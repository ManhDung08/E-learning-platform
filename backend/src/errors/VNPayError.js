import AppError from "./AppError.js";

export class VNPayError extends AppError {
  constructor(responseCode, message) {
    const vnpayMessages = {
      "00": "Payment successful",
      "07": "Transaction suspected of fraud",
      "09": "Customer has not registered for internetbanking service",
      10: "Customer has incorrectly verified information more than 3 times",
      11: "Payment deadline has expired. Please try again",
      12: "Customer account is locked",
      13: "You entered incorrect OTP. Please try again",
      24: "Customer canceled the transaction",
      51: "Your account does not have enough balance to make the payment",
      65: "Your account has exceeded the daily transaction limit",
      75: "Payment bank is under maintenance",
      79: "Customer entered payment password incorrectly more than allowed times",
      99: "Unknown error occurred",
    };

    const errorMessage =
      message || vnpayMessages[responseCode] || `VNPay error: ${responseCode}`;
    super(errorMessage, 400);
    this.name = "VNPayError";
    this.responseCode = responseCode;
  }
}
