const bcrypt = require("bcryptjs");
const Teacher = require("../models/Teacher");

// CREATE teacher (admin only)
exports.createTeacher = async (req, res) => {
  try {
    const { name, email, password, specialty } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password majburiy" });
    }

    const exists = await Teacher.findOne({ email: String(email).toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "Bu email bilan teacher bor" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const teacher = await Teacher.create({
      name,
      email: String(email).toLowerCase(),
      password: hashed,
      specialty: specialty || "",
    });

    return res.status(201).json({
      message: "Teacher yaratildi ✅",
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        specialty: teacher.specialty,
        createdAt: teacher.createdAt,
      },
    });
  } catch (err) {
    // eng muhim: server yiqilmasin, xatoni JSON qaytarsin
    return res.status(500).json({
      message: "Teacher create error",
      error: err?.message || String(err),
    });
  }
};

// GET teachers (logged-in)
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().select("_id name email specialty createdAt updatedAt");
    return res.json(teachers);
  } catch (err) {
    return res.status(500).json({
      message: "Get teachers error",
      error: err?.message || String(err),
    });
  }
};

// GET teacher by id (logged-in)
exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select("_id name email specialty createdAt updatedAt");
    if (!teacher) return res.status(404).json({ message: "Teacher topilmadi" });
    return res.json(teacher);
  } catch (err) {
    return res.status(500).json({
      message: "Get teacher error",
      error: err?.message || String(err),
    });
  }
};

// UPDATE teacher (admin only)
exports.updateTeacher = async (req, res) => {
  try {
    const { name, email, specialty, password } = req.body;

    const update = {};
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = String(email).toLowerCase();
    if (specialty !== undefined) update.specialty = specialty;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password, salt);
    }

    const teacher = await Teacher.findByIdAndUpdate(req.params.id, update, { new: true })
      .select("_id name email specialty createdAt updatedAt");

    if (!teacher) return res.status(404).json({ message: "Teacher topilmadi" });

    return res.json({ message: "Teacher update ✅", teacher });
  } catch (err) {
    return res.status(500).json({
      message: "Update teacher error",
      error: err?.message || String(err),
    });
  }
};

// DELETE teacher (admin only)
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher topilmadi" });
    return res.json({ message: "Teacher delete ✅" });
  } catch (err) {
    return res.status(500).json({
      message: "Delete teacher error",
      error: err?.message || String(err),
    });
  }
};