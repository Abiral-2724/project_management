"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import SearchOverlay from "@/components/search/SearchOverlay";
import { ToastContainer, Spinner } from "@/components/ui";
import { api } from "@/lib/api";
import Footer from "./Footer";

export default function AppLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!loading && !user) { router.push("/auth/login"); return; }
    if (user?.id) {
      api.projects.getAll(user.id).then((d) => {
        const all = [...(d.OwnerProject || []), ...(d.MemberProject || [])];
        setProjects(all);
      }).catch(() => {});
    }
  }, [user, loading, router]);

  // ⌘K shortcut
  useEffect(() => {
    const fn = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <SocketProvider userId={user.id}>
      <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
          *{box-sizing:border-box}
          ::-webkit-scrollbar{width:4px;height:4px}
          ::-webkit-scrollbar-track{background:transparent}
          ::-webkit-scrollbar-thumb{background:#3f3f46;border-radius:4px}
          ::-webkit-scrollbar-thumb:hover{background:#52525b}
          .-rotate-90{transform:rotate(-90deg)}
        `}</style>

        <Sidebar
          projects={projects}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
        />

        <div className="flex flex-col flex-1 min-w-0">
          <Topbar
            onSearchOpen={() => setSearchOpen(true)}
            onSidebarToggle={() => setSidebarCollapsed((v) => !v)}
          />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>

        {searchOpen && (
          <SearchOverlay
            projects={projects}
            onClose={() => setSearchOpen(false)}
          />
        )}

        <ToastContainer />
      </div>
      <Footer></Footer>
    </SocketProvider>
  );
}