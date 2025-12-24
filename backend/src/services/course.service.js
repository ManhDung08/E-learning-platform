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
import notificationService from "./notification.service.js";

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

const updateCourse = async (
  courseId,
  courseData,
  userId,
  userRole,
  imageFile
) => {
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

  // Check permissions: admin can update any course, instructor can update own courses
  if (userRole !== "admin" && course.instructorId !== userId) {
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

  // Send notifications to enrolled users when course is published
  const wasPublished = course.isPublished;
  const isNowPublished = updatedCourse.isPublished;

  if (!wasPublished && isNowPublished) {
    // Course was just published - notify all enrolled users
    await notificationService
      .notifyEnrolledUsers(parseInt(courseId), {
        type: "course_update",
        title: "Course Published",
        content: `The course "${updatedCourse.title}" has been published! You can now start learning.`,
      })
      .catch((err) => {
        console.error("Failed to send course publication notifications:", err);
      });
  } else if (
    wasPublished &&
    isNowPublished &&
    title &&
    title !== course.title
  ) {
    // Course title was updated - notify enrolled users
    await notificationService
      .notifyEnrolledUsers(parseInt(courseId), {
        type: "course_update",
        title: "Course Updated",
        content: `The course "${updatedCourse.title}" has been updated with new information.`,
      })
      .catch((err) => {
        console.error("Failed to send course update notifications:", err);
      });
  }

  return {
    ...updatedCourse,
    ...(uploadedImageKey && {
      uploadedFile: { key: uploadedImageKey, url: imageUrl },
    }),
  };
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

  // Check permissions: admin can delete any course, instructor can delete own courses
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

  // For paid courses, check if payment exists and is successful
  if (course.priceVND > 0) {
    const successfulPayment = await prisma.payment.findFirst({
      where: {
        userId: parseInt(userId),
        courseId: parseInt(courseId),
        status: "success",
      },
    });

    if (!successfulPayment) {
      throw new BadRequestError(
        "Payment required for this course. Please complete payment before enrollment.",
        "payment_required"
      );
    }
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

  // Notify user about successful enrollment
  await notificationService
    .createNotification({
      userId: parseInt(userId),
      type: "course_update",
      title: "Enrollment Successful",
      content: `You have successfully enrolled in "${enrollment.course.title}". Start learning now!`,
    })
    .catch((err) => {
      console.error("Failed to send enrollment notification:", err);
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

const getCourseEnrolledStudents = async (
  courseId,
  instructorId,
  userRole,
  page = 1,
  limit = 10,
  filters = {}
) => {
  // Check if course exists
  const course = await prisma.course.findUnique({
    where: { id: parseInt(courseId) },
    select: {
      id: true,
      instructorId: true,
      title: true,
    },
  });

  if (!course) {
    throw new NotFoundError("Course", "course_not_found");
  }

  // Check if user has permission (must be course instructor or admin)
  if (userRole !== "admin" && course.instructorId !== parseInt(instructorId)) {
    throw new PermissionError(
      "Only the course instructor or admin can view enrolled students",
      "unauthorized_access"
    );
  }

  const skip = (page - 1) * limit;

  // Build where clause
  const where = {
    courseId: parseInt(courseId),
  };

  // Add search filter if provided
  if (filters.search) {
    where.user = {
      OR: [
        { username: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { firstName: { contains: filters.search, mode: "insensitive" } },
        { lastName: { contains: filters.search, mode: "insensitive" } },
      ],
    };
  }

  // Build order by clause - handle nested user fields
  let orderBy;
  if (filters.sortBy === "username" || filters.sortBy === "email") {
    orderBy = {
      user: {
        [filters.sortBy]: filters.sortOrder || "asc",
      },
    };
  } else {
    orderBy = {
      [filters.sortBy || "enrolledAt"]: filters.sortOrder || "desc",
    };
  }

  // Fetch enrollments with user details and progress
  const [enrollments, totalCount] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.enrollment.count({ where }),
  ]);

  // Get course modules and lessons for progress calculation
  const courseModules = await prisma.module.findMany({
    where: { courseId: parseInt(courseId) },
    select: {
      id: true,
      lessons: {
        select: {
          id: true,
        },
      },
    },
  });

  const totalLessons = courseModules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );

  // Fetch all lesson progress for all enrolled students in one query (performance optimization)
  const allStudentProgress = await prisma.lessonProgress.findMany({
    where: {
      userId: { in: enrollments.map((e) => e.userId) },
      lesson: {
        module: {
          courseId: parseInt(courseId),
        },
      },
      isCompleted: true,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  // Group progress by userId for O(1) lookup
  const progressByUserId = allStudentProgress.reduce((acc, progress) => {
    if (!acc[progress.userId]) {
      acc[progress.userId] = 0;
    }
    acc[progress.userId]++;
    return acc;
  }, {});

  // Calculate progress for each student
  const studentsWithProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      const completedLessons = progressByUserId[enrollment.userId] || 0;
      const progressPercentage =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      // Generate signed URL for user profile image
      let userImageUrl = enrollment.user.profileImageUrl;
      if (enrollment.user.profileImageUrl) {
        try {
          const key = extractKeyFromUrl(enrollment.user.profileImageUrl);
          userImageUrl = await getSignedUrlForDownload(key, "avatar", 3600);
        } catch (error) {
          console.error("Error generating signed URL for user profile:", error);
          userImageUrl = enrollment.user.profileImageUrl; // fallback to original URL
        }
      }

      return {
        enrollmentId: enrollment.id,
        enrolledAt: enrollment.enrolledAt,
        student: {
          id: enrollment.user.id,
          username: enrollment.user.username,
          email: enrollment.user.email,
          firstName: enrollment.user.firstName,
          lastName: enrollment.user.lastName,
          profileImageUrl: userImageUrl,
          memberSince: enrollment.user.createdAt,
        },
        progress: {
          completedLessons,
          totalLessons,
          progressPercentage,
        },
      };
    })
  );

  return {
    courseId: course.id,
    courseTitle: course.title,
    students: studentsWithProgress,
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

// Check if user has paid for the course
const checkPaymentForCourse = async (courseId, userId) => {
  try {
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { priceVND: true },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    // If course is free, no payment needed
    if (course.priceVND === 0) {
      return { hasPaid: true, paymentRequired: false };
    }

    // Check for successful payment
    const payment = await prisma.payment.findFirst({
      where: {
        courseId: courseId,
        userId: userId,
        status: "success",
      },
    });

    return {
      hasPaid: !!payment,
      paymentRequired: true,
      payment: payment || null,
    };
  } catch (error) {
    console.error("Error checking payment for course:", error);
    throw error;
  }
};

const createReview = async (courseId, userId, reviewData) => {
  // Check if course exists and is published
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, isPublished: true },
  });

  if (!course) {
    throw new NotFoundError("Course", "course_not_found");
  }

  if (!course.isPublished) {
    throw new BadRequestError(
      "Cannot review an unpublished course",
      "course_not_published"
    );
  }

  // Check if user is enrolled in the course
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: userId,
        courseId: courseId,
      },
    },
  });

  if (!enrollment) {
    throw new PermissionError(
      "You must be enrolled in the course to write a review",
      "not_enrolled"
    );
  }

  // Create the review
  const review = await prisma.review.create({
    data: {
      userId: userId,
      courseId: courseId,
      rating: reviewData.rating,
      comment: reviewData.comment,
    },
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
      course: {
        select: {
          id: true,
          title: true,
          instructorId: true,
        },
      },
    },
  });

  // Notify instructor about new review
  await notificationService
    .createNotification({
      userId: review.course.instructorId,
      type: "new_comment",
      title: "New Course Review",
      content: `${review.user.username} left a ${reviewData.rating}-star review on "${review.course.title}".`,
    })
    .catch((err) => {
      console.error("Failed to send review notification:", err);
    });

  // Generate signed URL for user profile image
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
};

const updateReview = async (courseId, reviewId, userId, reviewData) => {
  // Check if review exists
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      course: true,
    },
  });

  if (!review) {
    throw new NotFoundError("Review", "review_not_found");
  }

  // Check if review belongs to the course
  if (review.courseId !== courseId) {
    throw new BadRequestError(
      "Review does not belong to this course",
      "invalid_course"
    );
  }

  // Check if user owns the review
  if (review.userId !== userId) {
    throw new PermissionError(
      "You can only update your own reviews",
      "not_review_owner"
    );
  }

  // Update the review
  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...(reviewData.rating && { rating: reviewData.rating }),
      ...(reviewData.comment && { comment: reviewData.comment }),
    },
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
  });

  // Generate signed URL for user profile image
  let userImageUrl = updatedReview.user.profileImageUrl;
  if (updatedReview.user.profileImageUrl) {
    const key = extractKeyFromUrl(updatedReview.user.profileImageUrl);
    userImageUrl = await getSignedUrlForDownload(key, "avatar", 3600);
  }

  return {
    ...updatedReview,
    user: {
      ...updatedReview.user,
      profileImageUrl: userImageUrl,
    },
  };
};

const deleteReview = async (courseId, reviewId, userId, userRole) => {
  // Check if review exists
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new NotFoundError("Review", "review_not_found");
  }

  // Check if review belongs to the course
  if (review.courseId !== courseId) {
    throw new BadRequestError(
      "Review does not belong to this course",
      "invalid_course"
    );
  }

  // Check permissions: user must own the review or be an admin
  if (review.userId !== userId && userRole !== "admin") {
    throw new PermissionError(
      "You can only delete your own reviews",
      "not_review_owner"
    );
  }

  // Delete the review
  await prisma.review.delete({
    where: { id: reviewId },
  });

  return { message: "Review deleted successfully" };
};

const getCourseReviews = async (
  courseId,
  page = 1,
  limit = 10,
  filters = {}
) => {
  // Check if course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, isPublished: true },
  });

  if (!course) {
    throw new NotFoundError("Course", "course_not_found");
  }

  const skip = (page - 1) * limit;
  const where = { courseId: courseId };

  // Filter by rating if provided
  if (filters.rating) {
    where.rating = parseInt(filters.rating);
  }

  const orderBy = {
    [filters.sortBy || "createdAt"]: filters.sortOrder || "desc",
  };

  const [reviews, totalCount] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy,
      skip,
      take: limit,
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
    }),
    prisma.review.count({ where }),
  ]);

  // Generate signed URLs for user profile images
  const reviewsWithSignedUrls = await Promise.all(
    reviews.map(async (review) => {
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

  return {
    reviews: reviewsWithSignedUrls,
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

const createDiscussion = async (courseId, userId, discussionData) => {
  // Check if course exists and is published
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, isPublished: true },
  });

  if (!course) {
    throw new NotFoundError("Course", "course_not_found");
  }

  if (!course.isPublished) {
    throw new BadRequestError(
      "Cannot create discussion in an unpublished course",
      "course_not_published"
    );
  }

  // Check if user is enrolled in the course
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: userId,
        courseId: courseId,
      },
    },
  });

  if (!enrollment) {
    throw new PermissionError(
      "You must be enrolled in the course to create a discussion",
      "not_enrolled"
    );
  }

  // Create the discussion
  const discussion = await prisma.discussion.create({
    data: {
      userId: userId,
      courseId: courseId,
      content: discussionData.content,
      parentId: null,
    },
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
      course: {
        select: {
          id: true,
          title: true,
          instructorId: true,
        },
      },
    },
  });

  // Notify instructor about new discussion (if user is not the instructor)
  if (discussion.course.instructorId !== userId) {
    await notificationService
      .createNotification({
        userId: discussion.course.instructorId,
        type: "new_comment",
        title: "New Discussion in Your Course",
        content: `${discussion.user.username} started a discussion in "${discussion.course.title}".`,
      })
      .catch((err) => {
        console.error("Failed to send discussion notification:", err);
      });
  }

  // Generate signed URL for user profile image
  let userImageUrl = discussion.user.profileImageUrl;
  if (discussion.user.profileImageUrl) {
    const key = extractKeyFromUrl(discussion.user.profileImageUrl);
    userImageUrl = await getSignedUrlForDownload(key, "avatar", 3600);
  }

  return {
    ...discussion,
    user: {
      ...discussion.user,
      profileImageUrl: userImageUrl,
    },
  };
};

const replyToDiscussion = async (courseId, discussionId, userId, replyData) => {
  // Check if parent discussion exists
  const parentDiscussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
    include: {
      course: true,
    },
  });

  if (!parentDiscussion) {
    throw new NotFoundError("Discussion", "discussion_not_found");
  }

  // Check if discussion belongs to the course
  if (parentDiscussion.courseId !== courseId) {
    throw new BadRequestError(
      "Discussion does not belong to this course",
      "invalid_course"
    );
  }

  // Check if user is enrolled in the course
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: userId,
        courseId: courseId,
      },
    },
  });

  if (!enrollment) {
    throw new PermissionError(
      "You must be enrolled in the course to reply to discussions",
      "not_enrolled"
    );
  }

  // Create the reply
  const reply = await prisma.discussion.create({
    data: {
      userId: userId,
      courseId: courseId,
      content: replyData.content,
      parentId: discussionId,
    },
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
      parent: {
        select: {
          userId: true,
          user: {
            select: {
              username: true,
            },
          },
        },
      },
      course: {
        select: {
          title: true,
        },
      },
    },
  });

  // Notify the original discussion author about the reply (if not replying to themselves)
  if (reply.parent.userId !== userId) {
    await notificationService
      .createNotification({
        userId: reply.parent.userId,
        type: "new_comment",
        title: "New Reply to Your Discussion",
        content: `${reply.user.username} replied to your discussion in "${reply.course.title}".`,
      })
      .catch((err) => {
        console.error("Failed to send reply notification:", err);
      });
  }

  // Generate signed URL for user profile image
  let userImageUrl = reply.user.profileImageUrl;
  if (reply.user.profileImageUrl) {
    const key = extractKeyFromUrl(reply.user.profileImageUrl);
    userImageUrl = await getSignedUrlForDownload(key, "avatar", 3600);
  }

  return {
    ...reply,
    user: {
      ...reply.user,
      profileImageUrl: userImageUrl,
    },
  };
};

const updateDiscussion = async (
  courseId,
  discussionId,
  userId,
  discussionData
) => {
  // Check if discussion exists
  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
    include: {
      course: true,
    },
  });

  if (!discussion) {
    throw new NotFoundError("Discussion", "discussion_not_found");
  }

  // Check if discussion belongs to the course
  if (discussion.courseId !== courseId) {
    throw new BadRequestError(
      "Discussion does not belong to this course",
      "invalid_course"
    );
  }

  // Check if user owns the discussion
  if (discussion.userId !== userId) {
    throw new PermissionError(
      "You can only update your own discussions",
      "not_discussion_owner"
    );
  }

  // Update the discussion
  const updatedDiscussion = await prisma.discussion.update({
    where: { id: discussionId },
    data: {
      content: discussionData.content,
    },
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
  });

  // Generate signed URLs for user profile images
  let userImageUrl = updatedDiscussion.user.profileImageUrl;
  if (updatedDiscussion.user.profileImageUrl) {
    const key = extractKeyFromUrl(updatedDiscussion.user.profileImageUrl);
    userImageUrl = await getSignedUrlForDownload(key, "avatar", 3600);
  }

  const repliesWithSignedUrls = await Promise.all(
    updatedDiscussion.replies.map(async (reply) => {
      let replyUserImageUrl = reply.user.profileImageUrl;
      if (reply.user.profileImageUrl) {
        const key = extractKeyFromUrl(reply.user.profileImageUrl);
        replyUserImageUrl = await getSignedUrlForDownload(key, "avatar", 3600);
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
    ...updatedDiscussion,
    user: {
      ...updatedDiscussion.user,
      profileImageUrl: userImageUrl,
    },
    replies: repliesWithSignedUrls,
  };
};

const deleteDiscussion = async (courseId, discussionId, userId, userRole) => {
  // Check if discussion exists
  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
  });

  if (!discussion) {
    throw new NotFoundError("Discussion", "discussion_not_found");
  }

  // Check if discussion belongs to the course
  if (discussion.courseId !== courseId) {
    throw new BadRequestError(
      "Discussion does not belong to this course",
      "invalid_course"
    );
  }

  // Check permissions: user must own the discussion or be an admin
  if (discussion.userId !== userId && userRole !== "admin") {
    throw new PermissionError(
      "You can only delete your own discussions",
      "not_discussion_owner"
    );
  }

  // Delete the discussion (will cascade to replies)
  await prisma.discussion.delete({
    where: { id: discussionId },
  });

  return { message: "Discussion deleted successfully" };
};

const getCourseDiscussions = async (
  courseId,
  page = 1,
  limit = 10,
  filters = {}
) => {
  // Check if course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, isPublished: true },
  });

  if (!course) {
    throw new NotFoundError("Course", "course_not_found");
  }

  const skip = (page - 1) * limit;
  const where = {
    courseId: courseId,
    parentId: null, // Only get top-level discussions
  };

  const orderBy = {
    [filters.sortBy || "createdAt"]: filters.sortOrder || "desc",
  };

  const [discussions, totalCount] = await Promise.all([
    prisma.discussion.findMany({
      where,
      orderBy,
      skip,
      take: limit,
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
    }),
    prisma.discussion.count({ where }),
  ]);

  // Generate signed URLs for all user profile images
  const discussionsWithSignedUrls = await Promise.all(
    discussions.map(async (discussion) => {
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

  return {
    discussions: discussionsWithSignedUrls,
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
  getCourseEnrolledStudents,
  checkPaymentForCourse,
  // Review functions
  createReview,
  updateReview,
  deleteReview,
  getCourseReviews,
  // Discussion functions
  createDiscussion,
  replyToDiscussion,
  updateDiscussion,
  deleteDiscussion,
  getCourseDiscussions,
};
