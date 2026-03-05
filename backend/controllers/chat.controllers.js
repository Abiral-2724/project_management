import client from "../prisma.js";

// GET chat message history for a project
export const getChatHistory = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await client.chatMessage.findMany({
      where: { project_id: projectId },
      orderBy: { createdAt: "desc" },
      skip,
      take: parseInt(limit),
    });

    const enriched = await Promise.all(
      messages.map(async (msg) => {
        const sender = await client.user.findFirst({
          where: { id: msg.sender_id },
          select: { fullname: true, profile: true, email: true }
        });

        let replyTo = null;
        if (msg.reply_to_id) {
          const original = await client.chatMessage.findFirst({ where: { id: msg.reply_to_id } });
          const originalSender = original
            ? await client.user.findFirst({
                where: { id: original.sender_id },
                select: { fullname: true }
              })
            : null;
          replyTo = original ? { ...original, sender: originalSender } : null;
        }

        return { ...msg, sender, replyTo };
      })
    );

    const total = await client.chatMessage.count({ where: { project_id: projectId } });

    return res.status(200).json({
      success: true,
      messages: enriched.reverse(), // chronological order
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Error fetching chat history" });
  }
};

// DELETE a message (only sender or project owner)
export const deleteMessage = async (req, res) => {
  try {
    const { messageId, userId } = req.params;

    const message = await client.chatMessage.findFirst({ where: { id: messageId } });
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });

    if (message.sender_id !== userId) {
      // Check if user is project owner
      const project = await client.projects.findFirst({ where: { id: message.project_id } });
      if (!project || project.ownerId !== userId) {
        return res.status(403).json({ success: false, message: "Not authorized to delete this message" });
      }
    }

    await client.chatMessage.delete({ where: { id: messageId } });
    return res.status(200).json({ success: true, message: "Message deleted" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Error deleting message" });
  }
};

// Edit a message
export const editMessage = async (req, res) => {
  try {
    const { messageId, userId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Content is required" });
    }

    const message = await client.chatMessage.findFirst({ where: { id: messageId } });
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });
    if (message.sender_id !== userId) {
      return res.status(403).json({ success: false, message: "You can only edit your own messages" });
    }

    const updated = await client.chatMessage.update({
      where: { id: messageId },
      data: { content: content.trim(), isEdited: true }
    });

    return res.status(200).json({ success: true, message: updated });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Error editing message" });
  }
};