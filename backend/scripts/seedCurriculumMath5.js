// backend/scripts/seedCurriculumMath5.js
require("dotenv").config();
const mongoose = require("mongoose");

const CurriculumChapter = require("../models/CurriculumChapter");
const CurriculumTopic = require("../models/CurriculumTopic");

const SUBJECT_ID = "694b03a0ec0d154c7b000716"; // Matematika
const GRADE = 5;

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const chapters = await CurriculumChapter.find({
    subject: SUBJECT_ID,
    grade: GRADE,
  }).select("_id title order");

  const byOrder = new Map(chapters.map((c) => [c.order, c]));

  const needOrders = [5, 6, 7, 8];
  for (const o of needOrders) {
    if (!byOrder.get(o)) {
      throw new Error(
        `❌ Chapter topilmadi: order=${o}. Avval chapterlar yaratilganiga ishonch hosil qiling.`
      );
    }
  }

  const CH5 = byOrder.get(5)._id; // V bob
  const CH6 = byOrder.get(6)._id; // VI bob
  const CH7 = byOrder.get(7)._id; // VII bob
  const CH8 = byOrder.get(8)._id; // VIII bob

  const topics = [
    // V BOB (qolgan 6..10)
    { chapter: CH5, order: 6, title: "O‘tilganlarni takrorlashga doir masalalar" },
    { chapter: CH5, order: 7, title: "Aralash sonlar" },
    { chapter: CH5, order: 8, title: "Aralash sonlarni qo‘shish va ayirish" },
    { chapter: CH5, order: 9, title: "Kasrlarga doir masalalar" },
    { chapter: CH5, order: 10, title: "V bobni takrorlashga doir masalalar" },

    // VI BOB (51..55)
    { chapter: CH6, order: 1, title: "Fazoviy shakllar. Ko‘pyoqlar" },
    { chapter: CH6, order: 2, title: "To‘g‘ri burchakli parallelepiped va kub" },
    { chapter: CH6, order: 3, title: "Ko‘pyoqlarni yoyilmasiga ko‘ra yasash" },
    { chapter: CH6, order: 4, title: "To‘g‘ri burchakli parallelepiped va kub hajmi" },
    { chapter: CH6, order: 5, title: "VI bobni takrorlashga doir masalalar" },

    // VII BOB (56..67)
    { chapter: CH7, order: 1, title: "O‘nli kasrlar" },
    { chapter: CH7, order: 2, title: "O‘nli kasrlarni taqqoslash" },
    { chapter: CH7, order: 3, title: "O‘nli kasrlarni qo‘shish va ayirish" },
    { chapter: CH7, order: 4, title: "Sonning taqribiy qiymati va yaxlitlash" },
    { chapter: CH7, order: 5, title: "Oilada tejamkorlik va matematika" },
    { chapter: CH7, order: 6, title: "O‘tilganlarni takrorlashga doir masalalar" },
    { chapter: CH7, order: 7, title: "O‘nli kasrlarni natural songa ko‘paytirish" },
    { chapter: CH7, order: 8, title: "O‘nli kasrlarni natural songa bo‘lish" },
    { chapter: CH7, order: 9, title: "O‘nli kasrlarni ko‘paytirish" },
    { chapter: CH7, order: 10, title: "O‘nli kasrni o‘nli kasrga bo‘lish" },
    { chapter: CH7, order: 11, title: "Foizlar" },
    { chapter: CH7, order: 12, title: "VII bobni takrorlashga doir masalalar" },

    // VIII BOB (68..70)
    { chapter: CH8, order: 1, title: "Ma’lumotlar qatorining o‘rta arifmetigi" },
    { chapter: CH8, order: 2, title: "Ma’lumotlar qatori va uning tahlili" },
    { chapter: CH8, order: 3, title: "Yakuniy takrorlashga doir masalalar" },
  ].map((t) => ({
    subject: SUBJECT_ID,
    grade: GRADE,
    chapter: t.chapter,
    order: t.order,
    title: t.title,
    isActive: true,
  }));

  const ops = topics.map((t) => ({
    updateOne: {
      filter: {
        subject: t.subject,
        grade: t.grade,
        chapter: t.chapter,
        title: t.title,
      },
      update: { $set: t },
      upsert: true,
    },
  }));

  const before = await CurriculumTopic.countDocuments({ subject: SUBJECT_ID, grade: GRADE });
  const res = await CurriculumTopic.bulkWrite(ops, { ordered: false });
  const after = await CurriculumTopic.countDocuments({ subject: SUBJECT_ID, grade: GRADE });

  console.log("✅ Seed done");
  console.log({
    before,
    after,
    inserted: res.upsertedCount ?? 0,
    modified: res.modifiedCount ?? 0,
    matched: res.matchedCount ?? 0,
  });

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("❌ Seed error:", e.message || e);
  process.exit(1);
});