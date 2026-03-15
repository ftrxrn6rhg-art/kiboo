const Assignment = require("../../models/Assignment");

async function toggleLike(req, res) {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: "Auth kerak" });

    const item = await Assignment.findById(id);
    if (!item) return res.status(404).json({ message: "Topshiriq topilmadi" });

    const uid = String(userId);
    const hasLike = item.likes.some((u) => String(u) === uid);
    const hasDislike = item.dislikes.some((u) => String(u) === uid);

    if (hasLike) {
      item.likes = item.likes.filter((u) => String(u) !== uid);
    } else {
      item.likes.push(userId);
      if (hasDislike) item.dislikes = item.dislikes.filter((u) => String(u) !== uid);
    }

    await item.save();

    return res.json({
      message: "OK",
      likes: item.likes.length,
      dislikes: item.dislikes.length,
      liked: !hasLike,
      disliked: false,
    });
  } catch (e) {
    return res.status(500).json({ message: "Server xatosi", error: String(e?.message || e) });
  }
}

async function toggleDislike(req, res) {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: "Auth kerak" });

    const item = await Assignment.findById(id);
    if (!item) return res.status(404).json({ message: "Topshiriq topilmadi" });

    const uid = String(userId);
    const hasLike = item.likes.some((u) => String(u) === uid);
    const hasDislike = item.dislikes.some((u) => String(u) === uid);

    if (hasDislike) {
      item.dislikes = item.dislikes.filter((u) => String(u) !== uid);
    } else {
      item.dislikes.push(userId);
      if (hasLike) item.likes = item.likes.filter((u) => String(u) !== uid);
    }

    await item.save();

    return res.json({
      message: "OK",
      likes: item.likes.length,
      dislikes: item.dislikes.length,
      liked: false,
      disliked: !hasDislike,
    });
  } catch (e) {
    return res.status(500).json({ message: "Server xatosi", error: String(e?.message || e) });
  }
}

module.exports = { toggleLike, toggleDislike };
