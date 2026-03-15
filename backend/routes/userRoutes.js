// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const uploadAvatar = require("../middlewares/uploadAvatar");

// controller (sizda borligini grep ko‘rsatgan)
const uploadAvatarController = require("../controllers/users/uploadAvatar.controller");

// POST /api/users/me/avatar
// form-data: avatar=<file>
router.post(
  "/me/avatar",
  protect,
  uploadAvatar.single("avatar"),
  uploadAvatarController
);

module.exports = router;