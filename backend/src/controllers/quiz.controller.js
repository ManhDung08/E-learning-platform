import quizService from "../services/quiz.service.js";

const getAllQuizzesForLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user?.id || null;
    const userRole = req.user?.role || "public";

    const quizzes = await quizService.getAllQuizzesForLesson(
      lessonId,
      userId,
      userRole
    );
    return res.status(200).json({
      success: true,
      message: "Quizzes retrieved successfully",
      data: quizzes,
    });
  } catch (error) {
    console.error("Get quizzes for lesson error:", error);
    next(error);
  }
};

const getQuizById = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.user?.id || null;
    const userRole = req.user?.role || "public";

    const quiz = await quizService.getQuizById(quizId, userId, userRole);
    return res.status(200).json({
      success: true,
      message: "Quiz retrieved successfully",
      data: quiz,
    });
  } catch (error) {
    console.error("Get quiz by ID error:", error);
    next(error);
  }
};

const createQuiz = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const quizData = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const quiz = await quizService.createQuiz(
      lessonId,
      quizData,
      userId,
      userRole
    );
    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: quiz,
    });
  } catch (error) {
    console.error("Create quiz error:", error);
    next(error);
  }
};

const updateQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const quizData = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const quiz = await quizService.updateQuiz(
      quizId,
      quizData,
      userId,
      userRole
    );
    return res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      data: quiz,
    });
  } catch (error) {
    console.error("Update quiz error:", error);
    next(error);
  }
};

const deleteQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const result = await quizService.deleteQuiz(quizId, userId, userRole);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Delete quiz error:", error);
    next(error);
  }
};

const startQuizAttempt = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const attempt = await quizService.startQuizAttempt(quizId, userId);
    return res.status(201).json({
      success: true,
      message: "Quiz attempt started successfully",
      data: attempt,
    });
  } catch (error) {
    console.error("Start quiz attempt error:", error);
    next(error);
  }
};

const submitQuizAttempt = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    const result = await quizService.submitQuizAttempt(
      attemptId,
      answers,
      userId
    );
    return res.status(200).json({
      success: true,
      message: "Quiz attempt submitted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Submit quiz attempt error:", error);
    next(error);
  }
};

const getUserQuizAttempts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      quizId: req.query.quizId,
      completed:
        req.query.completed !== undefined
          ? req.query.completed === "true"
          : undefined,
    };

    const result = await quizService.getUserQuizAttempts(
      userId,
      page,
      limit,
      filters
    );
    return res.status(200).json({
      success: true,
      message: "User quiz attempts retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get user quiz attempts error:", error);
    next(error);
  }
};

const getQuizAttempt = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const attempt = await quizService.getQuizAttempt(
      attemptId,
      userId,
      userRole
    );
    return res.status(200).json({
      success: true,
      message: "Quiz attempt retrieved successfully",
      data: attempt,
    });
  } catch (error) {
    console.error("Get quiz attempt error:", error);
    next(error);
  }
};

const getQuizAttempts = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      completed:
        req.query.completed !== undefined
          ? req.query.completed === "true"
          : undefined,
    };

    const result = await quizService.getQuizAttempts(
      quizId,
      userId,
      userRole,
      page,
      limit,
      filters
    );
    return res.status(200).json({
      success: true,
      message: "Quiz attempts retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get quiz attempts error:", error);
    next(error);
  }
};

export default {
  getAllQuizzesForLesson,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  startQuizAttempt,
  submitQuizAttempt,
  getUserQuizAttempts,
  getQuizAttempt,
  getQuizAttempts,
};
