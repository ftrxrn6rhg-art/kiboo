// backend/index.js
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

/* =======================
   MIDDLEWARES
======================= */
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const localNetworkPatterns = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
  /^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
  /^https?:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+(:\d+)?$/,
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.length && allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    if (!allowedOrigins.length && localNetworkPatterns.some((pattern) => pattern.test(origin))) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS origin not allowed"));
  },
  credentials: false,
};
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =======================
   STATIC FILES
======================= */
// video HLS va uploadlar uchun
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Demo/static fayllarni ildiz path bilan to'qnashmasligi uchun alohida prefix ostida beramiz.
app.use("/public", express.static(path.join(__dirname, "public")));

/* =======================
   ROUTES
======================= */
app.use("/api", cors(corsOptions));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/subjects", require("./routes/subjectRoutes"));
app.use("/api/topics", require("./routes/topicRoutes"));
app.use("/api/videos", require("./routes/videosRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));
app.use("/api/quizzes", require("./routes/quizRoutes"));
app.use("/api/parents", require("./routes/parentRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/teachers", require("./routes/teacherRoutes"));
app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));
app.use("/api/users", require("./routes/usersRoutes"));
app.use("/api/curriculum", require("./routes/curriculumRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

const frontendDist = path.resolve(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  app.get(/^\/(?!api|uploads).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}
/* =======================
   404 HANDLER
======================= */
app.use((req, res) => {
  res.status(404).json({ message: "Route topilmadi" });
});

/* =======================
   ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(err.status || 500).json({
    message: err.message || "Server xatosi",
  });
});

/* =======================
   DB + SERVER START
======================= */
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    // ✅ Dev uchun demo userlarni tayyorlab qo'yamiz
    if (process.env.NODE_ENV !== "production") {
      try {
        const seedDemoUsers = require("./utils/seedDemoUsers");
        seedDemoUsers().then(() => console.log("✅ Demo userlar tayyor"));
      } catch (e) {
        console.log("⚠️ Demo user seed xatosi:", e?.message || e);
      }
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
  });
