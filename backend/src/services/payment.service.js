import prisma from "../configs/prisma.config.js";
import crypto from "crypto";
import moment from "moment";
import { NotFoundError } from "../errors/NotFoundError.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { ConflictError } from "../errors/ConflictError.js";
import { PermissionError } from "../errors/PermissionError.js";
import { VNPayError } from "../errors/VNPayError.js";
import { emitToUser } from "../configs/socket.config.js";
import notificationService from "./notification.service.js";

const vnpayConfig = {
  tmnCode: process.env.VNPAY_TMN_CODE || "your_tmn_code",
  hashSecret: process.env.VNPAY_HASH_SECRET || "your_hash_secret",
  url: process.env.VNPAY_URL,
  api: process.env.VNPAY_API,
  returnUrl: process.env.VNPAY_RETURN_URL,
  ipnUrl: process.env.VNPAY_IPN_URL,
};

const sortObject = (obj) => {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
};

const verifyVNPaySignature = (vnpParams, secureHash) => {
  const paramsCopy = { ...vnpParams };
  delete paramsCopy["vnp_SecureHash"];
  delete paramsCopy["vnp_SecureHashType"];

  // Sort parameters by key and build sign data
  const sortedKeys = Object.keys(paramsCopy).sort();

  const signDataParts = [];
  for (let key of sortedKeys) {
    const value = paramsCopy[key];
    // Only include non-empty values
    if (value !== "" && value !== undefined && value !== null) {
      // URL encode both key and value, with + for spaces
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(value).replace(/%20/g, "+");
      signDataParts.push(`${encodedKey}=${encodedValue}`);
    }
  }

  const signData = signDataParts.join("&");

  const signed = crypto
    .createHmac("sha512", vnpayConfig.hashSecret)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  return signed === secureHash;
};

const createPaymentUrl = async (
  courseId,
  userId,
  bankCode = "",
  locale = "vn",
  ipAddress = "127.0.0.1"
) => {
  // Check if course exists and is published
  const course = await prisma.course.findUnique({
    where: { id: parseInt(courseId) },
    select: {
      id: true,
      title: true,
      priceVND: true,
      isPublished: true,
      instructorId: true,
    },
  });

  if (!course) {
    throw new NotFoundError("Course not found");
  }

  if (!course.isPublished) {
    throw new BadRequestError("Course is not available for purchase");
  }

  // Check if course is free
  if (course.priceVND <= 0) {
    throw new BadRequestError("Cannot create payment for free courses");
  }

  // Check if price is reasonable (not too high to prevent errors)
  if (course.priceVND > 100000000) {
    // 100 million VND
    throw new BadRequestError("Course price exceeds maximum allowed amount");
  }

  // Check if user is not the instructor
  if (course.instructorId === userId) {
    throw new BadRequestError("Instructors cannot purchase their own courses");
  }

  // Check if user is already enrolled
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: userId,
        courseId: parseInt(courseId),
      },
    },
  });

  if (existingEnrollment) {
    throw new ConflictError("You are already enrolled in this course");
  }

  // Use transaction to prevent race conditions
  const PAYMENT_TIMEOUT_MINUTES = 15;
  const timeoutDate = new Date(
    Date.now() - PAYMENT_TIMEOUT_MINUTES * 60 * 1000
  );

  // Use transaction to atomically handle payment creation/update
  const { payment, txnRef } = await prisma.$transaction(async (tx) => {
    // Cancel any expired pending payment for this user and course
    await tx.payment.updateMany({
      where: {
        userId: userId,
        courseId: parseInt(courseId),
        status: "pending",
        createdAt: {
          lt: timeoutDate,
        },
      },
      data: {
        status: "failed",
      },
    });

    // Check for valid pending payment (not expired)
    const pendingPayment = await tx.payment.findFirst({
      where: {
        userId: userId,
        courseId: parseInt(courseId),
        status: "pending",
        createdAt: {
          gte: timeoutDate,
        },
      },
    });

    if (pendingPayment) {
      return {
        payment: pendingPayment,
        txnRef: pendingPayment.transactionRef,
      };
    }

    // Create new payment
    const newPayment = await tx.payment.create({
      data: {
        userId: userId,
        courseId: parseInt(courseId),
        provider: "VNPay",
        status: "pending",
        amountVND: course.priceVND,
        transactionRef: "TEMP",
      },
    });

    const newTxnRef = `PAY${newPayment.id}${Date.now()}`;
    const updatedPayment = await tx.payment.update({
      where: { id: newPayment.id },
      data: { transactionRef: newTxnRef },
    });

    return {
      payment: updatedPayment,
      txnRef: newTxnRef,
    };
  });

  const createDate = moment().format("YYYYMMDDHHmmss");
  const ipAddr = ipAddress || "127.0.0.1";
  const orderInfo = `Payment for course: ${course.title}`;
  const amount = course.priceVND * 100;

  let vnpUrl = vnpayConfig.url;
  const vnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: vnpayConfig.tmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: "VND",
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: amount,
    vnp_ReturnUrl: vnpayConfig.returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  if (bankCode && bankCode.trim() !== "") {
    vnpParams.vnp_BankCode = bankCode.trim();
  }

  // Sort parameters and create signature
  const sortedParams = sortObject(vnpParams);
  let signData = "";

  for (let key in sortedParams) {
    signData += key + "=" + sortedParams[key] + "&";
  }

  signData = signData.slice(0, -1);
  const signed = crypto
    .createHmac("sha512", vnpayConfig.hashSecret)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  vnpParams.vnp_SecureHash = signed;

  // Build URL
  vnpUrl += "?" + new URLSearchParams(vnpParams).toString();

  return {
    paymentUrl: vnpUrl,
    paymentId: payment.id,
    txnRef: vnpParams.vnp_TxnRef,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
  };
};

const verifyPayment = async (vnpParams) => {
  const {
    vnp_SecureHash,
    vnp_TxnRef,
    vnp_ResponseCode,
    vnp_Amount,
    vnp_OrderInfo,
  } = vnpParams;

  // Log the payment verification attempt
  console.log("Payment verification attempt:", {
    txnRef: vnp_TxnRef,
    responseCode: vnp_ResponseCode,
    amount: vnp_Amount,
  });

  // Verify signature
  const isValidSignature = verifyVNPaySignature(vnpParams, vnp_SecureHash);

  if (!isValidSignature) {
    console.error("Invalid VNPay signature for transaction:", vnp_TxnRef);
    throw new BadRequestError("Invalid payment signature");
  }

  // Find the payment record by transaction reference (as string)
  const payment = await prisma.payment.findUnique({
    where: { transactionRef: vnp_TxnRef },
    include: {
      user: {
        select: { id: true, email: true, username: true },
      },
      course: {
        select: { id: true, title: true, instructorId: true },
      },
    },
  });

  if (!payment) {
    console.error(
      "Payment record not found for transaction reference:",
      vnp_TxnRef
    );
    throw new NotFoundError("Payment record not found");
  }

  // Check if payment was already processed
  if (payment.status !== "pending") {
    console.log("Payment already processed:", {
      transactionRef: vnp_TxnRef,
      currentStatus: payment.status,
    });
    return {
      status: payment.status,
      message: `Payment already ${payment.status}`,
      payment: payment,
    };
  }

  // Verify amount
  const expectedAmount = payment.amountVND * 100; // Convert to VNPay format
  if (parseInt(vnp_Amount) !== expectedAmount) {
    console.error("Payment amount mismatch:", {
      expected: expectedAmount,
      received: vnp_Amount,
    });
    throw new BadRequestError("Payment amount mismatch");
  }

  // Process payment result
  if (vnp_ResponseCode === "00") {
    console.log("Processing successful payment:", vnp_TxnRef);
    const updatedPayment = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { transactionRef: vnp_TxnRef },
        data: { status: "success" },
        include: {
          user: { select: { id: true, email: true, username: true } },
          course: { select: { id: true, title: true, instructorId: true } },
        },
      });

      await tx.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: payment.userId,
            courseId: payment.courseId,
          },
        },
        update: {},
        create: {
          userId: payment.userId,
          courseId: payment.courseId,
        },
      });

      return payment;
    });

    // Use notification service instead of direct Prisma calls
    await notificationService.createNotification({
      userId: updatedPayment.userId,
      type: "system",
      title: "Course Purchase Successful",
      content: `You have successfully enrolled in "${updatedPayment.course.title}". You can now start learning!`,
    });

    console.log("Payment processed successfully:", vnp_TxnRef);
    return {
      status: "success",
      message: "Payment successful and course enrollment completed",
      payment: {
        id: updatedPayment.id,
        status: updatedPayment.status,
        amountVND: updatedPayment.amountVND,
        createdAt: updatedPayment.createdAt,
        course: {
          id: updatedPayment.course.id,
          title: updatedPayment.course.title,
        },
      },
      enrollment: {
        courseId: updatedPayment.courseId,
        courseName: updatedPayment.course.title,
      },
    };
  } else {
    console.log("Processing failed payment:", {
      transactionRef: vnp_TxnRef,
      responseCode: vnp_ResponseCode,
    });
    const updatedPayment = await prisma.payment.update({
      where: { transactionRef: vnp_TxnRef },
      data: { status: "failed" },
      include: {
        course: { select: { id: true, title: true } },
      },
    });

    // Use notification service instead of direct Prisma calls
    await notificationService.createNotification({
      userId: updatedPayment.userId,
      type: "system",
      title: "Payment Failed",
      content: `Payment for course "${updatedPayment.course.title}" was unsuccessful. Please try again.`,
    });

    throw new VNPayError(
      vnp_ResponseCode,
      `Payment failed for course: ${updatedPayment.course.title}`
    );
  }
};

const getPaymentHistory = async (
  userId,
  userRole,
  targetUserId = null,
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  // Determine which user's payments to fetch
  let queryUserId = userId;
  if (userRole === "admin" && targetUserId) {
    queryUserId = parseInt(targetUserId);
  } else if (
    userRole !== "admin" &&
    targetUserId &&
    parseInt(targetUserId) !== userId
  ) {
    throw new PermissionError("You can only view your own payment history");
  }

  const [payments, totalCount] = await Promise.all([
    prisma.payment.findMany({
      where: { userId: queryUserId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        status: true,
        amountVND: true,
        provider: true,
        createdAt: true,
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            image: true,
          },
        },
      },
    }),
    prisma.payment.count({
      where: { userId: queryUserId },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    payments,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

const getPaymentById = async (paymentId, userId, userRole) => {
  const payment = await prisma.payment.findUnique({
    where: { id: parseInt(paymentId) },
    select: {
      id: true,
      status: true,
      amountVND: true,
      provider: true,
      createdAt: true,
      userId: true, // Needed for permission check
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          image: true,
          priceVND: true,
          instructor: {
            select: { id: true, username: true },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new NotFoundError("Payment not found");
  }

  // Check permissions
  if (userRole !== "admin" && payment.userId !== userId) {
    throw new PermissionError("You can only view your own payments");
  }

  return payment;
};

const getAllPayments = async (page = 1, limit = 10, filters = {}) => {
  const skip = (page - 1) * limit;

  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.provider) where.provider = filters.provider;
  if (filters.userId && !isNaN(parseInt(filters.userId))) {
    where.userId = parseInt(filters.userId);
  }
  if (filters.courseId && !isNaN(parseInt(filters.courseId))) {
    where.courseId = parseInt(filters.courseId);
  }

  const [payments, totalCount] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, email: true, username: true },
        },
        course: {
          select: { id: true, title: true, slug: true },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    payments,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

// Get payment statistics (for admin dashboard)
const getPaymentStats = async () => {
  const [
    totalRevenue,
    totalPayments,
    successfulPayments,
    pendingPayments,
    failedPayments,
    recentPayments,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "success" },
      _sum: { amountVND: true },
    }),
    prisma.payment.count(),
    prisma.payment.count({ where: { status: "success" } }),
    prisma.payment.count({ where: { status: "pending" } }),
    prisma.payment.count({ where: { status: "failed" } }),
    prisma.payment.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { username: true } },
        course: { select: { title: true } },
      },
    }),
  ]);

  return {
    totalRevenue: totalRevenue._sum.amountVND || 0,
    totalPayments,
    successfulPayments,
    pendingPayments,
    failedPayments,
    successRate:
      totalPayments > 0
        ? ((successfulPayments / totalPayments) * 100).toFixed(2)
        : 0,
    recentPayments,
  };
};

export default {
  createPaymentUrl,
  verifyPayment,
  getPaymentHistory,
  getPaymentById,
  getAllPayments,
  getPaymentStats,
};
