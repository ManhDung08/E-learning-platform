import prisma from "../configs/prisma.config.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { PermissionError } from "../errors/PermissionError.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { ConflictError } from "../errors/ConflictError.js";
import {
  uploadToS3,
  deleteFromS3,
  extractKeyFromUrl,
  getSignedUrlForDownload,
} from "../utils/aws.util.js";
import notificationService from "./notification.service.js";

const getLessonsByModuleId = async (moduleId, userId, userRole) => {
  const parsedModuleId = parseInt(moduleId);

  // Check module exists and access permissions
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
      "You don't have access to this unpublished module content",
      "module_access_denied"
    );
  }

  const shouldIncludeProgress =
    userId && isEnrolled && !isInstructor && !isAdmin;

  const lessons = await prisma.lesson.findMany({
    where: { moduleId: parsedModuleId },
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
  });

  let progressMap = new Map();

  if (shouldIncludeProgress && lessons.length > 0) {
    const lessonIds = lessons.map((l) => l.id);

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

  // Get user's notes for all lessons if user is enrolled or instructor
  let notesMap = new Map();
  if (userId && (isEnrolled || isInstructor) && lessons.length > 0) {
    const lessonIds = lessons.map((l) => l.id);

    const allNotes = await prisma.lessonNote.findMany({
      where: {
        userId,
        lessonId: { in: lessonIds },
      },
      select: {
        lessonId: true,
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    notesMap = new Map(allNotes.map((n) => [n.lessonId, n]));
  }

  return await Promise.all(
    lessons.map(async (lesson) => {
      // Generate signed URL for video if exists
      let videoUrl = null;
      if (lesson.videoKey) {
        try {
          videoUrl = await getSignedUrlForDownload(
            lesson.videoKey,
            "lessonVideo",
            3600
          );
        } catch (error) {
          console.error(
            `Failed to generate video URL for lesson ${lesson.id}:`,
            error
          );
        }
      }

      const lessonData = {
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        videoUrl: videoUrl,
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

      // Include user's note if available
      if (userId && (isEnrolled || isInstructor)) {
        const note = notesMap.get(lesson.id);
        if (note) {
          lessonData.note = note;
        }
      }

      return lessonData;
    })
  );
};

const getLessonById = async (lessonId, userId, userRole) => {
  const parsedLessonId = parseInt(lessonId);

  const lesson = await prisma.lesson.findUnique({
    where: { id: parsedLessonId },
    include: {
      module: {
        include: {
          course: {
            include: {
              enrollments: {
                where: userId ? { userId } : undefined,
                select: { id: true },
              },
            },
          },
        },
      },
      quizzes: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!lesson) {
    throw new NotFoundError("Lesson", "lesson_not_found");
  }

  const isInstructor = userId && lesson.module.course.instructorId === userId;
  const isAdmin = userRole === "admin";
  const isEnrolled = userId && lesson.module.course.enrollments.length > 0;

  // Allow public access to published courses, restrict unpublished to enrolled/instructor/admin
  if (
    !lesson.module.course.isPublished &&
    !isAdmin &&
    !isInstructor &&
    !isEnrolled
  ) {
    throw new PermissionError(
      "You don't have access to this unpublished lesson",
      "lesson_access_denied"
    );
  }

  const shouldIncludeProgress =
    userId && isEnrolled && !isInstructor && !isAdmin;

  let progress = null;

  if (shouldIncludeProgress) {
    progress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId: parsedLessonId,
        },
      },
      select: {
        isCompleted: true,
        lastAccessedAt: true,
        watchedSeconds: true,
      },
    });
  }

  // Get user's note for this lesson if user is enrolled or instructor
  let note = null;
  if (userId && (isEnrolled || isInstructor)) {
    note = await prisma.lessonNote.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId: parsedLessonId,
        },
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Generate signed URL for video if exists
  let videoUrl = null;
  if (lesson.videoKey) {
    try {
      videoUrl = await getSignedUrlForDownload(
        lesson.videoKey,
        "lessonVideo",
        3600
      );
    } catch (error) {
      console.error(
        `Failed to generate video URL for lesson ${lesson.id}:`,
        error
      );
    }
  }

  return {
    id: lesson.id,
    moduleId: lesson.moduleId,
    title: lesson.title,
    content: lesson.content,
    videoUrl: videoUrl,
    durationSeconds: lesson.durationSeconds,
    order: lesson.order,
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt,
    module: {
      id: lesson.module.id,
      title: lesson.module.title,
      courseId: lesson.module.courseId,
      course: {
        id: lesson.module.course.id,
        title: lesson.module.course.title,
        isPublished: lesson.module.course.isPublished,
      },
    },
    quizzes: lesson.quizzes,
    ...(shouldIncludeProgress && {
      progress: progress || {
        isCompleted: false,
        lastAccessedAt: null,
        watchedSeconds: null,
      },
    }),
    ...(note && { note }),
  };
};

const createLesson = async (
  moduleId,
  lessonData,
  userId,
  userRole,
  videoFile = null
) => {
  const { title, content, durationSeconds, order } = lessonData;

  // Validation
  const parsedModuleId = parseInt(moduleId);

  // Check permissions
  const module = await prisma.module.findUnique({
    where: { id: parsedModuleId },
    select: {
      id: true,
      title: true,
      courseId: true,
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
      "You don't have permission to create lessons",
      "unauthorized_lesson_create"
    );
  }

  // Determine lesson order
  let lessonOrder = order;

  if (lessonOrder === undefined || lessonOrder === null) {
    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId: parsedModuleId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    lessonOrder = (lastLesson?.order || 0) + 1;
  }

  // Check if order conflicts with existing lesson
  const existingLesson = await prisma.lesson.findFirst({
    where: {
      moduleId: parsedModuleId,
      order: lessonOrder,
    },
    select: { id: true },
  });

  if (existingLesson) {
    throw new ConflictError(
      `Lesson with order ${lessonOrder} already exists`,
      "lesson_order_exists"
    );
  }

  const lesson = await prisma.lesson.create({
    data: {
      moduleId: parsedModuleId,
      title: title.trim(),
      content,
      videoKey: null, // Will be updated after video upload
      durationSeconds,
      order: lessonOrder,
    },
    select: {
      id: true,
      moduleId: true,
      title: true,
      content: true,
      videoKey: true,
      durationSeconds: true,
      order: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  let uploadedVideoKey = null;

  try {
    if (videoFile) {
      const uploadResult = await uploadToS3({
        fileBuffer: videoFile.buffer,
        fileName: videoFile.originalname,
        fileType: "lessonVideo",
        mimeType: videoFile.mimetype,
        metadata: {
          courseId: module.course.id.toString(),
          moduleId: parsedModuleId.toString(),
          lessonId: lesson.id.toString(),
          instructorId: module.course.instructorId.toString(),
          title: title,
        },
      });

      uploadedVideoKey = uploadResult.key;

      const updatedLesson = await prisma.lesson.update({
        where: { id: lesson.id },
        data: { videoKey: uploadedVideoKey },
        select: {
          id: true,
          moduleId: true,
          title: true,
          content: true,
          videoKey: true,
          durationSeconds: true,
          order: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Generate signed URL for the newly uploaded video
      let videoUrl = null;
      try {
        videoUrl = await getSignedUrlForDownload(
          uploadedVideoKey,
          "lessonVideo",
          3600
        );
      } catch (error) {
        console.error(
          `Failed to generate video URL for lesson ${updatedLesson.id}:`,
          error
        );
      }

      // Notify enrolled users about new lesson
      await notificationService
        .notifyEnrolledUsers(module.course.id, {
          type: "course_update",
          title: "New Lesson Added",
          content: `A new lesson "${title}" has been added to the course "${module.course.title}".`,
        })
        .catch((err) => {
          console.error("Failed to send lesson creation notifications:", err);
        });

      return {
        id: updatedLesson.id,
        moduleId: updatedLesson.moduleId,
        title: updatedLesson.title,
        content: updatedLesson.content,
        videoUrl: videoUrl,
        durationSeconds: updatedLesson.durationSeconds,
        order: updatedLesson.order,
        createdAt: updatedLesson.createdAt,
        updatedAt: updatedLesson.updatedAt,
        module: {
          id: module.id,
          title: module.title,
          courseId: module.courseId,
          course: {
            id: module.course.id,
            title: module.course.title,
          },
        },
      };
    }

    // Notify enrolled users about new lesson (non-video path)
    await notificationService
      .notifyEnrolledUsers(module.course.id, {
        type: "course_update",
        title: "New Lesson Added",
        content: `A new lesson "${title}" has been added to the course "${module.course.title}".`,
      })
      .catch((err) => {
        console.error("Failed to send lesson creation notifications:", err);
      });

    return {
      id: lesson.id,
      moduleId: lesson.moduleId,
      title: lesson.title,
      content: lesson.content,
      videoUrl: null,
      durationSeconds: lesson.durationSeconds,
      order: lesson.order,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
      module: {
        id: module.id,
        title: module.title,
        courseId: module.courseId,
        course: {
          id: module.course.id,
          title: module.course.title,
        },
      },
    };
  } catch (error) {
    await prisma.lesson.delete({
      where: { id: lesson.id },
    });

    if (uploadedVideoKey) {
      await deleteFromS3(uploadedVideoKey);
    }

    throw error;
  }
};

const updateLesson = async (
  lessonId,
  lessonData,
  userId,
  userRole,
  videoFile = null
) => {
  const { title, content, durationSeconds, order } = lessonData;
  const parsedLessonId = parseInt(lessonId);

  const lesson = await prisma.lesson.findUnique({
    where: { id: parsedLessonId },
    select: {
      id: true,
      moduleId: true,
      title: true,
      content: true,
      videoKey: true,
      durationSeconds: true,
      order: true,
      module: {
        select: {
          id: true,
          title: true,
          courseId: true,
          course: {
            select: { id: true, instructorId: true, title: true },
          },
        },
      },
    },
  });

  if (!lesson) {
    throw new NotFoundError("Lesson", "lesson_not_found");
  }

  if (userRole !== "admin" && lesson.module.course.instructorId !== userId) {
    throw new PermissionError(
      "You don't have permission to update this lesson",
      "unauthorized_lesson_update"
    );
  }

  // Prepare update data
  const updateData = {};
  if (title !== undefined) {
    updateData.title = title.trim();
  }

  if (content !== undefined) {
    updateData.content = content;
  }

  if (durationSeconds !== undefined) {
    updateData.durationSeconds = durationSeconds;
  }

  const needsReorder = order !== undefined && order !== lesson.order;
  let uploadedVideoKey = null;
  let oldVideoKey = lesson.videoKey;
  let updatedLesson;

  try {
    if (needsReorder) {
      const existingLesson = await prisma.lesson.findFirst({
        where: {
          moduleId: lesson.moduleId,
          order: order,
          NOT: { id: parsedLessonId },
        },
        select: { id: true },
      });

      if (existingLesson) {
        updatedLesson = await prisma.$transaction(async (tx) => {
          if (order > lesson.order) {
            await tx.lesson.updateMany({
              where: {
                moduleId: lesson.moduleId,
                order: { gt: lesson.order, lte: order },
              },
              data: { order: { decrement: 1 } },
            });
          } else {
            await tx.lesson.updateMany({
              where: {
                moduleId: lesson.moduleId,
                order: { gte: order, lt: lesson.order },
              },
              data: { order: { increment: 1 } },
            });
          }

          return await tx.lesson.update({
            where: { id: parsedLessonId },
            data: { ...updateData, order },
            select: {
              id: true,
              moduleId: true,
              title: true,
              content: true,
              videoKey: true,
              durationSeconds: true,
              order: true,
              createdAt: true,
              updatedAt: true,
            },
          });
        });
      } else {
        updateData.order = order;
        updatedLesson = await prisma.lesson.update({
          where: { id: parsedLessonId },
          data: updateData,
          select: {
            id: true,
            moduleId: true,
            title: true,
            content: true,
            videoKey: true,
            durationSeconds: true,
            order: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      }
    } else {
      updatedLesson = await prisma.lesson.update({
        where: { id: parsedLessonId },
        data: updateData,
        select: {
          id: true,
          moduleId: true,
          title: true,
          content: true,
          videoKey: true,
          durationSeconds: true,
          order: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    // Handle video upload after lesson update
    if (videoFile) {
      const uploadResult = await uploadToS3({
        fileBuffer: videoFile.buffer,
        fileName: videoFile.originalname,
        fileType: "lessonVideo",
        mimeType: videoFile.mimetype,
        metadata: {
          courseId: lesson.module.course.id.toString(),
          moduleId: lesson.moduleId.toString(),
          lessonId: parsedLessonId.toString(),
          instructorId: lesson.module.course.instructorId.toString(),
          title: title || lesson.title,
        },
      });

      uploadedVideoKey = uploadResult.key;

      // Update lesson with new video key
      updatedLesson = await prisma.lesson.update({
        where: { id: parsedLessonId },
        data: { videoKey: uploadedVideoKey },
        select: {
          id: true,
          moduleId: true,
          title: true,
          content: true,
          videoKey: true,
          durationSeconds: true,
          order: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    // If video upload succeeded and we had an old video, delete it
    if (uploadedVideoKey && oldVideoKey) {
      await deleteFromS3(oldVideoKey);
    }

    // Notify enrolled users about lesson update
    await notificationService
      .notifyEnrolledUsers(lesson.module.course.id, {
        type: "course_update",
        title: "Lesson Updated",
        content: `The lesson "${updatedLesson.title}" in the course "${lesson.module.course.title}" has been updated.`,
      })
      .catch((err) => {
        console.error("Failed to send lesson update notifications:", err);
      });
  } catch (error) {
    // Clean up uploaded video if upload failed
    if (uploadedVideoKey) {
      await deleteFromS3(uploadedVideoKey);
    }
    throw error;
  }

  // Generate signed URL for the video
  let videoUrl = null;
  if (updatedLesson.videoKey) {
    try {
      videoUrl = await getSignedUrlForDownload(
        updatedLesson.videoKey,
        "lessonVideo",
        3600
      );
    } catch (error) {
      console.error(
        `Failed to generate video URL for lesson ${updatedLesson.id}:`,
        error
      );
    }
  }

  return {
    id: updatedLesson.id,
    moduleId: updatedLesson.moduleId,
    title: updatedLesson.title,
    content: updatedLesson.content,
    videoUrl: videoUrl,
    durationSeconds: updatedLesson.durationSeconds,
    order: updatedLesson.order,
    createdAt: updatedLesson.createdAt,
    updatedAt: updatedLesson.updatedAt,
    module: {
      id: lesson.module.id,
      title: lesson.module.title,
      courseId: lesson.module.courseId,
      course: {
        id: lesson.module.course.id,
        title: lesson.module.course.title,
      },
    },
  };
};

const deleteLesson = async (lessonId, userId, userRole) => {
  const parsedLessonId = parseInt(lessonId);

  const lesson = await prisma.lesson.findUnique({
    where: { id: parsedLessonId },
    select: {
      id: true,
      moduleId: true,
      title: true,
      videoKey: true,
      order: true,
      module: {
        select: {
          courseId: true,
          course: {
            select: {
              id: true,
              instructorId: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    throw new NotFoundError("Lesson", "lesson_not_found");
  }

  if (userRole !== "admin" && lesson.module.course.instructorId !== userId) {
    throw new PermissionError(
      "You don't have permission to delete this lesson",
      "unauthorized_lesson_delete"
    );
  }

  await prisma.$transaction(async (tx) => {
    // Delete lesson - this will cascade delete all progress, quizzes, etc.
    await tx.lesson.delete({
      where: { id: parsedLessonId },
    });

    // Update remaining lesson orders
    await tx.lesson.updateMany({
      where: {
        moduleId: lesson.moduleId,
        order: { gt: lesson.order },
      },
      data: { order: { decrement: 1 } },
    });
  });

  // Clean up S3 video after successful database deletion
  if (lesson.videoKey) {
    await deleteFromS3(lesson.videoKey).catch((err) =>
      console.error("Failed to delete lesson video from S3:", err)
    );
  }

  // Notify enrolled users about lesson deletion
  await notificationService
    .notifyEnrolledUsers(lesson.module.course.id, {
      type: "course_update",
      title: "Lesson Removed",
      content: `The lesson "${lesson.title}" has been removed from the course "${lesson.module.course.title}".`,
    })
    .catch((err) => {
      console.error("Failed to send lesson deletion notifications:", err);
    });

  return {
    success: true,
    message: "Lesson deleted successfully",
    deletedLesson: {
      id: lesson.id,
      title: lesson.title,
    },
  };
};

const reorderLessons = async (moduleId, lessonOrders, userId, userRole) => {
  const parsedModuleId = parseInt(moduleId);

  const lessonIds = lessonOrders.map((item) => {
    return parseInt(item.lessonId);
  });

  const uniqueIds = new Set(lessonIds);
  if (uniqueIds.size !== lessonIds.length) {
    throw new BadRequestError(
      "Duplicate lessonIds found",
      "duplicate_lesson_ids"
    );
  }

  const orders = lessonOrders.map((item) => item.order);
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

  const module = await prisma.module.findUnique({
    where: { id: parsedModuleId },
    include: {
      course: {
        select: {
          id: true,
          instructorId: true,
        },
      },
      _count: { select: { lessons: true } },
    },
  });

  if (!module) {
    throw new NotFoundError("Module", "module_not_found");
  }

  if (userRole !== "admin" && module.course.instructorId !== userId) {
    throw new PermissionError(
      "You don't have permission to reorder lessons for this module",
      "unauthorized_lesson_reorder"
    );
  }

  const existingLessons = await prisma.lesson.findMany({
    where: {
      id: { in: lessonIds },
      moduleId: parsedModuleId,
    },
    select: { id: true },
  });

  if (existingLessons.length !== lessonIds.length) {
    throw new BadRequestError(
      "Some lessons don't belong to this module or don't exist",
      "invalid_lessons"
    );
  }

  if (lessonOrders.length !== module._count.lessons) {
    throw new BadRequestError(
      `Must reorder all ${module._count.lessons} lessons in the module`,
      "incomplete_reorder"
    );
  }

  await prisma.$transaction(async (tx) => {
    const updatePromises = lessonOrders.map((item) => {
      return tx.lesson.update({
        where: { id: parseInt(item.lessonId) },
        data: { order: item.order },
      });
    });

    await Promise.all(updatePromises);
  });

  const updatedLessons = await prisma.lesson.findMany({
    where: { moduleId: parsedModuleId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      moduleId: true,
      title: true,
      content: true,
      videoKey: true,
      durationSeconds: true,
      order: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Generate signed URLs for videos
  return await Promise.all(
    updatedLessons.map(async (lesson) => {
      let videoUrl = null;
      if (lesson.videoKey) {
        try {
          videoUrl = await getSignedUrlForDownload(
            lesson.videoKey,
            "lessonVideo",
            3600
          );
        } catch (error) {
          console.error(
            `Failed to generate video URL for lesson ${lesson.id}:`,
            error
          );
        }
      }

      return {
        id: lesson.id,
        moduleId: lesson.moduleId,
        title: lesson.title,
        content: lesson.content,
        videoUrl: videoUrl,
        durationSeconds: lesson.durationSeconds,
        order: lesson.order,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
      };
    })
  );
};

const updateLessonProgress = async (
  lessonId,
  progressData,
  userId,
  userRole = "student"
) => {
  const { isCompleted, watchedSeconds } = progressData;
  const parsedLessonId = parseInt(lessonId);

  const lesson = await prisma.lesson.findUnique({
    where: { id: parsedLessonId },
    include: {
      module: {
        include: {
          course: {
            include: {
              enrollments: {
                where: { userId },
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    throw new NotFoundError("Lesson", "lesson_not_found");
  }

  const isEnrolled = lesson.module.course.enrollments.length > 0;
  const isInstructor = lesson.module.course.instructorId === userId;
  const isAdmin = userRole === "admin";

  // Allow progress tracking for enrolled students, course instructors, or admins
  if (!lesson.module.course.isPublished && !isAdmin && !isInstructor) {
    throw new PermissionError(
      "Course must be published to track progress",
      "progress_access_denied"
    );
  }

  if (!isEnrolled && !isInstructor && !isAdmin) {
    throw new PermissionError(
      "You must be enrolled in the course to track progress",
      "progress_access_denied"
    );
  }

  const updateData = {};
  if (isCompleted !== undefined) {
    updateData.isCompleted = Boolean(isCompleted);
  }

  if (watchedSeconds !== undefined) {
    if (
      watchedSeconds !== null &&
      (!Number.isInteger(watchedSeconds) || watchedSeconds < 0)
    ) {
      throw new BadRequestError(
        "Watched seconds must be a non-negative integer or null",
        "invalid_watched_seconds"
      );
    }
    updateData.watchedSeconds = watchedSeconds;
  }

  updateData.lastAccessedAt = new Date();

  const progress = await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId,
        lessonId: parsedLessonId,
      },
    },
    update: updateData,
    create: {
      userId,
      lessonId: parsedLessonId,
      ...updateData,
    },
    select: {
      id: true,
      isCompleted: true,
      lastAccessedAt: true,
      watchedSeconds: true,
    },
  });

  return {
    lessonId: parsedLessonId,
    progress,
  };
};

export default {
  getLessonsByModuleId,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  updateLessonProgress,
};
