'use client'
import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Plus, 
  X, 
  ChevronRight,
  Calendar,
  Circle,
  CheckCircle2,
  ChevronDown,
  Filter,
  SortAsc,
  Grid3x3,
  Settings,
  Search,
  MoreVertical
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

const API_BASE_URL = 'http://localhost:4000/api/v1';

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To do' },
  { value: 'DOING', label: 'Doing' },
  { value: 'DONE', label: 'Done' },
];

export default function TaskListPage() {
  const params = useParams();
  const userId = params?.userId || '';
  const projectId = params?.projectId || '';

  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newTaskRow, setNewTaskRow] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({});

  useEffect(() => {
    if (userId && projectId) {
      fetchTasks();
    }
  }, [userId, projectId]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${userId}/project/${projectId}/tasks`
      );
      const data = await response.json();
      if (data.success) {
        setTasks(data.TasksDetail || []);
      }
    } catch (error) {
      toast.error('Failed to fetch tasks');
      console.error(error);
    }
  };

  const handleAddTaskClick = () => {
    const newTask = {
      id: `temp-${Date.now()}`,
      title: '',
      assigneEmail: '',
      dueDate: '',
      priority: 'MEDIUM',
      status: 'TODO',
      description: '',
      isNew: true,
    };
    setNewTaskRow(newTask);
  };

  const handleSaveNewTask = async () => {
    if (!newTaskRow.title || !newTaskRow.assigneEmail || !newTaskRow.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/${userId}/project/${projectId}/addTasks`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tasks: [{
              title: newTaskRow.title,
              assigneEmail: newTaskRow.assigneEmail,
              startDate: new Date().toISOString(),
              dueDate: newTaskRow.dueDate,
              priority: newTaskRow.priority,
              status: newTaskRow.status,
              description: newTaskRow.description || '',
            }],
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success('Task created successfully');
        setNewTaskRow(null);
        fetchTasks();
      } else {
        toast.error(data.message || 'Failed to create task');
      }
    } catch (error) {
      toast.error('Error creating task');
      console.error(error);
    }
  };

  const handleCancelNewTask = () => {
    setNewTaskRow(null);
  };

  const handleTaskClick = async (task) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  };

  const handleMarkComplete = async (taskId, e) => {
    e?.stopPropagation();
    try {
      const response = await fetch(
        `${API_BASE_URL}/${userId}/project/${projectId}/markTaskComplete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success('Task status updated');
        fetchTasks();
      } else {
        toast.error(data.message || 'Failed to update task');
      }
    } catch (error) {
      toast.error('Error updating task');
      console.error(error);
    }
  };

  const handleMarkSubtaskComplete = async (subtaskId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${userId}/project/${projectId}/markSubTaskComplete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subtaskId }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success('Subtask status updated');
        fetchTasks();
      } else {
        toast.error(data.message || 'Failed to update subtask');
      }
    } catch (error) {
      toast.error('Error updating subtask');
      console.error(error);
    }
  };

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${day} ${month}`;
  };

  const getDateRangeText = (startDate, dueDate) => {
    if (!dueDate) return '';
    const start = startDate ? formatDate(startDate) : '';
    const end = formatDate(dueDate);
    if (start && start !== end) {
      return `${start} – ${end}`;
    }
    return end;
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    const status = task.status || 'TODO';
    if (!acc[status]) acc[status] = [];
    acc[status].push(task);
    return acc;
  }, {});

  const getInitials = (email) => {
    if (!email) return '';
    return email.charAt(0).toUpperCase();
  };

  const getAvatarColor = (email) => {
    if (!email) return 'bg-pink-500';
    const colors = [
      'bg-pink-500',
      'bg-purple-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-cyan-500',
    ];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Button
            onClick={handleAddTaskClick}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-md h-8 px-3 text-sm font-normal shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add task
            <ChevronDown className="w-4 h-4 ml-1.5" />
          </Button>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" className="text-gray-600 hover:bg-gray-100 h-8 px-3 text-sm font-normal">
              <Filter className="w-4 h-4 mr-1.5" />
              Filter
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:bg-gray-100 h-8 px-3 text-sm font-normal">
              <SortAsc className="w-4 h-4 mr-1.5" />
              Sort
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:bg-gray-100 h-8 px-3 text-sm font-normal">
              <Grid3x3 className="w-4 h-4 mr-1.5" />
              Group
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:bg-gray-100 h-8 px-3 text-sm font-normal">
              <Settings className="w-4 h-4 mr-1.5" />
              Options
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:bg-gray-100 h-8 w-8 p-0">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:bg-gray-100 h-8 px-3 text-sm font-normal">
              Save view
              <ChevronDown className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-0">
        <table className="w-full">
          <thead className="sticky top-[53px] bg-white z-10">
            <tr className="border-b border-gray-200">
              <th className="w-14 text-left py-2 bg-white"></th>
              <th className="text-left py-2 px-3 text-gray-500 font-normal text-xs bg-white">Name</th>
              <th className="text-left py-2 px-3 text-gray-500 font-normal text-xs bg-white w-52">Assignee</th>
              <th className="text-left py-2 px-3 text-gray-500 font-normal text-xs bg-white w-48">Due date</th>
              <th className="text-left py-2 px-3 text-gray-500 font-normal text-xs bg-white w-32">Priority</th>
              <th className="text-left py-2 px-3 text-gray-500 font-normal text-xs bg-white w-32">Status</th>
              <th className="w-12 text-left py-2 px-3 bg-white">
                <Plus className="w-4 h-4 text-gray-400" />
              </th>
            </tr>
          </thead>
          <tbody>
            {/* New Task Row */}
            {newTaskRow && (
              <tr className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
                <td className="py-2 px-0 pl-3">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleSaveNewTask}
                      className="h-6 w-6 p-0 hover:bg-green-100"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelNewTask}
                      className="h-6 w-6 p-0 hover:bg-red-100"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </td>
                <td className="py-2 px-3">
                  <Input
                    value={newTaskRow.title}
                    onChange={(e) =>
                      setNewTaskRow({ ...newTaskRow, title: e.target.value })
                    }
                    placeholder="Task name"
                    className="bg-transparent border-0 focus-visible:ring-0 text-gray-900 h-7 text-sm px-0"
                    autoFocus
                  />
                </td>
                <td className="py-2 px-3">
                  <Input
                    value={newTaskRow.assigneEmail}
                    onChange={(e) =>
                      setNewTaskRow({ ...newTaskRow, assigneEmail: e.target.value })
                    }
                    placeholder="email@example.com"
                    className="bg-transparent border-0 focus-visible:ring-0 text-gray-900 h-7 text-sm px-0"
                  />
                </td>
                <td className="py-2 px-3">
                  <Input
                    type="date"
                    value={newTaskRow.dueDate}
                    onChange={(e) =>
                      setNewTaskRow({ ...newTaskRow, dueDate: e.target.value })
                    }
                    className="bg-transparent border-0 focus-visible:ring-0 text-gray-900 h-7 text-sm px-0"
                  />
                </td>
                <td className="py-2 px-3">
                  <Select
                    value={newTaskRow.priority}
                    onValueChange={(value) =>
                      setNewTaskRow({ ...newTaskRow, priority: value })
                    }
                  >
                    <SelectTrigger className="bg-transparent border-0 focus:ring-0 h-7 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-2 px-3">
                  <Select
                    value={newTaskRow.status}
                    onValueChange={(value) =>
                      setNewTaskRow({ ...newTaskRow, status: value })
                    }
                  >
                    <SelectTrigger className="bg-transparent border-0 focus:ring-0 h-7 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-2 px-3"></td>
              </tr>
            )}

            {/* Grouped Tasks */}
            {Object.entries(groupedTasks).map(([status, statusTasks]) => (
              <React.Fragment key={status}>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td colSpan={7} className="py-2 px-0">
                    <button
                      onClick={() => toggleSection(status)}
                      className="flex items-center gap-2 hover:bg-gray-100 rounded px-2 py-1 transition-colors w-full text-left"
                    >
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform ${
                          collapsedSections[status] ? '-rotate-90' : ''
                        }`}
                      />
                      <span className="font-semibold text-gray-800 text-sm">
                        {STATUS_OPTIONS.find(s => s.value === status)?.label || status}
                      </span>
                    </button>
                  </td>
                </tr>
                {!collapsedSections[status] && statusTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer group transition-colors"
                  >
                    <td className="py-2.5 px-0 pl-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity select-none cursor-grab">::</span>
                        <button
                          onClick={(e) => handleMarkComplete(task.id, e)}
                          className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                        >
                          {task.mark_complete ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400 group-hover:text-gray-500" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3" onClick={() => handleTaskClick(task)}>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${task.mark_complete ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {task.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3" onClick={() => handleTaskClick(task)}>
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${getAvatarColor(task.assignee_email)} flex items-center justify-center text-xs font-medium text-white`}>
                          {getInitials(task.assignee_email)}
                        </div>
                        <span className="text-sm text-gray-700">{task.assignee_email?.split('@')[0]}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3" onClick={() => handleTaskClick(task)}>
                      <span className={`text-sm ${
                        formatDate(task.dueDate) === 'Today' ? 'text-green-600 font-medium' : 'text-gray-700'
                      }`}>
                        {getDateRangeText(task.startDate, task.dueDate)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3" onClick={() => handleTaskClick(task)}>
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${
                          task.priority === 'LOW'
                            ? 'bg-green-100 text-green-800'
                            : task.priority === 'MEDIUM'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {task.priority === 'LOW' ? 'Low' : task.priority === 'MEDIUM' ? 'Medium' : 'High'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3" onClick={() => handleTaskClick(task)}>
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${
                          status === 'TODO'
                            ? 'bg-green-100 text-green-800'
                            : status === 'DOING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {status === 'TODO' ? 'On track' : status === 'DOING' ? 'At risk' : 'Off track'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 pr-4">
                      <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                  </tr>
                ))}
                {!collapsedSections[status] && (
                  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td colSpan={7} className="py-2 px-0">
                      <button className="text-sm text-gray-500 hover:text-gray-700 pl-14 py-1 transition-colors">
                        Add task...
                      </button>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            
            {/* Add section button */}
            <tr>
              <td colSpan={7} className="py-3 px-0">
                <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors pl-3">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add section</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Task Details Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[600px] bg-white border-l border-gray-200 overflow-y-auto">
          {selectedTask && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleMarkComplete(selectedTask.id, e)}
                    className="border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-sm"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Mark complete
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <SheetTitle className="text-2xl text-gray-900 mt-6 font-semibold">
                  {selectedTask.title}
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-6">
                {/* Assignee */}
                <div className="flex items-center gap-4">
                  <Label className="w-32 text-gray-600 font-medium text-sm">Assignee</Label>
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full ${getAvatarColor(selectedTask.assignee_email)} flex items-center justify-center text-xs font-medium text-white`}>
                      {getInitials(selectedTask.assignee_email)}
                    </div>
                    <span className="text-gray-900 text-sm">{selectedTask.assignee_email?.split('@')[0]}</span>
                  </div>
                </div>

                {/* Due Date */}
                <div className="flex items-center gap-4">
                  <Label className="w-32 text-gray-600 font-medium text-sm">Due date</Label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{getDateRangeText(selectedTask.startDate, selectedTask.dueDate)}</span>
                  </div>
                </div>

                {/* Projects */}
                <div className="flex items-center gap-4">
                  <Label className="w-32 text-gray-600 font-medium text-sm">Projects</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                    <span className="text-gray-900 text-sm">Project Name</span>
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-3">
                  <Label className="text-gray-900 font-medium text-sm">Fields</Label>
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <div className="flex items-center justify-between p-3 border-b border-gray-200">
                      <span className="text-gray-600 text-sm">Priority</span>
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${
                          selectedTask.priority === 'LOW'
                            ? 'bg-green-100 text-green-800'
                            : selectedTask.priority === 'MEDIUM'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {selectedTask.priority === 'LOW' ? 'Low' : selectedTask.priority === 'MEDIUM' ? 'Medium' : 'High'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3">
                      <span className="text-gray-600 text-sm">Status</span>
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${
                          selectedTask.status === 'TODO'
                            ? 'bg-green-100 text-green-800'
                            : selectedTask.status === 'DOING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {selectedTask.status === 'TODO' ? 'On track' : selectedTask.status === 'DOING' ? 'At risk' : 'Off track'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <Label className="text-gray-900 font-medium text-sm">Description</Label>
                  <p className="text-gray-600 text-sm">
                    {selectedTask.description || 'What is this task about?'}
                  </p>
                </div>

                {/* Subtasks */}
                <div className="space-y-3 border-t border-gray-200 pt-6">
                  <Label className="text-lg text-gray-900 font-semibold">Subtasks</Label>
                  {selectedTask.allSubtasksDestail && selectedTask.allSubtasksDestail.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTask.allSubtasksDestail.map((subtask) => (
                        <div
                          key={subtask.id}
                          className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
                        >
                          <button
                            onClick={() => handleMarkSubtaskComplete(subtask.id)}
                            className="hover:bg-gray-200 rounded-full p-0.5"
                          >
                            {subtask.mark_complete ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <div className="flex-1">
                            <p className={`text-sm ${subtask.mark_complete ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                              {subtask.title}
                            </p>
                          </div>
                          <div className={`w-6 h-6 rounded-full ${getAvatarColor(subtask.assignee_email)} flex items-center justify-center text-xs font-medium text-white`}>
                            {getInitials(subtask.assignee_email)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      + Add subtask
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}