import { Router } from "express";
import courseController from "../controllers/course.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import {
  createCourseValidation,
  updateCourseValidation,
  courseQueryValidation,
} from "../validations/course.validation.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management and enrollment
 */

/**
 * @swagger
 * /api/courses:
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
 *           enum: [createdAt, updatedAt, title, priceCents]
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
 * /api/courses/{courseId}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseResponse'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:courseId", courseController.getCourseById);

/**
 * @swagger
 * /api/courses/slug/{slug}:
 *   get:
 *     summary: Get course by slug
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
 *         description: Course retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseResponse'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/slug/:slug", courseController.getCourseBySlug);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourseRequest'
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
  createCourseValidation,
  validate,
  courseController.createCourse
);

/**
 * @swagger
 * /api/courses/{courseId}:
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
 *       404:
 *         description: Course not found
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
router.put(
  "/:courseId",
  isAuth(["instructor", "admin"]),
  updateCourseValidation,
  validate,
  courseController.updateCourse
);

/**
 * @swagger
 * /api/courses/{courseId}:
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
 * /api/courses/{courseId}/enroll:
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
  "/:courseId/enroll",
  isAuth(["student"]),
  courseController.enrollInCourse
);

/**
 * @swagger
 * /api/courses/{courseId}/unenroll:
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
  "/:courseId/unenroll",
  isAuth(["student"]),
  courseController.unenrollFromCourse
);

/**
 * @swagger
 * /api/courses/enrollments:
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
  "/enrollments",
  isAuth(["student"]),
  courseQueryValidation,
  validate,
  courseController.getUserEnrollments
);

/**
 * @swagger
 * /api/courses/instructor/courses:
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
  "/instructor/courses",
  isAuth(["instructor", "admin"]),
  courseQueryValidation,
  validate,
  courseController.getInstructorCourses
);

export default router;
