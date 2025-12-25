import prisma from "../configs/prisma.config.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { PermissionError } from "../errors/PermissionError.js";
import { ConflictError } from "../errors/ConflictError.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import notificationService from "./notification.service.js";

const getAllQuizzesForLesson = async (
  lessonId,
  userId = null,
  userRole = "public"
) => {
  const parsedLessonId = parseInt(lessonId);

  // Check lesson access permissions
  const lesson = await prisma.lesson.findUnique({
    where: { id: parsedLessonId },
    include: {
      module: {
        include: {
          course: {
            select: {
              id: true,
              instructorId: true,
              isPublished: true,
              enrollments: {
                where: userId ? { userId } : undefined,
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

  const isInstructor = userId && lesson.module.course.instructorId === userId;
  const isAdmin = userRole === "admin";
  const isEnrolled = userId && lesson.module.course.enrollments.length > 0;

  // Access control
  if (
    !lesson.module.course.isPublished &&
    !isAdmin &&
    !isInstructor &&
    !isEnrolled
  ) {
    throw new PermissionError(
      "You don't have access to quizzes from this unpublished lesson",
      "quiz_access_denied"
    );
  }

  const quizzes = await prisma.quiz.findMany({
    where: { lessonId: parsedLessonId },
    select: {
      id: true,
      title: true,
      _count: {
        select: {
          questions: true,
        },
      },
      ...(userId &&
        (isEnrolled || isInstructor || isAdmin) && {
          attempts: {
            where: { userId },
            orderBy: { startedAt: "desc" },
            take: 1,
            select: {
              id: true,
              score: true,
              completedAt: true,
              startedAt: true,
            },
          },
        }),
    },
    orderBy: { id: "asc" },
  });

  return quizzes.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    questionCount: quiz._count.questions,
    ...(quiz.attempts && {
      lastAttempt: quiz.attempts[0] || null,
    }),
  }));
};

const getQuizById = async (quizId, userId = null, userRole = "public") => {
  const parsedQuizId = parseInt(quizId);

  const quiz = await prisma.quiz.findUnique({
    where: { id: parsedQuizId },
    include: {
      lesson: {
        include: {
          module: {
            include: {
              course: {
                select: {
                  id: true,
                  instructorId: true,
                  isPublished: true,
                  enrollments: {
                    where: userId ? { userId } : undefined,
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
      },
      ...(userId && {
        attempts: {
          where: { userId },
          orderBy: { startedAt: "desc" },
          select: {
            id: true,
            score: true,
            completedAt: true,
            startedAt: true,
          },
        },
      }),
    },
  });

  if (!quiz) {
    throw new NotFoundError("Quiz", "quiz_not_found");
  }

  const isInstructor =
    userId && quiz.lesson.module.course.instructorId === userId;
  const isAdmin = userRole === "admin";
  const isEnrolled = userId && quiz.lesson.module.course.enrollments.length > 0;

  if (
    !quiz.lesson.module.course.isPublished &&
    !isAdmin &&
    !isInstructor &&
    !isEnrolled
  ) {
    throw new PermissionError(
      "You don't have access to this quiz",
      "quiz_access_denied"
    );
  }

  const questions = await prisma.quizQuestion.findMany({
    where: { quizId: parsedQuizId },
    select: {
      id: true,
      questionText: true,
      optionsJson: true,
      ...((isInstructor || isAdmin) && {
        correctOption: true,
      }),
    },
    orderBy: { id: "asc" },
  });

  const questionsWithParsedOptions = questions.map((question) => {
    let options = [];
    try {
      options = JSON.parse(question.optionsJson);
    } catch (error) {
      console.error(
        `Error parsing options for question ${question.id}:`,
        error
      );
      options = [];
    }

    return {
      id: question.id,
      questionText: question.questionText,
      options,
      ...((isInstructor || isAdmin) && {
        correctOption: question.correctOption,
      }),
    };
  });

  return {
    id: quiz.id,
    title: quiz.title,
    lesson: {
      id: quiz.lesson.id,
      title: quiz.lesson.title,
      module: {
        id: quiz.lesson.module.id,
        title: quiz.lesson.module.title,
        courseId: quiz.lesson.module.courseId,
        course: {
          id: quiz.lesson.module.course.id,
          title: quiz.lesson.module.course.title,
          isPublished: quiz.lesson.module.course.isPublished,
        },
      },
    },
    questions: questionsWithParsedOptions,
    ...(quiz.attempts && {
      userAttempts: quiz.attempts,
    }),
  };
};

const createQuiz = async (lessonId, quizData, userId, userRole) => {
  const { title, questions } = quizData;
  const parsedLessonId = parseInt(lessonId);

  const lesson = await prisma.lesson.findUnique({
    where: { id: parsedLessonId },
    include: {
      module: {
        include: {
          course: {
            select: {
              id: true,
              instructorId: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    throw new NotFoundError("Lesson", "lesson_not_found");
  }

  if (userRole !== "admin" && lesson.module.course.instructorId !== userId) {
    throw new PermissionError(
      "You don't have permission to create quizzes for this lesson",
      "unauthorized_quiz_creation"
    );
  }

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    throw new BadRequestError(
      "Quiz must have at least one question",
      "invalid_questions"
    );
  }

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];

    if (!question.questionText || question.questionText.trim().length === 0) {
      throw new BadRequestError(
        `Question ${i + 1} must have text`,
        "invalid_question_text"
      );
    }

    if (
      !question.options ||
      !Array.isArray(question.options) ||
      question.options.length < 2
    ) {
      throw new BadRequestError(
        `Question ${i + 1} must have at least 2 options`,
        "invalid_question_options"
      );
    }

    if (
      !question.correctOption ||
      !question.options.includes(question.correctOption)
    ) {
      throw new BadRequestError(
        `Question ${i + 1} must have a valid correct option`,
        "invalid_correct_option"
      );
    }
  }

  const quiz = await prisma.$transaction(async (tx) => {
    const newQuiz = await tx.quiz.create({
      data: {
        title,
        lessonId: parsedLessonId,
      },
    });

    const questionsData = questions.map((question) => ({
      quizId: newQuiz.id,
      questionText: question.questionText.trim(),
      optionsJson: JSON.stringify(question.options),
      correctOption: question.correctOption,
    }));

    await tx.quizQuestion.createMany({
      data: questionsData,
    });

    return await tx.quiz.findUnique({
      where: { id: newQuiz.id },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                id: true,
                title: true,
                courseId: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
        questions: {
          orderBy: { id: "asc" },
        },
      },
    });
  });

  // Notify enrolled users about new quiz
  await notificationService
    .notifyEnrolledUsers(quiz.lesson.module.courseId, {
      type: "course_update",
      title: "New Quiz Available",
      content: `A new quiz "${title}" has been added to "${quiz.lesson.module.course.title}". Test your knowledge!`,
    })
    .catch((err) => {
      console.error("Failed to send quiz creation notifications:", err);
    });

  const questionsWithParsedOptions = quiz.questions.map((question) => {
    let options = [];
    try {
      options = JSON.parse(question.optionsJson);
    } catch (error) {
      console.error(
        `Error parsing options for question ${question.id}:`,
        error
      );
      options = [];
    }

    return {
      id: question.id,
      questionText: question.questionText,
      options,
      correctOption: question.correctOption,
    };
  });

  return {
    ...quiz,
    questions: questionsWithParsedOptions,
  };
};

const updateQuiz = async (quizId, quizData, userId, userRole) => {
  const { title, questions } = quizData;
  const parsedQuizId = parseInt(quizId);

  // Check quiz exists and permissions
  const quiz = await prisma.quiz.findUnique({
    where: { id: parsedQuizId },
    include: {
      lesson: {
        include: {
          module: {
            include: {
              course: {
                select: {
                  id: true,
                  instructorId: true,
                },
              },
            },
          },
        },
      },
      attempts: true,
    },
  });

  if (!quiz) {
    throw new NotFoundError("Quiz", "quiz_not_found");
  }

  if (
    userRole !== "admin" &&
    quiz.lesson.module.course.instructorId !== userId
  ) {
    throw new PermissionError(
      "You don't have permission to update this quiz",
      "unauthorized_quiz_update"
    );
  }

  // Check if quiz has attempts
  if (quiz.attempts.length > 0) {
    throw new BadRequestError(
      "Cannot update quiz that has been attempted by students",
      "quiz_has_attempts"
    );
  }

  const updateData = {};
  if (title !== undefined) updateData.title = title;

  const updatedQuiz = await prisma.$transaction(async (tx) => {
    const updated = await tx.quiz.update({
      where: { id: parsedQuizId },
      data: updateData,
    });

    if (questions) {
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new BadRequestError(
          "Quiz must have at least one question",
          "invalid_questions"
        );
      }

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];

        if (
          !question.questionText ||
          question.questionText.trim().length === 0
        ) {
          throw new BadRequestError(
            `Question ${i + 1} must have text`,
            "invalid_question_text"
          );
        }

        if (
          !question.options ||
          !Array.isArray(question.options) ||
          question.options.length < 2
        ) {
          throw new BadRequestError(
            `Question ${i + 1} must have at least 2 options`,
            "invalid_question_options"
          );
        }

        if (
          !question.correctOption ||
          !question.options.includes(question.correctOption)
        ) {
          throw new BadRequestError(
            `Question ${i + 1} must have a valid correct option`,
            "invalid_correct_option"
          );
        }
      }

      await tx.quizQuestion.deleteMany({
        where: { quizId: parsedQuizId },
      });

      const questionsData = questions.map((question) => ({
        quizId: parsedQuizId,
        questionText: question.questionText.trim(),
        optionsJson: JSON.stringify(question.options),
        correctOption: question.correctOption,
      }));

      await tx.quizQuestion.createMany({
        data: questionsData,
      });
    }

    return await tx.quiz.findUnique({
      where: { id: parsedQuizId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                id: true,
                title: true,
                courseId: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
        questions: {
          orderBy: { id: "asc" },
        },
      },
    });
  });

  const questionsWithParsedOptions = updatedQuiz.questions.map((question) => {
    let options = [];
    try {
      options = JSON.parse(question.optionsJson);
    } catch (error) {
      console.error(
        `Error parsing options for question ${question.id}:`,
        error
      );
      options = [];
    }

    return {
      id: question.id,
      questionText: question.questionText,
      options,
      correctOption: question.correctOption,
    };
  });

  return {
    ...updatedQuiz,
    questions: questionsWithParsedOptions,
  };
};

const deleteQuiz = async (quizId, userId, userRole) => {
  const parsedQuizId = parseInt(quizId);

  // Check quiz exists and permissions
  const quiz = await prisma.quiz.findUnique({
    where: { id: parsedQuizId },
    include: {
      lesson: {
        include: {
          module: {
            include: {
              course: {
                select: {
                  id: true,
                  instructorId: true,
                },
              },
            },
          },
        },
      },
      attempts: true,
    },
  });

  if (!quiz) {
    throw new NotFoundError("Quiz", "quiz_not_found");
  }

  if (
    userRole !== "admin" &&
    quiz.lesson.module.course.instructorId !== userId
  ) {
    throw new PermissionError(
      "You don't have permission to delete this quiz",
      "unauthorized_quiz_delete"
    );
  }

  // Check if quiz has attempts
  if (quiz.attempts.length > 0) {
    throw new BadRequestError(
      "Cannot delete quiz that has been attempted by students",
      "quiz_has_attempts"
    );
  }

  // Delete quiz (cascade will delete questions)
  await prisma.quiz.delete({
    where: { id: parsedQuizId },
  });

  // Notify enrolled users about quiz deletion
  await notificationService
    .notifyEnrolledUsers(quiz.lesson.module.course.id, {
      type: "course_update",
      title: "Quiz Removed",
      content: `A quiz "${quiz.title}" has been removed from the course.`,
    })
    .catch((err) => {
      console.error("Failed to send quiz deletion notifications:", err);
    });

  return { success: true, message: "Quiz deleted successfully" };
};

const startQuizAttempt = async (quizId, userId) => {
  const parsedQuizId = parseInt(quizId);

  // Check quiz exists and access permissions
  const quiz = await prisma.quiz.findUnique({
    where: { id: parsedQuizId },
    include: {
      lesson: {
        include: {
          module: {
            include: {
              course: {
                select: {
                  id: true,
                  instructorId: true,
                  isPublished: true,
                  enrollments: {
                    where: { userId },
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
      },
      questions: {
        select: {
          id: true,
          questionText: true,
          optionsJson: true,
        },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!quiz) {
    throw new NotFoundError("Quiz", "quiz_not_found");
  }

  // Check access permissions
  const isEnrolled = quiz.lesson.module.course.enrollments.length > 0;
  const isInstructor = quiz.lesson.module.course.instructorId === userId;

  if (!quiz.lesson.module.course.isPublished) {
    throw new BadRequestError(
      "Cannot take quiz from unpublished course",
      "course_not_published"
    );
  }

  if (!isEnrolled && !isInstructor) {
    throw new PermissionError(
      "You must be enrolled in the course to take this quiz",
      "not_enrolled"
    );
  }

  // Create quiz attempt
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      quizId: parsedQuizId,
    },
  });

  // Parse options for questions
  const questionsWithParsedOptions = quiz.questions.map((question) => {
    let options = [];
    try {
      options = JSON.parse(question.optionsJson);
    } catch (error) {
      console.error(
        `Error parsing options for question ${question.id}:`,
        error
      );
      options = [];
    }

    return {
      id: question.id,
      questionText: question.questionText,
      options,
    };
  });

  return {
    attemptId: attempt.id,
    quiz: {
      id: quiz.id,
      title: quiz.title,
      questions: questionsWithParsedOptions,
    },
    startedAt: attempt.startedAt,
  };
};

const submitQuizAttempt = async (attemptId, answers, userId) => {
  const parsedAttemptId = parseInt(attemptId);

  // Check attempt exists and belongs to user
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: parsedAttemptId },
    include: {
      quiz: {
        include: {
          questions: {
            select: {
              id: true,
              optionsJson: true,
              correctOption: true,
            },
          },
        },
      },
    },
  });

  if (!attempt) {
    throw new NotFoundError("Quiz attempt", "attempt_not_found");
  }

  if (attempt.userId !== userId) {
    throw new PermissionError(
      "You can only submit your own quiz attempts",
      "unauthorized_submission"
    );
  }

  if (attempt.completedAt) {
    throw new BadRequestError(
      "Quiz attempt has already been completed",
      "attempt_already_completed"
    );
  }

  // Validate answers format
  if (!answers || typeof answers !== "object") {
    throw new BadRequestError(
      "Invalid answers format",
      "invalid_answers_format"
    );
  }

  // Calculate score
  const totalQuestions = attempt.quiz.questions.length;
  let correctAnswers = 0;

  attempt.quiz.questions.forEach((question) => {
    const userAnswer = answers[question.id.toString()];

    // Parse options from JSON to get the actual option text
    let options = [];
    try {
      options = JSON.parse(question.optionsJson);
    } catch (error) {
      console.error(
        `Error parsing options for question ${question.id}:`,
        error
      );
    }

    // correctOption is stored as index (1-based), get the actual option text
    const correctOptionIndex = parseInt(question.correctOption) - 1;
    const correctOptionText = options[correctOptionIndex];

    if (userAnswer && userAnswer === correctOptionText) {
      correctAnswers++;
    }
  });

  const score =
    totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  // Update attempt with score and completion time
  const completedAttempt = await prisma.quizAttempt.update({
    where: { id: parsedAttemptId },
    data: {
      score,
      completedAt: new Date(),
    },
    include: {
      quiz: {
        select: {
          id: true,
          title: true,
          lesson: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  return {
    id: completedAttempt.id,
    score: completedAttempt.score,
    correctAnswers,
    totalQuestions,
    completedAt: completedAttempt.completedAt,
    quiz: completedAttempt.quiz,
  };
};

const getUserQuizAttempts = async (
  userId,
  page = 1,
  limit = 10,
  filters = {}
) => {
  const skip = (page - 1) * limit;

  const where = {
    userId: parseInt(userId),
  };

  if (filters.quizId) {
    where.quizId = parseInt(filters.quizId);
  }

  if (filters.completed !== undefined) {
    where.completedAt = filters.completed ? { not: null } : null;
  }

  const [attempts, totalCount] = await Promise.all([
    prisma.quizAttempt.findMany({
      where,
      skip,
      take: limit,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            lesson: {
              select: {
                id: true,
                title: true,
                module: {
                  select: {
                    id: true,
                    title: true,
                    course: {
                      select: {
                        id: true,
                        title: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { startedAt: "desc" },
    }),
    prisma.quizAttempt.count({ where }),
  ]);

  return {
    attempts,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      limit,
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPreviousPage: page > 1,
    },
  };
};

const getQuizAttempt = async (attemptId, userId, userRole = "student") => {
  const parsedAttemptId = parseInt(attemptId);

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: parsedAttemptId },
    include: {
      quiz: {
        include: {
          lesson: {
            include: {
              module: {
                include: {
                  course: {
                    select: {
                      id: true,
                      instructorId: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!attempt) {
    throw new NotFoundError("Quiz attempt", "attempt_not_found");
  }

  // Permission check - users can see their own attempts, instructors can see attempts for their courses, admins see all
  const isOwner = attempt.userId === userId;
  const isInstructor =
    attempt.quiz.lesson.module.course.instructorId === userId;
  const isAdmin = userRole === "admin";

  if (!isOwner && !isInstructor && !isAdmin) {
    throw new PermissionError(
      "You don't have permission to view this quiz attempt",
      "unauthorized_attempt_access"
    );
  }

  return attempt;
};

const getQuizAttempts = async (
  quizId,
  userId,
  userRole,
  page = 1,
  limit = 10,
  filters = {}
) => {
  const parsedQuizId = parseInt(quizId);

  const quiz = await prisma.quiz.findUnique({
    where: { id: parsedQuizId },
    include: {
      lesson: {
        include: {
          module: {
            include: {
              course: {
                select: {
                  instructorId: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!quiz) {
    throw new NotFoundError("Quiz", "quiz_not_found");
  }

  const isInstructor = quiz.lesson.module.course.instructorId === userId;
  const isAdmin = userRole === "admin";

  if (!isInstructor && !isAdmin) {
    throw new PermissionError(
      "You don't have permission to view quiz attempts",
      "unauthorized_access"
    );
  }

  const skip = (page - 1) * limit;
  const where = { quizId: parsedQuizId };

  if (filters.completed !== undefined) {
    where.completedAt = filters.completed ? { not: null } : null;
  }

  const [attempts, totalCount] = await Promise.all([
    prisma.quizAttempt.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    }),
    prisma.quizAttempt.count({ where }),
  ]);

  return {
    attempts,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      limit,
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPreviousPage: page > 1,
    },
  };
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
