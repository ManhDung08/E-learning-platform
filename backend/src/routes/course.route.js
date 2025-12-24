import { Router } from "express";
import courseController from "../controllers/course.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { isAuth, optionalAuth } from "../middlewares/auth.middleware.js";
import {
  createCourseValidation,
  updateCourseValidation,
  courseQueryValidation,
  enrolledStudentsQueryValidation,
} from "../validations/course.validation.js";
import {
  createReviewValidation,
  updateReviewValidation,
  deleteReviewValidation,
  getCourseReviewsValidation,
} from "../validations/review.validation.js";
import {
  createDiscussionValidation,
  replyToDiscussionValidation,
  updateDiscussionValidation,
  deleteDiscussionValidation,
  getCourseDiscussionsValidation,
} from "../validations/discussion.validation.js";
import { optionalUploadCourseImage } from "../middlewares/upload.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management and enrollment
 */

/**
 * @swagger
 * /api/course:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of courses per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Search term for course title or description
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: true
 *         description: Filter by publication status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, title, priceVND]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoursesResponse'
 *       400:
 *         description: Bad request - invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/",
  courseQueryValidation,
  validate,
  courseController.getAllCourses
);

/**
 * @swagger
 * /api/course/{courseId}:
 *   get:
 *     summary: Get detailed course information (admin only - sees everything)
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseDetailResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:courseId", isAuth(["admin"]), courseController.getCourseById);

/**
 * @swagger
 * /api/course/slug/{slug}:
 *   get:
 *     summary: Get course by slug (dynamic access based on user type)
 *     description: |
 *       Returns different data based on user access level:
 *       - Public users: Basic info + limited preview
 *       - Students (not enrolled): Basic info + first lesson preview
 *       - Students (enrolled): Full course access
 *       - Course instructor: Full access + enrollment statistics
 *       Authentication is optional - passes user context if available
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Course slug
 *     responses:
 *       200:
 *         description: Course retrieved successfully (data varies by access level)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DynamicCourseResponse'
 *       404:
 *         description: Course not found or not published (for non-owners)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/slug/:slug", optionalAuth, courseController.getCourseBySlug);

/**
 * @swagger
 * /api/course:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 description: Course title
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 description: Course description
 *               priceVND:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 1000000000
 *                 description: Course price in Vietnamese Dong
 *               instructorId:
 *                 type: integer
 *                 minimum: 1
 *                 description: Target instructor ID (admin only)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Course thumbnail image (optional)
 *             required:
 *               - title
 *               - description
 *               - priceVND
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseResponse'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - course title already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/",
  isAuth(["instructor", "admin"]),
  ...optionalUploadCourseImage,
  createCourseValidation,
  validate,
  courseController.createCourse
);

/**
 * @swagger
 * /api/course/{courseId}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Course title (slug remains unchanged)
 *                 example: "Advanced JavaScript Programming"
 *               description:
 *                 type: string
 *                 description: Course description
 *                 example: "Learn advanced JavaScript concepts and patterns"
 *               priceVND:
 *                 type: integer
 *                 description: Course price in Vietnamese Dong
 *                 example: 1500000
 *               isPublished:
 *                 type: boolean
 *                 description: Course publication status (requires minimum content to publish)
 *                 example: false
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Course thumbnail image (optional)
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCourseRequest'
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseResponse'
 *       400:
 *         description: Bad request - validation error or publishing requirements not met
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  "/:courseId",
  isAuth(["instructor", "admin"]),
  optionalUploadCourseImage,
  updateCourseValidation,
  validate,
  courseController.updateCourse
);

/**
 * @swagger
 * /api/course/{courseId}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request - course has enrollments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  "/:courseId",
  isAuth(["instructor", "admin"]),
  courseController.deleteCourse
);

/**
 * @swagger
 * /api/course/{courseId}/enrollments:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       201:
 *         description: Successfully enrolled in course
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnrollmentResponse'
 *       400:
 *         description: Bad request - course not published or instructor self-enrollment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Already enrolled in course
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/:courseId/enrollments",
  isAuth(["student"]),
  courseController.enrollInCourse
);

/**
 * @swagger
 * /api/course/{courseId}/enrollments:
 *   delete:
 *     summary: Unenroll from a course
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Successfully unenrolled from course
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Enrollment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  "/:courseId/enrollments",
  isAuth(["student"]),
  courseController.unenrollFromCourse
);

/**
 * @swagger
 * /api/course/me/enrollments:
 *   get:
 *     summary: Get user's course enrollments
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of enrollments per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Search term for course title
 *     responses:
 *       200:
 *         description: User enrollments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnrollmentsResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/me/enrollments",
  isAuth(["student"]),
  courseQueryValidation,
  validate,
  courseController.getUserEnrollments
);

/**
 * @swagger
 * /api/course/me/courses:
 *   get:
 *     summary: Get instructor's courses
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of courses per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Search term for course title or description
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by publication status
 *     responses:
 *       200:
 *         description: Instructor courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoursesResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/me/courses",
  isAuth(["instructor", "admin"]),
  courseQueryValidation,
  validate,
  courseController.getInstructorCourses
);

/**
 * @swagger
 * /api/course/{courseId}/students:
 *   get:
 *     summary: Get all enrolled students for a course (instructor/admin only)
 *     description: |
 *       Returns a list of all students enrolled in the specified course with their progress information.
 *       Only accessible by the course instructor or admin users.
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of students per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Search by student username, email, first name, or last name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [enrolledAt, username, email]
 *           default: enrolledAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Enrolled students retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Enrolled students retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     courseId:
 *                       type: integer
 *                     courseTitle:
 *                       type: string
 *                     students:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           enrollmentId:
 *                             type: integer
 *                           enrolledAt:
 *                             type: string
 *                             format: date-time
 *                           student:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               username:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 *                               profileImageUrl:
 *                                 type: string
 *                               memberSince:
 *                                 type: string
 *                                 format: date-time
 *                           progress:
 *                             type: object
 *                             properties:
 *                               completedLessons:
 *                                 type: integer
 *                               totalLessons:
 *                                 type: integer
 *                               progressPercentage:
 *                                 type: integer
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalCount:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPreviousPage:
 *                           type: boolean
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - only course instructor or admin can access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/:courseId/students",
  isAuth(["instructor", "admin"]),
  enrolledStudentsQueryValidation,
  validate,
  courseController.getCourseEnrolledStudents
);

// ==================== REVIEW ROUTES ====================

/**
 * @swagger
 * /api/course/{courseId}/reviews:
 *   get:
 *     summary: Get all reviews for a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of reviews per page
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter by rating
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, rating]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Course reviews retrieved successfully
 *       404:
 *         description: Course not found
 */
router.get(
  "/:courseId/reviews",
  getCourseReviewsValidation,
  validate,
  courseController.getCourseReviews
);

/**
 * @swagger
 * /api/course/{courseId}/reviews:
 *   post:
 *     summary: Create a review for a course (enrolled students only)
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5
 *               comment:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 description: Review comment
 *             required:
 *               - rating
 *               - comment
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - must be enrolled
 *       404:
 *         description: Course not found
 *       409:
 *         description: Already reviewed this course
 */
router.post(
  "/:courseId/reviews",
  isAuth(["student"]),
  createReviewValidation,
  validate,
  courseController.createReview
);

/**
 * @swagger
 * /api/course/{courseId}/reviews/{reviewId}:
 *   put:
 *     summary: Update a review (review owner only)
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5
 *               comment:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 description: Review comment
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not review owner
 *       404:
 *         description: Review not found
 */
router.put(
  "/:courseId/reviews/:reviewId",
  isAuth(["student"]),
  updateReviewValidation,
  validate,
  courseController.updateReview
);

/**
 * @swagger
 * /api/course/{courseId}/reviews/{reviewId}:
 *   delete:
 *     summary: Delete a review (review owner or admin)
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not review owner or admin
 *       404:
 *         description: Review not found
 */
router.delete(
  "/:courseId/reviews/:reviewId",
  isAuth(["student", "admin"]),
  deleteReviewValidation,
  validate,
  courseController.deleteReview
);

// ==================== DISCUSSION ROUTES ====================

/**
 * @swagger
 * /api/course/{courseId}/discussions:
 *   get:
 *     summary: Get all discussions for a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of discussions per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Course discussions retrieved successfully
 *       404:
 *         description: Course not found
 */
router.get(
  "/:courseId/discussions",
  getCourseDiscussionsValidation,
  validate,
  courseController.getCourseDiscussions
);

/**
 * @swagger
 * /api/course/{courseId}/discussions:
 *   post:
 *     summary: Create a discussion for a course (enrolled users only)
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 2000
 *                 description: Discussion content
 *             required:
 *               - content
 *     responses:
 *       201:
 *         description: Discussion created successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - must be enrolled
 *       404:
 *         description: Course not found
 */
router.post(
  "/:courseId/discussions",
  isAuth(["student", "instructor", "admin"]),
  createDiscussionValidation,
  validate,
  courseController.createDiscussion
);

/**
 * @swagger
 * /api/course/{courseId}/discussions/{discussionId}/reply:
 *   post:
 *     summary: Reply to a discussion (enrolled users only)
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *       - in: path
 *         name: discussionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Discussion ID to reply to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 2000
 *                 description: Reply content
 *             required:
 *               - content
 *     responses:
 *       201:
 *         description: Reply created successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - must be enrolled
 *       404:
 *         description: Discussion not found
 */
router.post(
  "/:courseId/discussions/:discussionId/reply",
  isAuth(["student", "instructor", "admin"]),
  replyToDiscussionValidation,
  validate,
  courseController.replyToDiscussion
);

/**
 * @swagger
 * /api/course/{courseId}/discussions/{discussionId}:
 *   put:
 *     summary: Update a discussion (discussion owner only)
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *       - in: path
 *         name: discussionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Discussion ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 2000
 *                 description: Discussion content
 *             required:
 *               - content
 *     responses:
 *       200:
 *         description: Discussion updated successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not discussion owner
 *       404:
 *         description: Discussion not found
 */
router.put(
  "/:courseId/discussions/:discussionId",
  isAuth(["student", "instructor", "admin"]),
  updateDiscussionValidation,
  validate,
  courseController.updateDiscussion
);

/**
 * @swagger
 * /api/course/{courseId}/discussions/{discussionId}:
 *   delete:
 *     summary: Delete a discussion (discussion owner or admin)
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *       - in: path
 *         name: discussionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Discussion ID
 *     responses:
 *       200:
 *         description: Discussion deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not discussion owner or admin
 *       404:
 *         description: Discussion not found
 */
router.delete(
  "/:courseId/discussions/:discussionId",
  isAuth(["student", "instructor", "admin"]),
  deleteDiscussionValidation,
  validate,
  courseController.deleteDiscussion
);

export default router;
