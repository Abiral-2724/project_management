import client from "../prisma.js";

// Global search across tasks, projects, members
export const globalSearch = async (req, res) => {
  try {
    const { userId } = req.params;
    const { q, type } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Query must be at least 2 characters" });
    }

    const user = await client.user.findFirst({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Get all project IDs the user belongs to
    const memberships = await client.project_Members.findMany({
      where: { emailuser: user.email }
    });
    const projectIds = memberships.map((m) => m.projectId);

    const results = {};

    if (!type || type === "projects") {
      const projects = await client.projects.findMany({
        where: {
          id: { in: projectIds },
          projectName: { contains: q, mode: "insensitive" }
        },
        take: 10
      });
      results.projects = projects;
    }

    if (!type || type === "tasks") {
      const tasks = await client.project_Tasks.findMany({
        where: {
          project_id: { in: projectIds },
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } }
          ]
        },
        take: 20
      });
      results.tasks = tasks;
    }

    if (!type || type === "subtasks") {
      const subtasks = await client.project_SubTasks.findMany({
        where: {
          projectId: { in: projectIds },
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } }
          ]
        },
        take: 20
      });
      results.subtasks = subtasks;
    }

    if (!type || type === "members") {
      const memberEmails = await client.project_Members.findMany({
        where: {
          projectId: { in: projectIds }
        },
        select: { emailuser: true }
      });
      const emails = [...new Set(memberEmails.map((m) => m.emailuser))];

      const members = await client.user.findMany({
        where: {
          email: { in: emails },
          OR: [
            { fullname: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } }
          ]
        },
        select: { id: true, fullname: true, email: true, profile: true },
        take: 10
      });
      results.members = members;
    }

    return res.status(200).json({ success: true, query: q, results });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Error performing search" });
  }
};

// Search tasks within a specific project
export const searchProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { q, status, priority, assignee, startDate, dueDate } = req.query;

    const where = { project_id: projectId };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } }
      ];
    }
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignee) where.assignee_email = assignee;
    if (startDate) where.startDate = { gte: new Date(startDate) };
    if (dueDate) where.dueDate = { lte: new Date(dueDate) };

    const tasks = await client.project_Tasks.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({ success: true, tasks });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Error searching tasks" });
  }
};