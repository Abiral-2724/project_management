import { BarChart3, Calendar, FileText, Folder, LayoutDashboard, List, MessageSquare, User, Workflow } from "lucide-react";

export const NavItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, viewKey: 'overView' },
    { id: 'list', label: 'List', icon: List, viewKey: 'list' },
    { id: 'board', label: 'Board', icon: LayoutDashboard, viewKey: 'board' },
    { id: 'timeline', label: 'Timeline', icon: BarChart3, viewKey: 'timeLine' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, viewKey: 'dashBoard' },
    { id: 'gantt', label: 'Gantt', icon: BarChart3, viewKey: 'gantt' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, viewKey: 'calender' },
    { id: 'note', label: 'Note', icon: FileText, viewKey: 'note' },
    { id: 'workload', label: 'Workload', icon: User, viewKey: 'workLoad' },
    { id: 'files', label: 'Files', icon: Folder, viewKey: 'files' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, viewKey: 'messages' },
    { id: 'workflow', label: 'Workflow', icon: Workflow, viewKey: 'workFlow' },
  ];