"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Modal, Input, Textarea, Select, Button, showToast, formatDateInput } from "@/components/ui";

export default function TaskModal({ open, onClose, projectId, task, members = [], onSaved }) {
  const { user } = useAuth();
  const isEdit = !!task;
  const [form, setForm] = useState({ title: "", description: "", status: "Todo", priority: "High", assigneEmail: "", startDate: "", dueDate: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setForm({ title: task.title || "", description: task.description || "", status: task.status || "Todo", priority: task.priority || "High", assigneEmail: task.assignee_email || "", startDate: formatDateInput(task.startDate), dueDate: formatDateInput(task.dueDate) });
    } else {
      setForm({ title: "", description: "", status: "Todo", priority: "High", assigneEmail: user?.email || "", startDate: formatDateInput(new Date()), dueDate: "" });
    }
    setErrors({});
  }, [task, open, user]);

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.assigneEmail) e.assigneEmail = "Assignee is required";
    if (!form.dueDate) e.dueDate = "Due date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit) {
        await api.tasks.edit(user.id, projectId, [{ ...form, taskId: task.id }]);
        showToast("Task updated");
      } else {
        await api.tasks.add(user.id, projectId, [form]);
        showToast("Task created");
      }
      onSaved?.();
      onClose();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Task" : "Create Task"}>
      <div className="space-y-4">
        <Input label="Title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Task title..." error={errors.title} />
        <Textarea label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What needs to be done?" rows={3} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Status" value={form.status} onChange={(e) => set("status", e.target.value)}>
            {["Todo", "In Progress", "In Review", "Done"].map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select label="Priority" value={form.priority} onChange={(e) => set("priority", e.target.value)}>
            {["High", "Medium", "Low"].map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
        </div>
        <Select label="Assignee" value={form.assigneEmail} onChange={(e) => set("assigneEmail", e.target.value)} error={errors.assigneEmail}>
          <option value="">Select assignee...</option>
          {members.map((m) => <option key={m.emailuser} value={m.emailuser}>{m.fullname || m.emailuser}</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          <Input label="Due Date" type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} error={errors.dueDate} />
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" loading={loading} onClick={submit}>{isEdit ? "Save Changes" : "Create Task"}</Button>
        </div>
      </div>
    </Modal>
  );
}