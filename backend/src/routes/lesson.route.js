import { Router } from "express";
import lessonController from "../controllers/lesson.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { isAuth, optionalAuth } from "../middlewares/auth.middleware.js";
import {
  uploadLessonVideo,
  optionalUploadLessonVideo,
} from "../middlewares/upload.middleware.js";
import {
  createLessonValidation,
  updateLessonValidation,
  lessonIdValidation,
  moduleIdParamValidation,
  deleteLessonValidation,
  reorderLessonsValidation,
  updateLessonProgressValidation,
} from "../validations/lesson.validation.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Lessons
 *   description: Module lesson management
 */

/**
 * @swagger
 * /api/lessons/module/{moduleId}:
 *   get:
 *     summary: Get all lessons for a module
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Module ID
 *     responses:
 *       200:
 *         description: Lessons retrieved successfully
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
 *                   example: "Lessons retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LessonWithProgress'
 *       403:
 *         description: Access denied - not enrolled or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Module not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/module/:moduleId",
  optionalAuth,
  moduleIdParamValidation,
  validate,
  lessonController.getLessonsByModuleId
);

/**
 * @swagger
 * /api/lessons/{lessonId}:
 *   get:
 *     summary: Get a specific lesson by ID
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson retrieved successfully
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
 *                   example: "Lesson retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/LessonWithProgress'
 *       403:
 *         description: Access denied - not enrolled or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Lesson not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/:lessonId",
  optionalAuth,
  lessonIdValidation,
  validate,
  lessonController.getLessonById
);

/**
 * @swagger
 * /api/lessons/module/{moduleId}:
 *   post:
 *     summary: Create a new lesson
 *     tags: [Lessons]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Module ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLessonRequest'
 *     responses:
 *       201:
 *         description: Lesson created successfully
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
 *                   example: "Lesson created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Lesson'
 *       400:
 *         description: Bad request - validation error or order conflict
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
 *         description: Forbidden - not course instructor or admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Module not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/module/:moduleId",
  isAuth(["instructor", "admin"]),
  optionalUploadLessonVideo,
  createLessonValidation,
  validate,
  lessonController.createLesson
);

/**
 * @swagger
 * /api/lessons/{lessonId}:
 *   put:
 *     summary: Update a lesson
 *     tags: [Lessons]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLessonRequest'
 *     responses:
 *       200:
 *         description: Lesson updated successfully
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
 *                   example: "Lesson updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Lesson'
 *       400:
 *         description: Bad request - validation error or order conflict
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
 *         description: Forbidden - not course instructor or admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Lesson not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  "/:lessonId",
  isAuth(["instructor", "admin"]),
  optionalUploadLessonVideo,
  updateLessonValidation,
  validate,
  lessonController.updateLesson
);

/**
 * @swagger
 * /api/lessons/{lessonId}:
 *   delete:
 *     summary: Delete a lesson
 *     tags: [Lessons]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson deleted successfully
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
 *       403:
 *         description: Forbidden - not course instructor or admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Lesson not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  "/:lessonId",
  isAuth(["instructor", "admin"]),
  deleteLessonValidation,
  validate,
  lessonController.deleteLesson
);

/**
 * @swagger
 * /api/lessons/module/{moduleId}/reorder:
 *   patch:
 *     summary: Reorder lessons in a module
 *     tags: [Lessons]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Module ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReorderLessonsRequest'
 *     responses:
 *       200:
 *         description: Lessons reordered successfully
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
 *                   example: "Lessons reordered successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lesson'
 *       400:
 *         description: Bad request - invalid lessons or validation error
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
 *         description: Forbidden - not course instructor or admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Module not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  "/module/:moduleId/reorder",
  isAuth(["instructor", "admin"]),
  reorderLessonsValidation,
  validate,
  lessonController.reorderLessons
);

/**
 * @swagger
 * /api/lessons/{lessonId}/progress:
 *   patch:
 *     summary: Update lesson progress for a student
 *     tags: [Lessons]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLessonProgressRequest'
 *     responses:
 *       200:
 *         description: Lesson progress updated successfully
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
 *                   example: "Lesson progress updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     lessonId:
 *                       type: integer
 *                       example: 1
 *                     progress:
 *                       $ref: '#/components/schemas/LessonProgress'
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
 *         description: Forbidden - not enrolled in course
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Lesson not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  "/:lessonId/progress",
  isAuth(["student", "instructor", "admin"]),
  updateLessonProgressValidation,
  validate,
  lessonController.updateLessonProgress
);

export default router;
