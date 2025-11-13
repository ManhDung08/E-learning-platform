import { createTransporter } from "../configs/mail.config.js";
import AppError from "../errors/AppError.js";

const sendEmail = async (mailOptions) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
      ...mailOptions,
    });
    console.log(`Email sent: ${mailOptions.subject} - ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new AppError(`Failed to send email: ${error.message}`);
  }
};

const buildEmailTemplate = (title, content) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          margin: 20px 0;
          background-color: #4CAF50;
          color: white !important;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .button:hover {
          background-color: #45a049;
        }
        .success-icon {
          color: #4CAF50;
          font-size: 48px;
          text-align: center;
          margin: 20px 0;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 12px;
          margin: 15px 0;
        }
        .code {
          background-color: #f4f4f4;
          padding: 15px;
          border-radius: 5px;
          font-family: monospace;
          font-size: 24px;
          text-align: center;
          letter-spacing: 5px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .link {
          word-break: break-all;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <h2>${title}</h2>
          ${content}
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ===== 1. VERIFICATION EMAIL =====
export const sendVerificationEmail = async (email, username, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  const content = `
    <p>Welcome, <strong>${username}</strong>!</p>
    <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
    <p>Click the button below to verify your email:</p>
    <a href="${verificationUrl}" class="button">Verify Email</a>
    <p>Or copy and paste this link into your browser:</p>
    <p class="link">${verificationUrl}</p>
    <div class="warning">
      <strong>⏰ Note:</strong> This link will expire in 24 hours.
    </div>
    <p>If you didn't create an account, please ignore this email.</p>
  `;

  return sendEmail({
    to: email,
    subject: "Verify Your Email Address",
    html: buildEmailTemplate("Email Verification", content),
  });
};

// ===== 2. WELCOME EMAIL =====
export const sendWelcomeEmail = async (email, username) => {
  const content = `
    <div class="success-icon">✓</div>
    <h2 style="text-align: center; color: #4CAF50;">Email Verified Successfully!</h2>
    <p>Hi <strong>${username}</strong>,</p>
    <p>Your email has been verified successfully. You can now enjoy all features of our platform.</p>
    <p>Thank you for joining us!</p>
  `;

  return sendEmail({
    to: email,
    subject: "Welcome! Your Email is Verified",
    html: buildEmailTemplate("Welcome", content),
  });
};

// ===== 3. FORGOT PASSWORD EMAIL =====
export const sendForgotPasswordEmail = async (email, username, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const content = `
    <p>Hi <strong>${username}</strong>,</p>
    <p>We received a request to reset your password. Click the button below to reset it:</p>
    <a href="${resetUrl}" class="button">Reset Password</a>
    <p>Or copy and paste this link into your browser:</p>
    <p class="link">${resetUrl}</p>
    <div class="warning">
      <strong>⏰ Note:</strong> This link will expire in 1 hour.
    </div>
    <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
  `;

  return sendEmail({
    to: email,
    subject: "Reset Your Password",
    html: buildEmailTemplate("Password Reset Request", content),
  });
};

// ===== 4. PASSWORD RESET SUCCESS EMAIL =====
export const sendPasswordResetSuccessEmail = async (email, username) => {
  const content = `
    <div class="success-icon">✓</div>
    <p>Hi <strong>${username}</strong>,</p>
    <p>Your password has been successfully reset.</p>
    <p>If you didn't make this change, please contact our support team immediately.</p>
    <p><strong>Security Tip:</strong> Never share your password with anyone.</p>
  `;

  return sendEmail({
    to: email,
    subject: "Password Reset Successful",
    html: buildEmailTemplate("Password Changed", content),
  });
};

// ===== 5. PASSWORD CHANGED EMAIL =====
export const sendPasswordChangedEmail = async (email, username) => {
  const content = `
    <div class="success-icon">🔐</div>
    <p>Hi <strong>${username}</strong>,</p>
    <p>This is a confirmation that your password has been changed successfully.</p>
    <p><strong>Changed at:</strong> ${new Date().toLocaleString()}</p>
    <div class="warning">
      <strong>⚠️ Security Alert:</strong> If you didn't make this change, please contact support immediately and secure your account.
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Your Password Has Been Changed",
    html: buildEmailTemplate("Password Changed", content),
  });
};

// ===== 6. ACCOUNT LOCKED EMAIL =====
export const sendAccountLockedEmail = async (email, username, reason) => {
  const content = `
    <p>Hi <strong>${username}</strong>,</p>
    <p>Your account has been temporarily locked due to:</p>
    <div class="warning">
      <strong>Reason:</strong> ${reason}
    </div>
    <p>Please contact our support team or try again in 30 minutes.</p>
    <p><strong>Need help?</strong> Contact us at ${process.env.SUPPORT_EMAIL}</p>
  `;

  return sendEmail({
    to: email,
    subject: "Account Locked - Security Alert",
    html: buildEmailTemplate("Account Locked", content),
  });
};

export default {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendForgotPasswordEmail,
  sendPasswordResetSuccessEmail,
  sendPasswordChangedEmail,
  sendAccountLockedEmail,
};