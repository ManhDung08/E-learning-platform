import { Router } from "express";
import quizController from "../controllers/quiz.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { isAuth, optionalAuth } from "../middlewares/auth.middleware.js";
import {
  createQuizValidation,
  updateQuizValidation,
  submitQuizValidation,
  quizQueryValidation,
  lessonIdValidation,
  quizIdValidation,
  attemptIdValidation,
} from "../validations/quiz.validation.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Quizzes
 *   description: Quiz management and attempt handling
 */

/**
 * @swagger
 * /api/quiz/lessons/{lessonId}/quizzes:
 *   get:
 *     summary: Get all quizzes for a lesson
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Quizzes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizzesResponse'
 *       404:
 *         description: Lesson not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/lessons/:lessonId/quizzes",
  lessonIdValidation,
  validate,
  optionalAuth,
  quizController.getAllQuizzesForLesson
);

/**
 * @swagger
 * /api/quiz/{quizId}:
 *   get:
 *     summary: Get quiz by ID with questions
 *     description: |
 *       Returns quiz with questions. Correct answers are only shown to instructors and admins.
 *       Students can see their previous attempts.
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizDetailResponse'
 *       404:
 *         description: Quiz not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/:quizId",
  quizIdValidation,
  validate,
  optionalAuth,
  quizController.getQuizById
);

/**
 * @swagger
 * /api/quiz/lessons/{lessonId}:
 *   post:
 *     summary: Create a new quiz for a lesson
 *     tags: [Quizzes]
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
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 description: Quiz title
 *                 example: "JavaScript Basics Quiz"
 *               questions:
 *                 type: array
 *                 minItems: 1
 *                 description: Array of quiz questions
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionText:
 *                       type: string
 *                       minLength: 5
 *                       maxLength: 500
 *                       description: Question text
 *                       example: "What is the correct way to declare a variable in JavaScript?"
 *                     options:
 *                       type: array
 *                       minItems: 2
 *                       maxItems: 6
 *                       description: Array of answer options
 *                       items:
 *                         type: string
 *                         maxLength: 200
 *                       example: ["var x = 5", "let x = 5", "const x = 5", "All of the above"]
 *                     correctOption:
 *                       type: string
 *                       description: The correct answer (must be one of the options)
 *                       example: "All of the above"
 *                   required:
 *                     - questionText
 *                     - options
 *                     - correctOption
 *             required:
 *               - title
 *               - questions
 *     responses:
 *       201:
 *         description: Quiz created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizResponse'
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
 *         description: Lesson not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/lesson/:lessonId",
  isAuth(["instructor", "admin"]),
  lessonIdValidation,
  createQuizValidation,
  validate,
  quizController.createQuiz
);

/**
 * @swagger
 * /api/quiz/{quizId}:
 *   put:
 *     summary: Update a quiz
 *     description: |
 *       Update quiz title and questions.
 *       Quiz cannot be updated if it has been attempted by students.
 *     tags: [Quizzes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 description: Quiz title
 *               questions:
 *                 type: array
 *                 minItems: 1
 *                 description: Array of quiz questions (replaces all existing questions)
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionText:
 *                       type: string
 *                       minLength: 5
 *                       maxLength: 500
 *                       description: Question text
 *                     options:
 *                       type: array
 *                       minItems: 2
 *                       maxItems: 6
 *                       description: Array of answer options
 *                       items:
 *                         type: string
 *                         maxLength: 200
 *                     correctOption:
 *                       type: string
 *                       description: The correct answer (must be one of the options)
 *                   required:
 *                     - questionText
 *                     - options
 *                     - correctOption
 *     responses:
 *       200:
 *         description: Quiz updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizResponse'
 *       400:
 *         description: Bad request - validation error or quiz has attempts
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
 *         description: Quiz not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  "/:quizId",
  isAuth(["instructor", "admin"]),
  quizIdValidation,
  updateQuizValidation,
  validate,
  quizController.updateQuiz
);

/**
 * @swagger
 * /api/quiz/{quizId}:
 *   delete:
 *     summary: Delete a quiz
 *     description: |
 *       Delete a quiz and all its questions.
 *       Quiz cannot be deleted if it has been attempted by students.
 *     tags: [Quizzes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request - quiz has attempts
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
 *         description: Quiz not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  "/:quizId",
  isAuth(["instructor", "admin"]),
  quizIdValidation,
  validate,
  quizController.deleteQuiz
);

/**
 * @swagger
 * /api/quiz/{quizId}/attempts:
 *   post:
 *     summary: Start a new quiz attempt
 *     description: |
 *       Start a new attempt for a quiz. User must be enrolled in the course.
 *       Instructors cannot take their own quizzes.
 *     tags: [Quizzes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *     responses:
 *       201:
 *         description: Quiz attempt started successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizAttemptResponse'
 *       400:
 *         description: Bad request - course not published or instructor trying to take quiz
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
 *         description: Quiz not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/:quizId/attempts",
  isAuth(["student"]),
  quizIdValidation,
  validate,
  quizController.startQuizAttempt
);

/**
 * @swagger
 * /api/quiz/attempts/{attemptId}:
 *   put:
 *     summary: Submit quiz attempt with answers
 *     tags: [Quizzes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Attempt ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: object
 *                 description: Object with question IDs as keys and selected options as values
 *                 example:
 *                   "1": "All of the above"
 *                   "2": "let x = 5"
 *                 additionalProperties:
 *                   type: string
 *             required:
 *               - answers
 *     responses:
 *       200:
 *         description: Quiz attempt submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizSubmissionResponse'
 *       400:
 *         description: Bad request - invalid answers or attempt already completed
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
 *         description: Forbidden - can only submit your own attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Attempt not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  "/attempts/:attemptId",
  isAuth(["student"]),
  attemptIdValidation,
  submitQuizValidation,
  validate,
  quizController.submitQuizAttempt
);

/**
 * @swagger
 * /api/quiz/me/attempts:
 *   get:
 *     summary: Get user's quiz attempts
 *     tags: [Quizzes]
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
 *         description: Number of attempts per page
 *       - in: query
 *         name: completed
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by completion status
 *       - in: query
 *         name: quizId
 *         schema:
 *           type: integer
 *         description: Filter by specific quiz ID
 *     responses:
 *       200:
 *         description: User quiz attempts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizAttemptsResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/me/attempts",
  isAuth(["student", "instructor", "admin"]),
  quizQueryValidation,
  validate,
  quizController.getUserQuizAttempts
);

/**
 * @swagger
 * /api/quiz/attempts/{attemptId}:
 *   get:
 *     summary: Get quiz attempt details
 *     description: |
 *       Get details of a specific quiz attempt.
 *       Users can only see their own attempts.
 *       Instructors can see attempts for their courses.
 *       Admins can see all attempts.
 *     tags: [Quizzes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Attempt ID
 *     responses:
 *       200:
 *         description: Quiz attempt retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizAttemptDetailResponse'
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
 *         description: Attempt not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/attempts/:attemptId",
  isAuth(["student", "instructor", "admin"]),
  attemptIdValidation,
  validate,
  quizController.getQuizAttempt
);

/**
 * @swagger
 * /api/quiz/{quizId}/attempts:
 *   get:
 *     summary: Get all attempts for a quiz (instructors and admins only)
 *     description: |
 *       Get all attempts for a specific quiz.
 *       Only instructors (for their courses) and admins can access this endpoint.
 *     tags: [Quizzes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
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
 *         description: Number of attempts per page
 *       - in: query
 *         name: completed
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by completion status
 *     responses:
 *       200:
 *         description: Quiz attempts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizAttemptsResponse'
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
 *         description: Quiz not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/:quizId/attempts",
  isAuth(["instructor", "admin"]),
  quizIdValidation,
  quizQueryValidation,
  validate,
  quizController.getQuizAttempts
);

export default router;
