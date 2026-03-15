/**
 * Seed: Matematika 10-sinf (Algebra + Geometriya)
 * Subject: Matematika
 * subjectId: 694b03a0ec0d154c7b000716
 *
 * Ishlatish:
 *   node scripts/seedCurriculumMath10.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

// Sizning loyihangizdagi model path'lari shunga mos bo'lishi kerak.
// (Oldingi seed fayllaringizda qaysi path bo'lsa, shu qoladi.)
const CurriculumChapter = require("../models/CurriculumChapter");
const CurriculumTopic = require("../models/CurriculumTopic");

const SUBJECT_ID = "694b03a0ec0d154c7b000716";
const GRADE = 10;

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function upsertChapter({ subject, grade, order, title }) {
  return CurriculumChapter.findOneAndUpdate(
    { subject, grade, order },
    { $set: { title, subject, grade, order } },
    { upsert: true, new: true }
  );
}

async function upsertTopics({ subject, grade, chapterId, topics }) {
  // topics: [{ order, title }]
  const ops = topics.map((t) => ({
    updateOne: {
      filter: { subject, grade, title: t.title }, // unique index: subject+grade+title
      update: {
        $set: {
          subject,
          grade,
          chapter: chapterId,
          order: t.order,
          title: t.title,
        },
      },
      upsert: true,
    },
  }));

  if (!ops.length) return { matched: 0, modified: 0, upserted: 0 };
  const res = await CurriculumTopic.bulkWrite(ops, { ordered: false });

  return {
    matched: res.matchedCount || 0,
    modified: res.modifiedCount || 0,
    upserted: (res.upsertedCount || 0),
  };
}

async function main() {
  const MONGO_URI = mustEnv("MONGO_URI");
  await mongoose.connect(MONGO_URI);

  const subject = new mongoose.Types.ObjectId(SUBJECT_ID);

  const chaptersPlan = [
    // ===== ALGEBRA =====
    {
      order: 1,
      title: "Algebra 10-sinf — I bob. Funksiya va uning xossalari",
      topics: [
        { order: 1, title: "A1.1. Funksiya. Funksiyaning berilish usullari" },
        { order: 2, title: "A1.2. Funksiyaning aniqlanish sohasi va qiymatlar to‘plami" },
        { order: 3, title: "A1.3. Funksiyalar ustida arifmetik amallar" },
        { order: 4, title: "A1.4. Murakkab, teskari, davriy funksiyalar" },
        { order: 5, title: "A1.5. Funksiya xossalari" },
        { order: 6, title: "A1.6. Funksiya grafigi ustida sodda almashtirishlar" },
        { order: 7, title: "A1.7. Chiziqli va kvadratik modellashtirishlar" },
      ],
    },
    {
      order: 2,
      title: "Algebra 10-sinf — II bob. Ratsional va irratsional tenglama/tengsizliklar",
      topics: [
        { order: 1, title: "A2.1. Ratsional tenglamalar" },
        { order: 2, title: "A2.2. Ratsional tenglamalar sistemasi" },
        { order: 3, title: "A2.3. Ratsional tengsizliklar" },
        { order: 4, title: "A2.4. Ratsional tengsizliklar sistemasi" },
        { order: 5, title: "A2.5. Irratsional tenglamalar" },
        { order: 6, title: "A2.6. Irratsional tenglamalar sistemasi" },
      ],
    },
    {
      order: 3,
      title: "Algebra 10-sinf — III bob. Ko‘rsatkichli va logarifmik funksiya",
      topics: [
        { order: 1, title: "A3.1. Ko‘rsatkichli funksiya" },
        { order: 2, title: "A3.2. Ko‘rsatkichli tenglamalar" },
        { order: 3, title: "A3.3. Ko‘rsatkichli tengsizliklar" },
        { order: 4, title: "A3.4. Logarifm tushunchasi. Logarifmik funksiya" },
        { order: 5, title: "A3.5. Logarifmik ifodalarni ayniy almashtirish" },
        { order: 6, title: "A3.6. Logarifmik tenglamalar" },
        { order: 7, title: "A3.7. Ko‘rsatkichli va logarifmik tenglamalar sistemasi" },
        { order: 8, title: "A3.8. Logarifmik tengsizliklar" },
        { order: 9, title: "A3.9. Ko‘rsatkichli va logarifmik funksiyalarning tatbiqi" },
      ],
    },
    {
      order: 4,
      title: "Algebra 10-sinf — IV bob. Trigonometriya va ehtimollik",
      topics: [
        { order: 1, title: "A4.1. Trigonometrik funksiyalar. Davriy jarayonlar. Teskari trigonometrik funksiyalar" },
        { order: 2, title: "A4.2. Trigonometrik tenglamalar" },
        { order: 3, title: "A4.3. Ba’zi trigonometrik tenglamalarni yechish usullari" },
        { order: 4, title: "A4.4. Trigonometrik tengsizliklar" },
        { order: 5, title: "A4.5. Tasodifiy hodisalar" },
        { order: 6, title: "A4.6. Ehtimollik ta’riflari" },
      ],
    },

    // ===== GEOMETRIYA =====
    {
      order: 5,
      title: "Geometriya 10-sinf — I bob. Stereometriya asoslari va ko‘pyoqlar",
      topics: [
        { order: 1, title: "G1.1. Stereometriyaning asosiy tushunchalari" },
        { order: 2, title: "G1.2. Fazoda to‘g‘ri chiziqlar va tekisliklar" },
        { order: 3, title: "G1.3. Fazoviy geometrik shakllar. Ko‘pyoqlar" },
        { order: 4, title: "G1.4. Ko‘pyoqlarni tasvirlash va modelini yasash" },
        { order: 5, title: "G1.5. Ko‘pyoqlarning sodda kesimlarini yasash" },
      ],
    },
    {
      order: 6,
      title: "Geometriya 10-sinf — II bob. Fazoda to‘g‘ri chiziq va tekisliklarning o‘zaro joylashuvi",
      topics: [
        { order: 1, title: "G2.1. Fazoda to‘g‘ri chiziqlarning o‘zaro joylashuvi" },
        { order: 2, title: "G2.2. Ayqash to‘g‘ri chiziqlar" },
        { order: 3, title: "G2.3. Fazoda to‘g‘ri chiziq va tekisliklarning o‘zaro joylashuvi" },
        { order: 4, title: "G2.4. Fazoda tekisliklarning o‘zaro joylashuvi" },
      ],
    },
    {
      order: 7,
      title: "Geometriya 10-sinf — III bob. Proyeksiyalar",
      topics: [
        { order: 1, title: "G3.1. Fazoda parallel proyeksiyalash" },
      ],
    },
    {
      order: 8,
      title: "Geometriya 10-sinf — IV bob. Perpendikulyarlik, masofa va ortogonal proyeksiya",
      topics: [
        { order: 1, title: "G4.1. Fazoda perpendikulyar to‘g‘ri chiziq va tekisliklar" },
        { order: 2, title: "G4.2. Fazoda perpendikulyar, og‘ma va masofa" },
        { order: 3, title: "G4.3. Uch perpendikulyar haqidagi teorema" },
        { order: 4, title: "G4.4. Fazoda tekisliklarning perpendikulyarligi" },
        { order: 5, title: "G4.5. Fazoda ortogonal proyeksiya va undan texnikada foydalanish" },
      ],
    },
  ];

  const beforeCh = await CurriculumChapter.countDocuments({ subject, grade: GRADE });
  const beforeTp = await CurriculumTopic.countDocuments({ subject, grade: GRADE });

  // 1) Chapters upsert
  const createdChapters = [];
  for (const ch of chaptersPlan) {
    const doc = await upsertChapter({
      subject,
      grade: GRADE,
      order: ch.order,
      title: ch.title,
    });
    createdChapters.push({ plan: ch, doc });
  }

  // 2) Topics upsert
  let matched = 0, modified = 0, upserted = 0;
  for (const item of createdChapters) {
    const r = await upsertTopics({
      subject,
      grade: GRADE,
      chapterId: item.doc._id,
      topics: item.plan.topics,
    });
    matched += r.matched;
    modified += r.modified;
    upserted += r.upserted;
  }

  const afterCh = await CurriculumChapter.countDocuments({ subject, grade: GRADE });
  const afterTp = await CurriculumTopic.countDocuments({ subject, grade: GRADE });

  console.log("✅ Matematika 10-sinf (Algebra+Geometriya) curriculum saqlandi");
  console.log({
    chapters: { before: beforeCh, after: afterCh, added: afterCh - beforeCh },
    topics: { before: beforeTp, after: afterTp, added: afterTp - beforeTp },
    topicsUpsert: { matched, modified, upserted },
  });

  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error("❌ Seed error:", e?.message || e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});