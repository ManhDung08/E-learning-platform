import statisticService from "../services/statistic.service.js";

/**
 * Get overview statistics (admin dashboard)
 */
const getOverviewStatistics = async (req, res, next) => {
  try {
    const statistics = await statisticService.getOverviewStatistics();

    return res.status(200).json({
      success: true,
      message: "Overview statistics retrieved successfully",
      data: statistics,
    });
  } catch (error) {
    console.error("Get overview statistics error:", error);
    next(error);
  }
};

/**
 * Get user statistics
 */
const getUserStatistics = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const statistics = await statisticService.getUserStatistics(filters);

    return res.status(200).json({
      success: true,
      message: "User statistics retrieved successfully",
      data: statistics,
    });
  } catch (error) {
    console.error("Get user statistics error:", error);
    next(error);
  }
};

/**
 * Get course statistics
 */
const getCourseStatistics = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const statistics = await statisticService.getCourseStatistics(filters);

    return res.status(200).json({
      success: true,
      message: "Course statistics retrieved successfully",
      data: statistics,
    });
  } catch (error) {
    console.error("Get course statistics error:", error);
    next(error);
  }
};

/**
 * Get revenue statistics
 */
const getRevenueStatistics = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const statistics = await statisticService.getRevenueStatistics(filters);

    return res.status(200).json({
      success: true,
      message: "Revenue statistics retrieved successfully",
      data: statistics,
    });
  } catch (error) {
    console.error("Get revenue statistics error:", error);
    next(error);
  }
};

/**
 * Get learning progress statistics
 */
const getLearningStatistics = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const statistics = await statisticService.getLearningStatistics(filters);

    return res.status(200).json({
      success: true,
      message: "Learning statistics retrieved successfully",
      data: statistics,
    });
  } catch (error) {
    console.error("Get learning statistics error:", error);
    next(error);
  }
};

/**
 * Get engagement statistics
 */
const getEngagementStatistics = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const statistics = await statisticService.getEngagementStatistics(filters);

    return res.status(200).json({
      success: true,
      message: "Engagement statistics retrieved successfully",
      data: statistics,
    });
  } catch (error) {
    console.error("Get engagement statistics error:", error);
    next(error);
  }
};

/**
 * Get instructor performance statistics
 */
const getInstructorStatistics = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const statistics = await statisticService.getInstructorStatistics(filters);

    return res.status(200).json({
      success: true,
      message: "Instructor statistics retrieved successfully",
      data: statistics,
    });
  } catch (error) {
    console.error("Get instructor statistics error:", error);
    next(error);
  }
};

/**
 * Generate comprehensive report with all statistics
 */
const generateComprehensiveReport = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const report = await statisticService.generateComprehensiveReport(filters);

    return res.status(200).json({
      success: true,
      message: "Comprehensive report generated successfully",
      data: report,
    });
  } catch (error) {
    console.error("Generate comprehensive report error:", error);
    next(error);
  }
};

/**
 * Get growth trends over time
 */
const getGrowthTrends = async (req, res, next) => {
  try {
    const period = req.query.period || "monthly";
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 12;

    // Validate parsed limit
    if (isNaN(limit) || limit < 1 || limit > 365) {
      return res.status(400).json({
        success: false,
        message: "Limit must be a valid integer between 1 and 365",
      });
    }

    const trends = await statisticService.getGrowthTrends(period, limit);

    return res.status(200).json({
      success: true,
      message: "Growth trends retrieved successfully",
      data: trends,
    });
  } catch (error) {
    console.error("Get growth trends error:", error);
    next(error);
  }
};

export default {
  getOverviewStatistics,
  getUserStatistics,
  getCourseStatistics,
  getRevenueStatistics,
  getLearningStatistics,
  getEngagementStatistics,
  getInstructorStatistics,
  generateComprehensiveReport,
  getGrowthTrends,
};
