import certificateService from "../services/certificate.service.js";

const issueCertificate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    const certificate = await certificateService.issueCertificate({
      userId,
      courseId,
      file: req.file,
    });

    return res.status(201).json({ success: true, data: certificate });
  } catch (error) {
    console.error("Issue certificate error:", error);
    next(error);
  }
};

const getMyCertificates = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const requesterRole = req.user.role;

    const certificates = await certificateService.getCertificatesByUser(
      userId,
      userId,
      requesterRole
    );
    return res.status(200).json({ success: true, data: certificates });
  } catch (error) {
    console.error("Get my certificates error:", error);
    next(error);
  }
};

const getCertificatesByUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    const certificates = await certificateService.getCertificatesByUser(
      userId,
      requesterId,
      requesterRole
    );
    return res.status(200).json({ success: true, data: certificates });
  } catch (error) {
    console.error("Get certificates by user error:", error);
    next(error);
  }
};

const getCertificateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    const certificate = await certificateService.getCertificateById(
      id,
      requesterId,
      requesterRole
    );

    return res.status(200).json({ success: true, data: certificate });
  } catch (error) {
    console.error("Get certificate by id error:", error);
    next(error);
  }
};

export default {
  issueCertificate,
  getMyCertificates,
  getCertificatesByUser,
  getCertificateById,
};
