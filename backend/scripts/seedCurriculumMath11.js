/**
 * seedCurriculumMath11.js
 * Matematika 11-sinf (Algebra + Geometriya) curriculum seed
 *
 * Run:
 * node scripts/seedCurriculumMath11.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const CurriculumChapter = require("../models/CurriculumChapter");
const CurriculumTopic = require("../models/CurriculumTopic");

// Matematika subjectId (sizda mavjud)
const SUBJECT_ID = "694b03a0ec0d154c7b000716";
const GRADE = 11;

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error("❌ MONGO_URI topilmadi (.env ni tekshiring)");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");

  // Avval shu grade bo‘yicha eski chapter/topiclarni o‘chiramiz (toza seed)
  const oldChapters = await CurriculumChapter.find({
    subject: SUBJECT_ID,
    grade: GRADE,
  }).select("_id");

  const oldChapterIds = oldChapters.map((c) => c._id);

  const chaptersBefore = await CurriculumChapter.countDocuments({
    subject: SUBJECT_ID,
    grade: GRADE,
  });
  const topicsBefore = await CurriculumTopic.countDocuments({
    subject: SUBJECT_ID,
    grade: GRADE,
  });

  if (oldChapterIds.length > 0) {
    await CurriculumTopic.deleteMany({
      subject: SUBJECT_ID,
      grade: GRADE,
      chapter: { $in: oldChapterIds },
    });
  }

  await CurriculumChapter.deleteMany({
    subject: SUBJECT_ID,
    grade: GRADE,
  });

  // ====== 11-SINF CHAPTERS + TOPICS ======
  const chaptersData = [
    {
      title: "Algebra 11-sinf — I bob. Limit, hosila va differensial hisob",
      order: 1,
      topics: [
        "A1.1. O‘zgaruvchi miqdorlar orttirmalarining nisbati va uning ma’nosi",
        "A1.2. Urinma ta’rifi. Funksiya orttirmasi",
        "A1.3. Limit haqida tushuncha",
        "A1.4. Hosila, uning geometrik va fizik ma’nosi",
        "A1.5. Hosilani hisoblash qoidalari",
        "A1.6. Murakkab funksiyaning hosilasi",
        "A1.7. Funksiya grafigiga o‘tkazilgan urinma va normal tenglamalari. Masalalar yechish",
        "A1.8. Hosila yordamida funksiyani tekshirish va grafiklarni yasash",
        "A1.9. Geometrik, fizik, iqtisodiy mazmunli ekstremal masalalarni yechishda differensial hisob usullari",
        "A1.10. Taqribiy hisoblashlar",
        "A1.11. Hosila yordamida modellashtirish",
      ],
    },

    {
      title: "Algebra 11-sinf — II bob. Integral va uning tatbiqlari",
      order: 2,
      topics: [
        "A2.1. Boshlang‘ich funksiya va aniqmas integral tushunchalari",
        "A2.2. Integrallar jadvali. Integrallashning eng sodda qoidalari",
        "A2.3. Aniq integral. Nyuton–Leybnis formulasi",
        "A2.4. Aniq integralning tatbiqlari",
        "A2.5. Taqribiy integrallash",
      ],
    },

    {
      title: "Algebra 11-sinf — III bob. Kombinatorika va Nyuton binomi",
      order: 3,
      topics: [
        "A3.1. Kombinatorika masalalari",
        "A3.2. Nyuton binomi",
      ],
    },

    {
      title: "Algebra 11-sinf — IV bob. Statistika va ehtimollik",
      order: 4,
      topics: [
        "A4.1. Statistik ma’lumotlar. Statistik ma’lumotlarning turli ko‘rinishlari",
        "A4.2. O‘rta qiymat, moda va mediana. Chetlashish, standart chetlashish",
        "A4.3. Ikkita tur ma’lumotlar o‘rtasida bog‘liqlikni tadqiq qilish",
        "A4.4. Tasodifiy hodisalar va ularning ehtimolligi haqida tushuncha",
        "A4.5. Qarama-qarshi hodisa. Hodisalar ustida amallar va ularni Eyler–Venn diagrammalarida tasvirlash",
        "A4.6. Ehtimolliklarni qo‘shish va ko‘paytirish. Hodisalarning ehtimolligini hisoblash usullari",
        "A4.7. Binomial va normal taqsimot haqida tushuncha",
      ],
    },

    {
      title: "Geometriya 11-sinf — 1-bo‘lim. Fazoda to‘g‘ri chiziq va tekislik",
      order: 5,
      topics: [
        "G1.1. Fazoda nuqta, to‘g‘ri chiziq, tekislik tushunchalari",
        "G1.2. Fazoda ikki to‘g‘ri chiziqning o‘zaro joylashuvi",
        "G1.3. To‘g‘ri chiziq va tekislikning o‘zaro joylashuvi",
        "G1.4. Ikki tekislikning o‘zaro joylashuvi",
        "G1.5. Parallel to‘g‘ri chiziqlar (fazoda)",
        "G1.6. Parallel tekisliklar",
        "G1.7. Perpendikulyar to‘g‘ri chiziqlar",
        "G1.8. To‘g‘ri chiziqning tekislikka perpendikulyarligi",
        "G1.9. Tekisliklarning perpendikulyarligi",
        "G1.10. Fazoda burchaklar: chiziqlar orasidagi burchak, tekisliklar orasidagi burchak",
      ],
    },

    {
      title: "Geometriya 11-sinf — 2-bo‘lim. Ko‘pyoqlilar (Polyedrlar)",
      order: 6,
      topics: [
        "G2.1. Ko‘pyoqlilar tushunchasi",
        "G2.2. Prizma va uning elementlari",
        "G2.3. To‘g‘ri prizma",
        "G2.4. Parallelepiped (to‘g‘ri burchakli parallelepiped)",
        "G2.5. Piramida va uning elementlari",
        "G2.6. To‘g‘ri piramida",
        "G2.7. Kesik piramida",
        "G2.8. Ko‘pyoqlilarning yoyilmalari",
        "G2.9. Ko‘pyoqlilarning sirt yuzasi (to‘la va yon sirt)",
        "G2.10. Ko‘pyoqlilarning hajmi (prizma, parallelepiped, piramida)",
      ],
    },

    {
      title: "Geometriya 11-sinf — 3-bo‘lim. Aylanish jismlari",
      order: 7,
      topics: [
        "G3.1. Aylanish jismlari haqida umumiy tushuncha",
        "G3.2. Silindr va uning elementlari",
        "G3.3. Silindrning sirt yuzasi",
        "G3.4. Silindrning hajmi",
        "G3.5. Konus va uning elementlari",
        "G3.6. Konusning sirt yuzasi",
        "G3.7. Konusning hajmi",
        "G3.8. Kesik konus",
        "G3.9. Shar va uning elementlari",
        "G3.10. Sharning sirt yuzasi",
        "G3.11. Sharning hajmi",
      ],
    },

    {
      title: "Geometriya 11-sinf — 4-bo‘lim. Fazoda koordinatalar va vektorlar",
      order: 8,
      topics: [
        "G4.1. Fazoda koordinatalar sistemasini kiritish",
        "G4.2. Fazoda vektorlar",
        "G4.3. Vektorlar ustida amallar (qo‘shish, ayirish, ko‘paytirish)",
        "G4.4. Skalyar ko‘paytma",
        "G4.5. Fazoda masofa formulalari",
        "G4.6. Ikki nuqta orasidagi masofa",
        "G4.7. Kesmani berilgan nisbatda bo‘lish",
        "G4.8. To‘g‘ri chiziq tenglamasi (fazoda)",
        "G4.9. Tekislik tenglamasi",
        "G4.10. Nuqtadan tekislikkacha masofa",
        "G4.11. Chiziq va tekislik orasidagi burchak",
        "G4.12. Ikki tekislik orasidagi burchak",
      ],
    },

    {
      title: "Geometriya 11-sinf — 5-bo‘lim. Stereometriyada kesimlar",
      order: 9,
      topics: [
        "G5.1. Ko‘pyoqlilarning kesimi",
        "G5.2. Prizmaning kesimi",
        "G5.3. Piramidaning kesimi",
        "G5.4. Aylanish jismlarining kesimi (silindr, konus, shar)",
        "G5.5. Kesim yuzasini topish masalalari",
      ],
    },

    {
      title: "Geometriya 11-sinf — 6-bo‘lim. Hajm va sirt yuzaga doir murakkab masalalar",
      order: 10,
      topics: [
        "G6.1. Ko‘pyoqlilarning kombinatsiyasi (prizma + piramida)",
        "G6.2. Silindr va konus aralash jismlar",
        "G6.3. Shar bilan bog‘liq masalalar",
        "G6.4. Fazoda eng qisqa masofa masalalari",
        "G6.5. Amaliy geometriya masalalari",
      ],
    },
  ];

  // ====== INSERT ======
  let createdChapters = 0;
  let createdTopics = 0;

  for (const ch of chaptersData) {
    const chapterDoc = await CurriculumChapter.create({
      subject: SUBJECT_ID,
      grade: GRADE,
      title: ch.title,
      order: ch.order,
    });
    createdChapters++;

    const topicsDocs = ch.topics.map((t, idx) => ({
      subject: SUBJECT_ID,
      grade: GRADE,
      chapter: chapterDoc._id,
      title: t,
      order: idx + 1,
    }));

    await CurriculumTopic.insertMany(topicsDocs);
    createdTopics += topicsDocs.length;
  }

  const chaptersAfter = await CurriculumChapter.countDocuments({
    subject: SUBJECT_ID,
    grade: GRADE,
  });
  const topicsAfter = await CurriculumTopic.countDocuments({
    subject: SUBJECT_ID,
    grade: GRADE,
  });

  console.log("✅ Matematika 11-sinf (Algebra+Geometriya) curriculum saqlandi");
  console.log({
    chapters: { before: chaptersBefore, after: chaptersAfter, added: createdChapters },
    topics: { before: topicsBefore, after: topicsAfter, added: createdTopics },
  });

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error("❌ Seed error:", err);
  try {
    await mongoose.disconnect();
  } catch (e) {}
  process.exit(1);
});