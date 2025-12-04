import { body, query, param } from "express-validator";

export const createQuizValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Quiz title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Quiz title must be between 3 and 200 characters"),

  body("questions")
    .isArray({ min: 1 })
    .withMessage("Quiz must have at least one question"),

  body("questions.*.questionText")
    .trim()
    .notEmpty()
    .withMessage("Question text is required")
    .isLength({ min: 5, max: 500 })
    .withMessage("Question text must be between 5 and 500 characters"),

  body("questions.*.options")
    .isArray({ min: 2, max: 6 })
    .withMessage("Each question must have between 2 and 6 options"),

  body("questions.*.options.*")
    .trim()
    .notEmpty()
    .withMessage("Option text cannot be empty")
    .isLength({ min: 1, max: 200 })
    .withMessage("Option text must be between 1 and 200 characters"),

  body("questions.*.correctOption")
    .trim()
    .notEmpty()
    .withMessage("Correct option is required"),
];

export const updateQuizValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Quiz title must be between 3 and 200 characters"),

  body("questions")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Quiz must have at least one question"),

  body("questions.*.questionText")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Question text is required")
    .isLength({ min: 5, max: 500 })
    .withMessage("Question text must be between 5 and 500 characters"),

  body("questions.*.options")
    .optional()
    .isArray({ min: 2, max: 6 })
    .withMessage("Each question must have between 2 and 6 options"),

  body("questions.*.options.*")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Option text cannot be empty")
    .isLength({ min: 1, max: 200 })
    .withMessage("Option text must be between 1 and 200 characters"),

  body("questions.*.correctOption")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Correct option is required"),
];

export const submitQuizValidation = [
  body("answers")
    .isObject()
    .withMessage("Answers must be an object")
    .custom((value) => {
      // Check that answers is not empty
      if (Object.keys(value).length === 0) {
        throw new Error("At least one answer must be provided");
      }

      // Check that all values are strings
      for (const [questionId, answer] of Object.entries(value)) {
        if (typeof answer !== 'string' || answer.trim().length === 0) {
          throw new Error(`Answer for question ${questionId} must be a non-empty string`);
        }
      }

      return true;
    }),
];

export const quizQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("completed")
    .optional()
    .isIn(["true", "false"])
    .withMessage("Completed must be 'true' or 'false'"),

  query("quizId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quiz ID must be a positive integer"),
];

export const lessonIdValidation = [
  param("lessonId")
    .isInt({ min: 1 })
    .withMessage("Lesson ID must be a positive integer"),
];

export const quizIdValidation = [
  param("quizId")
    .isInt({ min: 1 })
    .withMessage("Quiz ID must be a positive integer"),
];

export const attemptIdValidation = [
  param("attemptId")
    .isInt({ min: 1 })
    .withMessage("Attempt ID must be a positive integer"),
];