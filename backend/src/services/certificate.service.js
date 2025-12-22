import prisma from "../configs/prisma.config.js";
import {
  uploadToS3,
  extractKeyFromUrl,
  deleteFromS3,
  getSignedUrlForDownload,
} from "../utils/aws.util.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { PermissionError } from "../errors/PermissionError.js";
import notificationService from "./notification.service.js";

const signCertificateUrls = async (certificates) => {
  return Promise.all(
    certificates.map(async (cert) => {
      if (!cert.url) return cert;
      const key = extractKeyFromUrl(cert.url);
      const signedUrl = await getSignedUrlForDownload(key, "certificate", 3600);
      return { ...cert, url: signedUrl };
    })
  );
};

const issueCertificate = async ({
  issuerId,
  issuerRole,
  userId,
  courseId,
  file,
}) => {
  if (!file) {
    throw new BadRequestError(
      "Certificate file is required",
      "certificate_file_required"
    );
  }

  const [user, course, enrollment, existingCertificate] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
    prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, instructorId: true },
    }),
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    }),
    prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    }),
  ]);

  if (!user) {
    throw new NotFoundError("User", "user_not_found");
  }

  if (!course) {
    throw new NotFoundError("Course", "course_not_found");
  }

  if (!enrollment) {
    throw new BadRequestError(
      "User must be enrolled in the course to receive a certificate",
      "user_not_enrolled"
    );
  }

  if (existingCertificate) {
    throw new BadRequestError(
      "Certificate has already been issued for this course",
      "certificate_already_exists"
    );
  }

  // Only admin or the course instructor can issue the certificate
  if (issuerRole !== "admin" && course.instructorId !== issuerId) {
    throw new PermissionError(
      "Only admin or the course instructor can issue certificates",
      "not_course_instructor"
    );
  }

  let uploadResult = null;
  let certificate = null;
  try {
    uploadResult = await uploadToS3({
      fileBuffer: file.buffer,
      fileName: file.originalname,
      fileType: "certificate",
      mimeType: file.mimetype,
      metadata: {
        userId: userId.toString(),
        courseId: courseId.toString(),
        issuedBy: issuerId.toString(),
      },
    });

    certificate = await prisma.$transaction(async (tx) => {
      return await tx.certificate.create({
        data: {
          userId,
          courseId,
          url: uploadResult.url,
        },
        select: {
          id: true,
          userId: true,
          courseId: true,
          issuedAt: true,
          url: true,
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          course: { select: { id: true, title: true, slug: true } },
        },
      });
    });

    // Notify user about certificate issuance
    await notificationService
      .createNotification({
        userId: certificate.userId,
        type: "system",
        title: "Certificate Issued",
        content: `Congratulations! You have been awarded a certificate for completing "${certificate.course.title}".`,
      })
      .catch((err) => {
        console.error("Failed to send certificate notification:", err);
      });

    const [certWithUrl] = await signCertificateUrls([certificate]);
    return certWithUrl;
  } catch (error) {
    // If DB insert fails after S3 upload, clean up S3
    if (uploadResult && uploadResult.key) {
      try {
        await deleteFromS3(uploadResult.key);
      } catch (cleanupErr) {
        console.error("Failed to rollback certificate upload:", cleanupErr);
      }
    }
    throw error;
  }
};

const getCertificatesByUser = async (userId, requesterId, requesterRole) => {
  // Verify the user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new NotFoundError("User", "user_not_found");
  }

  // Permission check: only the user themselves or admin can view their certificates
  if (requesterRole !== "admin" && userId !== requesterId) {
    throw new PermissionError(
      "You do not have permission to view these certificates",
      "permission_denied"
    );
  }

  const certificates = await prisma.certificate.findMany({
    where: { userId },
    select: {
      id: true,
      userId: true,
      courseId: true,
      issuedAt: true,
      url: true,
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
      course: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { issuedAt: "desc" },
  });

  return signCertificateUrls(certificates);
};

const getCertificateById = async (id, requesterId, requesterRole) => {
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      courseId: true,
      issuedAt: true,
      url: true,
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
      course: {
        select: { id: true, title: true, slug: true, instructorId: true },
      },
    },
  });

  if (!certificate) {
    throw new NotFoundError("Certificate", "certificate_not_found");
  }

  // Permission check: only the certificate owner, course instructor, or admin can view
  const isOwner = certificate.userId === requesterId;
  const isInstructor = certificate.course?.instructorId === requesterId;
  const isAdmin = requesterRole === "admin";

  if (!isOwner && !isInstructor && !isAdmin) {
    throw new PermissionError(
      "You do not have permission to view this certificate",
      "permission_denied"
    );
  }

  const [certWithUrl] = await signCertificateUrls([certificate]);
  return certWithUrl;
};

export default {
  issueCertificate,
  getCertificatesByUser,
  getCertificateById,
};
