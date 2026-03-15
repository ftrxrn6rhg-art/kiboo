/**
 * seedCurriculumPhysics7.js
 * 7-sinf Fizika curriculum (chapters + topics) seed script
 *
 * Run:
 *   node scripts/seedCurriculumPhysics7.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const CurriculumChapter = require("../models/CurriculumChapter");
const CurriculumTopic = require("../models/CurriculumTopic");

function assertEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} topilmadi (.env).`);
  return v;
}

function toInt(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return 0;
  return x;
}

async function upsertChapter({ subject, grade, title, order }) {
  // chapter unique: subject + grade + title
  const chapter = await CurriculumChapter.findOneAndUpdate(
    { subject, grade, title },
    { $setOnInsert: { subject, grade, title, order } },
    { upsert: true, new: true }
  );

  // agar order o'zgarsa ham update qilib ketamiz
  if (chapter.order !== order) {
    chapter.order = order;
    await chapter.save();
  }

  return chapter;
}

async function upsertTopic({ subject, grade, chapterId, title, order }) {
  // topic unique: subject + grade + chapter + order
  // (title o'zgarib qolsa ham order orqali topiladi)
  return CurriculumTopic.findOneAndUpdate(
    { subject, grade, chapter: chapterId, order },
    { $set: { subject, grade, chapter: chapterId, title, order } },
    { upsert: true, new: true }
  );
}

async function main() {
  const MONGO_URI = assertEnv("MONGO_URI");
  const PHYSICS_SUBJECT_ID = assertEnv("PHYSICS_SUBJECT_ID");

  const subjectId = new mongoose.Types.ObjectId(PHYSICS_SUBJECT_ID);
  const grade = 7;

  await mongoose.connect(MONGO_URI);

  // Avval count olib qo'yamiz
  const beforeChapters = await CurriculumChapter.countDocuments({
    subject: subjectId,
    grade,
  });
  const beforeTopics = await CurriculumTopic.countDocuments({
    subject: subjectId,
    grade,
  });

  const chapters = [
    {
      title: "Fizika 7-sinf — 1-bo‘lim. Fizika va o‘lchashlarni takrorlash",
      order: 1,
      topics: [
        "1. Fizika fani va uning bo‘limlari",
        "2. Fizik kattaliklar va SI birliklari (takror)",
        "3. O‘lchash asboblari va o‘lchash aniqligi",
        "4. Xatolik turlari (taxminiy tushuncha)",
        "5. Formulalar bilan ishlash (o‘lchov birliklarni tekshirish)",
      ],
    },
    {
      title: "Fizika 7-sinf — 2-bo‘lim. Mexanik harakat (kinematika)",
      order: 2,
      topics: [
        "6. Mexanik harakat va sanoq sistemasi",
        "7. Trayektoriya, yo‘l, ko‘chish",
        "8. Bir tekis harakat",
        "9. Notekis harakat",
        "10. Tezlik va o‘rtacha tezlik",
        "11. Tezlanish tushunchasi",
        "12. Tezlanish formulasi (oddiy): a = (v₂ – v₁)/t",
        "13. Bir tekis tezlanadigan harakat",
        "14. Erkin tushish harakati (g tushunchasi)",
        "15. Harakat grafiklari (s–t, v–t)",
        "16. Grafiklardan masala ishlash (oddiy)",
      ],
    },
    {
      title: "Fizika 7-sinf — 3-bo‘lim. Dinamika — kuchlar va Nyuton qonunlari",
      order: 3,
      topics: [
        "17. Kuch va uning xususiyatlari (yo‘nalish, qiymat)",
        "18. Kuchlarni qo‘shish (natijaviy kuch)",
        "19. Inersiya va Nyutonning I qonuni",
        "20. Nyutonning II qonuni: F = m·a",
        "21. Nyutonning III qonuni (ta’sir va aks ta’sir)",
        "22. Massa va og‘irlik (farqi)",
        "23. Og‘irlik kuchi: P = m·g",
        "24. Tayanch reaksiyasi kuchi (oddiy tushuncha)",
        "25. Ishqalanish kuchi (takror + chuqurroq)",
        "26. Ishqalanish turlari va koeffitsienti (kirish)",
        "27. Elastiklik kuchi va Hooke qonuni",
        "28. Kuch momenti (oddiy tushuncha)",
        "29. Muvozanat shartlari (oddiy)",
      ],
    },
    {
      title: "Fizika 7-sinf — 4-bo‘lim. Mexanik ish, energiya va quvvat",
      order: 4,
      topics: [
        "30. Mexanik ish: A = F·s·cosα (oddiy holatlar)",
        "31. Quvvat: N = A/t",
        "32. Kinetik energiya: Ek = mv²/2",
        "33. Potensial energiya: Ep = mgh",
        "34. Mexanik energiya saqlanishi",
        "35. Ishqalanishda energiya yo‘qolishi (issiqlikka aylanish)",
        "36. Foydali ish koeffitsienti (FIK) — η",
        "37. Oddiy mexanizmlar (richag, blok, qiya tekislik)",
        "38. Richag qoidasi (kuch yutish)",
        "39. Mexanik yutuq tushunchasi",
        "40. Amaliy masalalar (ish, quvvat, energiya)",
      ],
    },
    {
      title: "Fizika 7-sinf — 5-bo‘lim. Moddaning tuzilishi va molekulyar fizika",
      order: 5,
      topics: [
        "41. Moddaning tuzilishi (atom, molekula)",
        "42. Molekulalarning harakati",
        "43. Diffuziya (takror + misollar)",
        "44. Moddaning agregat holatlari (qattiq/suyuqlik/gaz)",
        "45. Gaz, suyuqlik, qattiq jismlarning xossalari",
        "46. Ichki energiya tushunchasi",
        "47. Issiqlik almashinuvi turlari (o‘tkazuvchanlik, konveksiya, nurlanish)",
        "48. Harorat va termometrlar",
        "49. Issiqlik miqdori tushunchasi",
        "50. Qizish va sovish jarayonlari",
        "51. Issiqlik sig‘imi (kirish)",
        "52. Solishtirma issiqlik sig‘imi (oddiy tushuncha)",
        "53. Issiqlik miqdori formulasi: Q = c·m·Δt",
        "54. Issiqlik muvozanati (oddiy masalalar)",
      ],
    },
    {
      title: "Fizika 7-sinf — 6-bo‘lim. Moddaning holat o‘zgarishi (fazalar)",
      order: 6,
      topics: [
        "55. Bug‘lanish va kondensatsiya",
        "56. Qaynash va qaynash harorati",
        "57. Namlik va bug‘lanish tezligi",
        "58. Erish va qotish",
        "59. Erish harorati",
        "60. Solishtirma erish issiqligi (kirish)",
        "61. Muzlash jarayoni",
        "62. Issiqlik dvigatellari haqida kirish (juda oddiy)",
      ],
    },
    {
      title: "Fizika 7-sinf — 7-bo‘lim. Bosim (chuqurroq)",
      order: 7,
      topics: [
        "63. Bosim: p = F/S (takror)",
        "64. Suyuqlik bosimi va chuqurlikka bog‘liqlik",
        "65. Pascal qonuni va gidravlik mashinalar",
        "66. Arximed kuchi va suzish shartlari",
        "67. Atmosfera bosimi (chuqurroq)",
        "68. Barometr va manometr (kirish)",
        "69. Gaz bosimi (oddiy tushuncha)",
        "70. Bosimga oid amaliy masalalar",
      ],
    },
    {
      title: "Fizika 7-sinf — 8-bo‘lim. Tebranish va to‘lqinlar (kirish)",
      order: 8,
      topics: [
        "71. Tebranish harakati tushunchasi",
        "72. Tebranish amplitudasi, davri, chastota",
        "73. Matematik mayatnik (oddiy)",
        "74. Prujinali mayatnik (oddiy)",
        "75. To‘lqin tushunchasi",
        "76. Mexanik to‘lqinlar (tovush)",
        "77. Tovush manbai va tarqalishi",
        "78. Tovush tezligi (oddiy tushuncha)",
        "79. Eshitiladigan va eshitilmaydigan tovushlar",
        "80. Aks sado (echo)",
      ],
    },
    {
      title: "Fizika 7-sinf — 9-bo‘lim. Elektr hodisalari",
      order: 9,
      topics: [
        "81. Elektr zaryad va elektrlanish",
        "82. O‘tkazgich va dielektrik",
        "83. Elektr maydon tushunchasi (kirish)",
        "84. Elektr toki tushunchasi",
        "85. Tok kuchi: I",
        "86. Kuchlanish: U",
        "87. Qarshilik: R",
        "88. Om qonuni: I = U/R",
        "89. Elektr zanjiri va uning elementlari",
        "90. Ampermetr va voltmetr (ulash qoidalari)",
        "91. Ketma-ket ulanish",
        "92. Parallel ulanish",
        "93. Aralash ulanish (oddiy)",
        "94. Elektr ish va quvvat",
        "95. Elektr quvvat: P = U·I",
        "96. Elektr energiya: A = U·I·t",
        "97. Elektr xavfsizligi qoidalari",
        "98. Uy elektr tarmog‘i haqida kirish",
        "99. Sug‘urta (predoxranitel) va avtomat (kirish)",
      ],
    },
    {
      title: "Fizika 7-sinf — 10-bo‘lim. Magnit hodisalari (elektromagnitga kirish)",
      order: 10,
      topics: [
        "100. Magnit va magnit maydon",
        "101. Magnit qutblari va ularning o‘zaro ta’siri",
        "102. Yerning magnit maydoni (oddiy)",
        "103. Tokli o‘tkazgich atrofida magnit maydon",
        "104. Elektromagnit tushunchasi",
        "105. Elektromagnitning qo‘llanilishi",
        "106. Elektr dvigatel haqida kirish (oddiy)",
        "107. Generator haqida kirish (oddiy)",
      ],
    },
  ];

  let topicsUpserted = 0;

  for (const ch of chapters) {
    const chapter = await upsertChapter({
      subject: subjectId,
      grade,
      title: ch.title,
      order: ch.order,
    });

    let topicOrder = 1;
    for (const t of ch.topics) {
      await upsertTopic({
        subject: subjectId,
        grade,
        chapterId: chapter._id,
        title: t,
        order: topicOrder,
      });
      topicsUpserted++;
      topicOrder++;
    }
  }

  const afterChapters = await CurriculumChapter.countDocuments({
    subject: subjectId,
    grade,
  });
  const afterTopics = await CurriculumTopic.countDocuments({
    subject: subjectId,
    grade,
  });

  console.log("✅ Fizika 7-sinf curriculum saqlandi");
  console.log({
    chapters: {
      before: beforeChapters,
      after: afterChapters,
      added: afterChapters - beforeChapters,
    },
    topics: {
      before: beforeTopics,
      after: afterTopics,
      added: afterTopics - beforeTopics,
    },
    topicsUpserted,
  });

  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error("❌ Seed error:", e);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});