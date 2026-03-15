// backend/middlewares/subscriptionMiddleware.js
const Subscription = require("../models/Subscription");
const VideoLesson = require("../models/VideoLesson");

/**
 * requireActiveSubscription:
 * - Userda active subscription bo‘lishi shart
 * - endsAt tugamagan bo‘lishi shart
 * - Agar subscription.subject = null bo‘lsa => GLOBAL (hamma video/subjectga ruxsat)
 * - Agar subscription.subject bor bo‘lsa => faqat o‘sha subjectdagi videolarga ruxsat
 *
 * NOTE: Subscription modelda fieldlar har xil bo‘lishi mumkin:
 * - isActive (boolean)
 * - status ("active"/"inactive")
 * - endsAt yoki endsAt/startedAt (senda endsAt ko‘rinib turibdi)
 */
async function requireActiveSubscription(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Video bo'lmasa (list/collection) -> faqat active sub borligini tekshiramiz
    const videoId = req.params.id || req.params.videoId;
    if (!videoId) {
      const activeAny = await Subscription.findOne({ student: userId, status: "active" });
      if (!activeAny) return res.status(403).json({ message: "Subscription active emas" });
      if (activeAny.endDate) {
        const ends = new Date(activeAny.endDate);
        if (!Number.isNaN(ends.getTime()) && ends < new Date()) {
          return res.status(403).json({ message: "Subscription muddati tugagan" });
        }
      }
      return next();
    }

    // Video bo'lsa -> video.subject ga mos active subscription tekshiramiz
    const video = await VideoLesson.findById(videoId).select("subject");
    if (!video) return res.status(404).json({ message: "Video topilmadi" });

    const videoSubjectId = String(video.subject || "");
    const sub = await Subscription.findOne({
      student: userId,
      subject: videoSubjectId,
      status: "active",
    });

    if (!sub) {
      return res.status(403).json({ message: "Bu video uchun subscription yo‘q" });
    }

    if (sub.endDate) {
      const ends = new Date(sub.endDate);
      if (!Number.isNaN(ends.getTime()) && ends < new Date()) {
        return res.status(403).json({ message: "Subscription muddati tugagan" });
      }
    }

    return next();
  } catch (err) {
    console.error("Subscription check error:", err?.message || err);
    return res.status(500).json({ message: "Subscription check error" });
  }
}

module.exports = { requireActiveSubscription };
