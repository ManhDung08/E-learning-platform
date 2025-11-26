export const uploadConfig = {
  /**
   * 📦 Kích thước tối đa (bytes)
   * Được chia theo từng loại file dựa trên nghiệp vụ của hệ thống E-learning.
   */
  maxFileSize: {
    avatar: 5 * 1024 * 1024, // 5MB
    courseImage: 10 * 1024 * 1024, // 10MB - ảnh thumbnail khóa học
    lessonVideo: 500 * 1024 * 1024, // 500MB - video bài học
    material: 50 * 1024 * 1024, // 50MB - tài liệu PDF/PPT
    assignment: 20 * 1024 * 1024, // 20MB - bài nộp
    certificate: 10 * 1024 * 1024, // 10MB - chứng chỉ PDF/hình ảnh
    supportAttachment: 10 * 1024 * 1024, // 10MB - file đính kèm ticket
  },

  /**
   * 📄 MIME types hợp lệ theo từng loại upload
   */
  allowedMimeTypes: {
    avatar: ["image/jpeg", "image/png", "image/webp", "image/jpg"],
    courseImage: ["image/jpeg", "image/png", "image/webp"],
    lessonVideo: ["video/mp4", "video/webm", "video/ogg"],
    material: [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/zip",
    ],
    assignment: [
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
      "image/jpeg",
      "image/png",
    ],
    certificate: ["application/pdf", "image/jpeg", "image/png"],
    supportAttachment: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/zip",
      "text/plain",
    ],
  },

  /**
   * 🗂️ Cấu trúc thư mục lưu file trên S3
   * Gắn chặt với các bảng trong DB: User, Course, Lesson, Certificate, SupportTicket, ...
   */
  folders: {
    avatar: (userId) => `users/${userId}/avatar`,
    courseImage: (courseId) => `courses/${courseId}/thumbnail`,
    lessonVideo: (courseId, moduleId, lessonId) =>
      `courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/video`,
    material: (courseId, moduleId) =>
      `courses/${courseId}/modules/${moduleId}/materials`,
    assignment: (courseId, userId, lessonId) =>
      `courses/${courseId}/assignments/${lessonId}/students/${userId}`,
    certificate: (userId, courseId) =>
      `certificates/${userId}/course-${courseId}`,
    supportAttachment: (ticketId, userId) =>
      `support-tickets/${userId}/${ticketId}`,
  },

  /**
   * 🧠 Cache-Control cho từng loại file
   */
  cacheControl: {
    avatar: "max-age=31536000, public", // cache 1 năm
    courseImage: "max-age=86400, public", // cache 1 ngày
    lessonVideo: "no-cache", // luôn fetch mới
    material: "max-age=3600, public", // cache 1 giờ
    assignment: "private, no-cache",
    certificate: "max-age=31536000, public",
    supportAttachment: "private, no-cache",
  },

  /**
   * ⏱️ Thời gian hết hạn pre-signed URL (giây)
   */
  signedUrlExpiry: {
    avatar: 600, // 10 phút
    courseImage: 1800, // 30 phút
    lessonVideo: 3600, // 1 giờ
    material: 1800, // 30 phút
    assignment: 1800, // 30 phút
    certificate: 3600, // 1 giờ
    supportAttachment: 900, // 15 phút
    default: 900, // 15 phút
  },
};
