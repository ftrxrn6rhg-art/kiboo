// backend/src/jobs/transcode/queue.js
const { Queue } = require("bullmq");

const redisUrl = process.env.REDIS_URL || "";
const redisHost = process.env.REDIS_HOST || "";
const redisPort = Number(process.env.REDIS_PORT || 6379);
const jobsEnabled = process.env.ENABLE_REDIS_JOBS === "true";

let connection = null;
let videoQueue = null;

if (jobsEnabled || redisUrl || redisHost) {
  connection = redisUrl
    ? { url: redisUrl }
    : {
        host: redisHost || "127.0.0.1",
        port: redisPort,
      };

  videoQueue = new Queue("video-transcode", { connection });
}

module.exports = { videoQueue, connection };
