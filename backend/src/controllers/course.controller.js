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
  getInstructorCourses,
};
