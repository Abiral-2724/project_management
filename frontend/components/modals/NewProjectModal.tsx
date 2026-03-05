"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Modal, Input, Textarea, Button, showToast } from "@/components/ui";

const VIEWS = ["Overview","Board","List","Timeline","Dashboard","Gantt","Calendar","Note","Workload","Files","Messages"];

export default function NewProjectModal({ open, onClose, onCreated }) {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ projectName: "", description: "" });
  const [selectedViews, setSelectedViews] = useState(["List", "Board"]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  const toggleView = (v) => setSelectedViews((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]);

  const submit = async () => {
    const e = {};
    if (!form.projectName.trim()) e.projectName = "Project name is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const data = await api.projects.create(user.id, { ...form, views: selectedViews });
      showToast("Project created!");
      onCreated?.(data.project);
      onClose();
      router.push(`/project/${data.project.id}`);
    } catch (err) {
      showToast(err.message, "error");
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="New Project">
      <div className="space-y-4">
        <Input label="Project Name" value={form.projectName} onChange={(e) => set("projectName", e.target.value)} placeholder="My Awesome Project" error={errors.projectName} />
        <Textarea label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What is this project about?" rows={3} error={errors.description} />
        <div>
          <p className="text-xs font-medium text-zinc-400 mb-2">Views</p>
          <div className="flex flex-wrap gap-2">
            {VIEWS.map((v) => (
              <button key={v} onClick={() => toggleView(v)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${selectedViews.includes(v) ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300" : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300"}`}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" loading={loading} onClick={submit}>Create Project</Button>
        </div>
      </div>
    </Modal>
  );
}