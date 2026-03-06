// lib/api.js
// ─── EVERY URL here matches the backend routes exactly ─────────────────────
// Backend mount points:
//   app.use("/api/v1/auth/user",    userAuthRoute)   → routes/user.auth.routes.js
//   app.use("/api/v1/user",         userRoute)        → routes/user.routes.js
//   app.use("/api/v1",              projectRoute)     → routes/project.routes.js
//   app.use("/api/v1/task",         tasksRoute)       → routes/project.tasks.route.js
//   app.use("/api/v1/files",        filesRoute)       → routes/project.files.routes.js
//   app.use("/api/v1/comments",     commentsRoute)    → routes/comments.routes.js
//   app.use("/api/v1/notifications",notificationsRoute)
//   app.use("/api/v1/activity",     activityRoute)
//   app.use("/api/v1/chat",         chatRoute)
//   app.use("/api/v1/search",       searchRoute)

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
// const BASE_URL =  "https://planzo-project-management.onrender.com/api/v1";


// ─── TOKEN HELPERS ──────────────────────────────────────────────────────────
export const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("nexus_token") : null;

export const getUserId = () =>
  typeof window !== "undefined" ? localStorage.getItem("nexus_user_id") : null;

export const setAuth = (token, userId) => {
  localStorage.setItem("nexus_token", token);
  localStorage.setItem("nexus_user_id", userId);
};

export const clearAuth = () => {
  localStorage.removeItem("nexus_token");
  localStorage.removeItem("nexus_user_id");
};

// ─── BASE REQUEST ───────────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

// For multipart file uploads (no Content-Type header — browser sets boundary)
async function upload(path, formData) {
  const token = getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${BASE_URL}${path}`, { method: "POST", headers, body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

// ─── API ────────────────────────────────────────────────────────────────────
export const api = {

  // ─── AUTH  →  /api/v1/auth/user/* ────────────────────────────────────────
  auth: {
    // POST /auth/user/register        body: { email, password }
    register: (email, password) =>
      request("/auth/user/register", { method: "POST", body: JSON.stringify({ email, password }) }),

    // POST /auth/user/login           body: { email, password }
    login: (email, password) =>
      request("/auth/user/login", { method: "POST", body: JSON.stringify({ email, password }) }),

    // POST /auth/user/logout
    logout: () =>
      request("/auth/user/logout", { method: "POST" }),

    // POST /auth/user/verify/:id      body: { otp }
    verifyEmail: (id, otp) =>
      request(`/auth/user/verify/${id}`, { method: "POST", body: JSON.stringify({ otp }) }),

    // POST /auth/user/resend-otp/:id
    resendOtp: (id) =>
      request(`/auth/user/resend-otp/${id}`, { method: "POST" }),

    // POST /auth/user/setup/:id       multipart FormData (file + fullname + myrole)
    accountSetup: (id, formData) =>
      upload(`/auth/user/setup/${id}`, formData),
  },

  // ─── USERS  →  /api/v1/user/* ────────────────────────────────────────────
  users: {
    // GET /user/:id  →  returns { user }
    getById: (id) =>
      request(`/user/${id}`),

    // GET /user/:userId/projects  →  returns { OwnerProject, MemberProject }
    getAllProjects: (userId) =>
      request(`/user/${userId}/projects`),
  },

  // ─── PROJECTS  →  /api/v1/project/* and /api/v1/projects/* ───────────────
  projects: {
    // POST /project/:userid           body: { projectName, description, views[] }
    create: (userId, data) =>
      request(`/project/${userId}`, { method: "POST", body: JSON.stringify(data) }),

    // GET  /projects/:userid          → { OwnerProject[], MemberProject[] }
    getAll: (userId) =>
      request(`/projects/${userId}`),

    // GET  /project/:projectId        → { project }
    getById: (projectId) =>
      request(`/project/${projectId}`),

    // GET  /project/:projectId/members → { member[] }
    getMembers: (projectId) =>
      request(`/project/${projectId}/members`),

    // GET  /project/:projectId/views  → { views }
    getViews: (projectId) =>
      request(`/project/${projectId}/views`),

    // GET  /project/:userId/:projectId/detail  → { projectDetail, projectMember[], projectViews, userRole }
    getDetail: (userId, projectId) =>
      request(`/project/${userId}/${projectId}/detail`),

    // GET  /project/:userId/:projectId/timeline → { timeline[] }
    getTimeline: (userId, projectId) =>
      request(`/project/${userId}/${projectId}/timeline`),

    // POST /project/:userId/:projectId/invite   body: { inviteEmail[], role }
    inviteMember: (userId, projectId, data) =>
      request(`/project/${userId}/${projectId}/invite`, { method: "POST", body: JSON.stringify(data) }),

    // PATCH /project/:projectId/role            body: { email, newRole }
    updateRole: (projectId, email, newRole) =>
      request(`/project/${projectId}/role`, { method: "PATCH", body: JSON.stringify({ email, newRole }) }),

    // POST  /project/:userId/:projectId/send-digest  body: { digest, projectName }
    sendDigest: (userId, projectId, digest, projectName) =>
      request(`/project/${userId}/${projectId}/send-digest`, { method: "POST", body: JSON.stringify({ digest, projectName }) }),
  },

  // ─── TASKS  →  /api/v1/task/* ────────────────────────────────────────────
  tasks: {
    // POST  /task/:userId/:projectId            body: { tasks[] }
    add: (userId, projectId, tasks) =>
      request(`/task/${userId}/${projectId}`, { method: "POST", body: JSON.stringify({ tasks }) }),

    // POST  /task/subtask/:userId/:projectId    body: { subtasks[] }
    addSubtasks: (userId, projectId, subtasks) =>
      request(`/task/subtask/${userId}/${projectId}`, { method: "POST", body: JSON.stringify({ subtasks }) }),

    // GET   /task/my-created/:userId            → { tasks[] }
    getMyCreated: (userId) =>
      request(`/task/my-created/${userId}`),

    // GET   /task/assigned/:userId              → { tasks[] }
    getAssigned: (userId) =>
      request(`/task/assigned/${userId}`),

    // GET   /task/:userId/:projectId/all        → { TasksDetail[] }  (tasks with subtasks[])
    getAllWithSubtasks: (userId, projectId) =>
      request(`/task/${userId}/${projectId}/all`),

    // PATCH /task/complete/:userId/:projectId   body: { taskId }
    markComplete: (userId, projectId, taskId) =>
      request(`/task/complete/${userId}/${projectId}`, { method: "PATCH", body: JSON.stringify({ taskId }) }),

    // PATCH /task/subtask/complete/:userId/:projectId  body: { subtaskId }
    markSubtaskComplete: (userId, projectId, subtaskId) =>
      request(`/task/subtask/complete/${userId}/${projectId}`, { method: "PATCH", body: JSON.stringify({ subtaskId }) }),

    // PUT   /task/edit/:userId/:projectId       body: { tasks[] }
    edit: (userId, projectId, tasks) =>
      request(`/task/edit/${userId}/${projectId}`, { method: "PUT", body: JSON.stringify({ tasks }) }),

    // PUT   /task/subtask/edit/:userId/:projectId  body: { subtasks[] }
    editSubtasks: (userId, projectId, subtasks) =>
      request(`/task/subtask/edit/${userId}/${projectId}`, { method: "PUT", body: JSON.stringify({ subtasks }) }),

    // GET   /task/:userId/:projectId/dashboard  → { totalTask, completedTask, ... }
    dashboard: (userId, projectId) =>
      request(`/task/${userId}/${projectId}/dashboard`),
  },

  // ─── FILES  →  /api/v1/files/* ───────────────────────────────────────────
  files: {
    // POST   /files/upload/:userId/:projectId/:taskId   multipart FormData
    upload: (userId, projectId, taskId, formData) =>
      upload(`/files/upload/${userId}/${projectId}/${taskId}`, formData),

    // GET    /files/project/:projectId                  → { files[] }
    getByProject: (projectId) =>
      request(`/files/project/${projectId}`),

    // GET    /files/task/:taskId                        → { files[] }
    getByTask: (taskId) =>
      request(`/files/task/${taskId}`),

    // DELETE /files/:fileId/user/:userId
    delete: (fileId, userId) =>
      request(`/files/${fileId}/user/${userId}`, { method: "DELETE" }),
  },

  // ─── COMMENTS  →  /api/v1/comments/* ────────────────────────────────────
  comments: {
    // POST   /comments/:userId/:projectId/:taskId   body: { content, parentCommentId? }
    add: (userId, projectId, taskId, content, parentCommentId) =>
      request(`/comments/${userId}/${projectId}/${taskId}`, {
        method: "POST",
        body: JSON.stringify({ content, parentCommentId }),
      }),

    // GET    /comments/task/:taskId                 → { comments[] }
    getByTask: (taskId) =>
      request(`/comments/task/${taskId}`),

    // PATCH  /comments/:commentId/user/:userId      body: { content }
    edit: (commentId, userId, content) =>
      request(`/comments/${commentId}/user/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ content }),
      }),

    // DELETE /comments/:commentId/user/:userId
    delete: (commentId, userId) =>
      request(`/comments/${commentId}/user/${userId}`, { method: "DELETE" }),
  },

  // ─── NOTIFICATIONS  →  /api/v1/notifications/* ───────────────────────────
  notifications: {
    // GET    /notifications/:userId?page=1&limit=20   → { notifications[], unreadCount }
    getAll: (userId, page = 1, limit = 20) =>
      request(`/notifications/${userId}?page=${page}&limit=${limit}`),

    // PATCH  /notifications/:notificationId/user/:userId/read
    markRead: (notificationId, userId) =>
      request(`/notifications/${notificationId}/user/${userId}/read`, { method: "PATCH" }),

    // PATCH  /notifications/:userId/read-all
    markAllRead: (userId) =>
      request(`/notifications/${userId}/read-all`, { method: "PATCH" }),

    // DELETE /notifications/:notificationId/user/:userId
    delete: (notificationId, userId) =>
      request(`/notifications/${notificationId}/user/${userId}`, { method: "DELETE" }),

    // DELETE /notifications/:userId/clear-all
    clearAll: (userId) =>
      request(`/notifications/${userId}/clear-all`, { method: "DELETE" }),
  },

  // ─── ACTIVITY  →  /api/v1/activity/* ────────────────────────────────────
  activity: {
    // GET /activity/project/:projectId?page=1   → { logs[] }
    getByProject: (projectId, page = 1) =>
      request(`/activity/project/${projectId}?page=${page}`),

    // GET /activity/task/:taskId                → { logs[] }
    getByTask: (taskId) =>
      request(`/activity/task/${taskId}`),

    // GET /activity/user/:userId                → { logs[] }
    getByUser: (userId) =>
      request(`/activity/user/${userId}`),
  },

  // ─── CHAT  →  /api/v1/chat/* ─────────────────────────────────────────────
  chat: {
    // GET   /chat/:projectId/history?page=1&limit=50   → { messages[], total }
    getHistory: (projectId, page = 1) =>
      request(`/chat/${projectId}/history?page=${page}&limit=50`),

    // PATCH /chat/:messageId/user/:userId              body: { content }
    editMessage: (messageId, userId, content) =>
      request(`/chat/${messageId}/user/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ content }),
      }),

    // DELETE /chat/:messageId/user/:userId
    deleteMessage: (messageId, userId) =>
      request(`/chat/${messageId}/user/${userId}`, { method: "DELETE" }),
  },

  // ─── SEARCH  →  /api/v1/search/* ─────────────────────────────────────────
  search: {
    // GET /search/global/:userId?q=keyword&type=projects|tasks|members
    global: (userId, q, type) =>
      request(`/search/global/${userId}?q=${encodeURIComponent(q)}${type ? `&type=${type}` : ""}`),

    // GET /search/project/:projectId/tasks?q=&status=&priority=&assignee=&startDate=&dueDate=
    projectTasks: (projectId, params) =>
      request(`/search/project/${projectId}/tasks?${new URLSearchParams(params).toString()}`),
  },
};