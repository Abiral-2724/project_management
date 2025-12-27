// Create a context for sharing project data
import { createContext, useContext } from 'react';

interface ProjectContextType {
  projectDetail: any;
  projectMember: any[];
  setProjectMember: (members: any[]) => void;
  token: string;
  id: string;
  projectId: string;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
   
  }
  return context;
}