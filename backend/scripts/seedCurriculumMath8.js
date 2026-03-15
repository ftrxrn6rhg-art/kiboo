// backend/scripts/seedCurriculumMath8.js
require("dotenv").config();
const mongoose = require("mongoose");

const Subject = require("../models/Subject");
const CurriculumChapter = require("../models/CurriculumChapter");
const CurriculumTopic = require("../models/CurriculumTopic");

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DB_URI;

const SUBJECT_ID = "694b03a0ec0d154c7b000716"; // Matematika
const GRADE = 8;

async function connect() {
  if (!MONGO_URI) throw new Error("MONGO_URI topilmadi (.env ni tekshir).");
  await mongoose.connect(MONGO_URI);
}

async function upsertChapter({ subject, grade, order, title }) {
  const ch = await CurriculumChapter.findOneAndUpdate(
    { subject, grade, order },
    { $set: { title } },
    { new: true, upsert: true }
  );
  return ch;
}

async function upsertTopic({ subject, grade, chapterId, order, title }) {
  // unique index (subject+grade+title) bo‘lishi mumkin — shuning uchun title unikal bo‘lsin (biz prefix qo‘ydik).
  const t = await CurriculumTopic.findOneAndUpdate(
    { subject, grade, title },
    { $set: { chapter: chapterId, order, isActive: true } },
    { new: true, upsert: true }
  );
  return t;
}

async function seed() {
  const subject = await Subject.findById(SUBJECT_ID);
  if (!subject) throw new Error("Matematika subject topilmadi: " + SUBJECT_ID);

  const chapters = [
    // ================== ALGEBRA ==================
    {
      order: 1,
      title: "Algebra 8-sinf — I bob. Koordinatalar va funksiya",
      topics: [
        "A1.1. Tekislikda to‘g‘ri burchakli koordinatalar sistemasi",
        "A1.2. Funksiya tushunchasi",
        "A1.3. y = kx funksiya va uning grafigi",
        "A1.4. Chiziqli funksiya va uning grafigi",
        "A1.5. I bobga doir mashqlar",
        "A1.6. I bobga doir sinov mashqlari (testlar)",
      ],
    },
    {
      order: 2,
      title: "Algebra 8-sinf — II bob. Ikki noma’lumli ikkita chiziqli tenglamalar sistemasi",
      topics: [
        "A2.1. Chiziqli tenglamalar sistemasi",
        "A2.2. O‘rniga qo‘yish usuli",
        "A2.3. Qo‘shish usuli",
        "A2.4. Tenglamalar sistemasini yechishning grafik usuli",
        "A2.5. Masalalarni tenglamalar sistemasi yordamida yechish",
        "A2.6. II bobga doir mashqlar",
        "A2.7. II bobga doir sinov mashqlari (testlar)",
      ],
    },
    {
      order: 3,
      title: "Algebra 8-sinf — III bob. Tengsizliklar",
      topics: [
        "A3.1. Musbat va manfiy sonlar",
        "A3.2. Sonli tengsizliklar",
        "A3.3. Sonli tengsizliklarning asosiy xossalari",
        "A3.4. Tengsizliklarni qo‘shish va ko‘paytirish",
        "A3.5. Qat’iy va noqat’iy tengsizliklar",
        "A3.6. Bir noma’lumli tengsizliklar",
        "A3.7. Bir noma’lumli tengsizliklarni yechish",
        "A3.8. Bir noma’lumli tengsizliklar sistemalari. Sonli oraliqlar",
        "A3.9. Tengsizliklar sistemalarini yechish",
        "A3.10. Sonning moduli. Modul qatnashgan tenglama va tengsizliklar",
        "A3.11. III bobga doir mashqlar",
        "A3.12. III bobga doir sinov mashqlari (testlar)",
      ],
    },
    {
      order: 4,
      title: "Algebra 8-sinf — IV bob. Kvadrat ildizlar",
      topics: [
        "A4.1. Arifmetik kvadrat ildiz",
        "A4.2. Haqiqiy sonlar",
        "A4.3. Darajaning kvadrat ildizi",
        "A4.4. Ko‘paytmaning kvadrat ildizi",
        "A4.5. Kasrning kvadrat ildizi",
        "A4.6. IV bobga doir mashqlar",
        "A4.7. IV bobga doir sinov mashqlari (testlar)",
      ],
    },
    {
      order: 5,
      title: "Algebra 8-sinf — V bob. Kvadrat tenglamalar",
      topics: [
        "A5.1. Kvadrat tenglama va uning ildizlari",
        "A5.2. Chala kvadrat tenglamalar",
        "A5.3. To‘la kvadratni ajratish usuli",
        "A5.4. Kvadrat tenglamalarni yechish",
        "A5.5. Keltirilgan kvadrat tenglama. Viyet teoremasi",
        "A5.6. Kvadrat tenglamaga keltiriladigan tenglamalar",
        "A5.7. Kvadrat tenglamalar yordamida masalalar yechish",
        "A5.8. Ikkinchi darajali tenglama qatnashgan eng sodda sistemalarni yechish",
        "A5.9. V bobga doir mashqlar",
        "A5.10. V bobga doir sinov mashqlari (testlar)",
      ],
    },
    {
      order: 6,
      title: "Algebra 8-sinf — VI bob. Taqribiy hisoblashlar",
      topics: [
        "A6.1. Miqdorlarning taqribiy qiymatlari. Yaqinlashish xatoligi",
        "A6.2. Xatolikni baholash",
        "A6.3. Sonlarni yaxlitlash",
        "A6.4. Nisbiy xatolik",
        "A6.5. Sonning standart shakli",
      ],
    },

    // ================== GEOMETRIYA ==================
    {
      order: 7,
      title: "Geometriya 8-sinf — I bob. To‘rtburchaklar va Fales teoremasi",
      topics: [
        "G1.1. Asosiy to‘rtburchaklar va ularning xossalari",
        "G1.2. Ko‘pburchak ichki va tashqi burchaklarining xossasi",
        "G1.3. Parallelogramm va uning xossalari",
        "G1.4. Parallelogrammning alomatlari",
        "G1.5. To‘g‘ri to‘rtburchak va uning xossalari",
        "G1.6. Romb va kvadratning xossalari",
        "G1.7. Trapetsiya va uning xossalari",
        "G2.1. Fales teoremasi va uning tatbiqlari",
        "G2.2. Fales teoremasi",
        "G2.3. Uchburchak o‘rta chizig‘ining xossasi",
        "G2.4. Trapetsiya o‘rta chizig‘ining xossasi",
        "G2.5. Amaliy mashq va tatbiq",
        "G2.6. 1-nazorat ishi",
        "G2.7. Xatolar ustida ishlash",
        "G2.8. 1-test",
        "G2.9. Tarixiy ma’lumotlar (1)",
      ],
    },
    {
      order: 8,
      title: "Geometriya 8-sinf — II bob. To‘g‘ri burchakli uchburchak va trigonometriya",
      topics: [
        "G3.1. O‘tkir burchakning trigonometrik funksiyalari",
        "G3.2. O‘tkir burchakning sinusi, kosinusi, tangensi va kotangensi",
        "G3.3. O‘tkir burchakning sinusi, kosinusi, tangensi va kotangensi (davomi)",
        "G4.1. Pifagor teoremasi va uning tatbiqlari",
        "G4.2. Pifagor teoremasi va uning turli isbotlari",
        "G4.3. Pifagor teoremasiga teskari teorema",
        "G4.4. Pifagor teoremasining ba’zi tatbiqlari",
        "G5.1. Trigonometrik ayniyatlar",
        "G5.2. Asosiy trigonometrik ayniyat va uning natijalari",
        "G5.3. To‘ldiruvchi burchak trigonometrik funksiyalari formulalari",
        "G5.4. 30°, 45°, 60° burchaklarning trigonometrik qiymatlari",
        "G6.1. To‘g‘ri burchakli uchburchaklarni yechish",
        "G6.2. Trigonometrik funksiyalarning qiymatlari jadvali",
        "G6.3. To‘g‘ri burchakli uchburchaklarni yechish",
        "G6.4. To‘g‘ri burchakli uchburchaklarni yechish (davomi)",
        "G6.5. To‘g‘ri burchakli uchburchaklarni yasash",
        "G6.6. Amaliy mashq va tatbiq",
        "G6.7. 2-nazorat ishi",
        "G6.8. Xatolar ustida ishlash (2)",
        "G6.9. 2-test",
        "G6.10. Tarixiy ma’lumotlar (2)",
      ],
    },
    {
      order: 9,
      title: "Geometriya 8-sinf — III bob. Koordinatalar usuli va vektorlar",
      topics: [
        "G7.1. Tekislikda koordinatalar sistemasi",
        "G7.2. Tekislikda nuqtaning koordinatalari. Kesma o‘rtasining koordinatalari",
        "G7.3. Ikki nuqta orasidagi masofa",
        "G7.4. Aylana tenglamasi",
        "G7.5. To‘g‘ri chiziq tenglamasi",
        "G7.6. Geometrik masalalar yechishning koordinatalar usuli",
        "G8.1. Tekislikda vektorlar",
        "G8.2. Vektor tushunchasi. Vektorning uzunligi va yo‘nalishi",
        "G8.3. Vektorlarni qo‘shish va ayirish",
        "G8.4. Vektorni songa ko‘paytirish",
        "G8.5. Vektorning koordinatalari",
        "G8.6. Koordinatalari bilan berilgan vektorlar ustida amallar",
        "G8.7. Vektorning fizik va geometrik talqinlari",
        "G8.8. Geometrik masalalar yechishning vektor usuli",
        "G8.9. Amaliy mashq va tatbiq (3)",
        "G8.10. 3-nazorat ishi",
        "G8.11. Xatolar ustida ishlash (3)",
        "G8.12. 3-test",
        "G8.13. Tarixiy ma’lumotlar (3)",
      ],
    },
    {
      order: 10,
      title: "Geometriya 8-sinf — IV bob. Yuz",
      topics: [
        "G9.1. Ko‘purchakning yuzi",
        "G9.2. Yuz haqida tushuncha",
        "G9.3. To‘g‘ri to‘rtburchak va parallelogrammning yuzi",
        "G9.4. Uchburchakning yuzi",
        "G9.5. Romb va trapetsiyaning yuzi",
        "G9.6. Ko‘pburchakning yuzi (umumiy)",
        "G9.7. Amaliy mashq va tatbiq (4)",
        "G9.8. 4-nazorat ishi",
        "G9.9. Xatolar ustida ishlash (4)",
        "G9.10. 4-test",
        "G9.11. Tarixiy ma’lumotlar (4)",
      ],
    },
    {
      order: 11,
      title: "Geometriya 8-sinf — V bob. Aylana va uchburchakning ajoyib nuqtalari",
      topics: [
        "G10.1. Aylanadagi burchaklar",
        "G10.2. To‘g‘ri chiziq va aylananing o‘zaro joylashuvi. Aylanaga urinma va uning xossalari",
        "G10.3. Ikki aylananing o‘zaro joylashuvi. Markaziy burchak va yoy gradusi",
        "G10.4. Aylanaga ichki chizilgan burchak",
        "G10.5. Aylananing kesuvchilari hosil qilgan burchaklar",
        "G10.6. Aylana vatari va diametrining xossalari",
        "G10.7. Amaliy mashq va tatbiq (5)",
        "G11.1. Uchburchakning ajoyib nuqtalari",
      ],
    },
  ];

  const beforeCh = await CurriculumChapter.countDocuments({ subject: SUBJECT_ID, grade: GRADE });
  const beforeTp = await CurriculumTopic.countDocuments({ subject: SUBJECT_ID, grade: GRADE });

  // 1) chapters + topics
  for (const ch of chapters) {
    const chapterDoc = await upsertChapter({
      subject: SUBJECT_ID,
      grade: GRADE,
      order: ch.order,
      title: ch.title,
    });

    let i = 1;
    for (const title of ch.topics) {
      await upsertTopic({
        subject: SUBJECT_ID,
        grade: GRADE,
        chapterId: chapterDoc._id,
        order: i,
        title,
      });
      i += 1;
    }
  }

  const afterCh = await CurriculumChapter.countDocuments({ subject: SUBJECT_ID, grade: GRADE });
  const afterTp = await CurriculumTopic.countDocuments({ subject: SUBJECT_ID, grade: GRADE });

  console.log("✅ Matematika 8-sinf (Algebra+Geometriya) curriculum saqlandi");
  console.log({
    chapters: { before: beforeCh, after: afterCh, added: Math.max(0, afterCh - beforeCh) },
    topics: { before: beforeTp, after: afterTp, added: Math.max(0, afterTp - beforeTp) },
  });
}

(async () => {
  try {
    await connect();
    await seed();
  } catch (e) {
    console.error("❌ Seed error:", e.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
