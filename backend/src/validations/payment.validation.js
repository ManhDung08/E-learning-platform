import { body, param, check } from "express-validator";

export const createPaymentValidation = [
  param("courseId")
    .notEmpty()
    .withMessage("Course ID is required")
    .isInt({ min: 1 })
    .withMessage("Course ID must be a positive integer"),

  body("bankCode")
    .optional()
    .isString()
    .withMessage("Bank code must be a string")
    .isLength({ min: 2, max: 20 })
    .withMessage("Bank code must be between 2 and 20 characters"),

  body("locale")
    .optional()
    .isIn(["vn", "en"])
    .withMessage("Locale must be either 'vn' or 'en'"),
];

export const verifyPaymentValidation = [
  // Use check() to validate from both body and query
  check("vnp_Amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Amount must be numeric"),

  check("vnp_BankCode")
    .optional()
    .isString()
    .withMessage("Bank code must be a string"),

  check("vnp_BankTranNo")
    .optional()
    .isString()
    .withMessage("Bank transaction number must be a string"),

  check("vnp_CardType")
    .optional()
    .isString()
    .withMessage("Card type must be a string"),

  check("vnp_OrderInfo")
    .notEmpty()
    .withMessage("Order info is required")
    .isString()
    .withMessage("Order info must be a string"),

  check("vnp_PayDate")
    .notEmpty()
    .withMessage("Payment date is required")
    .isString()
    .withMessage("Payment date must be a string"),

  check("vnp_ResponseCode")
    .notEmpty()
    .withMessage("Response code is required")
    .isString()
    .withMessage("Response code must be a string"),

  check("vnp_TmnCode")
    .notEmpty()
    .withMessage("Terminal code is required")
    .isString()
    .withMessage("Terminal code must be a string"),

  check("vnp_TransactionNo")
    .notEmpty()
    .withMessage("Transaction number is required")
    .isString()
    .withMessage("Transaction number must be a string"),

  check("vnp_TxnRef")
    .notEmpty()
    .withMessage("Transaction reference is required")
    .isString()
    .withMessage("Transaction reference must be a string"),

  check("vnp_SecureHash")
    .notEmpty()
    .withMessage("Secure hash is required")
    .isString()
    .withMessage("Secure hash must be a string"),
];

export const getPaymentHistoryValidation = [
  param("userId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("User ID must be a positive integer"),
];

export const paymentIdValidation = [
  param("paymentId")
    .notEmpty()
    .withMessage("Payment ID is required")
    .isInt({ min: 1 })
    .withMessage("Payment ID must be a positive integer"),
];

export const ipnValidation = [
  check("vnp_Amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Amount must be numeric"),

  check("vnp_ResponseCode")
    .notEmpty()
    .withMessage("Response code is required")
    .isString()
    .withMessage("Response code must be a string"),

  check("vnp_TxnRef")
    .notEmpty()
    .withMessage("Transaction reference is required")
    .isString()
    .withMessage("Transaction reference must be a string"),

  check("vnp_SecureHash")
    .notEmpty()
    .withMessage("Secure hash is required")
    .isString()
    .withMessage("Secure hash must be a string"),
];
