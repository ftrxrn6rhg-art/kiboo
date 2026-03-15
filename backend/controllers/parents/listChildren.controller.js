// backend/controllers/parents/listChildren.controller.js
const ParentStudent = require("../../models/ParentStudent");

module.exports = async function listChildren(req, res) {
  try {
    const links = await ParentStudent.find({ parent: req.user._id, isActive: true })
      .populate("student", "_id name email parentCode role")
      .sort({ createdAt: -1 });

    const children = links.map((l) => l.student);

    return res.json({ count: children.length, children });
  } catch (err) {
    console.error("LIST CHILDREN ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};