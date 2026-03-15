const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function apiFetch(path, { token, method = "GET", body, isForm = false } = {}) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      (data && data.message) ||
      (typeof data === "string" ? data : "") ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

async function tryApiFetch(paths, opts) {
  let lastErr = null;
  for (const p of paths) {
    try {
      return await apiFetch(p, opts);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Request failed");
}

/* ---------------- Profile ---------------- */
export async function fetchTeacherProfile(token) {
  return await tryApiFetch(
    ["/api/teachers/me", "/api/users/me", "/api/users/me", "/api/profile"],
    { token }
  );
}

export async function updateTeacherProfile(token, payload) {
  // backendda teacher update PUT /api/teachers/me, ba’zida PATCH bo‘lishi mumkin
  return await tryApiFetch(
    ["/api/teachers/me", "/api/users/me", "/api/users/me", "/api/profile"],
    { token, method: "PUT", body: payload }
  );
}

export async function uploadTeacherAvatar(token, avatarFile) {
  const fd = new FormData();
  // backend: uploadAvatar.single("avatar")
  fd.append("avatar", avatarFile);

  return await tryApiFetch(
    ["/api/teachers/me/avatar", "/api/users/me/avatar", "/api/profile/avatar"],
    { token, method: "POST", body: fd, isForm: true }
  );
}

/* ---------------- Subjects / Topics ---------------- */
export async function fetchSubjects(token, grade) {
  return await apiFetch(`/api/subjects?grade=${encodeURIComponent(String(grade))}`, { token });
}

export async function fetchTopics(token, { subjectId, grade }) {
  return await apiFetch(
    `/api/topics?subjectId=${encodeURIComponent(String(subjectId))}&grade=${encodeURIComponent(String(grade))}`,
    { token }
  );
}

/* ---------------- Videos ---------------- */
export async function fetchMyVideos(token, { grade, subjectId, topicId } = {}) {
  const q = new URLSearchParams();
  if (grade) q.set("grade", String(grade));
  if (subjectId) q.set("subjectId", String(subjectId));
  if (topicId) q.set("topicId", String(topicId));

  // ba’zi backendlarda teacher videos endpoint /api/teachers/videos bo‘ladi
  return await tryApiFetch(
    [`/api/videos/mine?${q.toString()}`, `/api/teachers/videos?${q.toString()}`],
    { token }
  );
}

export async function uploadVideo(token, { title, topicId, file }) {
  const fd = new FormData();
  fd.append("title", title || file?.name || "Video");
  fd.append("topicId", topicId);
  fd.append("file", file);

  return await apiFetch("/api/videos/upload", { token, method: "POST", body: fd, isForm: true });
}

/* ---------------- Assignments ---------------- */
export async function fetchTeacherAssignments(token) {
  return await apiFetch("/api/assignments/teacher", { token });
}

export async function createTeacherAssignment(token, payload) {
  return await apiFetch("/api/assignments/teacher", {
    token,
    method: "POST",
    body: payload,
  });
}

export async function addTeacherQuestion(token, assignmentId, payload) {
  return await apiFetch(`/api/assignments/teacher/${assignmentId}/questions`, {
    token,
    method: "POST",
    body: payload,
  });
}

export async function publishTeacherAssignment(token, assignmentId) {
  return await apiFetch(`/api/assignments/teacher/${assignmentId}/publish`, {
    token,
    method: "PATCH",
  });
}

/* ---------------- PDF tasks ---------------- */
export async function uploadPdfTasks(token, { topicId, pdfFile }) {
  const fd = new FormData();
  fd.append("topicId", topicId);
  fd.append("file", pdfFile);

  // endpoint bo‘lmasa tryApiFetch bilan kengaytiramiz
  return await tryApiFetch(
    ["/api/tasks/pdf"],
    { token, method: "POST", body: fd, isForm: true }
  );
}
