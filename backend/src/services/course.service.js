import prisma from "../configs/prisma.config.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { PermissionError } from "../errors/PermissionError.js";
import { ConflictError } from "../errors/ConflictError.js";
import { BadRequestError } from "../errors/BadRequestError.js";

const getAllCourses = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    category = "",
    isPublished = true,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  const where = {
    ...(isPublished !== undefined && { isPublished: isPublished === "true" }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const orderBy = { [sortBy]: sortOrder };

  const [courses, totalCount] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: parseInt(limit),
      include: {
        instructor: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
        enrollments: {
          select: { id: true },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
          },
        },
        modules: {
          select: {
            id: true,
            title: true,
            order: true,
            lessons: {
              select: {
                id: true,
                title: true,
                durationSeconds: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    }),
    prisma.course.count({ where }),
  ]);

  const coursesWithStats = courses.map((course) => ({
    ...course,
    enrollmentCount: course.enrollments.length,
    averageRating:
      course.reviews.length > 0
        ? (
            course.reviews.reduce((sum, review) => sum + review.rating, 0) /
            course.reviews.length
          ).toFixed(1)
        : 0,
    totalLessons: course.modules.reduce(
      (total, module) => total + module.lessons.length,
      0
    ),
    totalDuration: course.modules.reduce(
      (total, module) =>
        total +
        module.lessons.reduce(
          (moduleTotal, lesson) => moduleTotal + (lesson.durationSeconds || 0),
          0
        ),
      0
    ),
  }));

  return {
    courses: coursesWithStats,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      limit: parseInt(limit),
    },
  };
};

const getCourseById = async (courseId) => {
  const course = await prisma.course.findUnique({
    where: { id: parseInt(courseId) },
    include: {
      instructor: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
          email: true,
        },
      },
      enrollments: {
        select: {
          id: true,
          userId: true,
          enrolledAt: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      modules: {
        include: {
          lessons: {
            select: {
              id: true,
              title: true,
              content: true,
              videoKey: true,
              durationSeconds: true,
              order: true,
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
      discussions: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  profileImageUrl: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        where: { parentId: null },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!course) {
    throw new NotFoundError("Course", "course_not_found");
  }

  const courseStats = {
    ...course,
    enrollmentCount: course.enrollments.length,
    averageRating:
      course.reviews.length > 0
        ? (
            course.reviews.reduce((sum, review) => sum + review.rating, 0) /
            course.reviews.length
          ).toFixed(1)
        : 0,
    totalLessons: course.modules.reduce(
      (total, module) => total + module.lessons.length,
      0
    ),
    totalDuration: course.modules.reduce(
      (total, module) =>
        total +
        module.lessons.reduce(
          (moduleTotal, lesson) => moduleTotal + (lesson.durationSeconds || 0),
          0
        ),
      0
    ),
  };

  return courseStats;
};

const getCourseBySlug = async (slug) => {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      instructor: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
        },
      },
      enrollments: {
        select: {
          id: true,
          userId: true,
          enrolledAt: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      modules: {
        include: {
          lessons: {
            select: {
              id: true,
              title: true,
              content: true,
              videoKey: true,
              durationSeconds: true,
              order: true,
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) {
    throw new NotFoundError("Course", "course_not_found");
  }

  const courseStats = {
    ...course,
    enrollmentCount: course.enrollments.length,
    averageRating:
      course.reviews.length > 0
        ? (
            course.reviews.reduce((sum, review) => sum + review.rating, 0) /
            course.reviews.length
          ).toFixed(1)
        : 0,
    totalLessons: course.modules.reduce(
      (total, module) => total + module.lessons.length,
      0
    ),
    totalDuration: course.modules.reduce(
      (total, module) =>
        total +
        module.lessons.reduce(
          (moduleTotal, lesson) => moduleTotal + (lesson.durationSeconds || 0),
          0
        ),
      0
    ),
  };

  return courseStats;
};

const createCourse = async (courseData, instructorId) => {
  const { title, description, priceCents, image } = courseData;

  // Generate slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();

  // Check if slug already exists
  const existingCourse = await prisma.course.findUnique({
    where: { slug },
  });

  if (existingCourse) {
    throw new ConflictError(
      "Course with this title already exists",
      "slug_exists"
    );
  }

  const course = await prisma.course.create({
    data: {
      title,
      slug,
      description,
      priceCents: parseInt(priceCents),
      image,
      instructorId: parseInt(instructorId),
      isPublished: false,
    },
    include: {
      instructor: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
        },
      },
    },
  });

  return course;
};

const updateCourse = async (courseId, courseData, userId, userRole) => {
  const course = await prisma.course.findUnique({
    where: { id: parseInt(courseId) },
  });

  if (!course) {
    throw new NotFoundError("Course", "course_not_found");
  }

  // Check permissions
  if (userRole !== "admin" && course.instructorId !== userId) {
    throw new PermissionError(
      "You don't have permission to update this course",
      "unauthorized_update"
    );
  }

  const { title, description, priceCents, image, isPublished } = courseData;
  const updateData = {};

  if (title) {
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();

    // Check if slug already exists (excluding current course)
    const existingCourse = await prisma.course.findFirst({
      where: {
        slug,
        NOT: { id: parseInt(courseId) },
      },
    });

    if (existingCourse) {
      throw new ConflictError(
        "Course with this title already exists",
        "slug_exists"
      );
    }

    updateData.title = title;
    updateData.slug = slug;
  }

  if (description !== undefined) updateData.description = description;
  if (priceCents !== undefined) updateData.priceCents = parseInt(priceCents);
  if (image !== undefined) updateData.image = image;
  if (isPublished !== undefined) updateData.isPublished = Boolean(isPublished);

  const updatedCourse = await prisma.course.update({
    where: { id: parseInt(courseId) },
    data: updateData,
    include: {
      instructor: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
        },
      },
    },
  });

  return updatedCourse;
};

const deleteCourse = async (courseId, userId, userRole) => {
  const course = await prisma.course.findUnique({
    where: { id: parseInt(courseId) },
    include: {
      enrollments: true,
    },
  });

  if (!course) {
    throw new NotFoundError("Course", "course_not_found");
  }

  // Check permissions
  if (userRole !== "admin" && course.instructorId !== userId) {
    throw new PermissionError(
      "You don't have permission to delete this course",
      "unauthorized_delete"
    );
  }

  // Check if course has enrollments
  if (course.enrollments.length > 0) {
    throw new BadRequestError(
      "Cannot delete course with existing enrollments",
      "course_has_enrollments"
    );
  }

  await prisma.course.delete({
    where: { id: parseInt(courseId) },
  });

  return { success: true, message: "Course deleted successfully" };
};

const enrollInCourse = async (courseId, userId) => {
  const course = await prisma.course.findUnique({
    where: { id: parseInt(courseId) },
  });

  if (!course) {
    throw new NotFoundError("Course", "course_not_found");
  }

  if (!course.isPublished) {
    throw new BadRequestError(
      "Cannot enroll in unpublished course",
      "course_not_published"
    );
  }

  // Check if user is already enrolled
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: parseInt(userId),
        courseId: parseInt(courseId),
      },
    },
  });

  if (existingEnrollment) {
    throw new ConflictError(
      "User is already enrolled in this course",
      "already_enrolled"
    );
  }

  // Check if user is the instructor
  if (course.instructorId === userId) {
    throw new BadRequestError(
      "Instructor cannot enroll in their own course",
      "instructor_self_enrollment"
    );
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      userId: parseInt(userId),
      courseId: parseInt(courseId),
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          description: true,
          image: true,
        },
      },
    },
  });

  return enrollment;
};

const unenrollFromCourse = async (courseId, userId) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: parseInt(userId),
        courseId: parseInt(courseId),
      },
    },
  });

  if (!enrollment) {
    throw new NotFoundError("Enrollment", "enrollment_not_found");
  }

  await prisma.enrollment.delete({
    where: {
      userId_courseId: {
        userId: parseInt(userId),
        courseId: parseInt(courseId),
      },
    },
  });

  return { success: true, message: "Successfully unenrolled from course" };
};

const getUserEnrollments = async (userId, filters = {}) => {
  const { page = 1, limit = 10, search = "" } = filters;

  const where = {
    userId: parseInt(userId),
    ...(search && {
      course: {
        title: { contains: search, mode: "insensitive" },
      },
    }),
  };

  const [enrollments, totalCount] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      skip: (page - 1) * limit,
      take: parseInt(limit),
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
              },
            },
            modules: {
              select: {
                id: true,
                lessons: {
                  select: {
                    id: true,
                    lessonProgress: {
                      where: { userId: parseInt(userId) },
                      select: { isCompleted: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    }),
    prisma.enrollment.count({ where }),
  ]);

  const enrollmentsWithProgress = enrollments.map((enrollment) => {
    const totalLessons = enrollment.course.modules.reduce(
      (total, module) => total + module.lessons.length,
      0
    );
    const completedLessons = enrollment.course.modules.reduce(
      (total, module) =>
        total +
        module.lessons.filter(
          (lesson) =>
            lesson.lessonProgress.length > 0 &&
            lesson.lessonProgress[0].isCompleted
        ).length,
      0
    );

    return {
      ...enrollment,
      course: {
        ...enrollment.course,
        progress:
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0,
        totalLessons,
        completedLessons,
      },
    };
  });

  return {
    enrollments: enrollmentsWithProgress,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      limit: parseInt(limit),
    },
  };
};

const getInstructorCourses = async (instructorId, filters = {}) => {
  const { page = 1, limit = 10, search = "", isPublished } = filters;

  const where = {
    instructorId: parseInt(instructorId),
    ...(isPublished !== undefined && { isPublished: isPublished === "true" }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [courses, totalCount] = await Promise.all([
    prisma.course.findMany({
      where,
      skip: (page - 1) * limit,
      take: parseInt(limit),
      include: {
        enrollments: {
          select: { id: true },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
          },
        },
        modules: {
          select: {
            id: true,
            lessons: {
              select: { id: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.count({ where }),
  ]);

  const coursesWithStats = courses.map((course) => ({
    ...course,
    enrollmentCount: course.enrollments.length,
    averageRating:
      course.reviews.length > 0
        ? (
            course.reviews.reduce((sum, review) => sum + review.rating, 0) /
            course.reviews.length
          ).toFixed(1)
        : 0,
    totalLessons: course.modules.reduce(
      (total, module) => total + module.lessons.length,
      0
    ),
  }));

  return {
    courses: coursesWithStats,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      limit: parseInt(limit),
    },
  };
};

export default {
  getAllCourses,
  getCourseById,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
  getUserEnrollments,
  getInstructorCourses,
};
