import lessonNoteService from "../services/lessonNote.service.js";

/**
 * Get user's note for a specific lesson
 */
const getLessonNote = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const note = await lessonNoteService.getLessonNote(lessonId, userId);

    return res.status(200).json({
      success: true,
      message: note
        ? "Lesson note retrieved successfully"
        : "No note found for this lesson",
      data: note,
    });
  } catch (error) {
    console.error("Get lesson note error:", error);
    next(error);
  }
};

/**
 * Create or update user's note for a lesson
 */
const upsertLessonNote = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const noteData = req.body;
    const userId = req.user.id;

    const note = await lessonNoteService.upsertLessonNote(
      lessonId,
      noteData,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Lesson note saved successfully",
      data: note,
    });
  } catch (error) {
    console.error("Upsert lesson note error:", error);
    next(error);
  }
};

/**
 * Delete user's note for a lesson
 */
const deleteLessonNote = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const result = await lessonNoteService.deleteLessonNote(lessonId, userId);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.deletedNote,
    });
  } catch (error) {
    console.error("Delete lesson note error:", error);
    next(error);
  }
};

/**
 * Get all notes for a user in a specific course
 */
const getUserNotesForCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const notes = await lessonNoteService.getUserNotesForCourse(
      courseId,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Course notes retrieved successfully",
      data: notes,
    });
  } catch (error) {
    console.error("Get user notes for course error:", error);
    next(error);
  }
};

export default {
  getLessonNote,
  upsertLessonNote,
  deleteLessonNote,
  getUserNotesForCourse,
};
