import courseService from "../services/course.service.js";

const getAllCourses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      search: req.query.search,
      category: req.query.category,
      isPublished: req.query.isPublished,
      instructorId: req.query.instructorId,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const result = await courseService.getAllCourses(page, limit, filters);
    return res.status(200).json({
      success: true,
      message: "Courses retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get all courses error:", error);
    next(error);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    // Admin-only function
    const course = await courseService.getCourseById(courseId);

    return res.status(200).json({
      success: true,
      message: "Course details retrieved successfully",
      data: course,
    });
  } catch (error) {
    console.error("Get course by ID error:", error);
    next(error);
  }
};

const getCourseBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Extract user context from middleware (will be null if not authenticated)
    const userId = req.user?.id || null;
    const userRole = req.user?.role || "public";

    const course = await courseService.getCourseBySlug(slug, userId, userRole);

    return res.status(200).json({
      success: true,
      message: "Course retrieved successfully",
      data: course,
    });
  } catch (error) {
    console.error("Get course by slug error:", error);
    next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const courseData = {...req.body};

    if (courseData.isPublished === 'true') {
        courseData.isPublished = true;
    } else if (courseData.isPublished === 'false') {
        courseData.isPublished = false;
    }

    const userId = req.user.id;
    const userRole = req.user.role;
    const imageFile = req.file;

    const course = await courseService.createCourse(
      courseData,
      userId,
      userRole,
      imageFile
    );
    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    console.error("Create course error:", error);
    next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const courseData = { ...req.body };

    const isPublishedStr = String(courseData.isPublished);

    if (isPublishedStr === 'true') {
        courseData.isPublished = true;
    } else if (isPublishedStr === 'false') {
        courseData.isPublished = false;
    }

    const userId = req.user.id;
    const userRole = req.user.role;
    const imageFile = req.file;

    const course = await courseService.updateCourse(
      courseId,
      courseData,
      userId,
      userRole,
      imageFile
    );
    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    console.error("Update course error:", error);
    next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const result = await courseService.deleteCourse(courseId, userId, userRole);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Delete course error:", error);
    next(error);
  }
};

const enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await courseService.enrollInCourse(courseId, userId);
    return res.status(201).json({
      success: true,
      message: "Successfully enrolled in course",
      data: enrollment,
    });
  } catch (error) {
    console.error("Enroll in course error:", error);
    next(error);
  }
};

const unenrollFromCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const result = await courseService.unenrollFromCourse(courseId, userId);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Unenroll from course error:", error);
    next(error);
  }
};

const getUserEnrollments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      search: req.query.search,
    };

    const result = await courseService.getUserEnrollments(
      userId,
      page,
      limit,
      filters
    );
    return res.status(200).json({
      success: true,
      message: "User enrollments retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get user enrollments error:", error);
    next(error);
  }
};

const getInstructorCourses = async (req, res, next) => {
  try {
    const instructorId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      search: req.query.search,
      isPublished: req.query.isPublished,
    };

    const result = await courseService.getInstructorCourses(
      instructorId,
      page,
      limit,
      filters
    );
    return res.status(200).json({
      success: true,
      message: "Instructor courses retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get instructor courses error:", error);
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const reviewData = req.body;

    const review = await courseService.createReview(
      parseInt(courseId),
      userId,
      reviewData
    );
    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { courseId, reviewId } = req.params;
    const userId = req.user.id;
    const reviewData = req.body;

    const review = await courseService.updateReview(
      parseInt(courseId),
      parseInt(reviewId),
      userId,
      reviewData
    );
    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    console.error("Update review error:", error);
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { courseId, reviewId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const result = await courseService.deleteReview(
      parseInt(courseId),
      parseInt(reviewId),
      userId,
      userRole
    );
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Delete review error:", error);
    next(error);
  }
};

const getCourseReviews = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      rating: req.query.rating,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const result = await courseService.getCourseReviews(
      parseInt(courseId),
      page,
      limit,
      filters
    );
    return res.status(200).json({
      success: true,
      message: "Course reviews retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get course reviews error:", error);
    next(error);
  }
};

const createDiscussion = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const discussionData = req.body;

    const discussion = await courseService.createDiscussion(
      parseInt(courseId),
      userId,
      discussionData
    );
    return res.status(201).json({
      success: true,
      message: "Discussion created successfully",
      data: discussion,
    });
  } catch (error) {
    console.error("Create discussion error:", error);
    next(error);
  }
};

const replyToDiscussion = async (req, res, next) => {
  try {
    const { courseId, discussionId } = req.params;
    const userId = req.user.id;
    const replyData = req.body;

    const reply = await courseService.replyToDiscussion(
      parseInt(courseId),
      parseInt(discussionId),
      userId,
      replyData
    );
    return res.status(201).json({
      success: true,
      message: "Reply created successfully",
      data: reply,
    });
  } catch (error) {
    console.error("Reply to discussion error:", error);
    next(error);
  }
};

const updateDiscussion = async (req, res, next) => {
  try {
    const { courseId, discussionId } = req.params;
    const userId = req.user.id;
    const discussionData = req.body;

    const discussion = await courseService.updateDiscussion(
      parseInt(courseId),
      parseInt(discussionId),
      userId,
      discussionData
    );
    return res.status(200).json({
      success: true,
      message: "Discussion updated successfully",
      data: discussion,
    });
  } catch (error) {
    console.error("Update discussion error:", error);
    next(error);
  }
};

const deleteDiscussion = async (req, res, next) => {
  try {
    const { courseId, discussionId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const result = await courseService.deleteDiscussion(
      parseInt(courseId),
      parseInt(discussionId),
      userId,
      userRole
    );
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Delete discussion error:", error);
    next(error);
  }
};

const getCourseDiscussions = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const result = await courseService.getCourseDiscussions(
      parseInt(courseId),
      page,
      limit,
      filters
    );
    return res.status(200).json({
      success: true,
      message: "Course discussions retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get course discussions error:", error);
    next(error);
  }
};

const getCourseEnrolledStudents = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      search: req.query.search,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const instructorId = req.user.id;
    const userRole = req.user.role;

    const result = await courseService.getCourseEnrolledStudents(
      courseId,
      instructorId,
      userRole,
      page,
      limit,
      filters
    );

    return res.status(200).json({
      success: true,
      message: "Enrolled students retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get course enrolled students error:", error);
    next(error);
  }
};

export default {
  getAllCourses,
  getCourseById,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
  getUserEnrollments,
  getCourseEnrolledStudents,
  getInstructorCourses,
  // Review controllers
  createReview,
  updateReview,
  deleteReview,
  getCourseReviews,
  // Discussion controllers
  createDiscussion,
  replyToDiscussion,
  updateDiscussion,
  deleteDiscussion,
  getCourseDiscussions,
};
