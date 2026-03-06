// lib/gemini.js  →  place in src/lib/gemini.js
// Add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local
// Get a free key at https://aistudio.google.com/app/apikey

// gemini-2.5-flash: confirmed free tier on v1beta generateContent
const MODEL  = "gemini-2.5-flash";
const getUrl = () =>
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`;

async function callGemini(prompt, maxTokens = 1024) {
  const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set in .env.local");

  const res = await fetch(getUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: maxTokens,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API error ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}


// ─── 1. TASK DESCRIPTION + SUBTASK GENERATOR ─────────────────────────────────
// Input : task title string
// Output: { description: string, subtasks: string[] }
export async function generateTaskDetails(title) {
  const raw = await callGemini(`
You are a senior project manager AI. Given a short task title, produce a professional task description and 4-6 concrete, actionable subtasks.

Task title: "${title}"

Reply with ONLY valid JSON in exactly this shape — no markdown fences, no extra text:
{"description":"Clear 1-2 sentence task description.","subtasks":["Subtask one","Subtask two","Subtask three","Subtask four","Subtask five"]}
`);
  try {
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    return { description: raw, subtasks: [] };
  }
}

// ─── 2. CHAT / MEETING SUMMARIZER ────────────────────────────────────────────
// Input : messages array — each { senderName?, sender?: { fullname }, content?, message? }
// Output: formatted summary string (markdown-ish, human readable)
export async function summarizeChat(messages) {
  if (!messages.length) throw new Error("No messages to summarize");

  const transcript = messages
    .map((m) => {
      const name    = m.senderName || m.sender?.fullname || "Team member";
      const content = m.content    || m.message          || "";
      return `${name}: ${content}`;
    })
    .join("\n");

  return callGemini(`
You are a scrum-master AI. Read this team chat and produce a concise meeting summary.

Structure your reply exactly like this (use the emoji headers):
💬 Key Discussion Points
• point one
• point two

✅ Decisions Made
• decision one

📋 Action Items
• action item (owner if mentioned)

🚧 Blockers / Risks
• any blockers, or "None mentioned"

Conversation:
${transcript}
`, 800);
}

// ─── 3. NATURAL-LANGUAGE → TASK LIST (Notion/Linear style) ──────────────────
// Input : free-form text
// Output: { tasks: [{ title, priority }] }
export async function extractTasksFromText(text) {
  const raw = await callGemini(`
You are a project management AI. Extract every distinct actionable task from the text below.
Each task title must start with a verb. Priority must be High, Medium, or Low.
Return ONLY valid JSON — no markdown, no extra text:
{"tasks":[{"title":"Verb-led task title","priority":"High"}]}

Limit: 8 tasks max. Ignore vague/non-actionable phrases.

Text: "${text}"
`);
  try {
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return parsed.tasks || [];
  } catch {
    return [];
  }
}

// ─── 4. PRODUCTIVITY INSIGHT GENERATOR ───────────────────────────────────────
// Input : dashboard stats object
// Output: insight string (2-4 sentences)
export async function generateProductivityInsight(stats) {
  const {
    totalTask = 0, completedTask = 0, notcompletedTask = 0,
    highPriority = 0, counttaskWithAssignEmails = [],
  } = stats;

  const pct = totalTask ? Math.round((completedTask / totalTask) * 100) : 0;
  const top = [...counttaskWithAssignEmails]
    .sort((a, b) => b.completeCount - a.completeCount)[0];

  return callGemini(`
You are a productivity coach AI. Write 2-4 sentences of genuine, specific insight about this project's progress.
Be encouraging but honest. Mention patterns, suggest next steps. Do NOT just repeat the numbers.
Start your reply with the emoji 📊.

Stats:
- Total tasks: ${totalTask}
- Completed: ${completedTask} (${pct}%)
- Pending: ${notcompletedTask}
- High-priority tasks: ${highPriority}
- Top contributor: ${top ? `${top.email?.split("@")[0]} — ${top.completeCount} done, ${top.incompleteCount} left` : "none"}
`, 300);
}

// ─── 5. DAILY STANDUP REPORT ─────────────────────────────────────────────────
// Input : activity logs array — each { user: { fullname }, action, meta, createdAt }
// Output: formatted standup string
export async function generateStandupReport(logs) {
  if (!logs.length) throw new Error("No activity logs available for today");

  // Group by person and format concisely
  const byPerson = {};
  for (const log of logs) {
    const name = log.user?.fullname || "Unknown";
    if (!byPerson[name]) byPerson[name] = [];
    const meta  = typeof log.meta === "string" ? JSON.parse(log.meta || "{}") : (log.meta || {});
    const label = [
      log.action?.replace(/_/g, " ").toLowerCase(),
      meta.taskTitle || meta.title || meta.projectName || meta.fileName || "",
    ].filter(Boolean).join(": ");
    byPerson[name].push(label);
  }

  const summary = Object.entries(byPerson)
    .map(([name, items]) => `${name}:\n${items.map((i) => `  - ${i}`).join("\n")}`)
    .join("\n\n");

  return callGemini(`
You are a scrum master AI. Convert these activity logs into a daily standup report for the team.
Format it like a real standup: what each person completed and what they are working on next.
Group by person. Add a 🚧 Blockers section at the end (infer from context or write "None reported").
Use clean bullet points.

Activity logs:
${summary}
`, 600);
}

// ─── 6. MEETING NOTES → TASKS ─────────────────────────────────────────────────
// Input : raw meeting notes string (any format)
// Output: { tasks: [{ title, priority, assigneeHint?, notes? }] }
export async function extractTasksFromMeetingNotes(notes) {
  const raw = await callGemini(`
You are a senior project manager AI. Carefully read these meeting notes and extract every actionable task or decision that requires follow-up work.

Rules:
- Each task title must start with an action verb (Build, Fix, Design, Write, Review, Schedule, etc.)
- Include a short "notes" field (1 sentence max) with context from the meeting if available
- Priority: High if urgent/blocking/deadline mentioned, Medium by default, Low if "nice to have"
- assigneeHint: extract the person's name if the task was explicitly assigned to someone, otherwise null
- Return 3–10 tasks max. Skip vague/non-actionable items.
- Return ONLY valid JSON — no markdown fences, no preamble:

{"tasks":[{"title":"Verb-led task title","priority":"High","notes":"Optional context from meeting","assigneeHint":null}]}

Meeting notes:
"""
${notes}
"""
`, 1024);
  try {
    const parsed = JSON.parse(raw.replace(/\`\`\`json|\`\`\`/g, "").trim());
    return parsed.tasks || [];
  } catch {
    return [];
  }
}

// ─── 7. SMART DIGEST ──────────────────────────────────────────────────────────
// Input : { user: { fullname }, projects: [{ projectName, totalTask, completedTask, tasks[] }], recentLogs[] }
// Output: personalized digest string
export async function generateSmartDigest({ user, projects, recentLogs }) {
  const projectSummary = projects.map((p) => {
    const overdue = (p.tasks || []).filter((t) => {
      if (t.mark_complete) return false;
      return t.dueDate && new Date(t.dueDate) < new Date();
    });
    const myTasks = (p.tasks || []).filter((t) => !t.mark_complete);
    return `Project: ${p.projectName} — ${p.completedTask}/${p.totalTask} tasks done${overdue.length ? `, ${overdue.length} overdue` : ""}${myTasks.length ? `, ${myTasks.length} pending` : ""}`;
  }).join("\n");

  const recentActivity = recentLogs.slice(0, 15).map((l) => {
    const meta = typeof l.meta === "string" ? JSON.parse(l.meta || "{}") : (l.meta || {});
    return `• ${l.action?.replace(/_/g, " ").toLowerCase()}: ${meta.taskTitle || meta.subtaskTitle || meta.fileName || meta.projectName || ""}`;
  }).join("\n");

  return callGemini(`
You are a smart work assistant. Write a concise, personalized daily digest for ${user?.fullname || "the user"}.

Structure your response with exactly these sections (use emoji headers):
🌅 Good morning, ${user?.fullname?.split(" ")[0] || "there"}!
[1-2 sentence motivating overview of their day based on the data]

📌 What Needs Your Attention
[2-4 bullet points: overdue tasks, high-priority items, blockers. Be specific.]

✅ Recent Progress
[2-3 bullet points: what was accomplished recently. Be encouraging.]

🎯 Suggested Focus for Today
[1-3 specific, actionable suggestions based on pending work]

Keep it concise, warm, and genuinely useful. Do not just repeat numbers — give real insight.

Data:
${projectSummary}

Recent activity:
${recentActivity}
`, 700);
}