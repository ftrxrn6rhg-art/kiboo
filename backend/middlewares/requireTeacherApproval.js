// backend/middlewares/requireTeacherApproval.js
module.exports = function requireTeacherApproval(req, res, next) {
  try {
    const role = req.user?.role;
    if (role !== "teacher") return next();

    const status = String(req.user?.teacherApprovalStatus || "pending").toLowerCase();
    if (status !== "approved") {
      return res.status(403).json({ message: "Sertifikat tasdiqlanmagan. Admin tasdiqidan so‘ng davom eting." });
    }

    return next();
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
};
