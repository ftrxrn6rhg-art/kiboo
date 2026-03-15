// backend/controllers/curriculum/curriculum.controller.js
const mongoose = require("mongoose");
const Subject = require("../../models/Subject");
const CurriculumChapter = require("../../models/CurriculumChapter");
const CurriculumTopic = require("../../models/CurriculumTopic");

/**
 * GET /api/curriculum/subjects/:subjectId/grades
 * -> shu subject ichida qaysi sinflarda topic bor (5..11)
 */
exports.getGradesBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: "subjectId noto‘g‘ri" });
    }

    const grades = await CurriculumTopic.distinct("grade", { subject: subjectId, isActive: true });
    grades.sort((a, b) => a - b);

    return res.json({ subjectId, grades });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
};

/**
 * GET /api/curriculum/structure?subject=...&grade=5
 * -> chapterlar + ichidagi topiclar (Teacher dropdown uchun eng qulay)
 */
exports.getStructure = async (req, res) => {
  try {
    const { subject, grade } = req.query;

    if (!subject || !mongoose.Types.ObjectId.isValid(String(subject))) {
      return res.status(400).json({ message: "subject majburiy va ObjectId bo‘lishi kerak" });
    }

    const g = Number(grade);
    if (!g || Number.isNaN(g)) {
      return res.status(400).json({ message: "grade majburiy (masalan 5)" });
    }

    const chapters = await CurriculumChapter.find({ subject, grade: g })
      .sort({ order: 1, createdAt: 1 })
      .select("_id title order grade subject");

    const chapterIds = chapters.map((c) => c._id);

    const topics = await CurriculumTopic.find({
      subject,
      grade: g,
      chapter: { $in: chapterIds },
      isActive: true,
    })
      .sort({ chapter: 1, order: 1, createdAt: 1 })
      .select("_id title order chapter grade subject");

    const byChapter = {};
    for (const c of chapters) byChapter[String(c._id)] = [];
    for (const t of topics) {
      const key = String(t.chapter);
      if (!byChapter[key]) byChapter[key] = [];
      byChapter[key].push(t);
    }

    const result = chapters.map((c) => ({
      _id: c._id,
      title: c.title,
      order: c.order,
      topics: byChapter[String(c._id)] || [],
    }));

    return res.json({
      subject,
      grade: g,
      chapters: result,
    });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
};

/**
 * POST /api/curriculum/seed/grade5/math
 * (hozircha qo‘lda seed qilmaymiz. Keyin senga yuborgan ro‘yxat bilan seed qilamiz.)
 * Bu endpointni hozir qo‘shmaymiz — ortiqcha.
 */