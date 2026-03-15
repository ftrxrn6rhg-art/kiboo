// backend/scripts/seedCurriculumEnglish.js
require("dotenv").config();
const mongoose = require("mongoose");

const Subject = require("../models/Subject");
const CurriculumChapter = require("../models/CurriculumChapter");
const CurriculumTopic = require("../models/CurriculumTopic");

/**
 * Ingliz tili sinf emas — level.
 * grade mapping:
 * 0=A0, 1=A1, 2=A2, 3=B1, 4=B2, 5=C1
 */

const SUBJECT_NAME = "Ingliz tili";

const LEVELS = [
  {
    grade: 0,
    level: "A0",
    chapterTitle: "English A0 — Eng boshidan",
    topics: [
      "A0.1. Sentence structure: Subject + Verb + Object",
      "A0.2. Word order (gap tartibi)",
      "A0.3. Noun (ot) nima?",
      "A0.4. Verb (fe’l) nima?",
      "A0.5. Adjective (sifat) nima?",
      "A0.6. Adverb (ravish) nima?",
      "A0.7. Pronouns (olmoshlar) nima?",
      "A0.8. Basic punctuation (., ?, !)",
      "A0.9. Yes/No questions (oddiy so‘roq)",
      "A0.10. Short answers (Yes, I am / No, I don’t)",
    ],
  },
  {
    grade: 1,
    level: "A1",
    chapterTitle: "English A1 — Beginner (Asosiy fundament)",
    topics: [
      "A1.11. Subject pronouns (I/You/He/She/It/We/They)",
      "A1.12. Verb to be (am/is/are) — positive",
      "A1.13. Verb to be — negative",
      "A1.14. Verb to be — questions",
      "A1.15. Wh- questions (What/Where/Who/When/Why/How)",
      "A1.16. Articles: a/an/the",
      "A1.17. This/That/These/Those",
      "A1.18. Possessive adjectives (my/your/his/her/its/our/their)",
      "A1.19. Possessive ’s (Ali’s book)",
      "A1.20. Plural nouns (s/es/irregular)",
      "A1.21. There is / There are",
      "A1.22. Have / Has got",
      "A1.23. Present Simple (I work) — positive",
      "A1.24. Present Simple — negative (don’t/doesn’t)",
      "A1.25. Present Simple — questions (Do/Does)",
      "A1.26. Adverbs of frequency (always/usually…)",
      "A1.27. Prepositions of time (in/on/at)",
      "A1.28. Prepositions of place (in/on/under…)",
      "A1.29. Can / Can’t (ability)",
      "A1.30. Imperatives (Open the door!)",
      "A1.31. Object pronouns (me/him/her/us/them)",
      "A1.32. Countable / Uncountable nouns",
      "A1.33. Some / Any",
      "A1.34. Much / Many",
      "A1.35. A lot of",
      "A1.36. How much / How many",
    ],
  },
  {
    grade: 2,
    level: "A2",
    chapterTitle: "English A2 — Elementary (Vaqtlar va taqqoslashlar)",
    topics: [
      "A2.37. Present Continuous (am/is/are + Ving)",
      "A2.38. Present Simple vs Present Continuous",
      "A2.39. Past Simple (regular verbs)",
      "A2.40. Past Simple (irregular verbs)",
      "A2.41. Past Simple — negative & questions (did/didn’t)",
      "A2.42. Was / Were",
      "A2.43. There was / There were",
      "A2.44. Past Continuous (was/were + Ving)",
      "A2.45. Past Continuous vs Past Simple",
      "A2.46. Future: going to",
      "A2.47. Future: will",
      "A2.48. Future: Present Continuous (arrangements)",
      "A2.49. Comparatives (bigger, more interesting)",
      "A2.50. Superlatives (the biggest)",
      "A2.51. Too / Enough",
      "A2.52. Should / Shouldn’t (advice)",
      "A2.53. Must / Mustn’t (rules)",
      "A2.54. Have to / Don’t have to",
      "A2.55. Could (past ability / polite request)",
      "A2.56. Question tags (You are…, aren’t you?)",
      "A2.57. Gerund (-ing) after like/love/hate",
      "A2.58. Infinitive (to + V) basics",
      "A2.59. Linking words (and/but/because/so)",
      "A2.60. Basic phrasal verbs structure (get up, turn on)",
    ],
  },
  {
    grade: 3,
    level: "B1",
    chapterTitle: "English B1 — Intermediate (Kuchli grammar)",
    topics: [
      "B1.61. Present Perfect (have/has + V3)",
      "B1.62. Present Perfect — negative & questions",
      "B1.63. Present Perfect vs Past Simple",
      "B1.64. Ever / Never / Just / Already / Yet",
      "B1.65. For / Since",
      "B1.66. Present Perfect Continuous",
      "B1.67. Used to (past habits)",
      "B1.68. Be used to / Get used to",
      "B1.69. Future forms revision (will/going to/present cont)",
      "B1.70. First Conditional (If + present, will)",
      "B1.71. Second Conditional (If + past, would)",
      "B1.72. Zero Conditional",
      "B1.73. Relative clauses (who/which/that)",
      "B1.74. Defining vs Non-defining relative clauses",
      "B1.75. Passive voice (Present Simple)",
      "B1.76. Passive voice (Past Simple)",
      "B1.77. Reported speech (say/tell) basic",
      "B1.78. Reported statements (tense changes)",
      "B1.79. Reported questions (basic)",
      "B1.80. Modal verbs (may/might/can/could)",
      "B1.81. Gerund vs Infinitive (start/stop/remember/forget)",
      "B1.82. Comparative structures (not as…as)",
      "B1.83. So / Such",
      "B1.84. Both / Either / Neither",
      "B1.85. Articles revision (a/an/the/zero article)",
    ],
  },
  {
    grade: 4,
    level: "B2",
    chapterTitle: "English B2 — Upper-Intermediate (IELTS kerakli)",
    topics: [
      "B2.86. Passive voice (all tenses)",
      "B2.87. Reported speech (advanced)",
      "B2.88. Third Conditional (If + had V3, would have V3)",
      "B2.89. Mixed Conditionals",
      "B2.90. Wish / If only (present/past)",
      "B2.91. Causative (have/get something done)",
      "B2.92. Modals of deduction (must/might/can’t)",
      "B2.93. Modals in the past (should have / could have)",
      "B2.94. Relative clauses advanced (whose/where/when)",
      "B2.95. Reduced relative clauses",
      "B2.96. Participle clauses (Walking…, Having done…)",
      "B2.97. Inversion (Never have I…, Not only…)",
      "B2.98. Emphasis (It is/What…)",
      "B2.99. The more…, the more…",
      "B2.100. Despite / In spite of / Although",
      "B2.101. Noun clauses (What I think is…)",
      "B2.102. Conditionals with modals (If you should…, If I were to…)",
      "B2.103. Advanced articles usage",
      "B2.104. Linking devices (however, therefore, whereas)",
      "B2.105. Phrasal verbs grammar patterns (separable/inseparable)",
    ],
  },
  {
    grade: 5,
    level: "C1",
    chapterTitle: "English C1 — Advanced",
    topics: [
      "C1.106. Advanced inversion & negative adverbials",
      "C1.107. Subjunctive (It’s important that he be…)",
      "C1.108. Ellipsis (I can, but I won’t)",
      "C1.109. Cleft sentences (What I need is…)",
      "C1.110. Advanced conditionals & alternatives (provided that, unless)",
      "C1.111. Advanced passive (have something done / get + past participle)",
      "C1.112. Nominalisation (decide → decision)",
      "C1.113. Discourse markers (moreover, nonetheless)",
      "C1.114. Hedging language (tends to, appears to, likely)",
      "C1.115. Advanced reported speech nuances",
    ],
  },
];

function getSubjectNameField() {
  // Sizda Subject schema: name bo‘lishi ehtimol yuqori (Matematika shunaqa bo‘lgan)
  if (Subject.schema && Subject.schema.path("title")) return "title";
  if (Subject.schema && Subject.schema.path("name")) return "name";
  // fallback
  return "name";
}

async function main() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI topilmadi (.env tekshir)");

  await mongoose.connect(process.env.MONGO_URI);

  const subjectField = getSubjectNameField();

  // Subject upsert (title/name auto)
  const subjectQuery = { [subjectField]: SUBJECT_NAME };
  const subjectUpdate = { $set: { [subjectField]: SUBJECT_NAME } };

  const subject = await Subject.findOneAndUpdate(subjectQuery, subjectUpdate, {
    new: true,
    upsert: true,
    runValidators: true,
  });

  let chaptersProcessed = 0;
  let topicsUpserted = 0;

  for (const lvl of LEVELS) {
    // Chapter upsert (har levelga 1 ta chapter)
    const chapter = await CurriculumChapter.findOneAndUpdate(
      {
        subject: subject._id,
        grade: lvl.grade,
        order: 1,
        title: lvl.chapterTitle,
      },
      {
        $set: {
          subject: subject._id,
          grade: lvl.grade,
          order: 1,
          title: lvl.chapterTitle,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    chaptersProcessed += 1;

    // Topics upsert
    for (let i = 0; i < lvl.topics.length; i++) {
      const title = lvl.topics[i];
      const order = i + 1;

      await CurriculumTopic.findOneAndUpdate(
        {
          subject: subject._id,
          grade: lvl.grade,
          chapter: chapter._id,
          order,
        },
        {
          $set: {
            subject: subject._id,
            grade: lvl.grade,
            chapter: chapter._id,
            order,
            title,
          },
        },
        { new: true, upsert: true, runValidators: true }
      );

      topicsUpserted += 1;
    }
  }

  console.log("✅ Ingliz tili curriculum saqlandi");
  console.log({
    subjectId: String(subject._id),
    subjectFieldUsed: subjectField,
    levels: LEVELS.map((x) => ({ level: x.level, gradeCode: x.grade })),
    chaptersProcessed,
    topicsUpserted,
  });

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("❌ Seed error:", e);
  process.exit(1);
});