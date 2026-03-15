// backend/controllers/videos/deleteVideo.controller.js
const fs = require("fs");
const path = require("path");
const VideoLesson = require("../../models/VideoLesson");

function safeUnlink(absPath) {
  try {
    if (absPath && fs.existsSync(absPath) && fs.statSync(absPath).isFile()) {
      fs.unlinkSync(absPath);
    }
  } catch {}
}

function safeRmDir(absDir) {
  try {
    if (absDir && fs.existsSync(absDir)) {
      fs.rmSync(absDir, { recursive: true, force: true });
    }
  } catch {}
}

/**
 * DELETE /api/videos/:id
 * Faqat owner teacher (yoki admin) o‘chira oladi.
 * Diskdan: uploads/hls/<videoId>/ papkasi o‘chadi.
 */
module.exports = async function deleteVideo(req, res) {
  try {
    const videoId = String(req.params.id || "").trim();
    if (!videoId) return res.status(400).json({ message: "Video id kerak" });

    const video = await VideoLesson.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video topilmadi" });

    const userId = String(req.user?._id || "");
    const role = String(req.user?.role || "").toLowerCase();

    // admin bo‘lmasa — video egasi bo‘lishi shart
    if (role !== "admin" && String(video.teacher) !== userId) {
      return res.status(403).json({ message: "Ruxsat yo‘q (owner emas)" });
    }

    // 1) HLS folder: uploads/hls/<videoId>/
    const hlsDir = path.join(process.cwd(), "uploads", "hls", String(video._id));
    safeRmDir(hlsDir);

    // 2) thumbnail local bo‘lsa (ixtiyoriy)
    if (video.thumbnailUrl && String(video.thumbnailUrl).startsWith("/uploads/")) {
      const thumbPath = path.join(process.cwd(), String(video.thumbnailUrl).replace(/^\//, ""));
      safeUnlink(thumbPath);
    }

    // 3) DB record delete
    await VideoLesson.deleteOne({ _id: video._id });

    return res.status(200).json({
      message: "✅ Video o‘chirildi",
      deleted: {
        id: String(video._id),
        hlsDir: `/uploads/hls/${String(video._id)}/`,
      },
    });
  } catch (e) {
    return res.status(500).json({
      message: "delete error",
      error: String(e?.message || e),
    });
  }
};
