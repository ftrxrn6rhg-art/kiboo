/**
 * Seed Curriculum: Physics Grade 10
 * Creates chapters + topics for Fizika (10-sinf)
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

  const grade = 10;

  const chapters = [
    {
      title: "Fizika 10-sinf — I bob. Mexanika (chuqurlashgan)",
      order: 1,
      topics: [
        "P1.1. Mexanik harakat va sanoq sistemasi (takror)",
        "P1.2. Tezlik va tezlanish (takror)",
        "P1.3. Harakat tenglamalari (kinematika)",
        "P1.4. Harakat grafiklari (s–t, v–t, a–t)",
        "P1.5. Aylana bo‘ylab harakat (tezlik va tezlanish)",
        "P1.6. Markazga intilma tezlanish",
        "P1.7. Dinamika: Nyuton qonunlari (takror)",
        "P1.8. Kuchlarning turlari va natijaviy kuch",
        "P1.9. Ishqalanish kuchi (chuqurroq)",
        "P1.10. Elastiklik kuchi va Hooke qonuni (takror)",
        "P1.11. Og‘irlik kuchi va tayanch reaksiyasi",
        "P1.12. Impuls va impuls saqlanish qonuni (takror)",
        "P1.13. Mexanik ish (A = F·s·cosα)",
        "P1.14. Quvvat (N = A/t)",
        "P1.15. Kinetik energiya (Ek = mv²/2)",
        "P1.16. Potensial energiya (Ep = mgh)",
        "P1.17. Mexanik energiya saqlanish qonuni",
        "P1.18. Mexanik tebranishlar (kirish)",
        "P1.19. Mexanik to‘lqinlar (kirish)",
        "P1.20. Tovush to‘lqinlari va xossalari",
      ],
    },
    {
      title: "Fizika 10-sinf — II bob. Molekulyar fizika va termodinamika",
      order: 2,
      topics: [
        "P2.1. Moddaning molekulyar tuzilishi (takror)",
        "P2.2. Ideal gaz modeli",
        "P2.3. Gazlarning holat parametrlari (p, V, T)",
        "P2.4. Boyle–Mariotte qonuni",
        "P2.5. Sharl qonuni",
        "P2.6. Gey-Lyussak qonuni",
        "P2.7. Umumiy gaz qonuni",
        "P2.8. Mendeleyev–Klapeiron tenglamasi",
        "P2.9. Gaz ish bajarishi (A = p·ΔV)",
        "P2.10. Ichki energiya va uning o‘zgarishi",
        "P2.11. Termodinamikaning 1-qonuni",
        "P2.12. Issiqlik miqdori (Q = c·m·Δt)",
        "P2.13. Issiqlik sig‘imi va solishtirma issiqlik sig‘imi",
        "P2.14. Bug‘lanish, qaynash, kondensatsiya",
        "P2.15. Erish va qotish",
        "P2.16. Issiqlik dvigatellari",
        "P2.17. Issiqlik mashinalarining FIKi",
        "P2.18. Sovutgichlar va issiqlik nasosi (kirish)",
        "P2.19. Termodinamikaning 2-qonuniga kirish",
        "P2.20. Entropiya haqida oddiy tushuncha",
      ],
    },
    {
      title: "Fizika 10-sinf — III bob. Elektrostatika",
      order: 3,
      topics: [
        "P3.1. Elektr zaryad va uning xossalari",
        "P3.2. Kulon qonuni",
        "P3.3. Elektr maydon va kuchlanganlik (E)",
        "P3.4. Elektr maydon chiziqlari",
        "P3.5. Elektr potensial va potensial farq",
        "P3.6. Elektr sig‘im (kondensator)",
        "P3.7. Kondensatorlar va ularning ulanishi",
        "P3.8. Elektr energiyasi (kondensator energiyasi)",
        "P3.9. Dielektriklar va ularning roli",
        "P3.10. Elektrostatik hodisalarning qo‘llanilishi",
      ],
    },
    {
      title: "Fizika 10-sinf — IV bob. Elektr toki (kengaytirilgan)",
      order: 4,
      topics: [
        "P4.1. Elektr toki va tok shartlari",
        "P4.2. Tok kuchi, kuchlanish, qarshilik (takror)",
        "P4.3. Om qonuni (takror)",
        "P4.4. To‘liq zanjir uchun Om qonuni",
        "P4.5. EMK (ε) va ichki qarshilik",
        "P4.6. Elektr ish va quvvat",
        "P4.7. Joule–Lenz qonuni",
        "P4.8. O‘tkazgich qarshiligi (R = ρ·l/S)",
        "P4.9. Elektr o‘lchash asboblari",
        "P4.10. Elektr energiyasi va hisoblagichlar",
      ],
    },
    {
      title: "Fizika 10-sinf — V bob. Magnit maydon va elektromagnit induksiya",
      order: 5,
      topics: [
        "P5.1. Magnit maydon va magnit induksiya (B)",
        "P5.2. Tokli o‘tkazgichning magnit maydoni",
        "P5.3. Amper kuchi",
        "P5.4. Lorens kuchi (kirish)",
        "P5.5. Magnit oqimi",
        "P5.6. Elektromagnit induksiya hodisasi",
        "P5.7. Faradey qonuni (kirish)",
        "P5.8. Lents qoidasi",
        "P5.9. Induksiya EYuK (ε_ind)",
        "P5.10. O‘zinduksiya (kirish)",
        "P5.11. Generatorning ishlash prinsipi",
        "P5.12. Transformator va energiya uzatish",
        "P5.13. O‘zgaruvchan tok (AC)",
        "P5.14. Rezonans haqida kirish",
        "P5.15. Elektromagnitlarning qo‘llanilishi",
      ],
    },
    {
      title: "Fizika 10-sinf — VI bob. Optika (yorug‘lik) — chuqurlashgan",
      order: 6,
      topics: [
        "P6.1. Yorug‘likning tabiati (to‘lqin/nur)",
        "P6.2. Yorug‘likning to‘g‘ri tarqalishi",
        "P6.3. Qaytish qonunlari",
        "P6.4. Sinish qonunlari",
        "P6.5. Snell qonuni",
        "P6.6. To‘liq ichki qaytish",
        "P6.7. Linza va tasvir hosil bo‘lishi",
        "P6.8. Linza formulasi (1/f = 1/d + 1/d’)",
        "P6.9. Optik kuch (D)",
        "P6.10. Ko‘z optikasi va nuqsonlar",
        "P6.11. Optik asboblar (mikroskop, teleskop)",
        "P6.12. Yorug‘lik dispersiyasi",
        "P6.13. Spektr va ranglar",
        "P6.14. Interferensiya (kirish)",
        "P6.15. Difraksiya (kirish)",
      ],
    },
    {
      title: "Fizika 10-sinf — VII bob. Atom va yadro fizikasi (kengroq)",
      order: 7,
      topics: [
        "P7.1. Atom tuzilishi va modellari",
        "P7.2. Kvant tushunchasi (kirish)",
        "P7.3. Fotoeffekt (kirish)",
        "P7.4. Spektrlar va atom nurlanishi",
        "P7.5. Yadro tuzilishi",
        "P7.6. Radioaktivlik va yemirilish qonuni (oddiy)",
        "P7.7. Yadro reaksiyalari",
        "P7.8. Zanjir reaksiyasi",
        "P7.9. Yadro energetikasi va xavfsizlik",
        "P7.10. Fizikaning zamonaviy texnologiyalarda qo‘llanilishi",
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

  let topicsUpserted = 0;

  for (const ch of chapters) {
    const chapterDoc = await upsertChapter({
      subjectId: PHYSICS_SUBJECT_ID,
      grade,
      title: ch.title,
      order: ch.order,
    });

    for (let i = 0; i < ch.topics.length; i++) {
      await upsertTopic({
        subjectId: PHYSICS_SUBJECT_ID,
        grade,
        chapterId: chapterDoc._id,
        title: ch.topics[i],
        order: i + 1,
      });
      topicsUpserted++;
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

  console.log("✅ Fizika 10-sinf curriculum saqlandi");
  console.log({
    chapters: { before: beforeChapters, after: afterChapters, added: afterChapters - beforeChapters },
    topics: { before: beforeTopics, after: afterTopics, added: afterTopics - beforeTopics },
    topicsUpsert: { upserted: topicsUpserted },
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