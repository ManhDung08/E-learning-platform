import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath.path);

/**
 * Extract video duration from buffer
 * @param {Buffer} videoBuffer - Video file buffer
 * @param {string} originalFilename - Original filename with extension
 * @returns {Promise<number>} Duration in seconds
 */
export const extractVideoDuration = async (videoBuffer, originalFilename) => {
  let tempFilePath = null;

  try {
    // Create a temporary file path
    const tempDir = os.tmpdir();
    const tempFileName = `video_${Date.now()}_${originalFilename}`;
    tempFilePath = path.join(tempDir, tempFileName);

    // Write buffer to temporary file
    await fs.promises.writeFile(tempFilePath, videoBuffer);

    // Extract duration using ffprobe
    const duration = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(tempFilePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          const durationInSeconds = metadata.format.duration;
          resolve(Math.round(durationInSeconds));
        }
      });
    });

    return duration;
  } catch (error) {
    console.error("Failed to extract video duration:", error);
    throw new Error(`Failed to extract video duration: ${error.message}`);
  } finally {
    // Clean up temporary file
    if (tempFilePath) {
      try {
        await fs.promises.unlink(tempFilePath);
      } catch (unlinkError) {
        console.error("Failed to delete temporary video file:", unlinkError);
      }
    }
  }
};

/**
 * Validate and extract video duration
 * @param {Buffer} videoBuffer - Video file buffer
 * @param {string} originalFilename - Original filename
 * @param {number|null} providedDuration - Duration provided by client (optional)
 * @returns {Promise<number>} Validated duration in seconds
 */
export const getValidatedVideoDuration = async (
  videoBuffer,
  originalFilename,
  providedDuration = null
) => {
  const extractedDuration = await extractVideoDuration(
    videoBuffer,
    originalFilename
  );

  // If client provided duration, log any significant discrepancy
  if (providedDuration && Math.abs(providedDuration - extractedDuration) > 2) {
    console.warn(
      `Duration mismatch: Client provided ${providedDuration}s, ` +
        `but actual video duration is ${extractedDuration}s. Using extracted value.`
    );
  }

  return extractedDuration;
};
