// backend/controllers/videos/segmentVideo.controller.js
const fs = require("fs");
const path = require("path");

const HLS_DIR = path.join(__dirname, "..", "..", "uploads", "hls");

function safeName(name) {
  // path traversalga yo'l qo'ymaslik
  if (!name) return null;
  if (name.includes("..") || name.includes("/") || name.includes("\\")) return null;
  return name;
}

exports.streamSegment = async (req, res) => {
  try {
    const videoId = req.params.id;
    const segment = safeName(req.params.segment);

    if (!videoId || !segment) {
      return res.status(400).json({ message: "Noto'g'ri segment nomi" });
    }

    const filePath = path.join(HLS_DIR, videoId, segment);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Segment topilmadi" });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Type", "video/mp2t");

    // Range bo'lsa — 206
    if (range) {
      const match = range.match(/bytes=(\d+)-(\d*)/);
      const start = match ? parseInt(match[1], 10) : 0;
      const end = match && match[2] ? parseInt(match[2], 10) : fileSize - 1;

      if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= fileSize) {
        return res.status(416).end();
      }

      res.status(206);
      res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
      res.setHeader("Content-Length", end - start + 1);

      return fs.createReadStream(filePath, { start, end }).pipe(res);
    }

    // Range yo'q — 200
    res.status(200);
    res.setHeader("Content-Length", fileSize);
    return fs.createReadStream(filePath).pipe(res);
  } catch (e) {
    return res.status(500).json({ message: "Segment stream error", error: String(e?.message || e) });
  }
};