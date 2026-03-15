// backend/controllers/videos/streamVideo.controller.js
const fs = require("fs");
const path = require("path");
const VideoLesson = require("../../models/VideoLesson");

function getMimeType(filePath) {
  const ext = path.extname(filePath || "").toLowerCase();
  switch (ext) {
    case ".mp4":
      return "video/mp4";
    case ".mov":
      return "video/quicktime";
    case ".mkv":
      return "video/x-matroska";
    case ".webm":
      return "video/webm";
    case ".avi":
      return "video/x-msvideo";
    default:
      return "application/octet-stream";
  }
}

function streamFile(req, res, filePath) {
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Video fayl topilmadi" });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", getMimeType(filePath));

  if (range) {
    const match = /bytes=(\d+)-(\d*)/.exec(range);
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

  res.status(200);
  res.setHeader("Content-Length", fileSize);
  return fs.createReadStream(filePath).pipe(res);
}

/**
 * GET /api/videos/:id/stream
 * Protected playlist (index.m3u8) qaytaradi va segmentlarni protected URL ga rewrite qiladi:
 * /api/videos/:id/segments/index0.ts
 */
exports.streamVideo = async (req, res) => {
  try {
    const videoId = req.params.id;

    const video = await VideoLesson.findById(videoId).select("_id hlsUrl status fileUrl");
    if (!video) return res.status(404).json({ message: "Video topilmadi" });

    // ✅ HLS tayyor bo'lsa — avval shu
    if (video.status === "ready" && video.hlsUrl) {
      // hlsUrl: /uploads/hls/<videoId>/index.m3u8
      const playlistPath = path.join(process.cwd(), video.hlsUrl.replace(/^\//, ""));
      if (!fs.existsSync(playlistPath)) {
        return res.status(404).json({ message: "Playlist topilmadi" });
      }

      let playlist = fs.readFileSync(playlistPath, "utf8");

      // index.m3u8 ichidagi segmentlarni protected routega o'girib chiqamiz
      // masalan: index0.ts -> /api/videos/<id>/segments/index0.ts
      const lines = playlist.split("\n").map((line) => {
        const t = (line || "").trim();
        if (!t) return line;

        // kommentlar (#EXT...) ni o'zgartirmaymiz
        if (t.startsWith("#")) return line;

        // faqat .ts segmentlarni rewrite qilamiz
        if (/\.ts(\?.*)?$/i.test(t)) {
          const segName = t.split("?")[0]; // query bo'lsa olib tashlaymiz
          return `/api/videos/${videoId}/segments/${segName}`;
        }

        return line;
      });

      const out = lines.join("\n");

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).send(out);
    }

    // ✅ Fallback: raw upload file (HLS bo'lmasa)
    if (video.fileUrl) {
      const rel = String(video.fileUrl || "").replace(/^\//, "");
      const abs = path.resolve(process.cwd(), rel);
      const inputRoot = path.resolve(process.cwd(), "uploads", "input");
      if (!(abs === inputRoot || abs.startsWith(inputRoot + path.sep))) {
        return res.status(400).json({ message: "Video yo'li noto'g'ri" });
      }
      return streamFile(req, res, abs);
    }

    return res.status(400).json({ message: "Video hali tayyor emas" });
  } catch (e) {
    return res.status(500).json({ message: "stream error", error: String(e?.message || e) });
  }
};

/**
 * GET /api/videos/:id/segments/:segment
 * Protected TS segment qaytaradi (Range support bilan)
 */
exports.streamSegment = async (req, res) => {
  try {
    const videoId = req.params.id;
    const segment = req.params.segment;

    // segment nomini xavfsiz qilamiz
    if (!segment || !/^[a-zA-Z0-9._-]+\.ts$/i.test(segment)) {
      return res.status(400).json({ message: "Segment nomi noto'g'ri" });
    }

    const filePath = path.join(process.cwd(), "uploads", "hls", videoId, segment);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Segment topilmadi" });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    res.setHeader("Content-Type", "video/mp2t");
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "no-store");

    // Range bo'lsa — partial content
    if (range) {
      const match = /bytes=(\d+)-(\d*)/.exec(range);
      const start = match ? parseInt(match[1], 10) : 0;
      const end = match && match[2] ? parseInt(match[2], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        res.setHeader("Content-Range", `bytes */${fileSize}`);
        return res.status(416).end();
      }

      const chunkSize = end - start + 1;
      res.status(206);
      res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
      res.setHeader("Content-Length", chunkSize);

      const stream = fs.createReadStream(filePath, { start, end });
      return stream.pipe(res);
    }

    // Range yo'q bo'lsa — full file
    res.status(200);
    res.setHeader("Content-Length", fileSize);
    const stream = fs.createReadStream(filePath);
    return stream.pipe(res);
  } catch (e) {
    return res.status(500).json({ message: "segment error", error: String(e?.message || e) });
  }
};
