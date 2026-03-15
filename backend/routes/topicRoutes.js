const router = require("express").Router();

const { protect, roleCheck } = require("../middlewares/authMiddleware");
const { createTopic, listTopics } = require("../controllers/topicController");

router.get("/", listTopics);
router.post("/", protect, roleCheck("admin","teacher"), createTopic);

module.exports = router;