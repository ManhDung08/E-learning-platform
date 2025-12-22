import paymentService from "../services/payment.service.js";
import { getClientIpAddress } from "../utils/network.util.js";

// Create payment URL for course purchase
const createPaymentUrl = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { bankCode, locale = "vn" } = req.body || {};
    const userId = req.user.id;
    const clientIp = getClientIpAddress(req);

    const result = await paymentService.createPaymentUrl(
      courseId,
      userId,
      bankCode,
      locale,
      clientIp
    );

    return res.status(200).json({
      success: true,
      message: "Payment URL created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Create payment URL error:", error);
    next(error);
  }
};

// Verify payment (VNPay return callback)
const verifyPayment = async (req, res, next) => {
  try {
    // VNPay can send data as query params (GET) or body params (POST)
    const vnpParams = { ...req.query, ...req.body };

    const result = await paymentService.verifyPayment(vnpParams);

    // Redirect to frontend with payment result
    const frontendUrl = process.env.FRONTEND_URL;
    const paymentResult = {
      success: true,
      status: result.status,
      courseId: result.enrollment?.courseId || result.payment?.course?.id || "",
      courseName: encodeURIComponent(
        result.enrollment?.courseName || result.payment?.course?.title || ""
      ),
      paymentId: result.payment?.id || "",
      message: encodeURIComponent(result.message || "Payment processed"),
    };

    // Build query string for frontend
    const queryParams = new URLSearchParams(paymentResult).toString();

    return res.redirect(`${frontendUrl}/payment/result?${queryParams}`);
  } catch (error) {
    console.error("Verify payment error:", error);

    // Redirect to frontend with error
    const frontendUrl = process.env.FRONTEND_URL;
    const errorParams = new URLSearchParams({
      success: "false",
      status: "failed",
      message: encodeURIComponent(
        error.message || "Payment verification failed"
      ),
    }).toString();

    return res.redirect(`${frontendUrl}/payment/result?${errorParams}`);
  }
};

const handleIPN = async (req, res, next) => {
  try {
    const vnpParams = req.query;

    // Validate required VNPay IPN parameters
    const requiredParams = [
      "vnp_Amount",
      "vnp_ResponseCode",
      "vnp_TxnRef",
      "vnp_SecureHash",
    ];
    const missingParams = requiredParams.filter((param) => !vnpParams[param]);

    if (missingParams.length > 0) {
      console.error(
        `Missing required IPN parameters: ${missingParams.join(", ")}`
      );
      return res
        .status(200)
        .json({ RspCode: "01", Message: "Missing required parameters" });
    }

    const result = await paymentService.verifyPayment(vnpParams);

    // VNPay expects specific response format
    if (result.status === "success") {
      return res.status(200).json({ RspCode: "00", Message: "Success" });
    } else {
      return res.status(200).json({ RspCode: "01", Message: "Fail" });
    }
  } catch (error) {
    console.error("IPN handler error:", error);

    // VNPay needs immediate response
    if (error.name === "VNPayError") {
      return res.status(200).json({ RspCode: "01", Message: "Payment failed" });
    }

    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};

// Get payment history for current user or specific user (admin only)
const getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { userId: targetUserId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

    const result = await paymentService.getPaymentHistory(
      userId,
      userRole,
      targetUserId,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: "Payment history retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get payment history error:", error);
    next(error);
  }
};

// Get current user's payment history
const getMyPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

    const result = await paymentService.getPaymentHistory(
      userId,
      userRole,
      null,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: "Your payment history retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get my payment history error:", error);
    next(error);
  }
};

// Get specific payment details
const getPaymentById = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const payment = await paymentService.getPaymentById(
      paymentId,
      userId,
      userRole
    );

    return res.status(200).json({
      success: true,
      message: "Payment details retrieved successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Get payment by ID error:", error);
    next(error);
  }
};

// Get all payments (admin only)
const getAllPayments = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const filters = {
      status: req.query.status,
      provider: req.query.provider,
      userId: req.query.userId,
      courseId: req.query.courseId,
    };

    const result = await paymentService.getAllPayments(page, limit, filters);

    return res.status(200).json({
      success: true,
      message: "All payments retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get all payments error:", error);
    next(error);
  }
};

// Get payment statistics (admin only)
const getPaymentStats = async (req, res, next) => {
  try {
    const stats = await paymentService.getPaymentStats();

    return res.status(200).json({
      success: true,
      message: "Payment statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Get payment stats error:", error);
    next(error);
  }
};

export default {
  createPaymentUrl,
  verifyPayment,
  handleIPN,
  getPaymentHistory,
  getMyPaymentHistory,
  getPaymentById,
  getAllPayments,
  getPaymentStats,
};
