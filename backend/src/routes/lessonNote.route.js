import { Router } from "express";
import lessonNoteController from "../controllers/lessonNote.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import {
  lessonIdParamValidation,
  courseIdParamValidation,
  upsertLessonNoteValidation,
  deleteLessonNoteValidation,
} from "../validations/lessonNote.validation.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Lesson Notes
 *   description: Personal lesson notes management
 */

/**
 * @swagger
 * /api/lesson-note/lesson/{lessonId}:
 *   get:
 *     summary: Get user's note for a specific lesson
 *     tags: [Lesson Notes]
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
 *         description: Lesson note retrieved successfully (or null if no note exists)
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
 *                   example: "Lesson note retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/LessonNote'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not enrolled in course
 *       404:
 *         description: Lesson not found
 */
router.get(
  "/lesson/:lessonId",
  isAuth(["student", "instructor", "admin"]),
  lessonIdParamValidation,
  validate,
  lessonNoteController.getLessonNote
);

/**
 * @swagger
 * /api/lesson-note/lesson/{lessonId}:
 *   put:
 *     summary: Create or update user's note for a lesson
 *     tags: [Lesson Notes]
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
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 10000
 *                 example: "This is my personal note about this lesson"
 *     responses:
 *       200:
 *         description: Lesson note saved successfully
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
 *                   example: "Lesson note saved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/LessonNoteWithLesson'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not enrolled in course
 *       404:
 *         description: Lesson not found
 */
router.put(
  "/lesson/:lessonId",
  isAuth(["student", "instructor", "admin"]),
  upsertLessonNoteValidation,
  validate,
  lessonNoteController.upsertLessonNote
);

/**
 * @swagger
 * /api/lesson-note/lesson/{lessonId}:
 *   delete:
 *     summary: Delete user's note for a lesson
 *     tags: [Lesson Notes]
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
 *         description: Lesson note deleted successfully
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
 *                   example: "Lesson note deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Can only delete your own notes
 *       404:
 *         description: Lesson note not found
 */
router.delete(
  "/lesson/:lessonId",
  isAuth(["student", "instructor", "admin"]),
  deleteLessonNoteValidation,
  validate,
  lessonNoteController.deleteLessonNote
);

/**
 * @swagger
 * /api/lesson-note/course/{courseId}:
 *   get:
 *     summary: Get all user's notes for a specific course
 *     tags: [Lesson Notes]
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
 *         description: Course notes retrieved successfully
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
 *                   example: "Course notes retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LessonNoteWithLesson'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not enrolled in course
 *       404:
 *         description: Course not found
 */
router.get(
  "/course/:courseId",
  isAuth(["student", "instructor", "admin"]),
  courseIdParamValidation,
  validate,
  lessonNoteController.getUserNotesForCourse
);

export default router;
