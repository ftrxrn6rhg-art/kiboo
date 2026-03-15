// src/lib/token.js
// ✅ Bizning qoida: PRIMARY token key = "token"
// eski dev keylar bilan ham mos bo‘lib turadi (fallback).

const PRIMARY_KEY = "token";
const FALLBACK_KEYS = [
  "STUDENT_TOKEN",
  "TEACHER_TOKEN",
  "PARENT_TOKEN",
  "authToken",
  "studentToken",
];

export function getToken() {
  try {
    const t = localStorage.getItem(PRIMARY_KEY);
    if (t) return t;

    for (const k of FALLBACK_KEYS) {
      const v = localStorage.getItem(k);
      if (v) return v;
    }
    return "";
  } catch {
    return "";
  }
}

export function setToken(token) {
  try {
    const t = token || "";
    // asosiy key
    localStorage.setItem(PRIMARY_KEY, t);

    // backward-compat: student sahifalari eski keyni ham o‘qishi mumkin
    localStorage.setItem("STUDENT_TOKEN", t);
    return true;
  } catch {
    return false;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(PRIMARY_KEY);
    for (const k of FALLBACK_KEYS) localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}
