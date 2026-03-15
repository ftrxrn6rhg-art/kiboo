// backend/scripts/seedCurriculumMath6.js
require("dotenv").config();
const mongoose = require("mongoose");

const CurriculumChapter = require("../models/CurriculumChapter");
const CurriculumTopic = require("../models/CurriculumTopic");

// 🔴 MATEMATIKA subjectId (sizdagi)
const SUBJECT_ID = "694b03a0ec0d154c7b000716";
const GRADE = 6;

/*
  ESLATMA:
  curriculumtopics da unique index bor: (subject, grade, title)
  Bir xil title qayta kelsa — avtomatik "(bob X)" qo‘shib unik qilamiz
*/

const chapters = [
  {
    order: 1,
    title: "I bob. Oddiy kasrlar (taqqoslash, qo‘shish-ayirish)",
    topics: [
      "Teng maxrajli kasrlar",
      "Kasrlarni qisqartirish",
      "Kasrlarni umumiy maxrajga keltirish",
      "Har xil maxrajli kasrlarni taqqoslash",
      "Har xil maxrajli kasrlarni qo‘shish",
      "Har xil maxrajli kasrlarni ayirish",
      "Aralash sonlarni qo‘shish va ayirish",
    ],
  },
  {
    order: 2,
    title: "II bob. Kasrlar ustida ko‘paytirish va bo‘lish",
    topics: [
      "Kasrlarni ko‘paytirish",
      "Aralash sonlarni ko‘paytirish",
      "Sonning qismini topish",
      "Qulay usullarda hisoblash",
      "O‘zaro teskari sonlar",
      "Kasrlarni bo‘lish",
      "Aralash sonlarni bo‘lish",
      "Qismiga ko‘ra sonni topish",
      "Kasrlar ustida amallarga doir topshiriqlar",
    ],
  },
  {
    order: 3,
    title: "III bob. O‘nli kasrlar",
    topics: [
      "O‘nli kasrni natural songa ko‘paytirish",
      "O‘nli kasrni 10 ga, 100 ga, 1000 ga ko‘paytirish",
      "O‘nli kasrlarni ko‘paytirish",
      "O‘nli kasrni natural songa bo‘lish",
      "O‘nli kasrni 10 ga, 100 ga, 1000 ga bo‘lish",
      "O‘nli kasrlarni bo‘lish",
      "Kasrni o‘nli kasrga keltirish",
      "Davriy kasrlar",
      "O‘nli kasrlarni yaxlitlash",
      "O‘nli kasrlar ustida amallarga doir topshiriqlar",
    ],
  },
  {
    order: 4,
    title: "IV bob. Butun sonlar",
    topics: [
      "Musbat va manfiy sonlar",
      "Butun sonlar haqida tushuncha",
      "Musbat va manfiy butun sonlarni son o‘qida tasvirlash",
      "Sonning moduli",
      "Butun sonlarni taqqoslash",
      "Butun sonlarni qo‘shish",
      "Butun sonlarni ayirish",
      "Butun sonlarni ko‘paytirish",
      "Butun sonlarni bo‘lish",
      "Butun sonlar ustida amallarga doir topshiriqlar",
    ],
  },
  {
    order: 5,
    title: "V bob. Ratsional sonlar",
    topics: [
      "Ratsional son haqida tushuncha",
      "Ratsional sonlarni qo‘shish",
      "Ratsional sonlarni ayirish",
      "Ratsional sonlarni ko‘paytirish",
      "Ratsional sonlarni bo‘lish",
      "Ratsional sonlar ustida amallarga doir topshiriqlar",
    ],
  },
  {
    order: 6,
    title: "VI bob. Koordinatalar va geometriya",
    topics: [
      "Dekart koordinatalar sistemasi",
      "Koordinatalar sistemasida shakllar yasash",
      "Uchburchak va uning elementlari",
      "Uchburchak turlari",
      "Uchburchakning yuzi",
      "Katakli qog‘ozda yuzlarni hisoblash",
      "Aylana va doira",
      "Aylana uzunligi va doira yuzi",
      "Murakkab shakllarning yuzi",
      "Fazoviy shakllar hajmi",
      "O‘lchov birliklari orasidagi munosabatlar",
    ],
  },
  {
    order: 7,
    title: "VII bob. Nisbat, proporsiya, foiz",
    topics: [
      "Nisbat",
      "Proporsiyalar",
      "Proporsiyaning asosiy xossasi",
      "Foizlar",
      "Sonning foizini topish",
      "Foiziga ko‘ra sonni topish",
      "To‘g‘ri va teskari proporsional miqdorlar",
      "Masshtab",
    ],
  },
  {
    order: 8,
    title: "VIII bob. Ifodalar va ma’lumotlar tahlili",
    topics: [
      "Sonli va harfli ifodalar",
      "Tengliklar",
      "Tenglamalar",
      "Iqtisodiy mazmundagi masalalar",
      "Bajarilgan ishga doir masalalar",
      "Jadvallar",
      "Ma’lumotlar qatori",
      "Ma’lumotlar tahlili",
    ],
  },
];

function norm(s) {
  return String(s).replace(/\s+/g, " ").replace(/[.]+$/g, "").trim();
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const usedTitles = new Map();

  // CHAPTERLAR
  await CurriculumChapter.bulkWrite(
    chapters.map((c) => ({
      updateOne: {
        filter: { subject: SUBJECT_ID, grade: GRADE, order: c.order },
        update: {
          $set: {
            subject: SUBJECT_ID,
            grade: GRADE,
            order: c.order,
            title: norm(c.title),
          },
        },
        upsert: true,
      },
    })),
    { ordered: false }
  );

  const dbChapters = await CurriculumChapter.find({
    subject: SUBJECT_ID,
    grade: GRADE,
  }).lean();

  const chapterByOrder = {};
  dbChapters.forEach((c) => (chapterByOrder[c.order] = c));

  // TOPICLAR
  const ops = [];

  chapters.forEach((ch) => {
    const chDoc = chapterByOrder[ch.order];
    ch.topics.forEach((t, i) => {
      const base = norm(t);
      const count = (usedTitles.get(base) || 0) + 1;
      usedTitles.set(base, count);

      const title = count === 1 ? base : `${base} (bob ${ch.order})`;

      ops.push({
        updateOne: {
          filter: {
            subject: SUBJECT_ID,
            grade: GRADE,
            chapter: chDoc._id,
            order: i + 1,
          },
          update: {
            $set: {
              subject: SUBJECT_ID,
              grade: GRADE,
              chapter: chDoc._id,
              order: i + 1,
              title,
              isActive: true,
            },
          },
          upsert: true,
        },
      });
    });
  });

  await CurriculumTopic.bulkWrite(ops, { ordered: false });

  console.log("✅ Matematika 6-sinf curriculum saqlandi");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("❌ Xatolik:", e.message);
  process.exit(1);
});