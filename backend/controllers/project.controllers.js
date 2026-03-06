import client from "../prisma.js";
import { z } from "zod";
import nodemailer from "nodemailer";
import { io } from "../index.js";
import { createActivityLog } from "./activity.controllers.js";

// ─── NOTIFICATION HELPER ──────────────────────────────────────────────────────
async function pushNotification({ userId, type, message, projectId = null, taskId = null }) {
  try {
    const notif = await client.notification.create({
      data: { user_id: userId, type, message, project_id: projectId, task_id: taskId },
    });
    io?.to(`user:${userId}`).emit("new_notification", notif);
  } catch (e) {
    console.warn("pushNotification failed:", e.message);
  }
}

// Notify every member of a project (optionally skip one userId)
async function notifyProjectMembers({ projectId, type, message, skipUserId = null }) {
  try {
    const members = await client.project_Members.findMany({ where: { projectId } });
    for (const m of members) {
      const user = await client.user.findFirst({ where: { email: m.emailuser } });
      if (!user || user.id === skipUserId) continue;
      await pushNotification({ userId: user.id, type, message, projectId });
    }
  } catch (e) {
    console.warn("notifyProjectMembers failed:", e.message);
  }
}

// ─── EMAIL TRANSPORTER ────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── CREATE PROJECT ──────────────────────────────────────────────────────────
export const createNewProject = async (req, res) => {
  try {
    const reqBody = z.object({
      projectName: z.string().min(2).max(100),
      description: z.string().min(2).max(500),
      views: z
        .array(
          z.enum([
            "Overview","Board","List","Timeline","Dashboard",
            "Gantt","Calendar","Note","Workload","Files","Messages",
          ])
        )
        .default(["List"]),
    });

    const parse = reqBody.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, message: "Validation failed", error: parse.error.issues });
    }

    const { projectName, description, views = [] } = req.body;
    const userid = req.params.userid;

    const user = await client.user.findFirst({ where: { id: userid } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const oldProject = await client.projects.findFirst({
      where: { ownerId: userid, projectName },
    });
    if (oldProject) {
      return res.status(409).json({ success: false, message: "You already have a project with this name" });
    }

    const project = await client.projects.create({
      data: { projectName, description, ownerId: userid },
    });

    // Add owner as OWNER member
    await client.project_Members.create({
      data: { projectId: project.id, role: "OWNER", emailuser: user.email },
    });

    // Create project views
    const updatedViews = await client.projectViews.create({
      data: {
        project_id: project.id,
        Overview:  views.includes("Overview"),
        Board:     views.includes("Board"),
        List:      views.includes("List") || views.length === 0, // default List on
        Timeline:  views.includes("Timeline"),
        Dashboard: views.includes("Dashboard"),
        Gantt:     views.includes("Gantt"),
        Calendar:  views.includes("Calendar"),
        Note:      views.includes("Note"),
        Workload:  views.includes("Workload"),
        Files:     views.includes("Files"),
        Messages:  views.includes("Messages"),
      },
    });

    await createActivityLog({ userId: userid, projectId: project.id, action: "PROJECT_CREATED", meta: { projectName } });

    return res.status(201).json({ success: true, project, views: updatedViews });
  } catch (e) {
    console.error("createNewProject:", e);
    return res.status(500).json({ success: false, message: "Error creating project" });
  }
};

// ─── GET ALL PROJECTS OF USER ─────────────────────────────────────────────────
// BUG FIX: original used async inside .map() which doesn't await — replaced with for...of
export const getAllProjectsOfUser = async (req, res) => {
  try {
    const userid = req.params.userid;
    if (!userid) return res.status(400).json({ success: false, message: "User ID required" });

    const user = await client.user.findFirst({ where: { id: userid } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Projects user OWNS
    const OwnerProject = await client.projects.findMany({
      where: { ownerId: userid },
      orderBy: { createdAt: "desc" },
    });

    // Projects user is a MEMBER of (but doesn't own)
    const memberships = await client.project_Members.findMany({
      where: { emailuser: user.email },
    });

    // Filter out owned projects and fetch details
    const MemberProject = [];
    for (const m of memberships) {
      if (OwnerProject.find((p) => p.id === m.projectId)) continue; // skip owned
      const proj = await client.projects.findFirst({ where: { id: m.projectId } });
      if (proj) MemberProject.push(proj);
    }

    return res.status(200).json({ success: true, OwnerProject, MemberProject });
  } catch (e) {
    console.error("getAllProjectsOfUser:", e);
    return res.status(500).json({ success: false, message: "Error fetching projects" });
  }
};

// ─── GET PROJECT BY ID ────────────────────────────────────────────────────────
export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await client.projects.findFirst({ where: { id: projectId } });
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    return res.status(200).json({ success: true, project });
  } catch (e) {
    console.error("getProjectById:", e);
    return res.status(500).json({ success: false, message: "Error fetching project" });
  }
};

// ─── GET ALL MEMBERS ──────────────────────────────────────────────────────────
export const getAllMemberOfProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const members = await client.project_Members.findMany({ where: { projectId } });
    return res.status(200).json({ success: true, member: members });
  } catch (e) {
    console.error("getAllMemberOfProject:", e);
    return res.status(500).json({ success: false, message: "Error fetching members" });
  }
};

// ─── GET VIEWS ────────────────────────────────────────────────────────────────
export const getViewsOfProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const views = await client.projectViews.findFirst({ where: { project_id: projectId } });
    return res.status(200).json({ success: true, views });
  } catch (e) {
    console.error("getViewsOfProject:", e);
    return res.status(500).json({ success: false, message: "Error fetching views" });
  }
};

// ─── GET COMPLETE PROJECT DETAIL ──────────────────────────────────────────────
export const getCompleteDetailOfProject = async (req, res) => {
  try {
    const { userId, projectId } = req.params;

    const projectDetail = await client.projects.findFirst({ where: { id: projectId } });
    if (!projectDetail) return res.status(404).json({ success: false, message: "Project not found" });

    const members = await client.project_Members.findMany({ where: { projectId } });

    // Enrich members with user details
    const projectMember = await Promise.all(
      members.map(async (m) => {
        const userDetail = await client.user.findFirst({
          where: { email: m.emailuser },
          select: { fullname: true, profile: true, email: true },
        });
        return {
          id: m.id,
          projectId: m.projectId,
          role: m.role,
          emailuser: m.emailuser,
          joinedAt: m.joinedAt,
          fullname: userDetail?.fullname || m.emailuser,
          profile: userDetail?.profile || null,
        };
      })
    );

    const projectViews = await client.projectViews.findFirst({ where: { project_id: projectId } });

    // Current user's role in project
    const currentUser = await client.user.findFirst({ where: { id: userId } });
    const currentMember = members.find((m) => m.emailuser === currentUser?.email);
    const userRole = currentMember?.role || "VIEWER";

    return res.status(200).json({
      success: true,
      projectDetail,
      projectMember,
      projectViews,
      userRole,
    });
  } catch (e) {
    console.error("getCompleteDetailOfProject:", e);
    return res.status(500).json({ success: false, message: "Error fetching project detail" });
  }
};

// ─── GET TIMELINE ─────────────────────────────────────────────────────────────
export const getProjectTimeline = async (req, res) => {
  try {
    const { userId, projectId } = req.params;

    const projectDetail = await client.projects.findFirst({ where: { id: projectId } });
    if (!projectDetail) return res.status(404).json({ success: false, message: "Project not found" });

    const projectMembers = await client.project_Members.findMany({ where: { projectId } });
    const emails = projectMembers.map((m) => m.emailuser);
    const users = await client.user.findMany({ where: { email: { in: emails } } });
    const userMap = new Map(users.map((u) => [u.email, u]));

    const timeline = [
      { type: "Project created", createdTime: projectDetail.createdAt },
      ...projectMembers
        .filter((m) => m.joinedAt)
        .map((m) => ({
          type: "Member joined",
          email: m.emailuser,
          role: m.role,
          createdTime: m.joinedAt,
          fullname: userMap.get(m.emailuser)?.fullname || m.emailuser,
          profile: userMap.get(m.emailuser)?.profile || null,
        })),
    ].sort((a, b) => new Date(a.createdTime) - new Date(b.createdTime));

    return res.status(200).json({ success: true, timeline });
  } catch (e) {
    console.error("getProjectTimeline:", e);
    return res.status(500).json({ success: false, message: "Error fetching timeline" });
  }
};

// ─── INVITE MEMBER ────────────────────────────────────────────────────────────
export const sendingInviteToAddMemberToProject = async (req, res) => {
  try {
    const { userId, projectId } = req.params;
    const { inviteEmail, role } = req.body;

    // Validate inputs
    if (!inviteEmail || !Array.isArray(inviteEmail) || inviteEmail.length === 0) {
      return res.status(400).json({ success: false, message: "inviteEmail array is required" });
    }
    if (!role) {
      return res.status(400).json({ success: false, message: "role is required" });
    }

    const inviter = await client.user.findFirst({ where: { id: userId } });
    if (!inviter) return res.status(404).json({ success: false, message: "Inviter not found" });

    const project = await client.projects.findFirst({ where: { id: projectId } });
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    // Check inviter has permission
    const inviterMembership = await client.project_Members.findFirst({
      where: { projectId, emailuser: inviter.email },
    });
    if (!inviterMembership || !["OWNER", "ADMIN"].includes(inviterMembership.role)) {
      return res.status(403).json({ success: false, message: "Only OWNER or ADMIN can invite members" });
    }

    // Check for duplicates before doing anything
    for (const email of inviteEmail) {
      const already = await client.project_Members.findFirst({
        where: { projectId, emailuser: email.toLowerCase() },
      });
      if (already) {
        return res.status(409).json({ success: false, message: `${email} is already a member of this project` });
      }
    }

    const added = [];

    for (const email of inviteEmail) {
      const normalizedEmail = email.toLowerCase().trim();

      // Add to project_Members
      const member = await client.project_Members.create({
        data: { projectId, role, emailuser: normalizedEmail },
      });
      added.push(member);

      // Send invite email
      try {
        await transporter.sendMail({
          from: `"Nexus" <${process.env.EMAIL_USER}>`,
          to: normalizedEmail,
          subject: `${inviter.fullname} invited you to ${project.projectName} on Nexus`,
          html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Segoe UI',system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 20px">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#09090b;border:1px solid #27272a;border-radius:16px;overflow:hidden">

        <!-- Header -->
        <tr>
          <td style="padding:28px 32px 24px;border-bottom:1px solid #18181b">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="width:32px;height:32px;background:#6366f1;border-radius:8px;display:inline-block;text-align:center;line-height:32px;font-size:16px">⚡</div>
                </td>
                <td style="padding-left:10px;vertical-align:middle">
                  <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px">Nexus</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Inviter avatar + message -->
        <tr>
          <td style="padding:32px 32px 0">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="width:48px;height:48px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:50%;text-align:center;line-height:48px;font-size:20px;font-weight:700;color:#fff;display:inline-block">
                    ${(inviter.fullname || inviter.email)[0].toUpperCase()}
                  </div>
                </td>
                <td style="padding-left:14px;vertical-align:middle">
                  <p style="margin:0;color:#a1a1aa;font-size:13px">Invitation from</p>
                  <p style="margin:2px 0 0;color:#ffffff;font-size:15px;font-weight:600">${inviter.fullname || inviter.email}</p>
                </td>
              </tr>
            </table>

            <h1 style="margin:24px 0 8px;color:#fafafa;font-size:22px;font-weight:700;line-height:1.3">
              You've been invited to join a project
            </h1>
            <p style="margin:0 0 24px;color:#71717a;font-size:14px;line-height:1.6">
              <strong style="color:#a1a1aa">${inviter.fullname || inviter.email}</strong> has invited you to collaborate on <strong style="color:#a1a1aa">${project.projectName}</strong> with the role of <span style="color:#6366f1;font-weight:600">${role}</span>.
            </p>
          </td>
        </tr>

        <!-- Project card -->
        <tr>
          <td style="padding:0 32px 28px">
            <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:20px">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
                <div style="width:36px;height:36px;background:#6366f122;border:1px solid #6366f133;border-radius:8px;text-align:center;line-height:36px;font-size:15px;font-weight:700;color:#6366f1">
                  ${project.projectName[0].toUpperCase()}
                </div>
                <div>
                  <p style="margin:0;color:#fafafa;font-size:15px;font-weight:600">${project.projectName}</p>
                  <p style="margin:2px 0 0;color:#71717a;font-size:12px">${project.description || "No description"}</p>
                </div>
              </div>
              <p style="margin:12px 0 0;color:#52525b;font-size:12px;border-top:1px solid #27272a;padding-top:12px">
                Your role: <span style="color:#6366f1;font-weight:600">${role}</span>
              </p>
            </div>
          </td>
        </tr>

        <!-- CTA button -->
        <tr>
          <td style="padding:0 32px 32px;text-align:center">
            <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/auth/login"
               style="display:inline-block;background:#6366f1;color:#ffffff;font-size:14px;font-weight:600;padding:13px 28px;border-radius:10px;text-decoration:none;letter-spacing:0.2px">
              Accept Invitation →
            </a>
            <p style="margin:16px 0 0;color:#52525b;font-size:12px">
              Log in with <strong style="color:#71717a">${normalizedEmail}</strong> to access the project.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #18181b">
            <p style="margin:0;color:#3f3f46;font-size:11px;text-align:center">
              You received this because you were invited to Nexus. If you weren't expecting this, you can ignore it.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
          `,
        });
      } catch (mailErr) {
        console.warn(`Email to ${normalizedEmail} failed:`, mailErr.message);
        // Don't fail the request — member was already added
      }
    }

    // ── Notifications ──────────────────────────────────────────────────────────
   // const inviter = await client.user.findFirst({ where: { id: userId } });
    for (const m of added) {
      // 1) Notify the newly added person themselves
      const newUser = await client.user.findFirst({ where: { email: m.emailuser } });
      if (newUser) {
        await pushNotification({
          userId: newUser.id,
          type: "MEMBER_JOINED",
          message: `${inviter?.fullname || "Someone"} added you to the project "${project.projectName}"`,
          projectId,
        });
      }
    }
    // 2) Notify all existing members that someone new joined
    await notifyProjectMembers({
      projectId,
      type: "MEMBER_JOINED",
      message: `${added.map((m) => m.emailuser).join(", ")} joined "${project.projectName}"`,
      skipUserId: userId, // don't notify the person who did the inviting
    });

    // Activity log — one entry per added member
    for (const m of added) {
      await createActivityLog({
        userId,
        projectId,
        action: "MEMBER_ADDED",
        meta: { email: m.emailuser, role: m.role }
      });
    }

    return res.status(200).json({
      success: true,
      message: `${added.length} member(s) added and invited successfully`,
      added,
    });
  } catch (e) {
    console.error("sendingInviteToAddMemberToProject:", e);
    return res.status(500).json({ success: false, message: "Error adding members" });
  }
};

// ─── UPDATE ROLE ──────────────────────────────────────────────────────────────
export const updateRole = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email, newRole } = req.body;

    if (!email || !newRole) {
      return res.status(400).json({ success: false, message: "email and newRole are required" });
    }

    const validRoles = ["OWNER", "ADMIN", "EDITOR", "COMMENTER", "VIEWER"];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ success: false, message: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
    }

    const membership = await client.project_Members.findFirst({
      where: { projectId, emailuser: email },
    });
    if (!membership) {
      return res.status(404).json({ success: false, message: `${email} is not a member of this project` });
    }

    const updated = await client.project_Members.updateMany({
      where: { projectId, emailuser: email },
      data: { role: newRole },
    });

    return res.status(200).json({ success: true, message: "Role updated successfully", updated });
  } catch (e) {
    console.error("updateRole:", e);
    return res.status(500).json({ success: false, message: "Error updating role" });
  }
};

// ─── SEND SMART DIGEST TO ALL PROJECT MEMBERS ────────────────────────────────
// POST /api/v1/project/:userId/:projectId/send-digest
// body: { digest: string, projectName: string }
export const sendDigestToMembers = async (req, res) => {
  try {
    const { userId, projectId } = req.params;
    const { digest, projectName } = req.body;

    if (!digest?.trim()) {
      return res.status(400).json({ success: false, message: "digest content is required" });
    }

    // Verify sender is a project member
    const sender = await client.user.findFirst({ where: { id: userId } });
    if (!sender) return res.status(404).json({ success: false, message: "User not found" });

    const senderMembership = await client.project_Members.findFirst({
      where: { projectId, emailuser: sender.email },
    });
    if (!senderMembership) {
      return res.status(403).json({ success: false, message: "You are not a member of this project" });
    }

    // Get all project members with their emails
    const members = await client.project_Members.findMany({ where: { projectId } });
    if (!members.length) {
      return res.status(404).json({ success: false, message: "No members found in this project" });
    }

    const project = await client.projects.findFirst({ where: { id: projectId } });
    const displayProjectName = projectName || project?.projectName || "your project";

    // Convert digest plain text → styled HTML bullet list
    const digestToHtml = (text) => {
      const emojiHeaders = ["🌅", "📌", "✅", "🎯"];
      return text.split("\n").map((line) => {
        if (!line.trim()) return "<div style=\"height:8px\"></div>";

        if (emojiHeaders.some((e) => line.trimStart().startsWith(e))) {
          const emoji = line.trim()[0];
          const rest  = line.trim().slice(1).trim();
          return `
            <div style="display:flex;align-items:center;gap:10px;margin:24px 0 8px;padding-bottom:8px;border-bottom:1px solid #27272a">
              <span style="font-size:18px;line-height:1">${emoji}</span>
              <span style="color:#ffffff;font-size:13px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase">${rest}</span>
            </div>`;
        }

        if (line.trimStart().startsWith("•") || line.trimStart().startsWith("-")) {
          const content = line.replace(/^[\s•\-]+/, "");
          return `
            <div style="display:flex;align-items:flex-start;gap:8px;padding:3px 0">
              <span style="color:#8b5cf6;font-size:12px;margin-top:3px;flex-shrink:0">▸</span>
              <span style="color:#a1a1aa;font-size:13px;line-height:1.6">${content}</span>
            </div>`;
        }

        return `<p style="margin:4px 0;color:#71717a;font-size:13px;line-height:1.6">${line}</p>`;
      }).join("");
    };

    const digestHtml = digestToHtml(digest);
    const sentDate   = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    let sentCount = 0;
    const errors  = [];

    for (const member of members) {
      try {
        await transporter.sendMail({
          from: `"Nexus" <${process.env.EMAIL_USER}>`,
          to:   member.emailuser,
          subject: `📋 Smart Digest — ${displayProjectName} · ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
          html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Segoe UI',system-ui,-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 20px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#09090b;border:1px solid #27272a;border-radius:16px;overflow:hidden;max-width:520px">

        <!-- Header -->
        <tr>
          <td style="padding:24px 32px;border-bottom:1px solid #18181b;background:#0a0a0b">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <div style="width:32px;height:32px;background:#6366f1;border-radius:8px;text-align:center;line-height:32px;font-size:16px;display:inline-block">⚡</div>
                      </td>
                      <td style="padding-left:10px;vertical-align:middle">
                        <span style="color:#ffffff;font-size:17px;font-weight:700;letter-spacing:-0.3px">Nexus</span>
                      </td>
                    </tr>
                  </table>
                </td>
                <td align="right" style="vertical-align:middle">
                  <span style="background:#6366f122;border:1px solid #6366f133;color:#818cf8;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;letter-spacing:0.05em">✦ SMART DIGEST</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Project + date badge -->
        <tr>
          <td style="padding:28px 32px 0">
            <div style="display:inline-flex;align-items:center;gap:8px;background:#18181b;border:1px solid #27272a;border-radius:8px;padding:8px 14px;margin-bottom:20px">
              <div style="width:22px;height:22px;background:#6366f122;border:1px solid #6366f133;border-radius:5px;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#6366f1;display:inline-block">
                ${displayProjectName[0].toUpperCase()}
              </div>
              <span style="color:#a1a1aa;font-size:13px;font-weight:600">${displayProjectName}</span>
              <span style="color:#3f3f46;font-size:11px">·</span>
              <span style="color:#52525b;font-size:12px">${sentDate}</span>
            </div>
            <p style="margin:0 0 6px;color:#fafafa;font-size:20px;font-weight:700;line-height:1.2">Your Daily Digest</p>
            <p style="margin:0 0 24px;color:#52525b;font-size:13px">Sent by <strong style="color:#71717a">${sender.fullname || sender.email}</strong> · AI-generated summary</p>
          </td>
        </tr>

        <!-- Digest content -->
        <tr>
          <td style="padding:0 32px 28px">
            <div style="background:#0d0d0f;border:1px solid #1c1c1f;border-radius:12px;padding:20px 24px">
              ${digestHtml}
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 28px;text-align:center">
            <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/project/${projectId}"
               style="display:inline-block;background:#6366f1;color:#ffffff;font-size:13px;font-weight:600;padding:11px 24px;border-radius:10px;text-decoration:none;letter-spacing:0.2px">
              Open Project in Nexus →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:18px 32px;border-top:1px solid #18181b">
            <p style="margin:0;color:#3f3f46;font-size:11px;text-align:center;line-height:1.6">
              This digest was generated by Gemini AI and sent by ${sender.fullname || sender.email} via Nexus.<br>
              You received this because you are a member of <strong style="color:#52525b">${displayProjectName}</strong>.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
        });
        sentCount++;
      } catch (mailErr) {
        console.warn(`Digest email to ${member.emailuser} failed:`, mailErr.message);
        errors.push(member.emailuser);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Digest sent to ${sentCount} member${sentCount !== 1 ? "s" : ""}${errors.length ? ` (${errors.length} failed)` : ""}`,
      sentCount,
      failedEmails: errors,
    });

  } catch (e) {
    console.error("sendDigestToMembers:", e);
    return res.status(500).json({ success: false, message: "Error sending digest" });
  }
};