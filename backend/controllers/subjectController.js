// backend/controllers/subjectController.js
const Subject = require("../models/Subject");

// GET /api/subjects
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ createdAt: -1 });
    res.json({ count: subjects.length, subjects });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/subjects
exports.createSubject = async (req, res) => {
  try {
    const { name, slug } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message: "name va slug majburiy" });
    }

    const exists = await Subject.findOne({ slug: slug.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: "Bu slug allaqachon mavjud" });
    }

    const subject = await Subject.create({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
    });

    res.status(201).json({ message: "Subject yaratildi ✅", subject });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};