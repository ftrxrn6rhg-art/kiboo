// backend/routes/subjectRoutes.js
const express = require("express");
const router = express.Router();

const {
  getSubjects,
  createSubject,
} = require("../controllers/subjectController");

// Hozircha authsiz (keyin admin protect qo‘shamiz)
router.get("/", getSubjects);
router.post("/", createSubject);

module.exports = router;