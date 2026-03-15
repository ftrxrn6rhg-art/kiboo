const mongoose = require("mongoose");

const Assignment = require("../../models/Assignment");
const AssignmentAttempt = require("../../models/AssignmentAttempt");
const AssignmentQuestion = require("../../models/AssignmentQuestion");

const Subscription = require("../../models/Subscription");
const StudentProgress = require("../../models/StudentProgress");
const CurriculumTopic = require("../../models/CurriculumTopic");
const VideoProgress = require("../../models/VideoProgress");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(String(id || ""));
}

function normalizeStatus(s) {
  return String(s || "").trim().toLowerCase();
}

// PASS threshold (hozircha 60%)
const PASS_SCORE_PERCENT = 60;

async function studentGetAssignments(req, res) {
  try {
    const studentId = req.user?._id;
    if (!studentId) return res.status(401).json({ message: "Auth kerak" });

    // Student faqat current topic (published) ni ko‘radi
    const sub = await Subscription.findOne({ student: studentId, status: "active" }).select("subject").lean();
    if (!sub) return res.json({ count: 0, assignments: [] });

    const prog = await StudentProgress.findOne({ student: studentId, subject: sub.subject })
      .select("currentGradeOrLevel currentTopic")
      .lean();
    if (!prog || !prog.currentTopic || !prog.currentGradeOrLevel) {
      return res.json({ count: 0, assignments: [] });
    }

    const filter = {
      status: "published",
      subject: sub.subject,
      grade: Number(prog.currentGradeOrLevel),
      topic: prog.currentTopic,
    };

    // optional: videoId bo‘yicha toraytirish
    const videoId = req.query?.videoId;
    if (videoId && isValidObjectId(videoId)) filter.video = videoId;

    const list = await Assignment.find(filter)
      .sort({ createdAt: -1 })
      .select(
        "_id title description type status subject grade topic video publishAt deadline teacher createdAt likes dislikes fileUrl fileName"
      )
      .populate("teacher", "name email")
      .lean();

    return res.json({
      count: list.length,
      assignments: list.map((a) => ({
        ...a,
        likeCount: Array.isArray(a.likes) ? a.likes.length : 0,
        dislikeCount: Array.isArray(a.dislikes) ? a.dislikes.length : 0,
      })),
    });
  } catch (err) {
    console.error("studentGetAssignments error:", err);
    return res.status(500).json({ message: "Server xatosi", error: err.message });
  }
}


// GET /api/assignments/student/topic/:topicId
async function studentGetAssignmentsByTopic(req, res) {
  try {
    const studentId = req.user?._id;
    const { topicId } = req.params;

    if (!studentId) return res.status(401).json({ message: "Auth kerak" });
    if (!isValidObjectId(topicId)) return res.status(400).json({ message: "topicId noto‘g‘ri" });

    const sub = await Subscription.findOne({ student: studentId, status: "active" })
      .select("subject")
      .lean();
    if (!sub) return res.json({ count: 0, assignments: [] });

    const topic = await CurriculumTopic.findById(topicId).select("_id subject grade").lean();
    if (!topic) return res.status(404).json({ message: "Topic topilmadi" });

    if (sub.subject && String(sub.subject) != String(topic.subject)) {
      return res.status(403).json({ message: "Bu mavzu uchun subscription yo‘q" });
    }

    const filter = {
      status: "published",
      subject: topic.subject,
      grade: Number(topic.grade),
      topic: topic._id,
    };

    const list = await Assignment.find(filter)
      .sort({ createdAt: -1 })
      .select(
        "_id title description type status subject grade topic video publishAt deadline teacher createdAt likes dislikes fileUrl fileName"
      )
      .populate("teacher", "name email")
      .lean();

    return res.json({
      count: list.length,
      assignments: list.map((a) => ({
        ...a,
        likeCount: Array.isArray(a.likes) ? a.likes.length : 0,
        dislikeCount: Array.isArray(a.dislikes) ? a.dislikes.length : 0,
      })),
    });
  } catch (err) {
    console.error("studentGetAssignmentsByTopic error:", err);
    return res.status(500).json({ message: "Server xatosi", error: err.message });
  }
}

// POST /api/assignments/student/:assignmentId/start
async function studentStartAttempt(req, res) {
  try {
    const studentId = req.user?._id;
    const { assignmentId } = req.params;

    if (!studentId) return res.status(401).json({ message: "Auth kerak" });
    if (!isValidObjectId(assignmentId)) return res.status(400).json({ message: "assignmentId noto‘g‘ri" });

    const assignment = await Assignment.findById(assignmentId)
      .select("_id title status subject grade topic video")
      .lean();

    if (!assignment) return res.status(404).json({ message: "Assignment topilmadi" });

    if (normalizeStatus(assignment.status) !== "published") {
      return res.status(403).json({ message: "Bu topshiriq hali published emas" });
    }

    // ✅ faqat CURRENT topic uchun start qilsa bo‘ladi
    const sub = await Subscription.findOne({ student: studentId, status: "active" })
      .select("subject")
      .lean();

    if (!sub?.subject) {
      return res.status(403).json({ message: "Active subscription topilmadi" });
    }

    const prog = await StudentProgress.findOne({ student: studentId, subject: sub.subject })
      .select("currentTopic")
      .lean();

    const curTopicId = String(prog?.currentTopic?._id || prog?.currentTopic || "");
    if (!curTopicId) {
      return res.status(403).json({ message: "Current topic topilmadi" });
    }

    if (String(assignment.topic) !== curTopicId) {
      return res.status(403).json({ message: "Bu topshiriq hozirgi (current) mavzu uchun emas" });
    }


    const questions = await AssignmentQuestion.find({ assignment: assignmentId })
      .sort({ order: 1 })
      .select("_id title text options correctIndex order")
      .lean();

    // existing attempt: started (resume)
    const existing = await AssignmentAttempt.findOne({
      assignment: assignmentId,
      student: studentId,
      status: { $in: ["started", "in_progress"] },
    }).lean();

    if (existing) {
      return res.json({
        message: "✅ Oldingi attempt davom etyapti",
        attempt: existing,
        questions,
      });
    }

    const attempt = await AssignmentAttempt.create({
      assignment: assignmentId,
      student: studentId,
      status: "started",
    });

    return res.status(201).json({
      message: "✅ Attempt boshlandi",
      attempt,
      questions,
    });
  } catch (err) {
    console.error("studentStartAttempt error:", err);
    return res.status(500).json({ message: "Server xatosi", error: err.message });
  }
}

/**
 * StudentProgress’ni keyingi topicga o‘tkazish (sakramaslik qoidasi)
 * - Faqat: studentda shu subject bo‘yicha ACTIVE subscription bo‘lsa
 * - Faqat: progress.currentTopic == assignment.topic bo‘lsa
 * - PASS bo‘lsa: next topic (yoki keyingi grade) ga o‘tadi
 */
async function advanceStudentProgressIfNeeded({ studentId, subjectId, assignmentGrade, assignmentTopicId, videoId, passed }) {
  if (!passed) return { advanced: false, reason: "not_passed" };
  if (!isValidObjectId(studentId) || !isValidObjectId(subjectId) || !isValidObjectId(assignmentTopicId)) {
    return { advanced: false, reason: "bad_ids" };
  }

  // 1) ACTIVE subscription tekshiramiz
  const sub = await Subscription.findOne({ student: studentId, subject: subjectId, status: "active" })
    .select("_id student subject status endDate")
    .lean();

  if (!sub) return { advanced: false, reason: "no_active_subscription" };

  // 1.5) ✅ Agar assignment video bilan bog‘langan bo‘lsa — avval video COMPLETED bo‘lishi shart
  if (videoId && isValidObjectId(videoId)) {
    const vp = await VideoProgress.findOne({ user: studentId, video: videoId })
      .select("status completedAt")
      .lean();

    if (!vp || normalizeStatus(vp.status) !== "completed") {
      return { advanced: false, reason: "video_not_completed", videoId };
    }
  }


  // 2) progress borligini olamiz (bo‘lmasa yaratamiz)
  let sp = await StudentProgress.findOne({ student: studentId, subject: subjectId });
  if (!sp) {
    sp = await StudentProgress.create({
      student: studentId,
      subject: subjectId,
      currentGradeOrLevel: Number(assignmentGrade || 5),
      currentTopic: assignmentTopicId,
      currentTopicCompleted: false,
      totalWatchSeconds: 0,
      lastSeenAt: null,
    });
  }

  const curTopicId = sp.currentTopic ? String(sp.currentTopic) : null;
  const assTopicId = String(assignmentTopicId);

  // Faqat currentTopic bo‘lsa o‘tkazamiz (sakramaslik)
  if (!curTopicId || curTopicId !== assTopicId) {
    return { advanced: false, reason: "not_current_topic", currentTopic: sp.currentTopic };
  }

  // 3) current topic info (order/grade) topamiz
  const curTopic = await CurriculumTopic.findById(assignmentTopicId).select("_id order grade subject title").lean();
  if (!curTopic) return { advanced: false, reason: "topic_not_found" };

  // 4) next topic: shu grade ichida order > current
  let nextTopic = await CurriculumTopic.findOne({
    subject: subjectId,
    grade: Number(curTopic.grade),
    order: { $gt: Number(curTopic.order || 0) },
  })
    .sort({ order: 1 })
    .select("_id order grade subject title")
    .lean();

  // 5) Agar shu grade tugagan bo‘lsa: keyingi grade’dan birinchi topic
  let nextGrade = Number(curTopic.grade);
  while (!nextTopic && nextGrade < 11) {
    nextGrade += 1;
    nextTopic = await CurriculumTopic.findOne({
      subject: subjectId,
      grade: nextGrade,
    })
      .sort({ order: 1 })
      .select("_id order grade subject title")
      .lean();
  }

  // 6) Progress update
  if (nextTopic) {
    sp.currentGradeOrLevel = Number(nextTopic.grade);
    sp.currentTopic = nextTopic._id;
    sp.currentTopicCompleted = false;
    sp.lastSeenAt = new Date();
    await sp.save();

    return { advanced: true, nextTopic };
  }

  // Umuman keyingi topic yo‘q (hammasi tugagan)
  sp.currentTopicCompleted = true;
  sp.lastSeenAt = new Date();
  await sp.save();

  return { advanced: true, nextTopic: null, finished: true };
}

// POST /api/assignments/student/attempts/:attemptId/submit
// body: { answers: [{questionId, selectedIndex}] }
async function studentSubmitAttempt(req, res) {
  try {
    const studentId = req.user?._id;
    const { attemptId } = req.params;

    if (!studentId) return res.status(401).json({ message: "Auth kerak" });
    if (!isValidObjectId(attemptId)) return res.status(400).json({ message: "attemptId noto‘g‘ri" });

    const attempt = await AssignmentAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: "Attempt topilmadi" });

    if (String(attempt.student) !== String(studentId)) {
      return res.status(403).json({ message: "Bu attempt sizniki emas" });
    }

    const st = normalizeStatus(attempt.status);
    if (st === "submitted") {
      return res.status(400).json({ message: "Bu attempt allaqachon topshirilgan" });
    }

    const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];

    const questions = await AssignmentQuestion.find({ assignment: attempt.assignment })
      .sort({ order: 1 })
      .lean();

    const qMap = new Map(questions.map((q) => [String(q._id), q]));

    let correctCount = 0;

    const normalizedAnswers = answers
      .map((a) => {
        const qId = String(a.questionId || a._id || "");
        const q = qMap.get(qId);

        const selectedIndex =
          a.selectedIndex === undefined || a.selectedIndex === null ? -1 : Number(a.selectedIndex);

        if (q && selectedIndex >= 0) {
          const isCorrect = Number(selectedIndex) === Number(q.correctIndex ?? 0);
          if (isCorrect) correctCount += 1;
        }

        return {
          question: q ? q._id : isValidObjectId(qId) ? qId : undefined,
          selectedIndex,
        };
      })
      .filter((x) => x.question); // schema talab qiladi: question majburiy

    const totalQuestions = questions.length;
    const scorePercent = totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // assignment info (subject/grade/topic/video)
    const assignment = await Assignment.findById(attempt.assignment)
      .select("_id subject grade topic video status")
      .lean();

    attempt.answers = normalizedAnswers;
    attempt.totalQuestions = totalQuestions;
    attempt.correctCount = correctCount;
    attempt.scorePercent = scorePercent;
    attempt.status = "submitted";

    await attempt.save();

    // ✅ Progress advance (sakramaslik) + completion lists

    let advanceInfo = null;

    if (assignment && normalizeStatus(assignment.status) === "published") {
      const passed = Number(scorePercent) >= PASS_SCORE_PERCENT;
      const topicId = assignment.topic;
      const videoId = assignment.video;

      // 1) TEST completed topics
      if (passed && topicId) {
        await StudentProgress.updateOne(
          { student: studentId, subject: assignment.subject },
          {
            $addToSet: { testCompletedTopics: topicId },
            $set: { lastSeenAt: new Date() },
          }
        );

// 2) Agar shu topic videolari ham completed bo‘lsa -> FULL completed
        const sp = await StudentProgress.findOne({ student: studentId, subject: assignment.subject })
          .select("videoCompletedTopics testCompletedTopics completedTopics")
          .lean();

        const vc = (sp?.videoCompletedTopics || []).map(String);
        if (vc.includes(String(topicId))) {
          await StudentProgress.updateOne(
            { student: studentId, subject: assignment.subject },
            {
              $addToSet: { completedTopics: topicId },
            }
          );
}
      }

      // 3) Advance rule: agar assignment video bilan bog‘langan bo‘lsa — video completed shart
      advanceInfo = await advanceStudentProgressIfNeeded({
        studentId,
        subjectId: assignment.subject,
        assignmentGrade: assignment.grade,
        assignmentTopicId: assignment.topic,
        videoId: assignment.video,
        passed,
      });
    }

    return res.json({
      message: "✅ Topshirildi",
      attempt: attempt.toObject(),
      progressAdvance: advanceInfo,
    });
  } catch (err) {
    console.error("studentSubmitAttempt error:", err);
    return res.status(500).json({ message: "Server xatosi", error: err.message });
  }
}

// GET /api/assignments/student/attempts
async function studentGetMyAttempts(req, res) {
  try {
    const studentId = req.user?._id;
    if (!studentId) return res.status(401).json({ message: "Auth kerak" });

    const list = await AssignmentAttempt.find({ student: studentId })
      .sort({ createdAt: -1 })
      .populate("assignment", "title grade subject topic video status")
      .lean();

    return res.json({ count: list.length, attempts: list });
  } catch (err) {
    console.error("studentGetMyAttempts error:", err);
    return res.status(500).json({ message: "Server xatosi", error: err.message });
  }
}

module.exports = {
  studentGetAssignments,
  studentGetAssignmentsByTopic,
  studentStartAttempt,
  studentSubmitAttempt,
  studentGetMyAttempts,
};
