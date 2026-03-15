// backend/src/jobs/worker.js
const { Worker } = require("bullmq");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

require("dotenv").config();

// ✅ TO‘G‘RI pathlar: src/jobs -> (..)->src -> (..)->backend
const connectDB = require("../../config/db");
const VideoLesson = require("../../models/VideoLesson");

// ✅ queue odatda shu papkada bo‘ladi: src/jobs/transcode/queue.js
const { connection } = require("./transcode/queue");

// ✅ TO‘G‘RI OUTPUT: backend/uploads/hls
const OUTPUT_ROOT = path.resolve(__dirname, "../../uploads/hls");

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function runFFmpeg(cmd) {
  return new Promise((resolve, reject) => {
    const child = exec(cmd, (err, stdout, stderr) => {
      if (stdout) console.log(stdout);
      if (stderr) console.log(stderr);
      if (err) return reject(err);
      resolve();
    });

    child.on("error", reject);
  });
}

async function start() {
  await connectDB();
  ensureDir(OUTPUT_ROOT);

  const worker = new Worker(
    "video-transcode",
    async (job) => {
      const { videoId, filePath } = job.data;

      if (!videoId || !filePath) {
        throw new Error("Job data ichida videoId/filePath yo‘q");
      }

      const inputPath = filePath;
      const outDir = path.join(OUTPUT_ROOT, videoId);
      const playlistPath = path.join(outDir, "index.m3u8");

      ensureDir(outDir);

      await VideoLesson.findByIdAndUpdate(videoId, { status: "processing" });

      // ✅ segmentlar outDir ichiga tushadi, m3u8 ham shu yerda bo‘ladi
      // -hls_segment_filename bilan aniq nom beramiz (index0.ts, index1.ts ...)
      const segmentPattern = path.join(outDir, "index%d.ts");

      const cmd =
        `ffmpeg -y -i "${inputPath}" ` +
        `-c:v libx264 -preset veryfast -crf 23 ` +
        `-c:a aac -b:a 128k ` +
        `-hls_time 6 -hls_list_size 0 ` +
        `-hls_segment_filename "${segmentPattern}" ` +
        `-f hls "${playlistPath}"`;

      await runFFmpeg(cmd);

      // ✅ tekshiruv: m3u8 yaratildimi?
      if (!fs.existsSync(playlistPath)) {
        throw new Error("FFmpeg tugadi, lekin index.m3u8 topilmadi");
      }

      await VideoLesson.findByIdAndUpdate(videoId, {
        status: "ready",
        hlsUrl: `/uploads/hls/${videoId}/index.m3u8`,
      });

      return { ok: true, videoId };
    },
    { connection }
  );

  worker.on("completed", (job, result) => {
    console.log("✅ completed:", job.id, result);
  });

  worker.on("failed", async (job, err) => {
    console.error("❌ failed:", job?.id, err?.message || err);
    const videoId = job?.data?.videoId;
    if (videoId) {
      await VideoLesson.findByIdAndUpdate(videoId, { status: "failed" });
    }
  });

  console.log("👷 Worker started ✅");
}

start().catch((e) => {
  console.error("❌ Worker start error:", e?.message || e);
  process.exit(1);
});