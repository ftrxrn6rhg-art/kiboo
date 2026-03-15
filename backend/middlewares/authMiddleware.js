const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";

    if (!auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token yo'q (Bearer)" });
    }

    const token = auth.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token yo'q" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User topilmadi" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token noto'g'ri", error: err.message });
  }
};

const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Avval protect kerak" });

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Ruxsat yo'q (role mos emas)" });
    }
    next();
  };
};

module.exports = { protect, roleCheck };