import { Router } from "express";
import paymentController from "../controllers/payment.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import {
  createPaymentValidation,
  verifyPaymentValidation,
  getPaymentHistoryValidation,
  paymentIdValidation,
  ipnValidation,
} from "../validations/payment.validation.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing and management with VNPay integration
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         userId:
 *           type: integer
 *           example: 123
 *         courseId:
 *           type: integer
 *           example: 456
 *         provider:
 *           type: string
 *           example: "VNPay"
 *         status:
 *           type: string
 *           enum: [pending, success, failed]
 *           example: "success"
 *         amountVND:
 *           type: integer
 *           example: 500000
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 123
 *             email:
 *               type: string
 *               example: "user@example.com"
 *             username:
 *               type: string
 *               example: "johndoe"
 *         course:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 456
 *             title:
 *               type: string
 *               example: "React Development Course"
 *             slug:
 *               type: string
 *               example: "react-development-course"
 *             image:
 *               type: string
 *               example: "https://example.com/course-image.jpg"
 *     PaymentUrl:
 *       type: object
 *       properties:
 *         paymentUrl:
 *           type: string
 *           example: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
 *         paymentId:
 *           type: integer
 *           example: 1
 *         txnRef:
 *           type: string
 *           example: "PAY1234567890"
 *     PaymentStats:
 *       type: object
 *       properties:
 *         totalRevenue:
 *           type: integer
 *           example: 50000000
 *         totalPayments:
 *           type: integer
 *           example: 150
 *         successfulPayments:
 *           type: integer
 *           example: 140
 *         pendingPayments:
 *           type: integer
 *           example: 5
 *         failedPayments:
 *           type: integer
 *           example: 5
 *         successRate:
 *           type: string
 *           example: "93.33"
 *         recentPayments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Payment'
 *     CreatePaymentRequest:
 *       type: object
 *       properties:
 *         bankCode:
 *           type: string
 *           example: "NCB"
 *           description: "Optional bank code for direct bank payment"
 *         locale:
 *           type: string
 *           enum: [vn, en]
 *           default: vn
 *           example: "vn"
 *           description: "Language for VNPay interface"
 *     VNPayVerifyRequest:
 *       type: object
 *       properties:
 *         vnp_Amount:
 *           type: string
 *           example: "50000000"
 *         vnp_BankCode:
 *           type: string
 *           example: "NCB"
 *         vnp_BankTranNo:
 *           type: string
 *           example: "VNP14526975"
 *         vnp_CardType:
 *           type: string
 *           example: "ATM"
 *         vnp_OrderInfo:
 *           type: string
 *           example: "Payment for course: React Development"
 *         vnp_PayDate:
 *           type: string
 *           example: "20241215103000"
 *         vnp_ResponseCode:
 *           type: string
 *           example: "00"
 *         vnp_TmnCode:
 *           type: string
 *           example: "TMNCODE"
 *         vnp_TransactionNo:
 *           type: string
 *           example: "14526975"
 *         vnp_TxnRef:
 *           type: string
 *           example: "PAY1234567890"
 *         vnp_SecureHash:
 *           type: string
 *           example: "a1b2c3d4e5f6..."
 *       required:
 *         - vnp_Amount
 *         - vnp_OrderInfo
 *         - vnp_PayDate
 *         - vnp_ResponseCode
 *         - vnp_TmnCode
 *         - vnp_TransactionNo
 *         - vnp_TxnRef
 *         - vnp_SecureHash
 */

/**
 * @swagger
 * /api/payment/courses/{courseId}/payments:
 *   post:
 *     summary: Create payment URL for course purchase
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID to purchase
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentRequest'
 *     responses:
 *       200:
 *         description: Payment URL created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Payment URL created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/PaymentUrl'
 *       400:
 *         description: Bad request - course not available, already enrolled, etc.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Already enrolled or instructor attempting self-purchase
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/courses/:courseId/payments",
  isAuth(), // Allow any authenticated user
  createPaymentValidation,
  validate,
  paymentController.createPaymentUrl
);

/**
 * @swagger
 * /api/payment/verify:
 *   post:
 *     summary: Verify VNPay payment (return URL callback)
 *     tags: [Payments]
 *     description: Handles VNPay return callback after payment completion
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VNPayVerifyRequest'
 *     responses:
 *       200:
 *         description: Payment verification completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Payment successful and course enrollment completed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "success"
 *                     payment:
 *                       $ref: '#/components/schemas/Payment'
 *                     enrollment:
 *                       type: object
 *                       properties:
 *                         courseId:
 *                           type: integer
 *                           example: 456
 *                         courseName:
 *                           type: string
 *                           example: "React Development Course"
 *       400:
 *         description: Invalid signature or payment data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Payment record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/verify",
  verifyPaymentValidation,
  validate,
  paymentController.verifyPayment
);

// Also handle GET requests for VNPay return URL
router.get("/verify", paymentController.verifyPayment);

/**
 * @swagger
 * /api/payment/ipn:
 *   get:
 *     summary: VNPay IPN (Instant Payment Notification) endpoint
 *     tags: [Payments]
 *     description: Webhook endpoint for VNPay to notify payment status changes
 *     parameters:
 *       - in: query
 *         name: vnp_Amount
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: vnp_ResponseCode
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: vnp_TxnRef
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: vnp_SecureHash
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: IPN processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 RspCode:
 *                   type: string
 *                   example: "00"
 *                 Message:
 *                   type: string
 *                   example: "Success"
 */
router.get("/ipn", ipnValidation, validate, paymentController.handleIPN);

/**
 * @swagger
 * /api/payment/history:
 *   get:
 *     summary: Get current user's payment history
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Your payment history retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Payment'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationInfo'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/history", isAuth(), paymentController.getMyPaymentHistory);

/**
 * @swagger
 * /api/payment/history/{userId}:
 *   get:
 *     summary: Get specific user's payment history (Admin only)
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: User payment history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Payment history retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Payment'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationInfo'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/history/:userId",
  isAuth(["admin"]),
  getPaymentHistoryValidation,
  validate,
  paymentController.getPaymentHistory
);

/**
 * @swagger
 * /api/payment/stats:
 *   get:
 *     summary: Get payment statistics (Admin only)
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Payment statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Payment statistics retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/PaymentStats'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/stats",
  isAuth(["admin"]),
  paymentController.getPaymentStats
);

/**
 * @swagger
 * /api/payment/:
 *   get:
 *     summary: Get all payments (Admin only)
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, success, failed]
 *         description: Filter by payment status
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *         description: Filter by payment provider
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *         description: Filter by course ID
 *     responses:
 *       200:
 *         description: All payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "All payments retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Payment'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationInfo'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", isAuth(["admin"]), paymentController.getAllPayments);


/**
 * @swagger
 * /api/payment/{paymentId}:
 *   get:
 *     summary: Get specific payment details
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Payment details retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - can only view own payments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Payment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/:paymentId",
  isAuth(),
  paymentIdValidation,
  validate,
  paymentController.getPaymentById
);

export default router;
