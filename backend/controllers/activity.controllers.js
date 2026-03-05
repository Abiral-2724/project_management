import client from "../prisma.js";


// Helper to create an activity log entry (used internally across controllers)
export const createActivityLog = async ({ userId, projectId, taskId = null, action, meta = {} }) => {
  try {
    return await client.activityLog.create({
      data: {
        user_id: userId,
        project_id: projectId,
        task_id: taskId,
        action,
        meta: JSON.stringify(meta),
      }
    });
  } catch (e) {
    console.error("Activity log error:", e);
  }
};

// GET activity logs for a project
export const getProjectActivityLogs = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 30, taskId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { project_id: projectId };
    if (taskId) where.task_id = taskId;

    const logs = await client.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: parseInt(limit),
    });

    const enriched = await Promise.all(
      logs.map(async (log) => {
        const user = await client.user.findFirst({
          where: { id: log.user_id },
          select: { fullname: true, profile: true, email: true }
        });
        return {
          ...log,
          meta: log.meta ? JSON.parse(log.meta) : {},
          user
        };
      })
    );

    const total = await client.activityLog.count({ where });

    return res.status(200).json({
      success: true,
      logs: enriched,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Error fetching activity logs" });
  }
};

// GET activity logs for a specific task
export const getTaskActivityLogs = async (req, res) => {
  try {
    const { taskId } = req.params;

    const logs = await client.activityLog.findMany({
      where: { task_id: taskId },
      orderBy: { createdAt: "desc" },
    });

    const enriched = await Promise.all(
      logs.map(async (log) => {
        const user = await client.user.findFirst({
          where: { id: log.user_id },
          select: { fullname: true, profile: true, email: true }
        });
        return { ...log, meta: log.meta ? JSON.parse(log.meta) : {}, user };
      })
    );

    return res.status(200).json({ success: true, logs: enriched });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Error fetching task activity logs" });
  }
};

// GET activity logs for a user across all projects
export const getUserActivityLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await client.activityLog.findMany({
      where: { user_id: userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: parseInt(limit),
    });

    const enriched = await Promise.all(
      logs.map(async (log) => {
        const project = await client.projects.findFirst({
          where: { id: log.project_id },
          select: { projectName: true }
        });
        return { ...log, meta: log.meta ? JSON.parse(log.meta) : {}, project };
      })
    );

    const total = await client.activityLog.count({ where: { user_id: userId } });

    return res.status(200).json({
      success: true,
      logs: enriched,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Error fetching user activity logs" });
  }
};