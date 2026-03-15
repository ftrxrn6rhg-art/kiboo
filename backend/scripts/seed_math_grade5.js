// backend/scripts/seed_math_grade5.js
require("dotenv").config();
const mongoose = require("mongoose");

const CurriculumChapter = require("../models/CurriculumChapter");
const CurriculumTopic = require("../models/CurriculumTopic");

const SUBJECT_ID = "694b03a0ec0d154c7b000716"; // Matematika
const GRADE = 5;

const CHAPTERS = [
  {
    order: 1,
    title: "I bob. Natural sonlarni qo‘shish va ayirish",
    topics: [
      "Natural sonlar va nol",
      "Sodda geometrik shakllar",
      "Shkalalar va sonlar nuri",
      "Natural sonlarni taqqoslash",
      "Natural sonlarni yaxlitlash",
      "Natural sonlarni qo‘shish",
      "Natural sonlarni ayirish",
      "Sonli va harfli ifodalar",
      "Matematik masala va tenglamalar",
      "I bobni takrorlashga doir masalalar",
    ],
  },
  {
    order: 2,
    title: "II bob. Natural sonlarni ko‘paytirish va bo‘lish",
    topics: [
      "Natural sonlarni ko‘paytirish",
      "Natural sonlarni bo‘lish",
      "Qoldiqli bo‘lish",
      "Qulay va tezkor hisoblash usullari",
      "Ifodalarni soddalashtirish",
      "O‘tilganlarni takrorlashga doir masalalar",
      "Murakkabroq masalalarni yechish",
      "To‘rt amalga doir hisoblash algoritmlari",
      "Sonning kvadrati, kubi va darajasi",
      "Ma’lumotlar bilan ishlash",
      "Loyiha ishi namunasi",
      "II bobni takrorlashga doir masalalar",
    ],
  },
  {
    order: 3,
    title: "III bob. Matnli masalalarni yechish",
    topics: [
      "Matnli masalalar",
      "Qismlarga doir masalalar",
      "Geometrik mazmundagi matnli masalalar",
      "Harakatga doir masalalar",
      "Ikki jism harakatiga doir masalalar",
      "Iqtisodiy mazmundagi matnli masalalar",
      "Bajarilgan ishga doir masalalar",
      "III bobni takrorlashga doir masalalar",
    ],
  },
  {
    order: 4,
    title: "IV bob. Geometrik shakllar",
    topics: [
      "Burchaklar",
      "Parallel va perpendikulyar to'g'ri chiziqlar",
      "Siniq chiziq va uning uzunligi",
      "Ko'pburchak perimetri",
      "O'tilganlarni takrorlashga doir masalalar",
      "To'g'ri to'rtburchakning yuzi",
      "Murakkab shakllarning yuzi",
      "Yuz o‘lchov birliklari",
      "Yuzni chamalab taqribiy hisoblash",
      "IV bobni takrorlashga doir masalalar",
    ],
  },
  {
    order: 5,
    title: "V bob. Oddiy kasrlar",
    topics: [
      "Ulushlar va oddiy kasrlar",
      "Kasrlarni taqqoslash",
      "To‘g‘ri va noto‘g‘ri kasrlar",
      "Bir xil maxrajli kasrlarni qo‘shish va ayirish",
      "Bo‘lish va kasrlar",
      "O‘tilganlarni takrorlashga doir masalalar",
      "Aralash sonlar",
      "Aralash sonlarni qo‘shish va ayirish",
      "Kasrlarga doir masalalar",
      "V bobni takrorlashga doir masalalar",
    ],
  },
  {
    order: 6,
    title: "VI bob. Fazoviy geometrik shakllar",
    topics: [
      "Fazoviy shakllar. Ko‘pyoqlar",
      "To‘g‘ri burchakli parallelepiped va kub",
      "Ko‘pyoqlarni yoyilmasiga ko‘ra yasash",
      "To‘g‘ri burchakli parallelepiped va kub hajmi",
      "VI bobni takrorlashga doir masalalar",
    ],
  },
  {
    order: 7,
    title: "VII bob. O‘nli kasrlar",
    topics: [
      "O‘nli kasrlar",
      "O‘nli kasrlarni taqqoslash",
      "O‘nli kasrlarni qo‘shish va ayirish",
      "Sonning taqribiy qiymati va yaxlitlash",
      "Oilada tejamkorlik va matematika",
      "O‘tilganlarni takrorlashga doir masalalar",
      "O‘nli kasrlarni natural songa ko‘paytirish",
      "O‘nli kasrlarni natural songa bo‘lish",
      "O‘nli kasrlarni ko‘paytirish",
      "O‘nli kasrni o‘nli kasrga bo‘lish",
      "Foizlar",
      "VII bobni takrorlashga doir masalalar",
    ],
  },
  {
    order: 8,
    title: "VIII bob. Ma’lumotlar tahlili",
    topics: [
      "Ma’lumotlar qatorining o‘rta arifmetigi",
      "Ma’lumotlar qatori va uning tahlili",
      "Yakuniy takrorlashga doir masalalar",
    ],
  },
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected (seed) ");

  const subjectId = new mongoose.Types.ObjectId(SUBJECT_ID);

  // 1) Chapters upsert
  const chapterIdByOrder = {};
  for (const ch of CHAPTERS) {
    const doc = await CurriculumChapter.findOneAndUpdate(
      { subject: subjectId, grade: GRADE, order: ch.order },
      { $set: { title: ch.title } },
      { new: true, upsert: true }
    );
    chapterIdByOrder[ch.order] = doc._id;
  }

  // 2) Topics upsert
  let createdOrUpdated = 0;
  let fixedOldNoChapter = 0;

  for (const ch of CHAPTERS) {
    const chapterId = chapterIdByOrder[ch.order];

    for (let i = 0; i < ch.topics.length; i++) {
      const title = ch.topics[i];
      const order = i + 1;

      // Upsert by (subject, grade, chapter, order)
      const doc = await CurriculumTopic.findOneAndUpdate(
        { subject: subjectId, grade: GRADE, chapter: chapterId, order },
        { $set: { title, isActive: true } },
        { new: true, upsert: true }
      );

      if (doc) createdOrUpdated++;

      // Agar eski topiclar (chapter yo‘q) bo‘lib qolgan bo‘lsa — title bo‘yicha bog‘lab qo‘yamiz
      const old = await CurriculumTopic.findOne({
        subject: subjectId,
        grade: GRADE,
        title,
        $or: [{ chapter: { $exists: false } }, { chapter: null }],
      });

      if (old) {
        old.chapter = chapterId;
        old.order = order;
        old.isActive = true;
        await old.save();
        fixedOldNoChapter++;
      }
    }
  }

  const chaptersCount = await CurriculumChapter.countDocuments({ subject: subjectId, grade: GRADE });
  const topicsCount = await CurriculumTopic.countDocuments({ subject: subjectId, grade: GRADE });

  console.log("✅ Seed done:", {
    subject: SUBJECT_ID,
    grade: GRADE,
    chaptersCount,
    topicsCount,
    createdOrUpdated,
    fixedOldNoChapter,
  });

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("❌ Seed error:", e);
  process.exit(1);
});
