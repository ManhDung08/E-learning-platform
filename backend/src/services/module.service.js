import prisma from "../configs/prisma.config.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { PermissionError } from "../errors/PermissionError.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { ConflictError } from "../errors/ConflictError.js";
import { deleteFromS3 } from "../utils/aws.util.js";

const getModulesByCourseId = async (courseId, userId, userRole) => {
  const parsedCourseId = parseInt(courseId);

  if (isNaN(parsedCourseId)) {
    throw new BadRequestError("Invalid course ID format", "invalid_course_id");
  }

  // Check course exists and access permissions
  const course = await prisma.course.findUnique({
    where: { id: parsedCourseId },
    include: {
      enrollments: {
        where: userId ? { userId } : undefined,
        select: { id: true },
      },
    },
  });

  if (!course) {
    throw new NotFoundError("Course", "course_not_found");
  }

  const isInstructor = userId && course.instructorId === userId;
  const isAdmin = userRole === "admin";
  const isEnrolled = userId && course.enrollments.length > 0;

  // Allow public access to published courses, restrict unpublished to enrolled/instructor/admin
  if (!course.isPublished && !isAdmin && !isInstructor && !isEnrolled) {
    throw new PermissionError(
      "You don't have access to this unpublished course content",
      "course_access_denied"
    );
  }

  const lessonQuery = {
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      durationSeconds: true,
      order: true,
    },
  };

  const shouldIncludeProgress =
    userId && isEnrolled && !isInstructor && !isAdmin;

  const modules = await prisma.module.findMany({
    where: { courseId: parsedCourseId },
    orderBy: { order: "asc" },
    include: {
      lessons: lessonQuery,
    },
  });

  let progressMap = new Map();

  if (shouldIncludeProgress) {
    const lessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id));

    const allProgress = await prisma.lessonProgress.findMany({
      where: {
        userId,
        lessonId: { in: lessonIds },
      },
      select: {
        lessonId: true,
        isCompleted: true,
        lastAccessedAt: true,
        watchedSeconds: true,
      },
    });

    progressMap = new Map(allProgress.map((p) => [p.lessonId, p]));
  }

  return modules.map((module) => ({
    id: module.id,
    courseId: module.courseId,
    title: module.title,
    order: module.order,
    totalLessons: module.lessons.length,
    totalDuration: module.lessons.reduce(
      (total, lesson) => total + (lesson.durationSeconds || 0),
      0
    ),
    lessons: module.lessons.map((lesson) => {
      const lessonData = {
        id: lesson.id,
        title: lesson.title,
        durationSeconds: lesson.durationSeconds,
        order: lesson.order,
      };

      if (shouldIncludeProgress) {
        const progress = progressMap.get(lesson.id);
        lessonData.progress = progress || {
          isCompleted: false,
          lastAccessedAt: null,
          watchedSeconds: null,
        };
      }

      return lessonData;
    }),
  }));
};

const getModuleById = async (moduleId, userId, userRole) => {
  const parsedModuleId = parseInt(moduleId);

  if (isNaN(parsedModuleId)) {
    throw new BadRequestError("Invalid module ID format", "invalid_module_id");
  }

  const module = await prisma.module.findUnique({
    where: { id: parsedModuleId },
    include: {
      course: {
        include: {
          enrollments: {
            where: userId ? { userId } : undefined,
            select: { id: true },
          },
        },
      },
      lessons: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          content: true,
          videoKey: true,
          durationSeconds: true,
          order: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!module) {
    throw new NotFoundError("Module", "module_not_found");
  }

  const isInstructor = userId && module.course.instructorId === userId;
  const isAdmin = userRole === "admin";
  const isEnrolled = userId && module.course.enrollments.length > 0;

  // Allow public access to published courses, restrict unpublished to enrolled/instructor/admin
  if (!module.course.isPublished && !isAdmin && !isInstructor && !isEnrolled) {
    throw new PermissionError(
      "You don't have access to this unpublished module",
      "module_access_denied"
    );
  }

  const shouldIncludeProgress =
    userId && isEnrolled && !isInstructor && !isAdmin;
  let progressMap = new Map();

  if (shouldIncludeProgress && module.lessons.length > 0) {
    const lessonIds = module.lessons.map((l) => l.id);

    const allProgress = await prisma.lessonProgress.findMany({
      where: {
        userId,
        lessonId: { in: lessonIds },
      },
      select: {
        lessonId: true,
        isCompleted: true,
        lastAccessedAt: true,
        watchedSeconds: true,
      },
    });

    progressMap = new Map(allProgress.map((p) => [p.lessonId, p]));
  }

  const totalDuration = module.lessons.reduce(
    (total, lesson) => total + (lesson.durationSeconds || 0),
    0
  );

  let completedLessons = 0;
  if (shouldIncludeProgress) {
    completedLessons = module.lessons.filter(
      (lesson) => progressMap.get(lesson.id)?.isCompleted
    ).length;
  }

  return {
    id: module.id,
    courseId: module.courseId,
    title: module.title,
    order: module.order,
    course: {
      id: module.course.id,
      title: module.course.title,
      isPublished: module.course.isPublished,
    },
    totalLessons: module.lessons.length,
    totalDuration,
    ...(shouldIncludeProgress && {
      completedLessons,
      progressPercentage:
        module.lessons.length > 0
          ? Math.round((completedLessons / module.lessons.length) * 100)
          : 0,
    }),
    lessons: module.lessons.map((lesson) => {
      const lessonData = {
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        videoKey: lesson.videoKey,
        durationSeconds: lesson.durationSeconds,
        order: lesson.order,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
      };

      if (shouldIncludeProgress) {
        const progress = progressMap.get(lesson.id);
        lessonData.progress = progress || {
          isCompleted: false,
          lastAccessedAt: null,
          watchedSeconds: null,
        };
      }

      return lessonData;
    }),
  };
};

const createModule = async (courseId, moduleData, userId, userRole) => {
  const { title, order } = moduleData;
  const parsedCourseId = parseInt(courseId);

  if (isNaN(parsedCourseId)) {
    throw new BadRequestError("Invalid course ID format", "invalid_course_id");
  }

  const course = await prisma.course.findUnique({
    where: { id: parsedCourseId },
    select: {
      id: true,
      instructorId: true,
      title: true,
    },
  });

  if (!course) {
    throw new NotFoundError("Course", "course_not_found");
  }

  if (userRole !== "admin" && course.instructorId !== userId) {
    throw new PermissionError(
      "You don't have permission to create modules for this course",
      "unauthorized_module_create"
    );
  }

  const newModule = await prisma.$transaction(async (tx) => {
    let moduleOrder = order;

    if (moduleOrder === undefined || moduleOrder === null) {
      const lastModule = await tx.module.findFirst({
        where: { courseId: parsedCourseId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      moduleOrder = (lastModule?.order || 0) + 1;
    }

    const existingModule = await tx.module.findFirst({
      where: {
        courseId: parsedCourseId,
        order: moduleOrder,
      },
      select: { id: true },
    });

    if (existingModule) {
      throw new ConflictError(
        `Module with order ${moduleOrder} already exists`,
        "module_order_exists"
      );
    }

    return await tx.module.create({
      data: {
        courseId: parsedCourseId,
        title,
        order: moduleOrder,
      },
      select: {
        id: true,
        courseId: true,
        title: true,
        order: true,
      },
    });
  });

  return {
    ...newModule,
    course: {
      id: course.id,
      title: course.title,
    },
    totalLessons: 0,
    totalDuration: 0,
  };
};

const updateModule = async (moduleId, moduleData, userId, userRole) => {
  const { title, order } = moduleData;
  const parsedModuleId = parseInt(moduleId);

  if (isNaN(parsedModuleId)) {
    throw new BadRequestError("Invalid module ID format", "invalid_module_id");
  }

  const module = await prisma.module.findUnique({
    where: { id: parsedModuleId },
    include: {
      course: {
        select: { id: true, instructorId: true, title: true },
      },
    },
  });

  if (!module) {
    throw new NotFoundError("Module", "module_not_found");
  }

  if (userRole !== "admin" && module.course.instructorId !== userId) {
    throw new PermissionError(
      "You don't have permission to update this module",
      "unauthorized_module_update"
    );
  }

  const updateData = {};
  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      throw new BadRequestError("Title cannot be empty", "invalid_title");
    }
    updateData.title = title.trim();
  }

  const needsReorder = order !== undefined && order !== module.order;

  let updatedModule;

  if (needsReorder) {
    const existingModule = await prisma.module.findFirst({
      where: {
        courseId: module.courseId,
        order: order,
        NOT: { id: parsedModuleId },
      },
      select: { id: true },
    });

    if (existingModule) {
      updatedModule = await prisma.$transaction(async (tx) => {
        if (order > module.order) {
          await tx.module.updateMany({
            where: {
              courseId: module.courseId,
              order: { gt: module.order, lte: order },
            },
            data: { order: { decrement: 1 } },
          });
        } else {
          await tx.module.updateMany({
            where: {
              courseId: module.courseId,
              order: { gte: order, lt: module.order },
            },
            data: { order: { increment: 1 } },
          });
        }

        return await tx.module.update({
          where: { id: parsedModuleId },
          data: { ...updateData, order },
          select: {
            id: true,
            courseId: true,
            title: true,
            order: true,
          },
        });
      });
    } else {
      updateData.order = order;
      updatedModule = await prisma.module.update({
        where: { id: parsedModuleId },
        data: updateData,
        select: {
          id: true,
          courseId: true,
          title: true,
          order: true,
        },
      });
    }
  } else {
    updatedModule = await prisma.module.update({
      where: { id: parsedModuleId },
      data: updateData,
      select: {
        id: true,
        courseId: true,
        title: true,
        order: true,
      },
    });
  }

  const stats = await prisma.lesson.aggregate({
    where: { moduleId: parsedModuleId },
    _count: { id: true },
    _sum: { durationSeconds: true },
  });

  return {
    ...updatedModule,
    course: {
      id: module.course.id,
      title: module.course.title,
    },
    totalLessons: stats._count.id || 0,
    totalDuration: stats._sum.durationSeconds || 0,
  };
};

const deleteModule = async (moduleId, userId, userRole) => {
  const parsedModuleId = parseInt(moduleId);

  if (isNaN(parsedModuleId)) {
    throw new BadRequestError("Invalid module ID format", "invalid_module_id");
  }

  const module = await prisma.module.findUnique({
    where: { id: parsedModuleId },
    include: {
      course: {
        select: {
          id: true,
          instructorId: true,
          title: true,
        },
      },
      _count: {
        select: { lessons: true },
      },
    },
  });

  if (!module) {
    throw new NotFoundError("Module", "module_not_found");
  }

  if (userRole !== "admin" && module.course.instructorId !== userId) {
    throw new PermissionError(
      "You don't have permission to delete this module",
      "unauthorized_module_delete"
    );
  }

  // Get all lessons with video keys for S3 cleanup before cascade delete
  const lessonsWithVideos = await prisma.lesson.findMany({
    where: { moduleId: parsedModuleId },
    select: { videoKey: true },
  });

  await prisma.$transaction(async (tx) => {
    // Delete module - this will cascade delete all lessons, quizzes, progress, etc.
    await tx.module.delete({
      where: { id: parsedModuleId },
    });

    // Update remaining module orders
    await tx.module.updateMany({
      where: {
        courseId: module.courseId,
        order: { gt: module.order },
      },
      data: { order: { decrement: 1 } },
    });
  });

  // Clean up S3 videos after successful database deletion
  for (const lesson of lessonsWithVideos) {
    if (lesson.videoKey) {
      await deleteFromS3(lesson.videoKey).catch((err) =>
        console.error("Failed to delete lesson video from S3:", err)
      );
    }
  }

  return {
    success: true,
    message: "Module deleted successfully",
    deletedModule: {
      id: module.id,
      title: module.title,
    },
  };
};

const reorderModules = async (courseId, moduleOrders, userId, userRole) => {
  const parsedCourseId = parseInt(courseId);

  if (isNaN(parsedCourseId)) {
    throw new BadRequestError("Invalid course ID format", "invalid_course_id");
  }

  const moduleIds = moduleOrders.map((item) => {
    const parsed = parseInt(item.moduleId);
    if (isNaN(parsed)) {
      throw new BadRequestError(
        `Invalid moduleId format: ${item.moduleId}`,
        "invalid_module_id"
      );
    }
    return parsed;
  });

  const uniqueIds = new Set(moduleIds);
  if (uniqueIds.size !== moduleIds.length) {
    throw new BadRequestError(
      "Duplicate moduleIds found",
      "duplicate_module_ids"
    );
  }

  const orders = moduleOrders.map((item) => item.order);
  const uniqueOrders = new Set(orders);
  if (uniqueOrders.size !== orders.length) {
    throw new BadRequestError("Duplicate orders found", "duplicate_orders");
  }

  const sortedOrders = [...orders].sort((a, b) => a - b);
  for (let i = 0; i < sortedOrders.length; i++) {
    if (sortedOrders[i] !== i + 1) {
      throw new BadRequestError(
        `Orders must be sequential starting from 1. Expected ${i + 1}, got ${
          sortedOrders[i]
        }`,
        "invalid_order_sequence"
      );
    }
  }

  const course = await prisma.course.findUnique({
    where: { id: parsedCourseId },
    select: {
      id: true,
      instructorId: true,
      _count: { select: { modules: true } },
    },
  });

  if (!course) {
    throw new NotFoundError("Course", "course_not_found");
  }

  if (userRole !== "admin" && course.instructorId !== userId) {
    throw new PermissionError(
      "You don't have permission to reorder modules for this course",
      "unauthorized_module_reorder"
    );
  }

  const existingModules = await prisma.module.findMany({
    where: {
      id: { in: moduleIds },
      courseId: parsedCourseId,
    },
    select: { id: true },
  });

  if (existingModules.length !== moduleIds.length) {
    throw new BadRequestError(
      "Some modules don't belong to this course or don't exist",
      "invalid_modules"
    );
  }

  if (moduleOrders.length !== course._count.modules) {
    throw new BadRequestError(
      `Must reorder all ${course._count.modules} modules in the course`,
      "incomplete_reorder"
    );
  }

  await prisma.$transaction(async (tx) => {
    for (const orderItem of moduleOrders) {
      await tx.module.update({
        where: { id: parseInt(orderItem.moduleId) },
        data: { order: orderItem.order },
      });
    }
  });

  const updatedModules = await prisma.module.findMany({
    where: { courseId: parsedCourseId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      courseId: true,
      title: true,
      order: true,
      _count: {
        select: { lessons: true },
      },
    },
  });

  const durationsMap = await prisma.lesson.groupBy({
    by: ["moduleId"],
    where: {
      moduleId: { in: updatedModules.map((m) => m.id) },
    },
    _sum: {
      durationSeconds: true,
    },
  });

  const durationLookup = new Map(
    durationsMap.map((d) => [d.moduleId, d._sum.durationSeconds || 0])
  );

  return updatedModules.map((module) => ({
    id: module.id,
    courseId: module.courseId,
    title: module.title,
    order: module.order,
    totalLessons: module._count.lessons,
    totalDuration: durationLookup.get(module.id) || 0,
  }));
};

export default {
  getModulesByCourseId,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
};
