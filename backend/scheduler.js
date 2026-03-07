// scheduler.js
// Runs daily at 08:00 — "due today / due tomorrow" + "overdue" alerts
// npm install node-cron axios

import cron   from "node-cron";
import axios  from "axios";
import { PrismaClient } from "@prisma/client";
import { io } from "./index.js";

const client = new PrismaClient();

// ─── EMAIL via Brevo HTTP API (port 443 — works on Render free tier) ──────────
const sendEmail = async ({ to, subject, html }) => {
  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: { name: "Planzo", email: "planzo.dev@outlook.com" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
async function pushNotification({ userId, type, message, projectId, taskId }) {
  try {
    const notif = await client.notification.create({
      data: {
        user_id:    userId,
        type,
        message,
        project_id: projectId || null,
        task_id:    taskId    || null,
      },
    });
    io?.to(`user:${userId}`).emit("new_notification", notif);
  } catch (e) {
    console.warn("[scheduler] pushNotification error:", e.message);
  }
}

const dayStart = (d) => new Date(new Date(d).setHours(0, 0, 0, 0));
const fmtDate  = (d) => new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

// ─── EMAIL TEMPLATE ───────────────────────────────────────────────────────────
function buildAlertEmail({ userName, tasks, isOverdue }) {
  const accentColor = isOverdue ? "#ef4444" : "#f59e0b";
  const badgeText   = isOverdue ? "OVERDUE"  : "DUE SOON";
  const subject     = isOverdue
    ? `🔴 ${tasks.length} overdue task${tasks.length > 1 ? "s" : ""} need your attention — Planzo`
    : `🟡 ${tasks.length} task${tasks.length > 1 ? "s" : ""} due soon — Planzo`;

  const taskRows = tasks.map((t) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #1c1c1f;">
        <p style="margin:0 0 4px;color:#fafafa;font-size:14px;font-weight:600">${t.title}</p>
        <p style="margin:0;color:#71717a;font-size:12px">
          Project: <span style="color:#a1a1aa">${t.projectName}</span>
          &nbsp;·&nbsp;
          Due: <span style="color:${accentColor};font-weight:600">${fmtDate(t.dueDate)}</span>
          &nbsp;·&nbsp;
          Priority: <span style="color:#a1a1aa">${t.priority}</span>
        </p>
      </td>
    </tr>`).join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Segoe UI',system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 20px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#09090b;border:1px solid #27272a;border-radius:16px;overflow:hidden;max-width:520px">
        <tr>
          <td style="padding:24px 32px;border-bottom:1px solid #18181b;background:#0a0a0b">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td>
                  <div style="width:32px;height:32px;background:#6366f1;border-radius:8px;text-align:center;line-height:32px;font-size:16px;display:inline-block">⚡</div>
                  <span style="color:#ffffff;font-size:17px;font-weight:700;margin-left:10px;vertical-align:middle">Planzo</span>
                </td>
                <td align="right">
                  <span style="background:${accentColor}22;border:1px solid ${accentColor}44;color:${accentColor};font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;letter-spacing:0.05em">${badgeText}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px 0">
            <h1 style="margin:0 0 8px;color:#fafafa;font-size:20px;font-weight:700">
              ${isOverdue ? "You have overdue tasks" : "Tasks due soon"}
            </h1>
            <p style="margin:0 0 24px;color:#71717a;font-size:14px;line-height:1.6">
              Hi <strong style="color:#a1a1aa">${userName}</strong>,
              ${isOverdue
                ? " the following tasks are past their due date and still incomplete."
                : " the following tasks are due today or tomorrow — stay on track!"}
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">${taskRows}</table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px;text-align:center">
            <a href="https://project-management-gold-phi.vercel.app"
              style="display:inline-block;background:#6366f1;color:#fff;font-size:13px;font-weight:600;padding:11px 24px;border-radius:10px;text-decoration:none">
              Open Planzo →
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px;border-top:1px solid #18181b">
            <p style="margin:0;color:#3f3f46;font-size:11px;text-align:center">
              You received this because you have tasks assigned to you in Planzo.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

// ─── CORE ALERT RUNNER ────────────────────────────────────────────────────────
async function runDueAlerts() {
  try {
    console.log("[scheduler] Running due-date alert check…");

    const now          = new Date();
    const todayStart   = dayStart(now);
    const tomorrowEnd  = new Date(todayStart); tomorrowEnd.setDate(tomorrowEnd.getDate() + 2);

    const [tasks, subtasks] = await Promise.all([
      client.project_Tasks.findMany({ where: { mark_complete: false } }),
      client.project_SubTasks.findMany({ where: { mark_complete: false } }),
    ]);

    const allItems = [
      ...tasks.map((t)    => ({ ...t, _kind: "task",    taskId: t.id,  projectId: t.project_id })),
      ...subtasks.map((s) => ({ ...s, _kind: "subtask", taskId: s.project_Tasks_id, projectId: s.projectId })),
    ];

    const overdueItems = allItems.filter((t) => t.dueDate && dayStart(t.dueDate) < todayStart);
    const dueSoonItems = allItems.filter((t) => t.dueDate && dayStart(t.dueDate) >= todayStart && new Date(t.dueDate) < tomorrowEnd);

    const projectIds = [...new Set(allItems.map((t) => t.projectId).filter(Boolean))];
    const projects   = await client.projects.findMany({ where: { id: { in: projectIds } } });
    const projectMap = new Map(projects.map((p) => [p.id, p.projectName]));

    const groupByAssignee = (items) => {
      const map = new Map();
      for (const item of items) {
        const email = item.assignee_email;
        if (!email) continue;
        if (!map.has(email)) map.set(email, []);
        map.get(email).push({ ...item, projectName: projectMap.get(item.projectId) || "Unknown project" });
      }
      return map;
    };

    const overdueByAssignee = groupByAssignee(overdueItems);
    const dueSoonByAssignee = groupByAssignee(dueSoonItems);
    const allEmails = new Set([...overdueByAssignee.keys(), ...dueSoonByAssignee.keys()]);

    for (const email of allEmails) {
      const userRecord = await client.user.findFirst({ where: { email } });
      if (!userRecord) continue;

      const userId   = userRecord.id;
      const userName = userRecord.fullname || email;

      const overdueList = overdueByAssignee.get(email) || [];
      const dueSoonList = dueSoonByAssignee.get(email) || [];

      for (const task of overdueList) {
        await pushNotification({ userId, type: "TASK_DUE", message: `⚠️ Overdue: "${task.title}" was due ${fmtDate(task.dueDate)}`, projectId: task.projectId, taskId: task.taskId });
      }
      for (const task of dueSoonList) {
        await pushNotification({ userId, type: "TASK_DUE", message: `🕐 Due soon: "${task.title}" is due ${fmtDate(task.dueDate)}`, projectId: task.projectId, taskId: task.taskId });
      }

      if (overdueList.length) {
        const { subject, html } = buildAlertEmail({ userName, tasks: overdueList, isOverdue: true });
        sendEmail({ to: email, subject, html }).catch(err =>
          console.warn(`[scheduler] Overdue email to ${email} failed:`, err.message)
        );
      }

      if (dueSoonList.length) {
        const { subject, html } = buildAlertEmail({ userName, tasks: dueSoonList, isOverdue: false });
        sendEmail({ to: email, subject, html }).catch(err =>
          console.warn(`[scheduler] Due-soon email to ${email} failed:`, err.message)
        );
      }
    }

    console.log(
      `[scheduler] Done — overdue: ${overdueItems.length} tasks across ${overdueByAssignee.size} users, ` +
      `due-soon: ${dueSoonItems.length} tasks across ${dueSoonByAssignee.size} users`
    );
  } catch (e) {
    console.error("[scheduler] runDueAlerts error:", e);
  }
}

// ─── SCHEDULE ────────────────────────────────────────────────────────────────
export function startScheduler() {
  cron.schedule("0 8 * * *", () => {
    console.log("[scheduler] 08:00 — triggering due-date alerts");
    runDueAlerts();
  });

  console.log("[scheduler] Registered daily due-alert job (08:00 daily)");

  if (process.env.NODE_ENV === "development") {
    console.log("[scheduler] DEV mode — running alert check now for testing");
    runDueAlerts();
  }
}