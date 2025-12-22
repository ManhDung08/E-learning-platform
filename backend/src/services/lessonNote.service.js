import prisma from "../configs/prisma.config.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { PermissionError } from "../errors/PermissionError.js";
import { BadRequestError } from "../errors/BadRequestError.js";

/**
 * Get user's note for a specific lesson
 */
const getLessonNote = async (lessonId, userId) => {
  const parsedLessonId = parseInt(lessonId);

  if (isNaN(parsedLessonId)) {
    throw new BadRequestError("Invalid lesson ID format", "invalid_lesson_id");
  }

  // Check if lesson exists and user has access
  const lesson = await prisma.lesson.findUnique({
    where: { id: parsedLessonId },
    include: {
      module: {
        include: {
          course: {
            select: {
              id: true,
              isPublished: true,
              instructorId: true,
              enrollments: {
                where: { userId },
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    throw new NotFoundError("Lesson", "lesson_not_found");
  }

  const isInstructor = lesson.module.course.instructorId === userId;
  const isEnrolled = lesson.module.course.enrollments.length > 0;

  // User must be enrolled or be the instructor to have notes
  if (!isEnrolled && !isInstructor) {
    throw new PermissionError(
      "You must be enrolled in the course to access lesson notes",
      "note_access_denied"
    );
  }

  // Get the note if it exists
  const note = await prisma.lessonNote.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId: parsedLessonId,
      },
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return note;
};

/**
 * Create or update user's note for a lesson
 */
const upsertLessonNote = async (lessonId, noteData, userId) => {
  const { content } = noteData;
  const parsedLessonId = parseInt(lessonId);

  if (isNaN(parsedLessonId)) {
    throw new BadRequestError("Invalid lesson ID format", "invalid_lesson_id");
  }

  // Check if lesson exists and user has access
  const lesson = await prisma.lesson.findUnique({
    where: { id: parsedLessonId },
    include: {
      module: {
        include: {
          course: {
            select: {
              id: true,
              isPublished: true,
              instructorId: true,
              enrollments: {
                where: { userId },
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    throw new NotFoundError("Lesson", "lesson_not_found");
  }

  const isInstructor = lesson.module.course.instructorId === userId;
  const isEnrolled = lesson.module.course.enrollments.length > 0;

  // User must be enrolled or be the instructor to create notes
  if (!isEnrolled && !isInstructor) {
    throw new PermissionError(
      "You must be enrolled in the course to create lesson notes",
      "note_create_denied"
    );
  }

  // Upsert the note
  const note = await prisma.lessonNote.upsert({
    where: {
      userId_lessonId: {
        userId,
        lessonId: parsedLessonId,
      },
    },
    update: {
      content: content.trim(),
    },
    create: {
      userId,
      lessonId: parsedLessonId,
      content: content.trim(),
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      lesson: {
        select: {
          id: true,
          title: true,
          module: {
            select: {
              id: true,
              title: true,
              courseId: true,
            },
          },
        },
      },
    },
  });

  return note;
};

/**
 * Delete user's note for a lesson
 */
const deleteLessonNote = async (lessonId, userId) => {
  const parsedLessonId = parseInt(lessonId);

  if (isNaN(parsedLessonId)) {
    throw new BadRequestError("Invalid lesson ID format", "invalid_lesson_id");
  }

  // Check if note exists
  const note = await prisma.lessonNote.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId: parsedLessonId,
      },
    },
    select: {
      id: true,
      userId: true,
      lesson: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!note) {
    throw new NotFoundError("Lesson note", "note_not_found");
  }

  // Ensure user owns the note (extra security check)
  if (note.userId !== userId) {
    throw new PermissionError(
      "You can only delete your own notes",
      "note_delete_denied"
    );
  }

  // Delete the note
  await prisma.lessonNote.delete({
    where: {
      userId_lessonId: {
        userId,
        lessonId: parsedLessonId,
      },
    },
  });

  return {
    success: true,
    message: "Lesson note deleted successfully",
    deletedNote: {
      id: note.id,
      lessonId: parsedLessonId,
      lessonTitle: note.lesson.title,
    },
  };
};

/**
 * Get all notes for a user in a specific course
 */
const getUserNotesForCourse = async (courseId, userId) => {
  const parsedCourseId = parseInt(courseId);

  if (isNaN(parsedCourseId)) {
    throw new BadRequestError("Invalid course ID format", "invalid_course_id");
  }

  // Check if course exists and user has access
  const course = await prisma.course.findUnique({
    where: { id: parsedCourseId },
    include: {
      enrollments: {
        where: { userId },
        select: { id: true },
      },
    },
  });

  if (!course) {
    throw new NotFoundError("Course", "course_not_found");
  }

  const isInstructor = course.instructorId === userId;
  const isEnrolled = course.enrollments.length > 0;

  // User must be enrolled or be the instructor
  if (!isEnrolled && !isInstructor) {
    throw new PermissionError(
      "You must be enrolled in the course to access notes",
      "notes_access_denied"
    );
  }

  // Get all notes for this user in this course
  const notes = await prisma.lessonNote.findMany({
    where: {
      userId,
      lesson: {
        module: {
          courseId: parsedCourseId,
        },
      },
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      lesson: {
        select: {
          id: true,
          title: true,
          order: true,
          module: {
            select: {
              id: true,
              title: true,
              order: true,
            },
          },
        },
      },
    },
    orderBy: [
      { lesson: { module: { order: "asc" } } },
      { lesson: { order: "asc" } },
    ],
  });

  return notes;
};

export default {
  getLessonNote,
  upsertLessonNote,
  deleteLessonNote,
  getUserNotesForCourse,
};
