import client from "../prisma.js";

// Add comment to a task
export const addComment = async (req, res) => {
  try {
    const { userId, projectId, taskId } = req.params;
    const { content, parentCommentId } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Comment content is required" });
    }

    const user = await client.user.findFirst({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const member = await client.project_Members.findFirst({
      where: { projectId, emailuser: user.email }
    });
    if (!member) return res.status(403).json({ success: false, message: "Not a project member" });

    const comment = await client.taskComment.create({
      data: {
        content: content.trim(),
        task_id: taskId,
        author_id: userId,
        project_id: projectId,
        parent_comment_id: parentCommentId || null,
      }
    });

    // Create notification for task assignee
    const task = await client.project_Tasks.findFirst({ where: { id: taskId } });
    if (task && task.assignee_email !== user.email) {
      const assignee = await client.user.findFirst({ where: { email: task.assignee_email } });
      if (assignee) {
        await client.notification.create({
          data: {
            user_id: assignee.id,
            type: "COMMENT",
            message: `${user.fullname} commented on task "${task.title}"`,
            project_id: projectId,
            task_id: taskId,
          }
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: { ...comment, author: { fullname: user.fullname, profile: user.profile, email: user.email } }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Error adding comment" });
  }
};

// Get all comments for a task
export const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    const comments = await client.taskComment.findMany({
      where: { task_id: taskId, parent_comment_id: null },
      orderBy: { createdAt: "asc" }
    });

    const enriched = await Promise.all(
      comments.map(async (comment) => {
        const author = await client.user.findFirst({
          where: { id: comment.author_id },
          select: { fullname: true, profile: true, email: true }
        });

        const replies = await client.taskComment.findMany({
          where: { parent_comment_id: comment.id },
          orderBy: { createdAt: "asc" }
        });

        const enrichedReplies = await Promise.all(
          replies.map(async (reply) => {
            const replyAuthor = await client.user.findFirst({
              where: { id: reply.author_id },
              select: { fullname: true, profile: true, email: true }
            });
            return { ...reply, author: replyAuthor };
          })
        );

        return { ...comment, author, replies: enrichedReplies };
      })
    );

    return res.status(200).json({ success: true, comments: enriched });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Error fetching comments" });
  }
};

// Edit a comment
export const editComment = async (req, res) => {
  try {
    const { commentId, userId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Content is required" });
    }

    const comment = await client.taskComment.findFirst({ where: { id: commentId } });
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });
    if (comment.author_id !== userId) {
      return res.status(403).json({ success: false, message: "You can only edit your own comments" });
    }

    const updated = await client.taskComment.update({
      where: { id: commentId },
      data: { content: content.trim(), isEdited: true }
    });

    return res.status(200).json({ success: true, comment: updated });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Error editing comment" });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId, userId } = req.params;

    const comment = await client.taskComment.findFirst({ where: { id: commentId } });
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });
    if (comment.author_id !== userId) {
      return res.status(403).json({ success: false, message: "You can only delete your own comments" });
    }

    // Delete replies first
    await client.taskComment.deleteMany({ where: { parent_comment_id: commentId } });
    await client.taskComment.delete({ where: { id: commentId } });

    return res.status(200).json({ success: true, message: "Comment deleted successfully" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Error deleting comment" });
  }
};