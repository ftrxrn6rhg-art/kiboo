// backend/scripts/seedCurriculumMath9.js
require("dotenv").config();
const mongoose = require("mongoose");

const Subject = require("../models/Subject");
const CurriculumChapter = require("../models/CurriculumChapter");
const CurriculumTopic = require("../models/CurriculumTopic");

// Matematika Subject ID (senda oldin shu edi)
const MATH_SUBJECT_ID = "694b03a0ec0d154c7b000716";
const GRADE = 9;

// ------- helpers -------
function norm(s) {
  return String(s || "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function upsertChapter({ subject, grade, order, title }) {
  const t = norm(title);
  return CurriculumChapter.findOneAndUpdate(
    { subject, grade, order },
    { $set: { title: t } },
    { upsert: true, new: true }
  );
}

async function upsertTopic({ subject, grade, chapter, order, title }) {
  const t = norm(title);
  return CurriculumTopic.findOneAndUpdate(
    { subject, grade, chapter, order },
    { $set: { title: t, isActive: true } },
    { upsert: true, new: true }
  );
}

async function seed() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI topilmadi (.env ni tekshir)");

  await mongoose.connect(process.env.MONGO_URI);

  const subject = await Subject.findById(MATH_SUBJECT_ID);
  if (!subject) throw new Error("Matematika Subject topilmadi: " + MATH_SUBJECT_ID);

  const subjectId = subject._id;

  // --- CURRICULUM DATA (9-sinf: Algebra + Geometriya) ---
  const chapters = [
    {
      order: 1,
      title: "Algebra 9-sinf — I bob. Kvadrat funksiya va tengsizliklar",
      topics: [
        "A1.1. Kvadrat funksiyaning ta’rifi",
        "A1.2. y = x^2 funksiya",
        "A1.3. y = ax^2 funksiya",
        "A1.4. y = ax^2 + bx + c funksiya",
        "A1.5. Kvadrat funksiyaning grafigini yasash",
        "A1.6. Kvadrat tengsizlik va uning yechimi",
        "A1.7. Kvadrat tengsizlikni kvadrat funksiya grafigi yordamida yechish",
        "A1.8. Intervallar usuli",
      ],
    },
    {
      order: 2,
      title: "Algebra 9-sinf — II bob. Funksiya xossalari, tenglama va tengsizliklar",
      topics: [
        "A2.1. Funksiyaning aniqlanish sohasi",
        "A2.2. Funksiyaning o‘sishi va kamayishi",
        "A2.3. Funksiyaning juftligi va toqligi",
        "A2.4. Daraja qatnashgan tengsizlik va tenglamalar",
        "A2.5. Ikkinchi darajali tenglama qatnashgan eng sodda sistemalarni yechish",
        "A2.6. Tenglamalar sistemasini yechishning turli usullari",
        "A2.7. Ikkinchi darajali bir noma’lumli tengsizliklar sistemalari",
        "A2.8. Sodda tengsizliklarni isbotlash",
      ],
    },
    {
      order: 3,
      title: "Algebra 9-sinf — III bob. Trigonometriya (asoslar)",
      topics: [
        "A3.1. Burchakning radian o‘lchovi",
        "A3.2. Nuqtani koordinatalar boshi atrofida burish",
        "A3.3. Burchakning sinusi, kosinusi, tangensi va kotangensi ta’riflari",
        "A3.4. Sinus, kosinus va tangensning ishoralari",
        "A3.5. Ayni bir burchakning sinusi, kosinusi va tangensi orasidagi munosabatlar",
        "A3.6. Trigonometrik ayniyatlar",
        "A3.7. a va −a burchaklarning sinusi, kosinusi, tangensi va kotangensi",
        "A3.8. Qo‘shish formulalari",
        "A3.9. Ikkilangan burchakning sinusi va kosinusi",
        "A3.10. Keltirish formulalari",
        "A3.11. Sinuslar yig‘indisi va ayirmasi. Kosinuslar yig‘indisi va ayirmasi",
      ],
    },
    {
      order: 4,
      title: "Algebra 9-sinf — IV bob. Ketma-ketliklar va progressiyalar",
      topics: [
        "A4.1. Sonli ketma-ketliklar",
        "A4.2. Arifmetik progressiya",
        "A4.3. Arifmetik progressiya dastlabki n ta hadining yig‘indisi",
        "A4.4. Geometrik progressiya",
        "A4.5. Geometrik progressiya dastlabki n ta hadining yig‘indisi",
        "A4.6. Cheksiz kamayuvchi geometrik progressiya",
      ],
    },
    {
      order: 5,
      title: "Algebra 9-sinf — V bob. Ehtimollik va statistika (asoslar)",
      topics: [
        "A5.1. Hodisa tushunchasi",
        "A5.2. Hodisaning ehtimolligi",
        "A5.3. Tasodifiy hodisaning nisbiy chastotasi",
        "A5.4. Tasodifiy miqdorlar",
        "A5.5. Tasodifiy miqdorlarning sonli xarakteristikalari",
      ],
    },

    // --- GEOMETRIYA ---
    {
      order: 6,
      title: "Geometriya 9-sinf — I bob. O‘xshashlik (uchburchak va ko‘pburchaklar)",
      topics: [
        "G1.1. Ko‘pburchaklarning o‘xshashligi. O‘xshash uchburchaklar va ularning xossalari",
        "G1.2. Uchburchaklar o‘xshashligining birinchi alomati",
        "G1.3. Uchburchaklar o‘xshashligining ikkinchi alomati",
        "G1.4. Uchburchaklar o‘xshashligining uchinchi alomati",
        "G1.5. To‘g‘ri burchakli uchburchaklarning o‘xshashlik alomatlari",
        "G1.6. O‘xshashlik alomatlarining isbotlashga doir masalalarga tatbiqlari",
        "G1.7. Amaliy mashq va tatbiq",
        "G1.8. Bilimingizni sinab ko‘ring",
      ],
    },
    {
      order: 7,
      title: "Geometriya 9-sinf — II bob. Geometrik almashtirishlar va o‘xshash shakllar",
      topics: [
        "G2.1. Tekislikda geometrik almashtirishlar. Harakat va parallel ko‘chirish",
        "G2.2. O‘qqa nisbatan simmetriya",
        "G2.3. Markaziy simmetriya va burish",
        "G2.4. Geometrik shakllarning o‘xshashligi",
        "G2.5. O‘xshash ko‘pburchaklarning xossalari",
        "G2.6. Gomotetiya va o‘xshashlik",
        "G2.7. O‘xshash ko‘pburchaklarni yasash",
      ],
    },
    {
      order: 8,
      title: "Geometriya 9-sinf — III bob. Trigonometriya teoremalari va vektorlar",
      topics: [
        "G3.1. 0° dan 180° gacha bo‘lgan burchakning sinusi, kosinusi, tangensi va kotangensi",
        "G3.2. Masalalar yechish (trigonometriya)",
        "G3.3. Uchburchak yuzini burchak sinusi yordamida hisoblash",
        "G3.4. Sinuslar teoremasi",
        "G3.5. Kosinuslar teoremasi",
        "G3.6. Sinuslar va kosinuslar teoremalarining ba’zi tatbiqlari",
        "G3.7. Ikki vektor orasidagi burchak va ularning skalyar ko‘paytmasi",
      ],
    },
    {
      order: 9,
      title: "Geometriya 9-sinf — IV bob. Muntazam ko‘pburchaklar va aylanalar",
      topics: [
        "G4.1. Aylanaga ichki chizilgan ko‘pburchak",
        "G4.2. Aylanaga tashqi chizilgan ko‘pburchak",
        "G4.3. Muntazam ko‘pburchaklar",
        "G4.4. Muntazam ko‘pburchakka ichki va tashqi chizilgan aylanalar",
        "G4.5. Muntazam ko‘pburchak tomoni bilan ichki/tashqi chizilgan aylanalar radiuslari orasidagi bog‘lanish",
        "G4.6. Bilimingizni sinab ko‘ring",
      ],
    },
    {
      order: 10,
      title: "Geometriya 9-sinf — V bob. Aylana uzunligi va doira yuzi",
      topics: [
        "G5.1. Aylana uzunligi",
        "G5.2. Aylana yoyi uzunligi. Burchakning radian o‘lchovi (takror)",
        "G5.3. Doira yuzi",
        "G5.4. Doira bo‘laklari yuzi",
      ],
    },
    {
      order: 11,
      title: "Geometriya 9-sinf — VI bob. Proyeksiya va proporsional kesmalar",
      topics: [
        "G6.1. Kesmalar proyeksiyasi va proporsionallik",
        "G6.2. Proporsional kesmalarning xossalari",
        "G6.3. To‘g‘ri burchakli uchburchakdagi proporsional kesmalar",
        "G6.4. Berilgan ikkita kesmaga o‘rta proporsional kesmani yasash",
        "G6.5. Aylanadagi proporsional kesmalar",
      ],
    },
  ];

  const beforeChapters = await CurriculumChapter.countDocuments({ subject: subjectId, grade: GRADE });
  const beforeTopics = await CurriculumTopic.countDocuments({ subject: subjectId, grade: GRADE });

  let addedCh = 0;
  let addedTp = 0;

  for (const ch of chapters) {
    const existed = await CurriculumChapter.findOne({
      subject: subjectId,
      grade: GRADE,
      order: ch.order,
    });

    const chapterDoc = await upsertChapter({
      subject: subjectId,
      grade: GRADE,
      order: ch.order,
      title: ch.title,
    });

    if (!existed) addedCh += 1;

    let idx = 1;
    for (const tpTitle of ch.topics) {
      const existedT = await CurriculumTopic.findOne({
        subject: subjectId,
        grade: GRADE,
        chapter: chapterDoc._id,
        order: idx,
      });

      await upsertTopic({
        subject: subjectId,
        grade: GRADE,
        chapter: chapterDoc._id,
        order: idx,
        title: tpTitle,
      });

      if (!existedT) addedTp += 1;
      idx += 1;
    }
  }

  const afterChapters = await CurriculumChapter.countDocuments({ subject: subjectId, grade: GRADE });
  const afterTopics = await CurriculumTopic.countDocuments({ subject: subjectId, grade: GRADE });

  console.log("✅ Matematika 9-sinf (Algebra+Geometriya) curriculum saqlandi");
  console.log({
    chapters: { before: beforeChapters, after: afterChapters, added: addedCh },
    topics: { before: beforeTopics, after: afterTopics, added: addedTp },
  });

  await mongoose.disconnect();
}

seed().catch(async (e) => {
  console.error("❌ Seed error:", e.message || e);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});