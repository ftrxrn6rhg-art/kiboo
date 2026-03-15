// backend/scripts/seed_math_5.js
require("dotenv").config();
const mongoose = require("mongoose");

// Sizning loyihangizda Subject va CurriculumTopic model nomi boshqacha bo‘lishi mumkin.
// Odatda bizda Subject: ./models/Subject
// Topic: ./models/CurriculumTopic (yoki Topic model)
// Agar path xato bersa, menga "ls models" chiqishini tashlab bering — moslab beraman.
const Subject = require("../models/Subject");
const CurriculumTopic = require("../models/CurriculumTopic");

const SUBJECT_NAME = "Matematika";
const GRADE = 5;

const chapters = [
  {
    chapterNo: 1,
    title: "Natural sonlarni qo‘shish va ayirish",
    topics: [
      { no: 1, title: "Natural sonlar va nol" },
      { no: 2, title: "Sodda geometrik shakllar" },
      { no: 3, title: "Shkalalar va sonlar nuri" },
      { no: 4, title: "Natural sonlarni taqqoslash" },
      { no: 5, title: "Natural sonlarni yaxlitlash" },
      { no: 6, title: "Natural sonlarni qo‘shish" },
      { no: 7, title: "Natural sonlarni ayirish" },
      { no: 8, title: "Sonli va harfli ifodalar" },
      { no: 9, title: "Matematik masala va tenglamalar" },
      { no: 10, title: "I bobni takrorlashga doir masalalar" },
    ],
  },
  {
    chapterNo: 2,
    title: "Natural sonlarni ko‘paytirish va bo‘lish",
    topics: [
      { no: 11, title: "Natural sonlarni ko‘paytirish" },
      { no: 12, title: "Natural sonlarni bo‘lish" },
      { no: 13, title: "Qoldiqli bo‘lish" },
      { no: 14, title: "Qulay va tezkor hisoblash usullari" },
      { no: 15, title: "Ifodalarni soddalashtirish" },
      { no: 16, title: "O‘tilganlarni takrorlashga doir masalalar" },
      { no: 17, title: "Murakkabroq masalalarni yechish" },
      { no: 18, title: "To‘rt amalga doir hisoblash algoritmlari" },
      { no: 19, title: "Sonning kvadrati, kubi va darajasi" },
      { no: 20, title: "Ma’lumotlar bilan ishlash" },
      { no: 21, title: "Loyiha ishi namunasi" },
      { no: 22, title: "II bobni takrorlashga doir masalalar" },
    ],
  },
  {
    chapterNo: 3,
    title: "Matnli masalalarni yechish",
    topics: [
      { no: 23, title: "Matnli masalalar" },
      { no: 24, title: "Qismlarga doir masalalar" },
      { no: 25, title: "Geometrik mazmundagi matnli masalalar" },
      { no: 26, title: "Harakatga doir masalalar" },
      { no: 27, title: "Ikki jism harakatiga doir masalalar" },
      { no: 28, title: "Iqtisodiy mazmundagi matnli masalalar" },
      { no: 29, title: "Bajarilgan ishga doir masalalar" },
      { no: 30, title: "III bobni takrorlashga doir masalalar" },
    ],
  },
  {
    chapterNo: 4,
    title: "Geometrik shakllar",
    topics: [
      { no: 31, title: "Burchaklar" },
      { no: 32, title: "Parallel va perpendikulyar to'g'ri chiziqlar" },
      { no: 33, title: "Siniq chiziq va uning uzunligi" },
      { no: 34, title: "Ko'pburchak perimetri" },
      { no: 35, title: "O'tilganlarni takrorlashga doir masalalar" },
      { no: 36, title: "To'g'ri to'rtburchakning yuzi" },
      { no: 37, title: "Murakkab shakllarning yuzi" },
      { no: 38, title: "Yuz o‘lchov birliklari" },
      { no: 39, title: "Yuzni chamalab taqribiy hisoblash" },
      { no: 40, title: "IV bobni takrorlashga doir masalalar" },
    ],
  },
  {
    chapterNo: 5,
    title: "Oddiy kasrlar",
    topics: [
      { no: 41, title: "Ulushlar va oddiy kasrlar" },
      { no: 42, title: "Kasrlarni taqqoslash" },
      { no: 43, title: "To‘g‘ri va noto‘g‘ri kasrlar" },
      { no: 44, title: "Bir xil maxrajli kasrlarni qo‘shish va ayirish" },
      { no: 45, title: "Bo‘lish va kasrlar" },
      { no: 46, title: "O‘tilganlarni takrorlashga doir masalalar" },
      { no: 47, title: "Aralash sonlar" },
      { no: 48, title: "Aralash sonlarni qo‘shish va ayirish" },
      { no: 49, title: "Kasrlarga doir masalalar" },
      { no: 50, title: "V bobni takrorlashga doir masalalar" },
    ],
  },
  {
    chapterNo: 6,
    title: "Fazoviy geometrik shakllar",
    topics: [
      { no: 51, title: "Fazoviy shakllar. Ko‘pyoqlar" },
      { no: 52, title: "To‘g‘ri burchakli parallelepiped va kub" },
      { no: 53, title: "Ko‘pyoqlarni yoyilmasiga ko‘ra yasash" },
      { no: 54, title: "To‘g‘ri burchakli parallelepiped va kub hajmi" },
      { no: 55, title: "VI bobni takrorlashga doir masalalar" },
    ],
  },
  {
    chapterNo: 7,
    title: "O‘nli kasrlar",
    topics: [
      { no: 56, title: "O‘nli kasrlar" },
      { no: 57, title: "O‘nli kasrlarni taqqoslash" },
      { no: 58, title: "O‘nli kasrlarni qo‘shish va ayirish" },
      { no: 59, title: "Sonning taqribiy qiymati va yaxlitlash" },
      { no: 60, title: "Oilada tejamkorlik va matematika" },
      { no: 61, title: "O‘tilganlarni takrorlashga doir masalalar" },
      { no: 62, title: "O‘nli kasrlarni natural songa ko‘paytirish" },
      { no: 63, title: "O‘nli kasrlarni natural songa bo‘lish" },
      { no: 64, title: "O‘nli kasrlarni ko‘paytirish" },
      { no: 65, title: "O‘nli kasrni o‘nli kasrga bo‘lish" },
      { no: 66, title: "Foizlar" },
      { no: 67, title: "VII bobni takrorlashga doir masalalar" },
    ],
  },
  {
    chapterNo: 8,
    title: "Ma’lumotlar tahlili",
    topics: [
      { no: 68, title: "Ma’lumotlar qatorining o‘rta arifmetigi" },
      { no: 69, title: "Ma’lumotlar qatori va uning tahlili" },
      { no: 70, title: "Yakuniy takrorlashga doir masalalar" },
    ],
  },
];

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/ʻ|’/g, "'")
    .replace(/[^a-z0-9' ]/g, " ")
    .trim()
    .replace(/\s+/g, "-");
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");

  // 1) Subject topamiz yoki yaratamiz
  let subject = await Subject.findOne({ name: SUBJECT_NAME });
  if (!subject) {
    subject = await Subject.create({ name: SUBJECT_NAME });
    console.log("✅ Subject yaratildi:", subject._id.toString());
  } else {
    console.log("ℹ️ Subject bor:", subject._id.toString());
  }

  // 2) Topiclarni upsert qilamiz
  let upserted = 0;

  for (const ch of chapters) {
    for (const t of ch.topics) {
      const doc = {
        title: t.title,
        slug: slugify(`${SUBJECT_NAME}-${GRADE}-${t.no}-${t.title}`),
        subject: subject._id,
        grade: GRADE,
        chapterNo: ch.chapterNo,
        chapterTitle: ch.title,
        topicNo: t.no,
      };

      // uniq kalit: subject+grade+topicNo (bizda 5-sinf matematika ichida unique)
      await CurriculumTopic.updateOne(
        { subject: subject._id, grade: GRADE, topicNo: t.no },
        { $set: doc },
        { upsert: true }
      );

      upserted++;
    }
  }

  console.log(`✅ Done. Upsert qilingan topiclar: ${upserted} ta`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});