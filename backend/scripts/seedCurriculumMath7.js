// backend/scripts/seedCurriculumMath7.js
require("dotenv").config();
const mongoose = require("mongoose");

const Subject = require("../models/Subject");
const CurriculumChapter = require("../models/CurriculumChapter");
const CurriculumTopic = require("../models/CurriculumTopic");

const MATH_SUBJECT_ID = "694b03a0ec0d154c7b000716"; // Matematika
const GRADE = 7;

async function upsertChapter({ subject, grade, title, order }) {
  const chapter = await CurriculumChapter.findOneAndUpdate(
    { subject, grade, order },
    { subject, grade, title, order },
    { new: true, upsert: true }
  );
  return chapter;
}

async function upsertTopic({ subject, grade, chapterId, title, order }) {
  // subject+grade+title unique bo‘lgani uchun title’ni raqam bilan UNIQUE qilamiz
  const topic = await CurriculumTopic.findOneAndUpdate(
    { subject, grade, chapter: chapterId, order },
    { subject, grade, chapter: chapterId, title, order, isActive: true },
    { new: true, upsert: true }
  );
  return topic;
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  // Subject tekshiramiz
  const subject = await Subject.findById(MATH_SUBJECT_ID);
  if (!subject) throw new Error("Matematika subject topilmadi: " + MATH_SUBJECT_ID);

  // OLD count
  const beforeCh = await CurriculumChapter.countDocuments({ subject: subject._id, grade: GRADE });
  const beforeTp = await CurriculumTopic.countDocuments({ subject: subject._id, grade: GRADE });

  // =========================
  // ALGEBRA (7-sinf)
  // =========================
  const algebraChapters = [
    {
      title: "Algebra 7-sinf — 1-bob. Sonli va algebraik ifodalar, daraja, ko‘phad",
      topics: [
        "Sonli ifodalar",
        "Algebraik ifodalar",
        "Algebraik tengliklar, formulalar",
        "Qavslarni ochish qoidasi va koeffitsiyent",
        "Arifmetik amallarning xossalari",
        "Natural ko‘rsatkichli daraja",
        "Natural ko‘rsatkichli darajaning xossalari",
        "Birhad va uning standart shakli",
        "Birhadlarni ko‘paytirish va bo‘lish",
        "Ko‘phadlar",
        "O‘xshash hadlar va ularni ixchamlash",
        "Ko‘phadlarni qo‘shish va ayirish",
        "Ko‘phadlarni ko‘paytirish",
        "Ko‘phadlarni bo‘lish",
        "Ko‘phadni ko‘paytuvchilarga ajratish",
      ],
    },
    {
      title: "Algebra 7-sinf — 2-bob. Qisqa ko‘paytirish formulalari",
      topics: [
        "Yig‘indining kvadrati va ayirmaning kvadrati",
        "Kvadratlar ayirmasi",
        "Yig‘indining kubi. Ayirmaning kubi",
        "Kublar yig‘indisi va ayirmasi",
        "Ko‘paytuvchilarga ajratish usullari",
        "Qisqa ko‘paytirish formulalarining tatbiqi",
      ],
    },
    {
      title: "Algebra 7-sinf — 3-bob. Algebraik kasrlar",
      topics: [
        "Algebraik kasr. Kasrlarni qisqartirish",
        "Algebraik kasrlarni umumiy maxrajga keltirish",
        "Algebraik kasrlarni qo‘shish va ayirish",
        "Algebraik kasrlarni ko‘paytirish va bo‘lish",
        "Loyiha ishi",
      ],
    },
    {
      title: "Algebra 7-sinf — 4-bob. Chiziqli tenglama",
      topics: [
        "Tenglama va uning ildizi",
        "Bir noma’lumli chiziqli tenglamalar",
        "Tenglamalar yechishning al-Xorazmiy usuli",
        "Masalalarni tenglama yordamida yechish",
      ],
    },
    {
      title: "Algebra 7-sinf — 5-bob. Chiziqli funksiya",
      topics: [
        "Dekart koordinatalar sistemasi",
        "Funksiya tushunchasi",
        "Chiziqli funksiya",
        "Loyiha ishi",
      ],
    },
    {
      title: "Algebra 7-sinf — 6-bob. Chiziqli tenglamalar sistemasi",
      topics: [
        "Chiziqli tenglamalar sistemasi",
        "Chiziqli tenglamalar sistemasini yechish usullari",
        "Chiziqli tenglamalar sistemasi yordamida masalalar yechish",
      ],
    },
    {
      title: "Algebra 7-sinf — 7-bob. Ma’lumotlar bilan ishlash (kombinatorika)",
      topics: [
        "Kombinatorikaning asosiy qoidalari",
        "Kombinatorik masalalar turlari",
        "Kombinatorik masalalarni yechish usullari",
      ],
    },
  ];

  // =========================
  // GEOMETRIYA (7-sinf)
  // =========================
  const geometryChapter = {
    title: "Geometriya 7-sinf — Asosiy mavzular",
    topics: [
      "Eng sodda geometrik shakllar",
      "Kesma. Kesmalarni taqqoslash va o‘lchash",
      "Burchak. Burchaklarni taqqoslash va o‘lchash",
      "Amaliy mashq va tatbiq. Bilimingizni sinab ko‘ring (1)",
      "Burchakning turlari",
      "Perpendikulyar to‘g‘ri chiziqlar",
      "Amaliy mashq va tatbiq. Bilimingizni sinab ko‘ring (2)",

      "Uchburchaklar, ularning turlari va elementlari",
      "Uchburchaklar tengligining birinchi alomati",
      "Teng yonli uchburchakning xossalari",

      "Uchburchaklar tengligining ikkinchi alomati",
      "Uchburchaklar tengligining uchinchi alomati",
      "Amaliy mashq va tatbiq. Bilimingizni sinab ko‘ring (3)",

      "Parallel to‘g‘ri chiziqlar",
      "Ikki to‘g‘ri chiziqning parallellik alomatlari",
      "Ikki parallel to‘g‘ri chiziq va kesuvchi hosil qilgan burchaklar",
      "Amaliy mashq va tatbiq. Bilimingizni sinab ko‘ring (4)",

      "Uchburchakning ichki burchaklari yig‘indisi",
      "To‘g‘ri burchakli uchburchaklar",
      "Burchak bissektrisasining xossasi",
      "Uchburchakning tomonlari va burchaklari orasidagi munosabatlar",
      "Amaliy mashq va tatbiq. Bilimingizni sinab ko‘ring (5)",

      "Sirkul va chizg‘ich yordamida geometrik yasashga doir masalalar",
      "Amaliy mashq va tatbiq. Bilimingizni sinab ko‘ring (6)",
    ],
  };

  // ==== SEED RUN ====
  let chapterOrder = 1;

  // Algebra boblari
  for (const ch of algebraChapters) {
    const chapter = await upsertChapter({
      subject: subject._id,
      grade: GRADE,
      title: ch.title,
      order: chapterOrder,
    });

    let topicOrder = 1;
    for (const t of ch.topics) {
      // unique title qilish: A{chapterOrder}.{topicOrder} ...
      const uniqueTitle = `A${chapterOrder}.${topicOrder}. ${t}`;
      await upsertTopic({
        subject: subject._id,
        grade: GRADE,
        chapterId: chapter._id,
        title: uniqueTitle,
        order: topicOrder,
      });
      topicOrder++;
    }

    chapterOrder++;
  }

  // Geometriya bobi (bitta katta chapter)
  {
    const chapter = await upsertChapter({
      subject: subject._id,
      grade: GRADE,
      title: geometryChapter.title,
      order: chapterOrder,
    });

    let topicOrder = 1;
    for (const t of geometryChapter.topics) {
      const uniqueTitle = `G${1}.${topicOrder}. ${t}`;
      await upsertTopic({
        subject: subject._id,
        grade: GRADE,
        chapterId: chapter._id,
        title: uniqueTitle,
        order: topicOrder,
      });
      topicOrder++;
    }
  }

  const afterCh = await CurriculumChapter.countDocuments({ subject: subject._id, grade: GRADE });
  const afterTp = await CurriculumTopic.countDocuments({ subject: subject._id, grade: GRADE });

  console.log("✅ Matematika 7-sinf (Algebra+Geometriya) curriculum saqlandi");
  console.log({
    chapters: { before: beforeCh, after: afterCh, added: afterCh - beforeCh },
    topics: { before: beforeTp, after: afterTp, added: afterTp - beforeTp },
  });

  await mongoose.disconnect();
}

seed().catch(async (e) => {
  console.error("❌ Seed error:", e.message);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});