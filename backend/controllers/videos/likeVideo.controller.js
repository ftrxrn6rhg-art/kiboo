const VideoLesson = require("../../models/VideoLesson");

async function toggleLike(req, res) {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: "Auth kerak" });

    const video = await VideoLesson.findById(id);
    if (!video) return res.status(404).json({ message: "Video topilmadi" });

    const uid = String(userId);
    const hasLike = video.likes.some((u) => String(u) === uid);
    const hasDislike = video.dislikes.some((u) => String(u) === uid);

    if (hasLike) {
      video.likes = video.likes.filter((u) => String(u) !== uid);
    } else {
      video.likes.push(userId);
      if (hasDislike) {
        video.dislikes = video.dislikes.filter((u) => String(u) !== uid);
      }
    }

    await video.save();

    return res.json({
      message: "OK",
      likes: video.likes.length,
      dislikes: video.dislikes.length,
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

    const video = await VideoLesson.findById(id);
    if (!video) return res.status(404).json({ message: "Video topilmadi" });

    const uid = String(userId);
    const hasLike = video.likes.some((u) => String(u) === uid);
    const hasDislike = video.dislikes.some((u) => String(u) === uid);

    if (hasDislike) {
      video.dislikes = video.dislikes.filter((u) => String(u) !== uid);
    } else {
      video.dislikes.push(userId);
      if (hasLike) {
        video.likes = video.likes.filter((u) => String(u) !== uid);
      }
    }

    await video.save();

    return res.json({
      message: "OK",
      likes: video.likes.length,
      dislikes: video.dislikes.length,
      liked: false,
      disliked: !hasDislike,
    });
  } catch (e) {
    return res.status(500).json({ message: "Server xatosi", error: String(e?.message || e) });
  }
}

module.exports = { toggleLike, toggleDislike };
