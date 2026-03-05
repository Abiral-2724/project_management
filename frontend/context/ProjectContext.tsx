"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const ProjectContext = createContext({
  ownedProjects: [],
  memberProjects: [],
  allProjects: [],
  refreshProjects: async () => {},
});

export const useProjects = () => useContext(ProjectContext);

export function ProjectProvider({ children }) {
  const { user } = useAuth();
  const [ownedProjects, setOwnedProjects] = useState([]);
  const [memberProjects, setMemberProjects] = useState([]);

  const fetchProjects = useCallback(async () => {
    if (!user?.id) return;
    try {
      const d = await api.users.getAllProjects(user.id);
      setOwnedProjects(d.OwnerProject || []);
      setMemberProjects(d.MemberProject || []);
    } catch {}
  }, [user?.id]);

  // Fetch ONCE when user is available — never again on navigation
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <ProjectContext.Provider
      value={{
        ownedProjects,
        memberProjects,
        allProjects: [...ownedProjects, ...memberProjects],
        refreshProjects: fetchProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}