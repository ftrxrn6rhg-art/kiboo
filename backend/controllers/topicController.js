const mongoose = require("mongoose");
const CurriculumTopic = require("../models/CurriculumTopic");
const Subject = require("../models/Subject");

async function createTopic(req, res) {
  try {
    const { subjectId, grade, title, order } = req.body;

    if (!subjectId || !mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: "subjectId noto'g'ri" });
    }
    if (!grade || Number.isNaN(Number(grade))) {
      return res.status(400).json({ message: "grade kerak" });
    }
    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: "title kerak" });
    }

    const subject = await Subject.findById(subjectId).select("_id");
    if (!subject) return res.status(404).json({ message: "Subject topilmadi" });

    const doc = await CurriculumTopic.create({
      subject: subject._id,
      grade: Number(grade),
      title: String(title).trim(),
      order: order ? Number(order) : 1,
    });

    return res.status(201).json(doc);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Bu topic allaqachon mavjud" });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function listTopics(req, res) {
  try {
    const { subjectId, grade } = req.query;
    const filter = { isActive: true };

    if (subjectId) {
      if (!mongoose.Types.ObjectId.isValid(subjectId)) {
        return res.status(400).json({ message: "subjectId noto'g'ri" });
      }
      filter.subject = subjectId;
    }
    if (grade) filter.grade = Number(grade);

    const items = await CurriculumTopic.find(filter)
      .sort({ grade: 1, order: 1, title: 1 })
      .select("_id subject grade title order");

    return res.json({ count: items.length, topics: items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { createTopic, listTopics };