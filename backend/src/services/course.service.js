import prisma from "../configs/prisma.config.js";
import slugify from "slugify";
import {
  extractKeyFromUrl,
  getSignedUrlForDownload,
  uploadToS3,
  deleteFromS3,
} from "../utils/aws.util.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { PermissionError } from "../errors/PermissionError.js";
import { ConflictError } from "../errors/ConflictError.js";
import { BadRequestError } from "../errors/BadRequestError.js";

const getAllCourses = async (page = 1, limit = 10, filters = {}) => {
  const skip = (page - 1) * limit;

  const where = {};
  if (filters.isPublished !== undefined)
    where.isPublished = filters.isPublished;
  if (filters.instructorId) where.instructorId = parseInt(filters.instructorId);
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const orderBy = {
    [filters.sortBy || "createdAt"]: filters.sortOrder || "desc",
  };

  const [courses, totalCount] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        image: true,
        priceVND: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
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
            rating: true,
          },
        },
        modules: {
          select: {
            lessons: {
              select: {
                id: true,
                durationSeconds: true,
              },
            },
          },
        },
      },
    }),
    prisma.course.count({ where }),
  ]);

  const coursesWithStats = await Promise.all(
    courses.map(async (course) => {
      // Generate signed URL for course image if exists
      let imageUrl = course.image;
      if (course.image) {
        const key = extractKeyFromUrl(course.image);
        imageUrl = await getSignedUrlForDownload(key, "courseImage", 3600);
      }

      // Generate signed URL for instructor profile image if exists
      let instructorImageUrl = course.instructor.profileImageUrl;
      if (course.instructor.profileImageUrl) {
        const key = extractKeyFromUrl(course.instructor.profileImageUrl);
        instructorImageUrl = await getSignedUrlForDownload(key, "avatar", 3600);
      }

      // Calculate statistics
      const enrollmentCount = course.enrollments.length;
      const averageRating =
        course.reviews.length > 0
          ? parseFloat(
              (
                course.reviews.reduce((sum, review) => sum + review.rating, 0) /
                course.reviews.length
              ).toFixed(1)
            )
          : 0;
      const totalLessons = course.modules.reduce(
        (total, module) => total + module.lessons.length,
        0
      );
      const totalDuration = course.modules.reduce(
        (total, module) =>
          total +
          module.lessons.reduce(
            (moduleTotal, lesson) =>
              moduleTotal + (lesson.durationSeconds || 0),
            0
          ),
        0
      );

      const { enrollments, reviews, modules, ...basicCourseInfo } = course;

      return {
        ...basicCourseInfo,
        image: imageUrl,
        instructor: {
          ...course.instructor,
          profileImageUrl: instructorImageUrl,
        },
        enrollmentCount,
        averageRating,
        totalLessons,
        totalDuration,
      };
    })
  );

  return {
    courses: coursesWithStats,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      limit,
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPreviousPage: page > 1,
    },
  };
};

const getCourseById = async (courseId) => {
  // Admin-only function - no restrictions, see everything
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
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { enrolledAt: "desc" },
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
              email: true,
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
              email: true,
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
                  email: true,
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

  // Generate signed URLs for all images (admin sees everything)
  let imageUrl = course.image;
  if (course.image) {
    const key = extractKeyFromUrl(course.image);
    imageUrl = await getSignedUrlForDownload(key, "courseImage", 3600);
  }

  let instructorImageUrl = course.instructor.profileImageUrl;
  if (course.instructor.profileImageUrl) {
    const key = extractKeyFromUrl(course.instructor.profileImageUrl);
    instructorImageUrl = await getSignedUrlForDownload(key, "avatar", 3600);
  }

  // Process all user avatars
  const reviewsWithSignedUrls = await Promise.all(
    course.reviews.map(async (review) => {
      let userImageUrl = review.user.profileImageUrl;
      if (review.user.profileImageUrl) {
        const key = extractKeyFromUrl(review.user.profileImageUrl);
        userImageUrl = await getSignedUrlForDownload(key, "avatar", 3600);
      }
      return {
        ...review,
        user: {
          ...review.user,
          profileImageUrl: userImageUrl,
        },
      };
    })
  );

  const discussionsWithSignedUrls = await Promise.all(
    course.discussions.map(async (discussion) => {
      let userImageUrl = discussion.user.profileImageUrl;
      if (discussion.user.profileImageUrl) {
        const key = extractKeyFromUrl(discussion.user.profileImageUrl);
        userImageUrl = await getSignedUrlForDownload(key, "avatar", 3600);
      }

      const repliesWithSignedUrls = await Promise.all(
        discussion.replies.map(async (reply) => {
          let replyUserImageUrl = reply.user.profileImageUrl;
          if (reply.user.profileImageUrl) {
            const key = extractKeyFromUrl(reply.user.profileImageUrl);
            replyUserImageUrl = await getSignedUrlForDownload(
              key,
              "avatar",
              3600
            );
          }
          return {
            ...reply,
            user: {
              ...reply.user,
              profileImageUrl: replyUserImageUrl,
            },
          };
        })
      );

      return {
        ...discussion,
        user: {
          ...discussion.user,
          profileImageUrl: userImageUrl,
        },
        replies: repliesWithSignedUrls,
      };
    })
  );

  // Return everything for admin
  const courseStats = {
    ...course,
    image: imageUrl,
    instructor: {
      ...course.instructor,
      profileImageUrl: instructorImageUrl,
    },
    reviews: reviewsWithSignedUrls,
    discussions: discussionsWithSignedUrls,
    enrollmentCount: course.enrollments.length,
    averageRating:
      course.reviews.length > 0
        ? parseFloat(
            (
              course.reviews.reduce((sum, review) => sum + review.rating, 0) /
              course.reviews.length
            ).toFixed(1)
          )
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

const getCourseBySlug = async (slug, userId = null, userRole = "public") => {
  // First, get basic course info to determine ownership
  const basicCourse = await prisma.course.findUnique({
    where: { slug },
    select: {
      id: true,
      instructorId: true,
      isPublished: true,
    },
  });

  if (!basicCourse) {
    throw new NotFoundError("Course", "course_not_found");
  }

  // Determine user access level
  const isOwner = basicCourse.instructorId === userId;
  const isPublic = userRole === "public";

  // Access control - only show unpublished courses to owners
  if (!basicCourse.isPublished && !isOwner) {
    throw new NotFoundError("Course", "course_not_found");
  }

  // Build conditional includes based on user role
  const includeConfig = {
    instructor: {
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
        ...(isOwner && { email: true }), // Only include email for course owner
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
            ...(!isPublic && { profileImageUrl: true }), // Profile images only for authenticated users
          },
        },
      },
      orderBy: { createdAt: "desc" },
      ...(isPublic && { take: 5 }), // Limit reviews for public
    },
    modules: {
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            durationSeconds: true,
            order: true,
            ...(!isPublic && {
              content: true,
              videoKey: true,
            }), // Content only for authenticated users
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    },
  };

  // Conditionally include enrollments and discussions only for non-public users
  if (!isPublic) {
    if (isOwner) {
      // Course owners get full enrollment data
      includeConfig.enrollments = {
        select: {
          id: true,
          userId: true,
          enrolledAt: true,
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              email: true, // Course owner can see student emails
            },
          },
        },
        orderBy: { enrolledAt: "desc" },
      };
    } else {
      // Non-owners only get enrollment check data (no user details)
      includeConfig.enrollments = {
        select: {
          userId: true,
        },
      };
    }

    includeConfig.discussions = {
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
    };
  } else {
    // Public users only get enrollment count
    includeConfig._count = {
      select: {
        enrollments: true,
      },
    };
  }

  // Fetch course with conditional includes
  const course = await prisma.course.findUnique({
    where: { slug },
    include: includeConfig,
  });

  if (!course) {
    throw new NotFoundError("Course", "course_not_found");
  }

  // Check enrollment status for authenticated users
  let isEnrolled = false;
  if (!isPublic && course.enrollments) {
    isEnrolled = course.enrollments.some(
      (enrollment) => enrollment.userId === userId
    );
  }

  // Generate signed URLs
  let imageUrl = course.image;
  if (course.image) {
    const key = extractKeyFromUrl(course.image);
    imageUrl = await getSignedUrlForDownload(key, "courseImage", 3600);
  }

  let instructorImageUrl = course.instructor.profileImageUrl;
  if (course.instructor.profileImageUrl) {
    const key = extractKeyFromUrl(course.instructor.profileImageUrl);
    instructorImageUrl = await getSignedUrlForDownload(key, "avatar", 3600);
  }

  // Process reviews based on access level
  const reviewsWithSignedUrls = await Promise.all(
    course.reviews.map(async (review) => {
      let userImageUrl = review.user.profileImageUrl;
      if (review.user.profileImageUrl && !isPublic) {
        const key = extractKeyFromUrl(review.user.profileImageUrl);
        userImageUrl = await getSignedUrlForDownload(key, "avatar", 3600);
      }

      if (isPublic) {
        // Public users see limited review info
        return {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          user: {
            displayName:
              `${review.user.firstName || ""} ${
                review.user.lastName || ""
              }`.trim() || "Anonymous",
          },
        };
      }

      return {
        ...review,
        user: {
          ...review.user,
          profileImageUrl: userImageUrl,
        },
      };
    })
  );

  // Process discussions (only available for authenticated users)
  let discussionsWithSignedUrls = [];
  if (!isPublic && course.discussions) {
    discussionsWithSignedUrls = await Promise.all(
      course.discussions.map(async (discussion) => {
        let userImageUrl = discussion.user.profileImageUrl;
        if (discussion.user.profileImageUrl) {
          const key = extractKeyFromUrl(discussion.user.profileImageUrl);
          userImageUrl = await getSignedUrlForDownload(key, "avatar", 3600);
        }

        const repliesWithSignedUrls = await Promise.all(
          discussion.replies.map(async (reply) => {
            let replyUserImageUrl = reply.user.profileImageUrl;
            if (reply.user.profileImageUrl) {
              const key = extractKeyFromUrl(reply.user.profileImageUrl);
              replyUserImageUrl = await getSignedUrlForDownload(
                key,
                "avatar",
                3600
              );
            }
            return {
              ...reply,
              user: {
                ...reply.user,
                profileImageUrl: replyUserImageUrl,
              },
            };
          })
        );

        return {
          ...discussion,
          user: {
            ...discussion.user,
            profileImageUrl: userImageUrl,
          },
          replies: repliesWithSignedUrls,
        };
      })
    );
  }

  // Process modules based on access level
  let processedModules;
  if (isPublic) {
    // Public users - preview only (no lesson content)
    processedModules = course.modules.map((module) => ({
      title: module.title,
      order: module.order,
      lessonCount: module.lessons.length,
    }));
  } else if (isEnrolled || isOwner) {
    // Enrolled students or course owner - full access
    processedModules = course.modules;
  } else {
    // Logged in but not enrolled - limited preview
    processedModules = course.modules.map((module) => ({
      title: module.title,
      order: module.order,
      lessonCount: module.lessons.length,
      lessons: module.lessons.slice(0, 1).map((lesson) => ({
        // Show only first lesson preview
        title: lesson.title,
        durationSeconds: lesson.durationSeconds,
        order: lesson.order,
        // No content or video key for preview
      })),
    }));
  }

  // Build final course data
  const courseData = {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    image: imageUrl,
    priceVND: course.priceVND,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    instructor: {
      ...course.instructor,
      profileImageUrl: instructorImageUrl,
    },
    reviews: reviewsWithSignedUrls,
    enrollmentCount: course.enrollments
      ? course.enrollments.length
      : course._count?.enrollments || 0,
    averageRating:
      course.reviews.length > 0
        ? parseFloat(
            (
              course.reviews.reduce((sum, review) => sum + review.rating, 0) /
              course.reviews.length
            ).toFixed(1)
          )
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
    modules: processedModules,
  };

  // Add additional data for specific user types
  if (!isPublic) {
    courseData.discussions = discussionsWithSignedUrls;
  }

  if (isOwner) {
    // Course owner gets additional management data
    courseData.enrollments = course.enrollments;
    courseData.isPublished = course.isPublished;
  }

  return courseData;
};

const createCourse = async (courseData, userId, userRole, imageFile = null) => {
  const {
    title,
    description,
    priceVND,
    instructorId: targetInstructorId,
  } = courseData;

  let actualInstructorId;
  if (userRole === "admin") {
    // If no instructorId provided, assign to themselves
    actualInstructorId = targetInstructorId
      ? parseInt(targetInstructorId)
      : userId;
  } else {
    actualInstructorId = userId;
  }

  // Validate that the target instructor exists and has instructor role (only for non-admin targets)
  if (userRole === "admin" && targetInstructorId) {
    const targetInstructor = await prisma.user.findUnique({
      where: { id: actualInstructorId },
      select: { id: true, role: true },
    });

    if (!targetInstructor) {
      throw new NotFoundError("Instructor not found", "instructor_not_found");
    }

    if (
      targetInstructor.role !== "instructor" &&
      targetInstructor.role !== "admin"
    ) {
      throw new BadRequestError(
        "Target user must be an instructor or admin",
        "invalid_instructor_role"
      );
    }
  }

  const baseSlug = slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()\'\"!\u2019\!:@]/g,
    locale: "vi",
  });

  // Auto-slug disambiguation - ensure unique slug
  let finalSlug = baseSlug;
  let counter = 1;

  while (true) {
    const existingCourse = await prisma.course.findUnique({
      where: { slug: finalSlug },
    });

    if (!existingCourse) {
      break; // Slug is unique, we can use it
    }

    // Generate new slug with counter
    finalSlug = `${baseSlug}-${counter}`;
    counter++;

    // Safety check to prevent infinite loop
    if (counter > 1000) {
      throw new BadRequestError(
        "Unable to generate unique slug. Please choose a different title.",
        "slug_generation_failed"
      );
    }
  }

  // Handle image upload to S3 if provided
  let imageUrl = null;
  let uploadedImageKey = null;

  if (imageFile) {
    const uploadResult = await uploadToS3({
      fileBuffer: imageFile.buffer,
      fileName: imageFile.originalname,
      fileType: "courseImage",
      mimeType: imageFile.mimetype,
      metadata: {
        instructorId: actualInstructorId.toString(),
        title: title,
      },
    });

    imageUrl = uploadResult.url;
    uploadedImageKey = uploadResult.key;
  }

  // Create course in database
  let course;
  try {
    course = await prisma.course.create({
      data: {
        title,
        slug: finalSlug,
        description,
        priceVND: parseInt(priceVND),
        image: imageUrl,
        instructorId: actualInstructorId,
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
  } catch (dbError) {
    // Rollback S3 upload if database creation fails
    if (uploadedImageKey) {
      await deleteFromS3(uploadedImageKey);
      console.log("S3 upload rolled back after database error");
    }

    // Re-throw the database error
    console.error("Database error creating course:", dbError);
    throw new BadRequestError(
      "Failed to create course. Please try again.",
      "course_creation_failed"
    );
  }

  // Generate signed URLs for response
  const responseData = {
    ...course,
    image: course.image ? await getSignedUrlForDownload(course.image) : null,
    instructor: {
      ...course.instructor,
      profileImageUrl: course.instructor.profileImageUrl
        ? await getSignedUrlForDownload(course.instructor.profileImageUrl)
        : null,
    },
  };

  return responseData;
};

const updateCourse = async (courseId, courseData, userId, imageFile) => {
  const course = await prisma.course.findUnique({
    where: { id: parseInt(courseId) },
    include: {
      modules: {
        include: {
          lessons: true,
        },
      },
    },
  });

  if (!course) {
    throw new NotFoundError("Course", "course_not_found");
  }

  if (course.instructorId !== userId) {
    throw new PermissionError(
      "You don't have permission to update this course",
      "unauthorized_update"
    );
  }

  const { title, description, priceVND, isPublished } = courseData;
  const updateData = {};

  if (title && title !== course.title) {
    updateData.title = title;
  }

  if (description !== undefined) updateData.description = description;
  if (priceVND !== undefined) updateData.priceVND = parseInt(priceVND);

  let imageUrl = course.image;
  let uploadedImageKey = null;
  let oldImageKey = null;

  if (imageFile) {
    // Get old image key for cleanup
    oldImageKey = course.image ? extractKeyFromUrl(course.image) : null;

    // Upload new image
    const uploadResult = await uploadToS3({
      fileBuffer: imageFile.buffer,
      fileName: imageFile.originalname,
      fileType: "courseImage",
      mimeType: imageFile.mimetype,
      metadata: {
        courseId: courseId.toString(),
        instructorId: course.instructorId.toString(),
      },
    });

    imageUrl = uploadResult.url;
    uploadedImageKey = uploadResult.key;
    updateData.image = imageUrl;
  }

  // Check publishing requirements
  if (
    isPublished !== undefined &&
    Boolean(isPublished) === true &&
    !course.isPublished
  ) {
    // Check minimum requirements for publishing
    const totalModules = course.modules.length;
    const totalLessons = course.modules.reduce(
      (acc, module) => acc + module.lessons.length,
      0
    );

    if (totalModules === 0) {
      throw new BadRequestError(
        "Cannot publish course: Course must have at least one module",
        "publish_requirements_not_met"
      );
    }

    if (totalLessons === 0) {
      throw new BadRequestError(
        "Cannot publish course: Course must have at least one lesson",
        "publish_requirements_not_met"
      );
    }

    updateData.isPublished = true;
  } else if (isPublished !== undefined) {
    updateData.isPublished = Boolean(isPublished);
  }

  // Update course in database with transaction for image handling
  let updatedCourse;
  try {
    updatedCourse = await prisma.$transaction(async (tx) => {
      return await tx.course.update({
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
          modules: {
            include: {
              lessons: true,
            },
          },
        },
      });
    });
  } catch (dbError) {
    // Rollback S3 upload if database update fails
    if (uploadedImageKey) {
      await deleteFromS3(uploadedImageKey).catch((e) => {
        console.error("Failed to rollback S3 upload:", e);
      });
    }
    throw dbError;
  }

  // Clean up old image after successful update
  if (oldImageKey && uploadedImageKey) {
    await deleteFromS3(oldImageKey).catch((err) =>
      console.error("Failed to delete old course image from S3:", err)
    );
  }

  return {
    ...updatedCourse,
    ...(uploadedImageKey && {
      uploadedFile: { key: uploadedImageKey, url: imageUrl },
    }),
  };
};

const deleteCourse = async (courseId, userId) => {
  const course = await prisma.course.findUnique({
    where: { id: parseInt(courseId) },
    include: {
      enrollments: true,
    },
  });

  if (!course) {
    throw new NotFoundError("Course", "course_not_found");
  }

  if (course.instructorId !== userId) {
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

  // Delete course image from S3 if it exists
  if (course.image) {
    const imageKey = extractKeyFromUrl(course.image);
    await deleteFromS3(imageKey).catch((err) =>
      console.error("Failed to delete course image from S3:", err)
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

const getUserEnrollments = async (
  userId,
  page = 1,
  limit = 10,
  filters = {}
) => {
  const skip = (page - 1) * limit;

  const where = {
    userId: parseInt(userId),
  };
  if (filters.search) {
    where.course = {
      title: { contains: filters.search, mode: "insensitive" },
    };
  }

  const [enrollments, totalCount] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      skip,
      take: limit,
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

  const enrollmentsWithProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
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

      // Generate signed URL for course image if exists
      let courseImageUrl = enrollment.course.image;
      if (enrollment.course.image) {
        const key = extractKeyFromUrl(enrollment.course.image);
        courseImageUrl = await getSignedUrlForDownload(
          key,
          "courseImage",
          3600
        );
      }

      // Generate signed URL for instructor profile image if exists
      let instructorImageUrl = enrollment.course.instructor.profileImageUrl;
      if (enrollment.course.instructor.profileImageUrl) {
        const key = extractKeyFromUrl(
          enrollment.course.instructor.profileImageUrl
        );
        instructorImageUrl = await getSignedUrlForDownload(key, "avatar", 3600);
      }

      return {
        ...enrollment,
        course: {
          ...enrollment.course,
          image: courseImageUrl,
          instructor: {
            ...enrollment.course.instructor,
            profileImageUrl: instructorImageUrl,
          },
          progress:
            totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0,
          totalLessons,
          completedLessons,
        },
      };
    })
  );

  return {
    enrollments: enrollmentsWithProgress,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      limit,
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPreviousPage: page > 1,
    },
  };
};

const getInstructorCourses = async (
  instructorId,
  page = 1,
  limit = 10,
  filters = {}
) => {
  const skip = (page - 1) * limit;

  const where = {
    instructorId: parseInt(instructorId),
  };
  if (filters.isPublished !== undefined)
    where.isPublished = filters.isPublished;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [courses, totalCount] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        image: true,
        priceVND: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
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

  const coursesWithStats = await Promise.all(
    courses.map(async (course) => {
      // Generate signed URL for course image if exists
      let imageUrl = course.image;
      if (course.image) {
        try {
          const key = extractKeyFromUrl(course.image);
          imageUrl = await getSignedUrlForDownload(key, "courseImage", 3600);
        } catch (error) {
          console.error("Error generating signed URL for course image:", error);
          imageUrl = course.image; // fallback to original URL
        }
      }

      return {
        ...course,
        image: imageUrl,
        enrollmentCount: course.enrollments.length,
        averageRating:
          course.reviews.length > 0
            ? parseFloat(
                (
                  course.reviews.reduce(
                    (sum, review) => sum + review.rating,
                    0
                  ) / course.reviews.length
                ).toFixed(1)
              )
            : 0,
        totalLessons: course.modules.reduce(
          (total, module) => total + module.lessons.length,
          0
        ),
      };
    })
  );

  return {
    courses: coursesWithStats,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      limit,
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPreviousPage: page > 1,
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
