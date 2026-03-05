import client from "../prisma.js";
import dotenv from "dotenv";

dotenv.config({});
// GET /api/v1/user/:id
// Returns { user: { id, email, fullname, profile, isVerified, myRole } }
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await client.user.findFirst({
      where: { id },
      select: {
        id: true,
        email: true,
        fullname: true,
        profile: true,
        isVerified: true,
        myRole: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (e) {
    console.error("getUserById error:", e);
    return res.status(500).json({ success: false, message: "Error fetching user" });
  }
};

// GET /api/v1/user/:userId/projects
// Returns all projects a user owns or is a member of
export const getUserProjects = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await client.user.findFirst({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Projects the user owns
    const ownedProjects = await client.projects.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
    });

    // Projects the user is a member of (but doesn't own)
    const memberships = await client.project_Members.findMany({
      where: { emailuser: user.email },
    });

    const memberProjectIds = memberships
      .map((m) => m.projectId)
      .filter((pid) => !ownedProjects.find((p) => p.id === pid));

    const memberProjects = await client.projects.findMany({
      where: { id: { in: memberProjectIds } },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      OwnerProject: ownedProjects,
      MemberProject: memberProjects,
    });
  } catch (e) {
    console.error("getUserProjects error:", e);
    return res.status(500).json({ success: false, message: "Error fetching user projects" });
  }
};