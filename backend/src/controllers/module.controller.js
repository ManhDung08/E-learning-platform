import moduleService from "../services/module.service.js";

/**
 * Get all modules for a course
 */
const getModulesByCourseId = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role || "public";

    const modules = await moduleService.getModulesByCourseId(
      courseId,
      userId,
      userRole
    );

    return res.status(200).json({
      success: true,
      message: "Modules retrieved successfully",
      data: modules,
    });
  } catch (error) {
    console.error("Get modules by course ID error:", error);
    next(error);
  }
};

/**
 * Get a specific module by ID
 */
const getModuleById = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role || "public";

    const module = await moduleService.getModuleById(
      moduleId,
      userId,
      userRole
    );

    return res.status(200).json({
      success: true,
      message: "Module retrieved successfully",
      data: module,
    });
  } catch (error) {
    console.error("Get module by ID error:", error);
    next(error);
  }
};

/**
 * Create a new module
 */
const createModule = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const moduleData = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const module = await moduleService.createModule(
      courseId,
      moduleData,
      userId,
      userRole
    );

    return res.status(201).json({
      success: true,
      message: "Module created successfully",
      data: module,
    });
  } catch (error) {
    console.error("Create module error:", error);
    next(error);
  }
};

/**
 * Update a module
 */
const updateModule = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const moduleData = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const module = await moduleService.updateModule(
      moduleId,
      moduleData,
      userId,
      userRole
    );

    return res.status(200).json({
      success: true,
      message: "Module updated successfully",
      data: module,
    });
  } catch (error) {
    console.error("Update module error:", error);
    next(error);
  }
};

/**
 * Delete a module
 */
const deleteModule = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const result = await moduleService.deleteModule(moduleId, userId, userRole);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.deletedModule,
    });
  } catch (error) {
    console.error("Delete module error:", error);
    next(error);
  }
};

/**
 * Reorder modules in a course
 */
const reorderModules = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { moduleOrders } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const modules = await moduleService.reorderModules(
      courseId,
      moduleOrders,
      userId,
      userRole
    );

    return res.status(200).json({
      success: true,
      message: "Modules reordered successfully",
      data: modules,
    });
  } catch (error) {
    console.error("Reorder modules error:", error);
    next(error);
  }
};

export default {
  getModulesByCourseId,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
};
