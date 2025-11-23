import courseService from "../services/course.service.js";

const getAllCourses = async (req, res, next) => {
  try {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      category: req.query.category,
      isPublished: req.query.isPublished,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const result = await courseService.getAllCourses(filters);
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
    const course = await courseService.getCourseById(courseId);

    return res.status(200).json({
      success: true,
      message: "Course retrieved successfully",
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
    const course = await courseService.getCourseBySlug(slug);

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
    const courseData = req.body;
    const instructorId = req.user.id;

    const course = await courseService.createCourse(courseData, instructorId);
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
    const courseData = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const course = await courseService.updateCourse(
      courseId,
      courseData,
      userId,
      userRole
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
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
    };

    const result = await courseService.getUserEnrollments(userId, filters);
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
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      isPublished: req.query.isPublished,
    };

    const result = await courseService.getInstructorCourses(
      instructorId,
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
