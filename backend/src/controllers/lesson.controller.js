import lessonService from "../services/lesson.service.js";

/**
 * Get all lessons for a module
 */
const getLessonsByModuleId = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role || "public";

    const lessons = await lessonService.getLessonsByModuleId(
      moduleId,
      userId,
      userRole
    );

    return res.status(200).json({
      success: true,
      message: "Lessons retrieved successfully",
      data: lessons,
    });
  } catch (error) {
    console.error("Get lessons by module ID error:", error);
    next(error);
  }
};

/**
 * Get a specific lesson by ID
 */
const getLessonById = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role || "public";

    const lesson = await lessonService.getLessonById(
      lessonId,
      userId,
      userRole
    );

    return res.status(200).json({
      success: true,
      message: "Lesson retrieved successfully",
      data: lesson,
    });
  } catch (error) {
    console.error("Get lesson by ID error:", error);
    next(error);
  }
};

/**
 * Create a new lesson
 */
const createLesson = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const lessonData = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    const videoFile = req.file; // Video file from multer upload

    const lesson = await lessonService.createLesson(
      moduleId,
      lessonData,
      userId,
      userRole,
      videoFile
    );

    return res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      data: lesson,
    });
  } catch (error) {
    console.error("Create lesson error:", error);
    next(error);
  }
};

/**
 * Update a lesson
 */
const updateLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const lessonData = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    const videoFile = req.file; // Video file from multer upload

    const lesson = await lessonService.updateLesson(
      lessonId,
      lessonData,
      userId,
      userRole,
      videoFile
    );

    return res.status(200).json({
      success: true,
      message: "Lesson updated successfully",
      data: lesson,
    });
  } catch (error) {
    console.error("Update lesson error:", error);
    next(error);
  }
};

/**
 * Delete a lesson
 */
const deleteLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const result = await lessonService.deleteLesson(lessonId, userId, userRole);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.deletedLesson,
    });
  } catch (error) {
    console.error("Delete lesson error:", error);
    next(error);
  }
};

/**
 * Reorder lessons in a module
 */
const reorderLessons = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { lessonOrders } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const lessons = await lessonService.reorderLessons(
      moduleId,
      lessonOrders,
      userId,
      userRole
    );

    return res.status(200).json({
      success: true,
      message: "Lessons reordered successfully",
      data: lessons,
    });
  } catch (error) {
    console.error("Reorder lessons error:", error);
    next(error);
  }
};

/**
 * Update lesson progress for a student
 */
const updateLessonProgress = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const progressData = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const result = await lessonService.updateLessonProgress(
      lessonId,
      progressData,
      userId,
      userRole
    );

    return res.status(200).json({
      success: true,
      message: "Lesson progress updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Update lesson progress error:", error);
    next(error);
  }
};

export default {
  getLessonsByModuleId,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  updateLessonProgress,
};
