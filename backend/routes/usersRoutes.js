// backend/routes/usersRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const uploadAvatar = require("../middlewares/uploadAvatar");

const {
  getMyProfile,
  updateMyAvatar,
  updateMyProfile,
} = require("../controllers/users/profile.controller");

// GET /api/users/me
router.get("/me", protect, getMyProfile);

// POST /api/users/me/avatar  (form-data: avatar=<file>)
router.post("/me/avatar", protect, uploadAvatar.single("avatar"), updateMyAvatar);

// PATCH /api/users/me
router.patch("/me", protect, updateMyProfile);

module.exports = router;
