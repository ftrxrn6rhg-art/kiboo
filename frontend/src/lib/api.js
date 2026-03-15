// frontend/src/lib/api.js

// Vite (browser) da: import.meta.env bor
// Node (terminal test) da: import.meta.env bo'lmaydi
const ENV =
  typeof import.meta !== "undefined" && import.meta && import.meta.env
    ? import.meta.env
    : {};

function resolveApiBase() {
  const envBase = (ENV.VITE_API_URL || ENV.VITE_API_BASE || "").trim();
  if (envBase) return envBase.replace(/\/$/, "");

  if (typeof window === "undefined") {
    return "http://127.0.0.1:3000";
  }

  return window.location.origin.replace(/\/$/, "");
}

export const API_BASE = resolveApiBase();

/* =========================
   YORDAMCHI REQUEST
========================= */
async function request(
  path,
  { method = "GET", token, body, isFormData = false } = {}
) {
  const headers = {};

  // JSON bo'lsa content-type qo'yamiz, FormData bo'lsa qo'ymaymiz (browser o'zi boundary qo'yadi)
  if (body && !isFormData) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) throw new Error(data.message || "API error");
  return data;
}

/* =========================
   AUTH
========================= */
export async function login(email, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function register(name, email, password, role = "student") {
  return request("/api/auth/register", {
    method: "POST",
    body: { name, email, password, role },
  });
}

export async function resendVerification(email) {
  return request("/api/auth/resend-verification", {
    method: "POST",
    body: { email },
  });
}

export async function forgotPassword(email) {
  return request("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export async function resetPassword(token, password) {
  return request("/api/auth/reset-password", {
    method: "POST",
    body: { token, password },
  });
}

/* =========================
   ADMIN
========================= */
export async function adminListTeachers(token) {
  return request("/api/admin/teachers", { token });
}

export async function adminApproveTeacher(token, id) {
  return request(`/api/admin/teachers/${id}/approve`, { method: "PATCH", token });
}

export async function adminRejectTeacher(token, id) {
  return request(`/api/admin/teachers/${id}/reject`, { method: "PATCH", token });
}

export async function apiMe(token) {
  return request("/api/auth/me", { token });
}

/* =========================
   VIDEOS
========================= */
export async function getVideos(token) {
  return request("/api/videos", { token });
}

/* =========================
   PROGRESS
========================= */
export async function apiGetMyProgress(token, videoId) {
  return request(`/api/progress/videos/${videoId}`, { token });
}

export async function apiSendProgress(token, videoId, lastPositionSec) {
  return request(`/api/progress/videos/${videoId}/position`, {
    method: "PATCH",
    token,
    body: { lastPositionSec },
  });
}

/* =========================
   SUBJECT / TOPIC (eski qolgan bo'lishi mumkin)
========================= */
export async function apiGetSubjects(token) {
  return request("/api/subjects", { token });
}

export async function apiGetTopics(token, subjectId) {
  return request(`/api/topics?subject=${subjectId}`, { token });
}

/* =========================
   CURRICULUM (Subject->Grades, Structure)
========================= */
export async function apiGetCurriculumGrades(token, subjectId) {
  return request(`/api/curriculum/subjects/${subjectId}/grades`, { token });
}

export async function apiGetCurriculumStructure(token, subjectId, grade) {
  return request(`/api/curriculum/structure?subject=${subjectId}&grade=${grade}`, {
    token,
  });
}

/* =========================
   PARENT
========================= */
export async function parentGetChildren(token) {
  return request("/api/parents/children", { token });
}

export async function parentLinkChild(token, studentId) {
  return request("/api/parents/link", {
    method: "POST",
    token,
    body: { studentId },
  });
}

export async function parentChildOverview(token, studentId) {
  return request(`/api/parents/children/${studentId}/overview`, { token });
}

/* =========================
   USER AVATAR (student/teacher/parent)
========================= */
export async function apiUploadMyAvatar(token, file) {
  const fd = new FormData();
  fd.append("avatar", file);
  return request("/api/users/me/avatar", {
    method: "POST",
    token,
    body: fd,
    isFormData: true,
  });
}

/* =========================
   ✅ COMPATIBILITY ALIASES
========================= */
export function getApiBase() {
  return API_BASE;
}

export const apiGetVideos = getVideos;
export const parentChildren = parentGetChildren;
export const parentGetOverview = parentChildOverview;
export const parentLink = parentLinkChild;
