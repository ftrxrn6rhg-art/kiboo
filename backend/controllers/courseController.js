const mongoose = require("mongoose");
const Course = require("../models/Course");
const Teacher = require("../models/Teacher");

// GET /api/courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("teacher", "name subject experience")
      .sort({ createdAt: -1 });

    return res.json(courses);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/courses/:id
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Noto‘g‘ri ID" });
    }

    const course = await Course.findById(id).populate(
      "teacher",
      "name subject experience"
    );

    if (!course) {
      return res.status(404).json({ message: "Course topilmadi" });
    }

    return res.json(course);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/courses
exports.createCourse = async (req, res) => {
  try {
    // DIQQAT: frontend/curl "teacherId" yuborsa ham ishlashi uchun
    // teacher = req.body.teacher || req.body.teacherId qilib oldik
    const { title, description, price } = req.body;
    const teacher = req.body.teacher || req.body.teacherId;

    if (!teacher) {
      return res.status(400).json({ message: "Teacher majburiy (teacher yoki teacherId)" });
    }

    if (!mongoose.Types.ObjectId.isValid(teacher)) {
      return res.status(400).json({ message: "Teacher ID noto‘g‘ri" });
    }

    const teacherExists = await Teacher.findById(teacher);
    if (!teacherExists) {
      return res.status(404).json({ message: "Teacher topilmadi" });
    }

    const course = await Course.create({
      title,
      description,
      price,
      teacher,
    });

    return res.status(201).json(course);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// PUT /api/courses/:id
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Noto‘g‘ri ID" });
    }

    // Agar teacher update qilinsa — teacher yoki teacherId bo‘lishi mumkin
    const teacherToUpdate = req.body.teacher || req.body.teacherId;

    if (teacherToUpdate) {
      if (!mongoose.Types.ObjectId.isValid(teacherToUpdate)) {
        return res.status(400).json({ message: "Teacher ID noto‘g‘ri" });
      }

      const teacherExists = await Teacher.findById(teacherToUpdate);
      if (!teacherExists) {
        return res.status(404).json({ message: "Teacher topilmadi" });
      }

      // agar teacherId kelgan bo‘lsa, modelga teacher qilib yozib qo‘yamiz
      req.body.teacher = teacherToUpdate;
      delete req.body.teacherId;
    }

    const updated = await Course.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Course topilmadi" });
    }

    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// DELETE /api/courses/:id
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Noto‘g‘ri ID" });
    }

    const deleted = await Course.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Course topilmadi" });
    }

    return res.json({ message: "O‘chirildi", deletedId: id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};