// scheduler.js  →  place in src/scheduler.js (or root next to index.js)
// Runs two jobs:
//   1. Daily at 08:00 — "due today / due tomorrow" alerts
//   2. Daily at 08:05 — "overdue" alerts (past due, incomplete)
//
// Uses node-cron.  Install if not present:  npm install node-cron
// Requires the same nodemailer transporter and io instance as the rest of the app.

import cron        from "node-cron";
import nodemailer  from "nodemailer";
import { PrismaClient } from "@prisma/client";
import { io }      from "./index.js";   // shared Socket.IO instance

const client = new PrismaClient();

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_PASS,
    },
  });

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Push an in-app notification row + real-time socket event */
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

/** Strip time from a Date so we can compare calendar days */
const dayStart = (d) => new Date(new Date(d).setHours(0, 0, 0, 0));

/** Format a date nicely for email bodies */
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

// ─── SHARED EMAIL TEMPLATE ────────────────────────────────────────────────────
function buildAlertEmail({ recipientEmail, userName, tasks, isOverdue }) {
  const accentColor = isOverdue ? "#ef4444" : "#f59e0b";
  const badgeText   = isOverdue ? "OVERDUE"  : "DUE SOON";
  const subject     = isOverdue
    ? `🔴 ${tasks.length} overdue task${tasks.length > 1 ? "s" : ""} need your attention — Nexus`
    : `🟡 ${tasks.length} task${tasks.length > 1 ? "s" : ""} due soon — Nexus`;

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
      <table width="520" cellpadding="0" cellspacing="0"
        style="background:#09090b;border:1px solid #27272a;border-radius:16px;overflow:hidden;max-width:520px">

        <!-- Header -->
        <tr>
          <td style="padding:24px 32px;border-bottom:1px solid #18181b;background:#0a0a0b">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td>
                  <div style="width:32px;height:32px;background:#6366f1;border-radius:8px;
                    text-align:center;line-height:32px;font-size:16px;display:inline-block">⚡</div>
                  <span style="color:#ffffff;font-size:17px;font-weight:700;
                    letter-spacing:-0.3px;vertical-align:middle;margin-left:10px">Nexus</span>
                </td>
                <td align="right">
                  <span style="background:${accentColor}22;border:1px solid ${accentColor}44;
                    color:${accentColor};font-size:11px;font-weight:700;padding:4px 10px;
                    border-radius:20px;letter-spacing:0.05em">${badgeText}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
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
            <table width="100%" cellpadding="0" cellspacing="0">
              ${taskRows}
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:24px 32px;text-align:center">
            <a href="${"https://project-management-gold-phi.vercel.app"}"
              style="display:inline-block;background:#6366f1;color:#fff;font-size:13px;
                font-weight:600;padding:11px 24px;border-radius:10px;text-decoration:none">
              Open Nexus →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:18px 32px;border-top:1px solid #18181b">
            <p style="margin:0;color:#3f3f46;font-size:11px;text-align:center">
              You received this because you have tasks assigned to you in Nexus.
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

// ─── CORE ALERT RUNNER ───────────────────────────────────────────────────────
async function runDueAlerts() {
  try {
    console.log("[scheduler] Running due-date alert check…");

    const now       = new Date();
    const todayStart   = dayStart(now);
    const tomorrowEnd  = new Date(todayStart); tomorrowEnd.setDate(tomorrowEnd.getDate() + 2);  // today + tomorrow
    const overdueEnd   = new Date(todayStart);                                                    // anything before today start

    // ── Fetch all incomplete tasks (main tasks + subtasks) ──────────────────
    const [tasks, subtasks] = await Promise.all([
      client.project_Tasks.findMany({
        where: { mark_complete: false },
      }),
      client.project_SubTasks.findMany({
        where: { mark_complete: false },
      }),
    ]);

    // Normalise to common shape
    const allItems = [
      ...tasks.map((t)    => ({ ...t, _kind: "task",    taskId: t.id,  projectId: t.project_id })),
      ...subtasks.map((s) => ({ ...s, _kind: "subtask", taskId: s.project_Tasks_id, projectId: s.projectId })),
    ];

    // ── Split into overdue vs due-soon ──────────────────────────────────────
    const overdueItems  = allItems.filter((t) => t.dueDate && dayStart(t.dueDate) < todayStart);
    const dueSoonItems  = allItems.filter((t) => t.dueDate && dayStart(t.dueDate) >= todayStart && new Date(t.dueDate) < tomorrowEnd);

    // ── Fetch project names for display ────────────────────────────────────
    const projectIds = [...new Set(allItems.map((t) => t.projectId).filter(Boolean))];
    const projects   = await client.projects.findMany({ where: { id: { in: projectIds } } });
    const projectMap = new Map(projects.map((p) => [p.id, p.projectName]));

    // ── Group by assignee email ─────────────────────────────────────────────
    const groupByAssignee = (items) => {
      const map = new Map();
      for (const item of items) {
        const email = item.assignee_email;
        if (!email) continue;
        if (!map.has(email)) map.set(email, []);
        map.get(email).push({
          ...item,
          projectName: projectMap.get(item.projectId) || "Unknown project",
        });
      }
      return map;
    };

    const overdueByAssignee  = groupByAssignee(overdueItems);
    const dueSoonByAssignee  = groupByAssignee(dueSoonItems);

    // ── Collect all unique assignee emails ─────────────────────────────────
    const allEmails = new Set([...overdueByAssignee.keys(), ...dueSoonByAssignee.keys()]);

    for (const email of allEmails) {
      // Look up user
      const userRecord = await client.user.findFirst({ where: { email } });
      if (!userRecord) continue;

      const userId   = userRecord.id;
      const userName = userRecord.fullname || email;

      const overdueList  = overdueByAssignee.get(email)  || [];
      const dueSoonList  = dueSoonByAssignee.get(email)   || [];

      // ── In-app notifications ────────────────────────────────────────────
      for (const task of overdueList) {
        await pushNotification({
          userId,
          type:      "TASK_DUE",
          message:   `⚠️ Overdue: "${task.title}" was due ${fmtDate(task.dueDate)}`,
          projectId: task.projectId,
          taskId:    task.taskId,
        });
      }
      for (const task of dueSoonList) {
        await pushNotification({
          userId,
          type:      "TASK_DUE",
          message:   `🕐 Due soon: "${task.title}" is due ${fmtDate(task.dueDate)}`,
          projectId: task.projectId,
          taskId:    task.taskId,
        });
      }

      // ── Email — one email per user (combines overdue + due-soon) ────────
      // Send overdue email
      if (overdueList.length) {
        const { subject, html } = buildAlertEmail({ recipientEmail: email, userName, tasks: overdueList, isOverdue: true });
        try {
          await transporter.sendMail({ from: `"Planzo" <planzo.dev@outlook.com>`, to: email, subject, html });
        } catch (mailErr) {
          console.warn(`[scheduler] Overdue email to ${email} failed:`, mailErr.message);
        }
      }

      // Send due-soon email
      if (dueSoonList.length) {
        const { subject, html } = buildAlertEmail({ recipientEmail: email, userName, tasks: dueSoonList, isOverdue: false });
        try {
          await transporter.sendMail({ from: `"Planzo" <planzo.dev@outlook.com>`, to: email, subject, html });
        } catch (mailErr) {
          console.warn(`[scheduler] Due-soon email to ${email} failed:`, mailErr.message);
        }
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
// Runs every day at 08:00 server time
// Cron syntax: minute hour day-of-month month day-of-week
export function startScheduler() {
  cron.schedule("0 8 * * *", () => {
    console.log("[scheduler] 08:00 — triggering due-date alerts");
    runDueAlerts();
  });

  console.log("[scheduler] Registered daily due-alert job (08:00 daily)");

  // Run immediately on startup in dev so you can test without waiting
  if (process.env.NODE_ENV === "development") {
    console.log("[scheduler] DEV mode — running alert check now for testing");
    runDueAlerts();
  }
}