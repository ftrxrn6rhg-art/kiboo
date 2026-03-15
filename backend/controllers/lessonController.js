const mongoose = require("mongoose");
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");

// GET /api/lessons?course=COURSE_ID
exports.getLessons = async (req, res) => {
  try {
    const filter = {};

    if (req.query.course) {
      if (!mongoose.Types.ObjectId.isValid(req.query.course)) {
        return res.status(400).json({ message: "Course ID noto‘g‘ri" });
      }
      filter.course = req.query.course;
    }

    const lessons = await Lesson.find(filter)
      .populate("course", "title price")
      .sort({ order: 1 });

    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/lessons/:id
exports.getLessonById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Noto‘g‘ri ID" });
    }

    const lesson = await Lesson.findById(id).populate("course", "title price");
    if (!lesson) return res.status(404).json({ message: "Lesson topilmadi" });

    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/lessons
exports.createLesson = async (req, res) => {
  try {
    const { title, videoUrl, duration, order, course } = req.body;

    if (!mongoose.Types.ObjectId.isValid(course)) {
      return res.status(400).json({ message: "Course ID noto‘g‘ri" });
    }

    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({ message: "Course topilmadi" });
    }

    const lesson = await Lesson.create({
      title,
      videoUrl,
      duration,
      order,
      course
    });

    res.status(201).json(lesson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/lessons/:id
exports.updateLesson = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Noto‘g‘ri ID" });
    }

    // agar course update qilinsa — tekshiramiz
    if (req.body.course) {
      if (!mongoose.Types.ObjectId.isValid(req.body.course)) {
        return res.status(400).json({ message: "Course ID noto‘g‘ri" });
      }
      const courseExists = await Course.findById(req.body.course);
      if (!courseExists) return res.status(404).json({ message: "Course topilmadi" });
    }

    const updated = await Lesson.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) return res.status(404).json({ message: "Lesson topilmadi" });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/lessons/:id
exports.deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Noto‘g‘ri ID" });
    }

    const deleted = await Lesson.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Lesson topilmadi" });

    res.json({ message: "O‘chirildi", deletedId: id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};