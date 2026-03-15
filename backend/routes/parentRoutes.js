// backend/routes/parentRoutes.js
const express = require("express");
const router = express.Router();

const { protect, roleCheck } = require("../middlewares/authMiddleware");

// Controllers
const { linkChild, unlinkChild, listChildren } = require("../controllers/parents/parent.controller");
const { childOverview } = require("../controllers/parents/childOverview.controller");
const { childAttempts } = require("../controllers/parents/childAttempts.controller");
const { childCourses } = require("../controllers/parents/childCourses.controller");
const {
  childSubscription,
  subscribeChild,
} = require("../controllers/parents/childSubscription.controller");

// Parent-only
router.use(protect, roleCheck("parent"));

// 1) Parent -> student link
router.post("/link", linkChild);
router.delete("/children/:studentId/unlink", unlinkChild);

// 2) Parent -> children list
router.get("/children", listChildren);

// 3) Parent -> one child overview
router.get("/children/:studentId/overview", childOverview);
router.get("/children/:studentId/attempts", childAttempts);
router.get("/children/:studentId/courses", childCourses);
router.get("/children/:studentId/subscription", childSubscription);
router.post("/children/:studentId/subscribe", subscribeChild);

module.exports = router;
