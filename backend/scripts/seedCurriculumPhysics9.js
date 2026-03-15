/**
 * Seed Curriculum: Physics Grade 9
 * Creates chapters + topics for Fizika (9-sinf)
 *
 * Required .env:
 *   MONGO_URI=...
 *   PHYSICS_SUBJECT_ID=...
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

async function upsertChapter({ subjectId, grade, title, order }) {
  return CurriculumChapter.findOneAndUpdate(
    { subject: subjectId, grade, order },
    { subject: subjectId, grade, title, order },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function upsertTopic({ subjectId, grade, chapterId, title, order }) {
  return CurriculumTopic.findOneAndUpdate(
    { subject: subjectId, grade, chapter: chapterId, order },
    { subject: subjectId, grade, chapter: chapterId, title, order },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function main() {
  const MONGO_URI = assertEnv("MONGO_URI");
  const PHYSICS_SUBJECT_ID = assertEnv("PHYSICS_SUBJECT_ID");

  await mongoose.connect(MONGO_URI);

  const grade = 9;

  const chapters = [
    {
      title: "Fizika 9-sinf — I bob. Mexanika (chuqurlashtirilgan)",
      order: 1,
      topics: [
        "P1.1. Mexanik harakat va sanoq sistemasi (takror)",
        "P1.2. Yo‘l, ko‘chish, tezlik, tezlanish (takror)",
        "P1.3. Harakat tenglamasi (oddiy)",
        "P1.4. Harakat grafiklari (s–t, v–t, a–t)",
        "P1.5. Bir tekis tezlanadigan harakat masalalari",
        "P1.6. Erkin tushish va vertikal harakat",
        "P1.7. Gorizontal otilgan jism harakati (kirish)",
        "P1.8. Aylana bo‘ylab harakat (kirish)",
        "P1.9. Markazga intilma tezlanish (kirish)",
        "P1.10. Kuchlar va Nyuton qonunlari (takror)",
        "P1.11. Og‘irlik kuchi va tayanch reaksiyasi",
        "P1.12. Ishqalanish kuchi va masalalar",
        "P1.13. Elastiklik kuchi va Hooke qonuni",
        "P1.14. Kuch momenti va muvozanat shartlari",
        "P1.15. Impuls va impulsning saqlanish qonuni",
        "P1.16. Reaktiv harakat (raketa harakati)",
        "P1.17. Mexanik ish va quvvat (takror)",
        "P1.18. Mexanik energiya turlari (Ek, Ep)",
        "P1.19. Mexanik energiyaning saqlanish qonuni",
        "P1.20. Foydali ish koeffitsienti (FIK) masalalari",
      ],
    },
    {
      title: "Fizika 9-sinf — II bob. Molekulyar fizika va gaz qonunlari",
      order: 2,
      topics: [
        "P2.1. Moddaning tuzilishi (atom-molekula) takror",
        "P2.2. Molekulalarning issiqlik harakati",
        "P2.3. Ichki energiya va uning o‘zgarishi",
        "P2.4. Issiqlik miqdori va issiqlik almashinuvi",
        "P2.5. Issiqlik sig‘imi va solishtirma issiqlik sig‘imi",
        "P2.6. Issiqlik balansi masalalari",
        "P2.7. Gaz bosimi va gaz molekulalari harakati",
        "P2.8. Gazlarning holat parametrlari (p, V, T)",
        "P2.9. Ideal gaz modeli (kirish)",
        "P2.10. Boyle–Mariotte qonuni (pV = const)",
        "P2.11. Sharl qonuni (V/T = const)",
        "P2.12. Gey-Lyussak qonuni (p/T = const)",
        "P2.13. Umumiy gaz qonuni (pV/T = const)",
        "P2.14. Mendeleyev–Klapeiron tenglamasi (kirish)",
        "P2.15. Bug‘lanish, qaynash, kondensatsiya (takror)",
        "P2.16. Namlik va havo namligi",
        "P2.17. Issiqlik dvigatellari (chuqurroq)",
        "P2.18. Termodinamikaning 1-qonuni (oddiy)",
        "P2.19. Issiqlik mashinalarida FIK",
        "P2.20. Sovutgich va issiqlik nasosi (kirish)",
      ],
    },
    {
      title: "Fizika 9-sinf — III bob. Elektr toki (chuqurlashtirilgan)",
      order: 3,
      topics: [
        "P3.1. Elektr zaryad va elektr maydon (takror)",
        "P3.2. Elektr kuchlanish va elektr potensial (kirish)",
        "P3.3. Tok kuchi, kuchlanish, qarshilik (takror)",
        "P3.4. Om qonuni va zanjir masalalari",
        "P3.5. O‘tkazgich qarshiligi: R = ρ·l/S (takror)",
        "P3.6. Ketma-ket ulanish masalalari",
        "P3.7. Parallel ulanish masalalari",
        "P3.8. Aralash ulanish (murakkab)",
        "P3.9. Elektr ish va quvvat (takror)",
        "P3.10. Joule–Lenz qonuni (takror)",
        "P3.11. Elektr toki manbalari (batareya, akkumulyator)",
        "P3.12. EMK (elektr yurituvchi kuch) tushunchasi",
        "P3.13. Ichki qarshilik (kirish)",
        "P3.14. To‘liq zanjir uchun Om qonuni (kirish)",
        "P3.15. Elektr o‘lchash asboblari (ampermetr, voltmetr)",
        "P3.16. Reostat va qarshilikni boshqarish",
        "P3.17. Elektr xavfsizligi va maishiy tarmoq",
        "P3.18. Elektr energiyasini hisoblash (hisoblagich)",
        "P3.19. Elektr toki kimyoviy ta’siri (elektroliz)",
        "P3.20. Elektr toki amaliy qo‘llanishi",
      ],
    },
    {
      title: "Fizika 9-sinf — IV bob. Magnit maydon va elektromagnit hodisalar",
      order: 4,
      topics: [
        "P4.1. Magnit maydon va magnit induksiya (takror)",
        "P4.2. Tokli o‘tkazgichning magnit maydoni",
        "P4.3. O‘ng qo‘l qoidasi (takror)",
        "P4.4. Amper kuchi (tokli o‘tkazgichga ta’sir)",
        "P4.5. Magnit oqimi (kirish)",
        "P4.6. Elektromagnit induksiya hodisasi (takror)",
        "P4.7. Induksiya toki yo‘nalishi (Lents qoidasi)",
        "P4.8. Generator va elektr energiya ishlab chiqarish",
        "P4.9. Transformator (chuqurroq)",
        "P4.10. O‘zgaruvchan tok (AC) haqida tushuncha",
        "P4.11. Elektr energiyasini uzoqqa uzatish",
        "P4.12. Elektromagnitlar va ularning qo‘llanilishi",
        "P4.13. Elektr dvigatel (takror)",
        "P4.14. Elektromagnit tebranishlar (kirish)",
      ],
    },
    {
      title: "Fizika 9-sinf — V bob. Optika (yorug‘lik) — kengroq",
      order: 5,
      topics: [
        "P5.1. Yorug‘likning tabiati (oddiy tushuncha)",
        "P5.2. Yorug‘likning to‘g‘ri tarqalishi (takror)",
        "P5.3. Qaytish qonunlari (takror)",
        "P5.4. Sinish hodisasi (takror)",
        "P5.5. Snell qonuniga kirish",
        "P5.6. To‘liq ichki qaytish (kengroq)",
        "P5.7. Linza va tasvir (takror)",
        "P5.8. Linza formulasi (kirish)",
        "P5.9. Optik kuch va fokus masofa",
        "P5.10. Ko‘z optikasi (takror)",
        "P5.11. Optik asboblar (mikroskop, teleskop)",
        "P5.12. Prizma va spektr (takror)",
        "P5.13. Yorug‘lik dispersiyasi",
        "P5.14. Yorug‘likning yutilishi va sochilishi",
        "P5.15. Ranglar va yorug‘lik (amaliy)",
        "P5.16. Lazer haqida kirish",
      ],
    },
    {
      title: "Fizika 9-sinf — VI bob. Atom va yadro fizikasi (kirish)",
      order: 6,
      topics: [
        "P6.1. Atom tuzilishi (elektron, proton, neytron)",
        "P6.2. Ionlar va ionlanish",
        "P6.3. Radioaktivlik tushunchasi",
        "P6.4. Alfa, beta, gamma nurlanish",
        "P6.5. Radioaktiv yemirilish (oddiy)",
        "P6.6. Yadro reaksiyalari (kirish)",
        "P6.7. Zanjir reaksiyasi (oddiy)",
        "P6.8. Yadro energetikasi (AES haqida)",
        "P6.9. Radiatsiya va xavfsizlik qoidalari",
        "P6.10. Fizikaning zamonaviy qo‘llanilishi (yakuniy)",
      ],
    },
  ];

  const beforeChapters = await CurriculumChapter.countDocuments({
    subject: PHYSICS_SUBJECT_ID,
    grade,
  });

  const beforeTopics = await CurriculumTopic.countDocuments({
    subject: PHYSICS_SUBJECT_ID,
    grade,
  });

  let addedChapters = 0;
  let addedTopics = 0;
  let upsertedTopics = 0;

  for (const ch of chapters) {
    const chapterDoc = await upsertChapter({
      subjectId: PHYSICS_SUBJECT_ID,
      grade,
      title: ch.title,
      order: ch.order,
    });

    if (chapterDoc) addedChapters++;

    for (let i = 0; i < ch.topics.length; i++) {
      const tTitle = ch.topics[i];
      const order = i + 1;

      const topicDoc = await upsertTopic({
        subjectId: PHYSICS_SUBJECT_ID,
        grade,
        chapterId: chapterDoc._id,
        title: tTitle,
        order,
      });

      if (topicDoc) {
        addedTopics++;
        upsertedTopics++;
      }
    }
  }

  const afterChapters = await CurriculumChapter.countDocuments({
    subject: PHYSICS_SUBJECT_ID,
    grade,
  });

  const afterTopics = await CurriculumTopic.countDocuments({
    subject: PHYSICS_SUBJECT_ID,
    grade,
  });

  console.log("✅ Fizika 9-sinf curriculum saqlandi");
  console.log({
    chapters: { before: beforeChapters, after: afterChapters, added: addedChapters },
    topics: { before: beforeTopics, after: afterTopics, added: addedTopics },
    topicsUpsert: { upserted: upsertedTopics },
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