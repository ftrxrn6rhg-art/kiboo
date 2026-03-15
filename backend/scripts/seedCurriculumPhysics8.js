/**
 * seedCurriculumPhysics8.js
 * 8-sinf Fizika curriculum (chapters + topics) seed script
 *
 * Run:
 *   node scripts/seedCurriculumPhysics8.js
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

async function upsertChapter({ subject, grade, title, order }) {
  const chapter = await CurriculumChapter.findOneAndUpdate(
    { subject, grade, title },
    { $setOnInsert: { subject, grade, title, order } },
    { upsert: true, new: true }
  );

  if (chapter.order !== order) {
    chapter.order = order;
    await chapter.save();
  }

  return chapter;
}

async function upsertTopic({ subject, grade, chapterId, title, order }) {
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
  const grade = 8;

  await mongoose.connect(MONGO_URI);

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
      title: "Fizika 8-sinf — 1-bo‘lim. Mexanikani takrorlash va kengaytirish",
      order: 1,
      topics: [
        "1. Fizik kattaliklar va SI birliklari (takror)",
        "2. Skalyar va vektor kattaliklar (kirish)",
        "3. Kuchlar va ularning qo‘shilishi (takror)",
        "4. Natijaviy kuch va muvozanat",
        "5. Nyuton qonunlari (takror)",
        "6. Massa, og‘irlik va erkin tushish tezlanishi (g)",
        "7. Ishqalanish kuchi (kengaytirilgan)",
        "8. Elastiklik kuchi va Hooke qonuni (takror)",
        "9. Mexanik ish va quvvat (takror)",
        "10. Mexanik energiya turlari (takror)",
        "11. Mexanik energiyaning saqlanishi (kengroq)",
        "12. Impuls tushunchasi (p = m·v)",
        "13. Impulsning saqlanish qonuni (kirish)",
        "14. Zarba va to‘qnashuvlar (oddiy)",
      ],
    },
    {
      title: "Fizika 8-sinf — 2-bo‘lim. Suyuqlik va gazlar mexanikasi",
      order: 2,
      topics: [
        "15. Bosim tushunchasi (takror)",
        "16. Suyuqlik bosimi va chuqurlik (takror)",
        "17. Pascal qonuni (takror)",
        "18. Arximed kuchi (takror)",
        "19. Suzish shartlari (cho‘kish/suzish)",
        "20. Gidravlik mashinalar (press, domkrat)",
        "21. Atmosfera bosimi (takror)",
        "22. Barometr va manometr (kengroq)",
        "23. Gaz bosimi va uning sabablari",
        "24. Gazlarda bosimning uzatilishi",
        "25. Suyuqlik va gazlarda oqim (oddiy tushuncha)",
      ],
    },
    {
      title:
        "Fizika 8-sinf — 3-bo‘lim. Issiqlik hodisalari va termodinamika asoslari",
      order: 3,
      topics: [
        "26. Ichki energiya tushunchasi",
        "27. Issiqlik miqdori va issiqlik almashinuvi",
        "28. Issiqlik o‘tkazuvchanlik, konveksiya, nurlanish (takror)",
        "29. Solishtirma issiqlik sig‘imi (c)",
        "30. Issiqlik miqdori formulasi: Q = c·m·Δt",
        "31. Issiqlik balansi (aralashma masalalari)",
        "32. Erish va qotish jarayoni",
        "33. Solishtirma erish issiqligi: λ (kirish)",
        "34. Bug‘lanish va kondensatsiya",
        "35. Qaynash va qaynash harorati",
        "36. Solishtirma bug‘lanish issiqligi: r (kirish)",
        "37. Namlik (havo namligi) haqida tushuncha",
        "38. Gazlarning kengayishi va siqilishi",
        "39. Ideal gaz haqida kirish (oddiy)",
        "40. Issiqlik dvigateli tushunchasi",
        "41. Foydali ish koeffitsienti (FIK) issiqlik dvigatelida",
        "42. Termodinamikaning 1-qonuniga kirish (oddiy)",
        "43. Sovutgich va issiqlik nasosi haqida kirish",
      ],
    },
    {
      title:
        "Fizika 8-sinf — 4-bo‘lim. Elektr toki va elektr zanjirlari (asosiy bo‘lim)",
      order: 4,
      topics: [
        "44. Elektr toki va tok shartlari",
        "45. Tok kuchi (I) va uni o‘lchash",
        "46. Kuchlanish (U) va uni o‘lchash",
        "47. Elektr qarshilik (R) va uning sabablari",
        "48. Om qonuni: I = U/R (takror + masalalar)",
        "49. O‘tkazgichning qarshiligi: R = ρ·l/S",
        "50. Ketma-ket ulanish (kengaytirilgan masalalar)",
        "51. Parallel ulanish (kengaytirilgan masalalar)",
        "52. Aralash ulanish (murakkab masalalar)",
        "53. Elektr ish (A = U·I·t)",
        "54. Elektr quvvat (P = U·I)",
        "55. Joule–Lenz qonuni: Q = I²·R·t",
        "56. Elektr toki issiqlik ta’siri",
        "57. Elektr toki kimyoviy ta’siri (elektroliz)",
        "58. Elektr toki magnit ta’siri (kirish)",
        "59. Elektr xavfsizligi (kengroq)",
        "60. Sug‘urta va avtomat (kirish)",
        "61. Elektr energiyani tejash (amaliy)",
      ],
    },
    {
      title: "Fizika 8-sinf — 5-bo‘lim. Magnit maydon va elektromagnit hodisalar",
      order: 5,
      topics: [
        "62. Magnit maydon tushunchasi",
        "63. Magnit induksiya (B) haqida kirish",
        "64. Tokli o‘tkazgich atrofida magnit maydon",
        "65. O‘ng qo‘l qoidasi (magnit maydon yo‘nalishi)",
        "66. Tokli ramka va g‘altak magnit maydoni",
        "67. Elektromagnit va uning ishlashi",
        "68. Elektromagnitning qo‘llanilishi",
        "69. Amper kuchi (tokli o‘tkazgichga ta’sir)",
        "70. Elektr dvigatelning ishlash prinsipi",
        "71. Elektromagnit induksiya hodisasi",
        "72. Faradey tajribalari (kirish)",
        "73. Induksiya toki yo‘nalishi (Lents qoidasi)",
        "74. Generator (elektr tok ishlab chiqarish)",
        "75. Transformator haqida kirish",
        "76. O‘zgaruvchan tok haqida tushuncha",
        "77. Elektr energiyasini uzatish (oddiy tushuncha)",
      ],
    },
    {
      title: "Fizika 8-sinf — 6-bo‘lim. Yorug‘lik hodisalari (Optika asoslari)",
      order: 6,
      topics: [
        "78. Yorug‘lik manbalari",
        "79. Yorug‘likning to‘g‘ri tarqalishi",
        "80. Soya va yarim soya",
        "81. Yorug‘likning qaytishi (aks etishi)",
        "82. Qaytish qonunlari",
        "83. Tekis ko‘zguda tasvir hosil bo‘lishi",
        "84. Yorug‘likning sinishi",
        "85. Sinish qonuniga kirish",
        "86. To‘liq ichki qaytish (kirish)",
        "87. Linza tushunchasi (yig‘uvchi va sochuvchi)",
        "88. Linzaning fokus masofasi",
        "89. Optik kuch (D)",
        "90. Linzada tasvir hosil qilish",
        "91. Ko‘z va ko‘rish jarayoni (oddiy)",
        "92. Ko‘z nuqsonlari: miopiya va gipermetropiya (kirish)",
        "93. Ko‘zoynak va linzalar (amaliy)",
        "94. Prizma va spektr (kirish)",
        "95. Yorug‘likning ranglarga ajralishi",
        "96. Optik asboblar (lupa, mikroskop, teleskop)",
      ],
    },
    {
      title: "Fizika 8-sinf — 7-bo‘lim. Yakuniy umumlashtirish va amaliy masalalar",
      order: 7,
      topics: [
        "97. Fizik kattaliklar va formulalarni takrorlash",
        "98. Issiqlik, elektr va mexanika bo‘yicha aralash masalalar",
        "99. Laboratoriya ishlariga tayyorlanish (oddiy)",
        "100. Hayotdagi fizika: texnika va xavfsizlik qoidalari",
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

  console.log("✅ Fizika 8-sinf curriculum saqlandi");
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