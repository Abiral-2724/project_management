import client from "../prisma.js";
import { io } from "../index.js";
import { createActivityLog } from "./activity.controllers.js";

// ─── NOTIFICATION HELPERS ────────────────────────────────────────────────────
async function createAndPushNotification({ userId, type, message, projectId, taskId }) {
  try {
    const notif = await client.notification.create({
      data: { user_id: userId, type, message, project_id: projectId || null, task_id: taskId || null }
    });
    io?.to(`user:${userId}`).emit("new_notification", notif);
  } catch (e) {
    console.warn("Notification error:", e.message);
  }
}

async function notifyProjectMembers({ projectId, type, message, skipUserId = null }) {
  try {
    const members = await client.project_Members.findMany({ where: { projectId } });
    for (const m of members) {
      const user = await client.user.findFirst({ where: { email: m.emailuser } });
      if (!user || user.id === skipUserId) continue;
      await createAndPushNotification({ userId: user.id, type, message, projectId });
    }
  } catch (e) {
    console.warn("notifyProjectMembers error:", e.message);
  }
}

// ─── ADD TASKS ────────────────────────────────────────────────────────────────
export const addTasks = async (req, res) => {
  try {
    const { userId, projectId } = req.params;
    const { tasks } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ success: false, message: "tasks array is required" });
    }

    const user = await client.user.findFirst({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const membership = await client.project_Members.findFirst({
      where: { projectId, emailuser: user.email },
    });
    if (!membership) {
      return res.status(403).json({ success: false, message: "You are not a member of this project" });
    }
    if (["COMMENTER", "VIEWER"].includes(membership.role)) {
      return res.status(403).json({ success: false, message: "You do not have permission to add tasks" });
    }

    const createdTasks = [];

    for (const task of tasks) {
      const { title, priority, startDate, dueDate, assigneEmail, status, description } = task;

      if (!title || !priority || !startDate || !dueDate || !assigneEmail || !status) {
        return res.status(400).json({
          success: false,
          message: "All task fields are required: title, priority, startDate, dueDate, assigneEmail, status",
        });
      }

      const assigneeMember = await client.project_Members.findFirst({
        where: { projectId, emailuser: assigneEmail },
      });
      if (!assigneeMember) {
        return res.status(400).json({ success: false, message: `${assigneEmail} is not a member of this project` });
      }

      const newTask = await client.project_Tasks.create({
        data: {
          title,
          description: description || "",
          status,
          project_id: projectId,
          assignee_email: assigneEmail,
          priority,
          startDate: new Date(startDate),
          dueDate: new Date(dueDate),
          project_task_creator_id: userId,
        },
      });
      createdTasks.push(newTask);

      if (assigneEmail !== user.email) {
        const assignee = await client.user.findFirst({ where: { email: assigneEmail } });
        if (assignee) {
          await createAndPushNotification({
            userId: assignee.id,
            type: "TASK_ASSIGNED",
            message: `${user.fullname || user.email} assigned you a task: "${title}"`,
            projectId,
            taskId: newTask.id,
          });
        }
      }
    }

    for (const task of createdTasks) {
      await createActivityLog({
        userId,
        projectId,
        taskId: task.id,
        action: "TASK_CREATED",
        meta: { taskTitle: task.title, assignee: task.assignee_email },
      });
    }

    return res.status(201).json({ success: true, tasks: createdTasks });
  } catch (e) {
    console.error("addTasks:", e);
    return res.status(500).json({ success: false, message: "Error adding tasks" });
  }
};

// ─── ADD SUBTASKS ─────────────────────────────────────────────────────────────
export const addSubTasks = async (req, res) => {
  try {
    const { userId, projectId } = req.params;
    const { subtasks } = req.body;

    if (!Array.isArray(subtasks) || subtasks.length === 0) {
      return res.status(400).json({ success: false, message: "subtasks array is required" });
    }

    const user = await client.user.findFirst({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const membership = await client.project_Members.findFirst({
      where: { projectId, emailuser: user.email },
    });
    if (!membership) {
      return res.status(403).json({ success: false, message: "You are not a member of this project" });
    }
    if (["COMMENTER", "VIEWER"].includes(membership.role)) {
      return res.status(403).json({ success: false, message: "You do not have permission to add subtasks" });
    }

    const createdSubtasks = [];

    for (const subtask of subtasks) {
      const { title, priority, startDate, dueDate, assigneEmail, status, description, taskId } = subtask;

      if (!title || !status || !priority || !assigneEmail || !startDate || !dueDate || !taskId) {
        return res.status(400).json({
          success: false,
          message: "All subtask fields are required: title, status, priority, assigneEmail, startDate, dueDate, taskId",
        });
      }

      const parentTask = await client.project_Tasks.findFirst({
        where: { id: taskId, project_id: projectId },
      });
      if (!parentTask) {
        return res.status(404).json({
          success: false,
          message: `Parent task ${taskId} not found in this project`,
        });
      }

      const newSubtask = await client.project_SubTasks.create({
        data: {
          title,
          description: description || "",
          status,
          priority,
          assignee_email: assigneEmail,
          startDate: new Date(startDate),
          dueDate: new Date(dueDate),
          projectId,
          project_Tasks_id: taskId,
          project_sub_task_creator_id: userId,
        },
      });
      // Attach parent title for activity log (not stored in DB)
      createdSubtasks.push({ ...newSubtask, _parentTaskTitle: parentTask.title });
    }

    // ✅ Activity log for each subtask created
    for (const sub of createdSubtasks) {
      await createActivityLog({
        userId,
        projectId,
        taskId: sub.project_Tasks_id,
        action: "SUBTASK_CREATED",
        meta: { subtaskTitle: sub.title, parentTask: sub._parentTaskTitle },
      });
    }

    return res.status(201).json({ success: true, subtasks: createdSubtasks });
  } catch (e) {
    console.error("addSubTasks:", e);
    return res.status(500).json({ success: false, message: "Error adding subtasks" });
  }
};

// ─── GET MY CREATED TASKS ─────────────────────────────────────────────────────
export const getmycreatedTask = async (req, res) => {
  try {
    const { userId } = req.params;
    const tasks = await client.project_Tasks.findMany({
      where: { project_task_creator_id: userId },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ success: true, tasks });
  } catch (e) {
    console.error("getmycreatedTask:", e);
    return res.status(500).json({ success: false, message: "Error fetching tasks" });
  }
};

// ─── GET TASKS ASSIGNED TO USER ───────────────────────────────────────────────
export const getTaskAssignedoftheUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await client.user.findFirst({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const tasks = await client.project_Tasks.findMany({
      where: { assignee_email: user.email },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ success: true, tasks });
  } catch (e) {
    console.error("getTaskAssignedoftheUser:", e);
    return res.status(500).json({ success: false, message: "Error fetching assigned tasks" });
  }
};

// ─── GET ALL TASKS WITH SUBTASKS ──────────────────────────────────────────────
// Returns { TasksDetail[] } where each task has a `subtasks` array
export const getalltaskswiththeirsubtasks = async (req, res) => {
  try {
    const { userId, projectId } = req.params;

    const allTasks = await client.project_Tasks.findMany({
      where: { project_id: projectId },
      orderBy: { createdAt: "desc" },
    });

    const TasksDetail = await Promise.all(
      allTasks.map(async (task) => {
        const subtasks = await client.project_SubTasks.findMany({
          where: { project_Tasks_id: task.id },
          orderBy: { createdAt: "asc" },
        });
        return { ...task, subtasks };
      })
    );

    return res.status(200).json({ success: true, TasksDetail });
  } catch (e) {
    console.error("getalltaskswiththeirsubtasks:", e);
    return res.status(500).json({ success: false, message: "Error fetching tasks" });
  }
};

// ─── MARK TASK COMPLETE ───────────────────────────────────────────────────────
export const markTaskComplete = async (req, res) => {
  try {
    const { userId, projectId } = req.params;
    const { taskId } = req.body;

    if (!taskId) return res.status(400).json({ success: false, message: "taskId is required" });

    const user = await client.user.findFirst({ where: { id: userId } });
    const membership = await client.project_Members.findFirst({
      where: { projectId, emailuser: user?.email },
    });
    if (!membership) return res.status(403).json({ success: false, message: "Not a project member" });
    if (["COMMENTER", "VIEWER"].includes(membership.role)) {
      return res.status(403).json({ success: false, message: "You do not have permission to complete tasks" });
    }

    const task = await client.project_Tasks.findFirst({ where: { id: taskId } });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const updated = await client.project_Tasks.update({
      where: { id: taskId },
      data: {
        mark_complete: !task.mark_complete,
        time_TaskCompletion: task.mark_complete ? task.createdAt : new Date(),
      },
    });

    if (updated.mark_complete === true) {
      const project = await client.projects.findFirst({ where: { id: projectId } });
      await notifyProjectMembers({
        projectId,
        type: "TASK_COMPLETED",
        message: `Task "${updated.title}" was marked complete in "${project?.projectName || "a project"}"`,
        skipUserId: userId,
      });
    }

    await createActivityLog({
      userId,
      projectId,
      taskId,
      action: updated.mark_complete ? "TASK_COMPLETED" : "TASK_REOPENED",
      meta: { taskTitle: updated.title },
    });

    return res.status(200).json({ success: true, message: "Task completion toggled", task: updated });
  } catch (e) {
    console.error("markTaskComplete:", e);
    return res.status(500).json({ success: false, message: "Error toggling task completion" });
  }
};

// ─── MARK SUBTASK COMPLETE ────────────────────────────────────────────────────
export const markSubTaskComplete = async (req, res) => {
  try {
    const { userId, projectId } = req.params;
    const { subtaskId } = req.body;

    if (!subtaskId) return res.status(400).json({ success: false, message: "subtaskId is required" });

    const user = await client.user.findFirst({ where: { id: userId } });
    const membership = await client.project_Members.findFirst({
      where: { projectId, emailuser: user?.email },
    });
    if (!membership) return res.status(403).json({ success: false, message: "Not a project member" });
    if (["COMMENTER", "VIEWER"].includes(membership.role)) {
      return res.status(403).json({ success: false, message: "You do not have permission to complete subtasks" });
    }

    const subtask = await client.project_SubTasks.findFirst({ where: { id: subtaskId } });
    if (!subtask) return res.status(404).json({ success: false, message: "Subtask not found" });

    const updated = await client.project_SubTasks.update({
      where: { id: subtaskId },
      data: {
        mark_complete: !subtask.mark_complete,
        time_SubTaskCompletion: subtask.mark_complete ? subtask.createdAt : new Date(),
      },
    });

    // ✅ Activity log for subtask completion — logged against parent task
    await createActivityLog({
      userId,
      projectId,
      taskId: subtask.project_Tasks_id,
      action: updated.mark_complete ? "SUBTASK_COMPLETED" : "SUBTASK_REOPENED",
      meta: { subtaskTitle: updated.title },
    });

    return res.status(200).json({ success: true, message: "Subtask completion toggled", subtask: updated });
  } catch (e) {
    console.error("markSubTaskComplete:", e);
    return res.status(500).json({ success: false, message: "Error toggling subtask completion" });
  }
};

// ─── EDIT TASKS (bulk) ────────────────────────────────────────────────────────
export const editTasks = async (req, res) => {
  try {
    const { userId, projectId } = req.params;
    const { tasks } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ success: false, message: "tasks array is required" });
    }

    const user = await client.user.findFirst({ where: { id: userId } });
    const membership = await client.project_Members.findFirst({
      where: { projectId, emailuser: user?.email },
    });
    if (!membership) return res.status(403).json({ success: false, message: "Not a project member" });
    if (["COMMENTER", "VIEWER"].includes(membership.role)) {
      return res.status(403).json({ success: false, message: "You do not have permission to edit tasks" });
    }

    const updatedTasks = [];

    for (const task of tasks) {
      const { taskId, title, priority, startDate, dueDate, assigneEmail, status, description } = task;
      if (!taskId) return res.status(400).json({ success: false, message: "taskId is required for each task" });

      const updated = await client.project_Tasks.update({
        where: { id: taskId },
        data: {
          ...(title        !== undefined && { title }),
          ...(description  !== undefined && { description }),
          ...(status       !== undefined && { status }),
          ...(priority     !== undefined && { priority }),
          ...(assigneEmail !== undefined && { assignee_email: assigneEmail }),
          ...(startDate    !== undefined && { startDate: new Date(startDate) }),
          ...(dueDate      !== undefined && { dueDate: new Date(dueDate) }),
        },
      });
      updatedTasks.push(updated);
    }

    for (const task of updatedTasks) {
      await createActivityLog({
        userId,
        projectId,
        taskId: task.id,
        action: "TASK_UPDATED",
        meta: { taskTitle: task.title },
      });
    }

    return res.status(200).json({ success: true, updatedTasks });
  } catch (e) {
    console.error("editTasks:", e);
    return res.status(500).json({ success: false, message: "Error editing tasks" });
  }
};

// ─── EDIT SUBTASKS (bulk) ─────────────────────────────────────────────────────
export const editsubTasks = async (req, res) => {
  try {
    const { userId, projectId } = req.params;
    const { subtasks } = req.body;

    if (!Array.isArray(subtasks) || subtasks.length === 0) {
      return res.status(400).json({ success: false, message: "subtasks array is required" });
    }

    const user = await client.user.findFirst({ where: { id: userId } });
    const membership = await client.project_Members.findFirst({
      where: { projectId, emailuser: user?.email },
    });
    if (!membership) return res.status(403).json({ success: false, message: "Not a project member" });
    if (["COMMENTER", "VIEWER"].includes(membership.role)) {
      return res.status(403).json({ success: false, message: "You do not have permission to edit subtasks" });
    }

    const updatedSubTasks = [];

    for (const subtask of subtasks) {
      const { subtaskId, title, priority, startDate, dueDate, assigneEmail, status, description } = subtask;
      if (!subtaskId) return res.status(400).json({ success: false, message: "subtaskId is required for each subtask" });

      const updated = await client.project_SubTasks.update({
        where: { id: subtaskId },
        data: {
          ...(title        !== undefined && { title }),
          ...(description  !== undefined && { description }),
          ...(status       !== undefined && { status }),
          ...(priority     !== undefined && { priority }),
          ...(assigneEmail !== undefined && { assignee_email: assigneEmail }),
          ...(startDate    !== undefined && { startDate: new Date(startDate) }),
          ...(dueDate      !== undefined && { dueDate: new Date(dueDate) }),
        },
      });
      updatedSubTasks.push(updated);
    }

    // ✅ Activity log for subtask edits — logged against parent task
    for (const sub of updatedSubTasks) {
      await createActivityLog({
        userId,
        projectId,
        taskId: sub.project_Tasks_id,
        action: "SUBTASK_UPDATED",
        meta: { subtaskTitle: sub.title },
      });
    }

    return res.status(200).json({ success: true, updatedSubTasks });
  } catch (e) {
    console.error("editsubTasks:", e);
    return res.status(500).json({ success: false, message: "Error editing subtasks" });
  }
};

// ─── PROJECT DASHBOARD ────────────────────────────────────────────────────────
export const projectDashboard = async (req, res) => {
  try {
    const { userId, projectId } = req.params;

    const projectTasks    = await client.project_Tasks.findMany({ where: { project_id: projectId } });
    const projectSubTasks = await client.project_SubTasks.findMany({ where: { projectId } });

    const totalTask        = projectTasks.length + projectSubTasks.length;
    const completedTask    = [...projectTasks, ...projectSubTasks].filter((t) => t.mark_complete).length;
    const notcompletedTask = totalTask - completedTask;

    let countHighPriority = 0, countMediumPriority = 0, countLowPriority = 0;
    const taskcompletionOvertime = [];
    const assigneeMap = {};
    const profileMap  = {};

    const allItems = [
      ...projectTasks.map((t)    => ({ ...t, _type: "task" })),
      ...projectSubTasks.map((t) => ({ ...t, _type: "subtask" })),
    ];

    for (const item of allItems) {
      if (item.priority === "High")   countHighPriority++;
      if (item.priority === "Medium") countMediumPriority++;
      if (item.priority === "Low")    countLowPriority++;

      taskcompletionOvertime.push({
        complete:         item.mark_complete,
        timeofcompletion: item._type === "task" ? item.time_TaskCompletion : item.time_SubTaskCompletion,
      });

      const assigneeEmail = item.assignee_email;
      if (!assigneeMap[assigneeEmail]) {
        const u = await client.user.findFirst({
          where:  { email: assigneeEmail },
          select: { fullname: true, profile: true, email: true },
        });
        assigneeMap[assigneeEmail] = {
          email:           assigneeEmail,
          fullname:        u?.fullname || assigneeEmail,
          profile:         u?.profile  || null,
          incompleteCount: 0,
          completeCount:   0,
        };
        profileMap[assigneeEmail] = u?.profile || null;
      }

      if (item.mark_complete) assigneeMap[assigneeEmail].completeCount++;
      else                    assigneeMap[assigneeEmail].incompleteCount++;
    }

    return res.status(200).json({
      success:                   true,
      totalTask,
      completedTask,
      notcompletedTask,
      taskcompletion:            taskcompletionOvertime,
      highPriority:              countHighPriority,
      mediumPriority:            countMediumPriority,
      lowPriority:               countLowPriority,
      counttaskWithAssignEmails: Object.values(assigneeMap),
      profile:                   profileMap,
    });
  } catch (e) {
    console.error("projectDashboard:", e);
    return res.status(500).json({ success: false, message: "Error fetching dashboard" });
  }
};