/**
 * Seed Curriculum: Physics Grade 11
 * Creates chapters + topics for Fizika (11-sinf)
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

  const grade = 11;

  const chapters = [
    {
      title: "Fizika 11-sinf — I bob. Mexanik tebranishlar va to‘lqinlar",
      order: 1,
      topics: [
        "P1.1. Tebranish harakati va tebranish turlari",
        "P1.2. Amplituda, davr, chastota",
        "P1.3. Garmonik tebranishlar",
        "P1.4. Prujinali tebranishlar",
        "P1.5. Matematik mayatnik",
        "P1.6. Tebranish tenglamasi (kirish)",
        "P1.7. Tebranish energiyasi",
        "P1.8. So‘nuvchi tebranishlar",
        "P1.9. Majburiy tebranishlar",
        "P1.10. Rezonans hodisasi",
        "P1.11. To‘lqin tushunchasi",
        "P1.12. Mexanik to‘lqinlar turlari",
        "P1.13. To‘lqin uzunligi va tarqalish tezligi",
        "P1.14. Tovush to‘lqinlari va xossalari",
        "P1.15. Tovush balandligi, tembri va kuchi",
        "P1.16. Doppler effekti (kirish)",
        "P1.17. Infratovush va ultratovush",
        "P1.18. Tovushning aks etishi (echo)",
        "P1.19. Tovushning sinishi va sochilishi (oddiy)",
        "P1.20. Akustikaning amaliy qo‘llanilishi",
      ],
    },
    {
      title: "Fizika 11-sinf — II bob. Elektromagnit tebranishlar va to‘lqinlar",
      order: 2,
      topics: [
        "P2.1. Elektromagnit tebranish tushunchasi",
        "P2.2. LC kontur va uning ishlashi",
        "P2.3. Elektromagnit tebranish davri (Tomson formulasi — kirish)",
        "P2.4. So‘nuvchi elektromagnit tebranishlar",
        "P2.5. Majburiy elektromagnit tebranishlar",
        "P2.6. Elektr rezonansi",
        "P2.7. Elektromagnit to‘lqinlar tushunchasi",
        "P2.8. Elektromagnit to‘lqinlarning tarqalishi",
        "P2.9. Elektromagnit spektr (radio → gamma)",
        "P2.10. Radioto‘lqinlar va aloqa",
        "P2.11. Televizor va radio ishlash prinsipi (oddiy)",
        "P2.12. Antenna va signal uzatish",
        "P2.13. Mikroto‘lqinlar va amaliyot",
        "P2.14. Infraqizil nurlanish",
        "P2.15. Ultrabinafsha nurlanish",
        "P2.16. Rentgen nurlanishi",
        "P2.17. Gamma nurlanishi",
        "P2.18. Elektromagnit to‘lqinlarning modda bilan ta’siri",
        "P2.19. Polarizatsiya (kirish)",
        "P2.20. Elektromagnit to‘lqinlarning xavfsizligi",
      ],
    },
    {
      title: "Fizika 11-sinf — III bob. Optika (to‘lqin optikasi)",
      order: 3,
      topics: [
        "P3.1. Yorug‘likning to‘lqin tabiati",
        "P3.2. Interferensiya hodisasi",
        "P3.3. Interferensiya tajribalari (kirish)",
        "P3.4. Difraksiya hodisasi",
        "P3.5. Difraksiya panjarasi (kirish)",
        "P3.6. Dispersiya (takror + chuqurroq)",
        "P3.7. Polarizatsiya (optikada)",
        "P3.8. Yorug‘likning sochilishi",
        "P3.9. Spektr va spektral tahlil",
        "P3.10. Lazer va uning xossalari",
        "P3.11. Lazerning qo‘llanilishi",
        "P3.12. Optik tolalar (fiber optics)",
        "P3.13. Fotometriya asoslari (yorug‘lik kuchi, yoritilganlik)",
        "P3.14. Ko‘z va ranglarni ko‘rish",
        "P3.15. Optik asboblar (kengroq)",
        "P3.16. Mikroskop va teleskop (chuqurroq)",
        "P3.17. Fotoapparat va kamera ishlashi",
        "P3.18. Optik illyuziyalar (oddiy)",
      ],
    },
    {
      title: "Fizika 11-sinf — IV bob. Kvant fizika asoslari",
      order: 4,
      topics: [
        "P4.1. Kvant tushunchasi",
        "P4.2. Plank doimiysi haqida tushuncha",
        "P4.3. Fotoeffekt hodisasi",
        "P4.4. Eynshteyn tenglamasi (kirish)",
        "P4.5. Fotoelement va qo‘llanilishi",
        "P4.6. Yorug‘likning zarracha tabiati (foton)",
        "P4.7. Foton impulsi va energiyasi (kirish)",
        "P4.8. Kompton effekti (kirish)",
        "P4.9. De Broyl to‘lqinlari (kirish)",
        "P4.10. Hezenberg noaniqlik prinsipi (kirish)",
        "P4.11. Atom spektrlari",
        "P4.12. Bor atom modeli",
        "P4.13. Atom energetik sathlari",
        "P4.14. Lazerning kvant asoslari (kirish)",
        "P4.15. Yarimo‘tkazgichlar haqida kirish",
        "P4.16. Diod va tranzistor haqida tushuncha",
        "P4.17. Integral sxemalar (mikrochiplar) kirish",
      ],
    },
    {
      title: "Fizika 11-sinf — V bob. Yadro fizikasi",
      order: 5,
      topics: [
        "P5.1. Atom yadrosi tuzilishi",
        "P5.2. Proton, neytron, izotoplar",
        "P5.3. Yadro kuchlari",
        "P5.4. Massa defekti",
        "P5.5. Bog‘lanish energiyasi (E = mc²)",
        "P5.6. Radioaktivlik va yemirilish turlari",
        "P5.7. Alfa, beta, gamma nurlanish (takror + chuqurroq)",
        "P5.8. Radioaktiv yemirilish qonuni (oddiy)",
        "P5.9. Yarim yemirilish davri",
        "P5.10. Yadro reaksiyalari",
        "P5.11. Zanjir reaksiyasi",
        "P5.12. Yadro bo‘linishi (fission)",
        "P5.13. Yadro sintezi (fusion)",
        "P5.14. Termoyadro reaksiyasi (Quyosh energiyasi)",
        "P5.15. Yadro reaktori ishlash prinsipi",
        "P5.16. Atom elektr stansiyasi (AES)",
        "P5.17. Radiatsiya dozalari va o‘lchash (kirish)",
        "P5.18. Radiatsiyadan himoyalanish",
        "P5.19. Yadro tibbiyoti (rentgen, tomografiya)",
        "P5.20. Yadro energetikasining ekologik ta’siri",
      ],
    },
    {
      title: "Fizika 11-sinf — VI bob. Astrofizika va koinot (yakuniy bo‘lim)",
      order: 6,
      topics: [
        "P6.1. Koinot haqida umumiy tushuncha",
        "P6.2. Quyosh sistemasi",
        "P6.3. Yulduzlar va ularning evolyutsiyasi",
        "P6.4. Galaktikalar va koinot tuzilishi",
        "P6.5. Zamonaviy fizika va texnologiyalar (yakuniy umumlashtirish)",
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

  console.log("✅ Fizika 11-sinf curriculum saqlandi");
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