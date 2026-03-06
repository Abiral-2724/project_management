"use client";
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { generateTaskDetails } from "@/lib/gemini";
import { Modal, Input, Textarea, Select, Button, showToast, formatDateInput } from "@/components/ui";

const Sparkle = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/>
  </svg>
);

// Tiny inline editable subtask row
function SubtaskRow({ subtask, index, onChange, onDelete, onAdd }) {
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); onAdd(index); }
    if (e.key === "Backspace" && subtask.title === "") { e.preventDefault(); onDelete(index); }
  };

  useEffect(() => {
    if (subtask._focus) {
      inputRef.current?.focus();
      onChange(index, { ...subtask, _focus: false });
    }
  }, [subtask._focus]);

  return (
    <div className="flex items-center gap-2 group py-0.5">
      {/* Drag handle / bullet */}
      <div className="w-1.5 h-1.5 rounded-full bg-violet-400/70 shrink-0 mt-0.5" />
      <input
        ref={inputRef}
        value={subtask.title}
        onChange={(e) => onChange(index, { ...subtask, title: e.target.value })}
        onKeyDown={handleKeyDown}
        placeholder="Subtask description…"
        className="flex-1 bg-transparent text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none py-0.5 border-b border-transparent focus:border-zinc-700 transition-colors"
      />
      <button
        onClick={() => onDelete(index)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-700 hover:text-red-400"
        tabIndex={-1}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  );
}

export default function TaskModal({ open, onClose, projectId, task, members = [], onSaved }) {
  const { user }  = useAuth();
  const isEdit    = !!task;

  const [form, setForm] = useState({
    title: "", description: "", status: "Todo", priority: "High",
    assigneEmail: "", startDate: "", dueDate: "",
  });
  const [loading,   setLoading]   = useState(false);
  const [errors,    setErrors]    = useState({});
  const [aiLoading, setAiLoading] = useState(false);

  // Subtasks state — each: { title, priority, status, _focus?, _isAi? }
  const [subtasks, setSubtasks] = useState([]);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "", description: task.description || "",
        status: task.status || "Todo", priority: task.priority || "High",
        assigneEmail: task.assignee_email || "",
        startDate: formatDateInput(task.startDate),
        dueDate:   formatDateInput(task.dueDate),
      });
      // Load existing subtasks for edit mode
      setSubtasks(
        (task.subtasks || task.allSubtasksDestail || []).map((s) => ({
          id:       s.id,
          title:    s.title || "",
          priority: s.priority || "Medium",
          status:   s.status  || "Todo",
        }))
      );
    } else {
      setForm({
        title: "", description: "", status: "Todo", priority: "High",
        assigneEmail: user?.email || "",
        startDate: formatDateInput(new Date()), dueDate: "",
      });
      setSubtasks([]);
    }
    setErrors({});
  }, [task, open, user]);

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  // ── Subtask helpers ───────────────────────────────────────────────────────
  const updateSubtask = (i, val) => setSubtasks((p) => p.map((s, idx) => idx === i ? val : s));
  const deleteSubtask = (i)      => setSubtasks((p) => p.filter((_, idx) => idx !== i));
  const addSubtask    = (afterIndex) => {
    setSubtasks((p) => {
      const next = [...p];
      next.splice(afterIndex + 1, 0, { title: "", priority: "Medium", status: "Todo", _focus: true });
      return next;
    });
  };
  const addBlankSubtask = () =>
    setSubtasks((p) => [...p, { title: "", priority: "Medium", status: "Todo", _focus: true }]);

  // ── AI generate ───────────────────────────────────────────────────────────
  const handleAI = async () => {
    if (!form.title.trim()) { showToast("Enter a task title first", "warning"); return; }
    setAiLoading(true);
    try {
      const result = await generateTaskDetails(form.title.trim());
      if (result.description) set("description", result.description);
      if (result.subtasks?.length) {
        setSubtasks(
          result.subtasks
            .filter((s) => s?.trim())
            .map((s) => ({ title: s, priority: "Medium", status: "Todo", _isAi: true }))
        );
      }
      showToast(`AI generated ${result.subtasks?.length || 0} subtasks`, "success");
    } catch (e) {
      showToast(e.message || "AI generation failed", "error");
    } finally {
      setAiLoading(false);
    }
  };

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title       = "Title is required";
    if (!form.assigneEmail)   e.assigneEmail = "Assignee is required";
    if (!form.dueDate)        e.dueDate      = "Due date is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const validSubtasks = subtasks.filter((s) => s.title?.trim());

      if (isEdit) {
        // Update task
        await api.tasks.edit(user.id, projectId, [{ ...form, taskId: task.id }]);

        // Subtask management in edit mode:
        // New subtasks (no id) → create
        const newSubs = validSubtasks.filter((s) => !s.id);
        if (newSubs.length) {
          await api.tasks.addSubtasks(user.id, projectId, newSubs.map((s) => ({
            title:       s.title.trim(),
            priority:    s.priority || "Medium",
            status:      s.status   || "Todo",
            taskId:      task.id,
            assigneEmail: form.assigneEmail,
            startDate:   form.startDate || new Date().toISOString(),
            dueDate:     form.dueDate,
          })));
        }
        // Existing subtasks (has id) → batch edit
        const existingSubs = validSubtasks.filter((s) => s.id);
        if (existingSubs.length) {
          await api.tasks.editSubtasks(user.id, projectId, existingSubs.map((s) => ({
            subtaskId: s.id,
            title:     s.title.trim(),
            priority:  s.priority,
            status:    s.status,
          })));
        }
        showToast("Task updated");

      } else {
        // Create task, get its id from response
        const res = await api.tasks.add(user.id, projectId, [form]);
        const newTaskId = res?.tasks?.[0]?.id || res?.id;

        // Create subtasks if any
        if (validSubtasks.length && newTaskId) {
          await api.tasks.addSubtasks(user.id, projectId, validSubtasks.map((s) => ({
            title:       s.title.trim(),
            priority:    s.priority || form.priority,
            status:      "Todo",
            taskId:      newTaskId,
            assigneEmail: form.assigneEmail,
            startDate:   form.startDate || new Date().toISOString(),
            dueDate:     form.dueDate,
          })));
        }
        showToast(validSubtasks.length
          ? `Task created with ${validSubtasks.length} subtask${validSubtasks.length > 1 ? "s" : ""}`
          : "Task created"
        );
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
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Task" : "New Task"}>
      <div className="space-y-4">

        {/* Title + AI button */}
        <div>
          <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Title</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Build login page"
                error={errors.title}
              />
            </div>
            {!isEdit && (
              <button
                onClick={handleAI}
                disabled={aiLoading}
                className="shrink-0 flex items-center gap-1.5 px-3 h-[38px] rounded-lg text-xs font-semibold
                  bg-gradient-to-br from-violet-600 to-indigo-600 text-white
                  hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-900/30
                  disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                title="Generate description & subtasks with AI"
              >
                {aiLoading
                  ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Sparkle />
                }
                <span className="hidden sm:inline">{aiLoading ? "Thinking…" : "AI Fill"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="What needs to be done?"
          rows={2}
        />

        {/* Status + Priority */}
        <div className="grid grid-cols-2 gap-3">
          <Select label="Status" value={form.status} onChange={(e) => set("status", e.target.value)}>
            {["Todo","In Progress","In Review","Done"].map((s) => <option key={s}>{s}</option>)}
          </Select>
          <Select label="Priority" value={form.priority} onChange={(e) => set("priority", e.target.value)}>
            {["High","Medium","Low"].map((p) => <option key={p}>{p}</option>)}
          </Select>
        </div>

        {/* Assignee */}
        <Select label="Assignee" value={form.assigneEmail} onChange={(e) => set("assigneEmail", e.target.value)} error={errors.assigneEmail}>
          <option value="">Select assignee…</option>
          {members.map((m) => (
            <option key={m.emailuser} value={m.emailuser}>{m.fullname || m.emailuser}</option>
          ))}
        </Select>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          <Input label="Due Date"   type="date" value={form.dueDate}   onChange={(e) => set("dueDate", e.target.value)}   error={errors.dueDate} />
        </div>

        {/* ── Subtasks ─────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              Subtasks
              {subtasks.length > 0 && (
                <span className="text-xs text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded-md">{subtasks.length}</span>
              )}
            </label>
            <button
              onClick={addBlankSubtask}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-violet-400 transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add subtask
            </button>
          </div>

          {subtasks.length === 0 ? (
            <div
              onClick={addBlankSubtask}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-dashed border-zinc-800 text-xs text-zinc-700 hover:border-violet-500/30 hover:text-zinc-500 cursor-pointer transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Click to add subtasks, or use AI Fill
            </div>
          ) : (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 space-y-0.5">
              {subtasks.map((sub, i) => (
                <SubtaskRow
                  key={i}
                  subtask={sub}
                  index={i}
                  onChange={updateSubtask}
                  onDelete={deleteSubtask}
                  onAdd={addSubtask}
                />
              ))}
              <button
                onClick={addBlankSubtask}
                className="flex items-center gap-1.5 text-xs text-zinc-700 hover:text-zinc-400 transition-colors pt-1 pl-3.5"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Add another
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" loading={loading} onClick={submit}>
            {isEdit ? "Save Changes" : subtasks.filter(s=>s.title?.trim()).length > 0 ? `Create Task + ${subtasks.filter(s=>s.title?.trim()).length} subtask${subtasks.filter(s=>s.title?.trim()).length>1?"s":""}` : "Create Task"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}