// middlewares/requireRole.js
module.exports = function requireRole(role) {
  return (req, res, next) => {
    // authMiddleware req.user ni qo‘ygan bo‘lishi kerak
    if (!req.user) {
      return res.status(401).json({ message: "Token kerak" });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: "Ruxsat yo‘q (role mos emas)" });
    }

    next();
  };
};