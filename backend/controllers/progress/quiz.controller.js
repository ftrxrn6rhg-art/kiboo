// backend/controllers/progress/quiz.controller.js
const mongoose = require("mongoose");
const QuizAttempt = require("../../models/QuizAttempt");
const VideoLesson = require("../../models/VideoLesson");
const StudentProgress = require("../../models/StudentProgress");
const CurriculumTopic = require("../../models/CurriculumTopic");

exports.submitQuiz = async (req, res) => {
  try {
    const userId = req.user._id;
    const { videoId } = req.params;
    const { total, correct } = req.body;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "videoId noto‘g‘ri" });
    }

    const video = await VideoLesson.findById(videoId).select("_id topic subject grade");
    if (!video) return res.status(404).json({ message: "Video topilmadi" });

    const t = Number(total);
    const c = Number(correct);

    if (!t || t <= 0) return res.status(400).json({ message: "total majburiy" });
    if (Number.isNaN(c) || c < 0) return res.status(400).json({ message: "correct majburiy" });

    const scorePercent = Math.round((c / t) * 100);
    const passed = scorePercent >= 70;

    const attempt = await QuizAttempt.create({
      user: userId,
      video: videoId,
      total: t,
      correct: c,
      scorePercent,
      passed,
    });

    let progressUpdate = null;

    try {
      // passed bo‘lsa — TEST done deb belgilaymiz, agar VIDEO ham done bo‘lsa — FULL done va next topic unlock
      if (passed && video?.topic) {
        const topicId = video.topic;
        const subjectId = video.subject;

        const sp = await StudentProgress.findOne({ student: userId, subject: subjectId })
          .select("videoCompletedTopics testCompletedTopics completedTopics currentTopic currentGradeOrLevel")
          .lean();

        if (sp) {
          // 1) TEST done
          await StudentProgress.updateOne(
            { _id: sp._id },
            { $addToSet: { testCompletedTopics: topicId } }
          );

          const hasVideo = Array.isArray(sp.videoCompletedTopics) && sp.videoCompletedTopics.map(String).includes(String(topicId));

          // JS stringini buzmaslik uchun, yuqoridagi python 'and any' ni JS ga o‘zgartiramiz:
          
          progressUpdate = { testDone: true, topicId: String(topicId) };
          if (hasVideo) {
            // 2) FULL done
            await StudentProgress.updateOne(
              { _id: sp._id },
              { $addToSet: { completedTopics: topicId } }
            );

            // 3) agar shu currentTopic bo‘lsa — next topicga o‘tamiz
            const curId = sp.currentTopic ? String(sp.currentTopic) : "";
            if (curId === String(topicId)) {
              const curTopicDoc = await CurriculumTopic.findById(topicId)
                .select("_id subject grade order")
                .lean();

              let nextTopic = await CurriculumTopic.findOne({
                subject: curTopicDoc.subject,
                grade: Number(curTopicDoc.grade),
                order: { $gt: Number(curTopicDoc.order) },
              })
                .sort({ order: 1, _id: 1 })
                .select("_id grade order title")
                .lean();

              if (!nextTopic) {
                nextTopic = await CurriculumTopic.findOne({
                  subject: curTopicDoc.subject,
                  grade: { $gt: Number(curTopicDoc.grade) },
                })
                  .sort({ grade: 1, order: 1, _id: 1 })
                  .select("_id grade order title")
                  .lean();
              }

              if (nextTopic?._id) {
                await StudentProgress.updateOne(
                  { _id: sp._id },
                  {
                    $set: {
                      currentGradeOrLevel: Number(nextTopic.grade),
                      currentTopic: nextTopic._id,
                      currentTopicCompleted: false,
                    },
                  }
                );
                progressUpdate = { unlockedNextTopic: true, nextTopic };
              } else {
                progressUpdate = { unlockedNextTopic: false, nextTopic: null };
              }
            } else {
              progressUpdate = { fullDone: true, topicId: String(topicId) };
            }
          } else {
            progressUpdate = { testDone: true, needVideo: true, topicId: String(topicId) };
          }

        }
      }
    } catch (e) {
      progressUpdate = { error: String(e?.message || e) };
    }

    return res.status(201).json({ message: "Quiz saqlandi ✅", attempt, progressUpdate });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.myQuizAttempts = async (req, res) => {
  try {
    const userId = req.user._id;

    const items = await QuizAttempt.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("video", "title topic subject grade");

    return res.json({ count: items.length, attempts: items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};