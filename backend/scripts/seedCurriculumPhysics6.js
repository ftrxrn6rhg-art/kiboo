/**
 * scripts/seedCurriculumPhysics6.js
 * Fizika 6-sinf curriculum seed (8 bo‘lim, 108 mavzu)
 *
 * Run:
 *   node scripts/seedCurriculumPhysics6.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const CurriculumChapter = require("../models/CurriculumChapter");
const CurriculumTopic = require("../models/CurriculumTopic");

const GRADE = 6;
const SUBJECT_ID = process.env.PHYSICS_SUBJECT_ID; // 6958373ec52062f8e10f3a99

function assertEnv() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI topilmadi (.env).");
  if (!SUBJECT_ID) throw new Error("PHYSICS_SUBJECT_ID topilmadi (.env).");
}

const T = (code, title) => `${code}. ${title}`;

async function upsertChapter({ subject, grade, title, order }) {
  // uniq: subject + grade + order
  return CurriculumChapter.findOneAndUpdate(
    { subject, grade, order },
    { $set: { title } },
    { upsert: true, new: true }
  );
}

async function upsertTopic({ subject, grade, chapterId, order, title }) {
  // uniq: chapter + order
  return CurriculumTopic.updateOne(
    { chapter: chapterId, order },
    { $set: { subject, grade, title, chapter: chapterId, order } },
    { upsert: true }
  );
}

async function main() {
  assertEnv();
  await mongoose.connect(process.env.MONGO_URI);

  const subject = SUBJECT_ID;

  const beforeChapters = await CurriculumChapter.countDocuments({ subject, grade: GRADE });
  const beforeTopics = await CurriculumTopic.countDocuments({ subject, grade: GRADE });

  const plan = [
    {
      title: "Fizika 6-sinf — 1-bo‘lim. Fizika fani va o‘lchashlar",
      order: 1,
      topics: [
        T("F1.1", "Fizika fani nimani o‘rganadi?"),
        T("F1.2", "Fizik jismlar va fizik hodisalar"),
        T("F1.3", "Fizik kattaliklar (asosiy tushuncha)"),
        T("F1.4", "O‘lchash va o‘lchov birliklari (SI tizimi)"),
        T("F1.5", "Uzunlikni o‘lchash (lineyka, metr)"),
        T("F1.6", "Vaqtni o‘lchash (sekundomer, soat)"),
        T("F1.7", "Massani o‘lchash (tarozi)"),
        T("F1.8", "Hajmni o‘lchash (menzurka)"),
        T("F1.9", "Haroratni o‘lchash (termometr)"),
        T("F1.10", "O‘lchash aniqligi va xatolik tushunchasi"),
      ],
    },
    {
      title: "Fizika 6-sinf — 2-bo‘lim. Modda va uning tuzilishi",
      order: 2,
      topics: [
        T("F2.1", "Modda nima? Jism va modda farqi"),
        T("F2.2", "Moddaning agregat holatlari: qattiq, suyuq, gaz"),
        T("F2.3", "Molekula haqida tushuncha"),
        T("F2.4", "Atom haqida tushuncha"),
        T("F2.5", "Molekulalarning doimiy harakati"),
        T("F2.6", "Molekulalarning o‘zaro ta’siri (tortishish va itarish)"),
        T("F2.7", "Diffuziya hodisasi"),
        T("F2.8", "Diffuziyaning tezlashishi (haroratga bog‘liqligi)"),
        T("F2.9", "Gazlarda diffuziya"),
        T("F2.10", "Suyuqliklarda diffuziya"),
        T("F2.11", "Qattiq jismlarda diffuziya"),
        T("F2.12", "Massa tushunchasi"),
        T("F2.13", "Hajm tushunchasi"),
        T("F2.14", "Zichlik tushunchasi (ρ)"),
        T("F2.15", "Zichlik formulasi: ρ = m / V"),
        T("F2.16", "Zichlik birliklari"),
        T("F2.17", "Zichlikni tajriba orqali aniqlash"),
        T("F2.18", "Zichlikka oid masalalar (oddiy hisoblar)"),
      ],
    },
    {
      title: "Fizika 6-sinf — 3-bo‘lim. Mexanik harakat va tezlik",
      order: 3,
      topics: [
        T("F3.1", "Mexanik harakat nima?"),
        T("F3.2", "Sanoq (hisob) sistemasi tushunchasi"),
        T("F3.3", "Trayektoriya"),
        T("F3.4", "Yo‘l (s)"),
        T("F3.5", "Ko‘chish (vektor sifatida)"),
        T("F3.6", "Harakat turlari (to‘g‘ri chiziqli, egri chiziqli)"),
        T("F3.7", "Bir tekis harakat"),
        T("F3.8", "Notekis harakat"),
        T("F3.9", "Tezlik tushunchasi"),
        T("F3.10", "Tezlik formulasi: v = s / t"),
        T("F3.11", "Tezlik birliklari (m/s, km/soat)"),
        T("F3.12", "Tezlikni o‘lchash usullari"),
        T("F3.13", "O‘rtacha tezlik tushunchasi"),
        T("F3.14", "Harakat grafigi (s–t sodda ko‘rinish)"),
      ],
    },
    {
      title: "Fizika 6-sinf — 4-bo‘lim. Kuchlar va ularning ta’siri",
      order: 4,
      topics: [
        T("F4.1", "Kuch tushunchasi"),
        T("F4.2", "Kuchning belgisi va o‘lchov birligi (N — Nyuton)"),
        T("F4.3", "Kuchni dinamometr bilan o‘lchash"),
        T("F4.4", "Kuchning yo‘nalishi (kuch vektori)"),
        T("F4.5", "Kuchlarning qo‘shilishi (natijaviy kuch)"),
        T("F4.6", "Inersiya hodisasi"),
        T("F4.7", "Massa va inersiya bog‘lanishi (oddiy tushuncha)"),
        T("F4.8", "Og‘irlik kuchi (Yer tortishishi)"),
        T("F4.9", "Og‘irlik kuchi yo‘nalishi"),
        T("F4.10", "Massa va og‘irlik farqi"),
        T("F4.11", "Elastiklik kuchi (prujina, rezina)"),
        T("F4.12", "Hooke qonuniga kirish (F ~ x)"),
        T("F4.13", "Ishqalanish kuchi tushunchasi"),
        T("F4.14", "Ishqalanish turlari: sirpanish, dumalash, tinch holat"),
        T("F4.15", "Ishqalanishni kamaytirish usullari"),
        T("F4.16", "Ishqalanishning foydali va zararli tomonlari"),
      ],
    },
    {
      title: "Fizika 6-sinf — 5-bo‘lim. Bosim va suyuqlik/gazlarda bosim",
      order: 5,
      topics: [
        T("F5.1", "Bosim tushunchasi"),
        T("F5.2", "Bosim formulasi: p = F / S"),
        T("F5.3", "Bosim birliklari (Pa)"),
        T("F5.4", "Qattiq jismlarda bosim (tayanch yuzaga bog‘liqlik)"),
        T("F5.5", "Bosimni oshirish va kamaytirish usullari"),
        T("F5.6", "Gazlarda bosim (oddiy tushuncha)"),
        T("F5.7", "Suyuqliklarda bosim (oddiy tushuncha)"),
        T("F5.8", "Suyuqlik bosimining chuqurlikka bog‘liqligi"),
        T("F5.9", "Suyuqlik bosimining idish shakliga bog‘liq emasligi"),
        T("F5.10", "Atmosfera bosimi tushunchasi"),
        T("F5.11", "Atmosfera bosimini o‘lchash (barometr haqida tushuncha)"),
        T("F5.12", "Pascal qonuni"),
        T("F5.13", "Gidravlik mashinalar (gidravlik press)"),
        T("F5.14", "Arximed kuchi tushunchasi"),
        T("F5.15", "Arximed kuchining paydo bo‘lish sababi"),
        T("F5.16", "Suyuqlikda suzish shartlari (cho‘kish/suzish)"),
        T("F5.17", "Gazlarda Arximed kuchi (oddiy misollar)"),
      ],
    },
    {
      title: "Fizika 6-sinf — 6-bo‘lim. Ish, quvvat va energiya",
      order: 6,
      topics: [
        T("F6.1", "Mexanik ish tushunchasi"),
        T("F6.2", "Ish formulasi: A = F · s"),
        T("F6.3", "Ish birliklari (J — Joule)"),
        T("F6.4", "Quvvat tushunchasi"),
        T("F6.5", "Quvvat formulasi: N = A / t"),
        T("F6.6", "Quvvat birliklari (W — Vatt)"),
        T("F6.7", "Energiya tushunchasi"),
        T("F6.8", "Kinetik energiya (harakat energiyasi)"),
        T("F6.9", "Potensial energiya (balandlik energiyasi)"),
        T("F6.10", "Mexanik energiya va uning saqlanishi (oddiy tushuncha)"),
        T("F6.11", "Energiya bir turdan ikkinchisiga aylanishi"),
      ],
    },
    {
      title: "Fizika 6-sinf — 7-bo‘lim. Issiqlik hodisalari",
      order: 7,
      topics: [
        T("F7.1", "Issiqlik hodisalari nima?"),
        T("F7.2", "Harorat va issiqlik farqi"),
        T("F7.3", "Issiqlik almashinuvi tushunchasi"),
        T("F7.4", "Issiqlik o‘tkazuvchanlik"),
        T("F7.5", "Konveksiya"),
        T("F7.6", "Nurlanish"),
        T("F7.7", "Qizish va sovish jarayonlari"),
        T("F7.8", "Moddaning qizish tezligi nimaga bog‘liq?"),
        T("F7.9", "Issiqlik miqdori (kirish tushuncha)"),
        T("F7.10", "Issiqlik sig‘imi haqida boshlang‘ich tushuncha"),
      ],
    },
    {
      title: "Fizika 6-sinf — 8-bo‘lim. Elektr va magnit hodisalari (kirish)",
      order: 8,
      topics: [
        T("F8.1", "Elektr hodisalari haqida umumiy tushuncha"),
        T("F8.2", "Elektr zaryad tushunchasi (+ va –)"),
        T("F8.3", "Elektrlanish hodisasi (ishqalanish bilan)"),
        T("F8.4", "O‘tkazgich va dielektrik (kirish)"),
        T("F8.5", "Elektr zanjiri tushunchasi"),
        T("F8.6", "Tok manbai va iste’molchi"),
        T("F8.7", "Elektr zanjirini yig‘ish qoidalari (oddiy)"),
        T("F8.8", "Kalit (switch) va uning vazifasi"),
        T("F8.9", "Magnit hodisalari (magnit nima?)"),
        T("F8.10", "Magnit qutblari (N va S)"),
        T("F8.11", "Magnitning temir jismlarga ta’siri"),
        T("F8.12", "Magnit maydon haqida kirish tushunchasi"),
      ],
    },
  ];

  let topicsUpsert = { matched: 0, modified: 0, upserted: 0 };

  for (const ch of plan) {
    const chapterDoc = await upsertChapter({
      subject,
      grade: GRADE,
      title: ch.title,
      order: ch.order,
    });

    for (let i = 0; i < ch.topics.length; i++) {
      const r = await upsertTopic({
        subject,
        grade: GRADE,
        chapterId: chapterDoc._id,
        order: i + 1,
        title: ch.topics[i],
      });

      topicsUpsert.matched += r.matchedCount || 0;
      topicsUpsert.modified += r.modifiedCount || 0;
      topicsUpsert.upserted += r.upsertedCount || 0;
    }
  }

  const afterChapters = await CurriculumChapter.countDocuments({ subject, grade: GRADE });
  const afterTopics = await CurriculumTopic.countDocuments({ subject, grade: GRADE });

  console.log(`✅ Fizika 6-sinf curriculum saqlandi`);
  console.log({
    chapters: { before: beforeChapters, after: afterChapters, added: afterChapters - beforeChapters },
    topics: { before: beforeTopics, after: afterTopics, added: afterTopics - beforeTopics },
    topicsUpsert,
  });

  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error("❌ Seed error:", e);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});