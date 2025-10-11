'use client'
import React, { useEffect, useRef, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Filter, ArrowUpDown, LayoutGrid, Settings, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const GanttChart = () => {
  const ganttRef = useRef(null);
  const ganttInstance = useRef(null);
  const containerRef = useRef(null);
  
  const [tasks, setTasks] = useState([
    { id: 'task1', name: 'Design System', start: '2025-09-30', end: '2025-10-15', progress: 100, dependencies: '', blockedBy: '', assignee: 'ja', completed: true },
    { id: 'task2', name: 'Database Setup', start: '2025-10-01', end: '2025-10-20', progress: 75, dependencies: 'task1', blockedBy: '', assignee: 'ab', completed: false },
    { id: 'task3', name: 'API Development', start: '2025-10-10', end: '2025-11-05', progress: 50, dependencies: 'task2', blockedBy: '', assignee: 'ja', completed: false },
    { id: 'task4', name: 'Frontend Build', start: '2025-10-15', end: '2025-11-15', progress: 30, dependencies: 'task1', blockedBy: 'task3', assignee: 'ab', completed: false },
    { id: 'task5', name: 'Testing', start: '2025-11-01', end: '2025-11-20', progress: 0, dependencies: 'task3,task4', blockedBy: '', assignee: '', completed: false },
    { id: 'task6', name: 'Deployment', start: '2025-11-21', end: '2025-11-30', progress: 0, dependencies: 'task5', blockedBy: 'task5', assignee: '', completed: false }
  ]);

  const [newTaskName, setNewTaskName] = useState('');
  const [selectedBlocker, setSelectedBlocker] = useState('');
  const [selectedBlockedBy, setSelectedBlockedBy] = useState('');
  const [viewMode, setViewMode] = useState('Month');
  const [tableWidth, setTableWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/frappe-gantt@0.6.1/dist/frappe-gantt.min.js';
    script.async = true;
    
    const link = document.createElement('link');
    link.href = 'https://cdn.jsdelivr.net/npm/frappe-gantt@0.6.1/dist/frappe-gantt.css';
    link.rel = 'stylesheet';
    
    document.body.appendChild(script);
    document.head.appendChild(link);

    script.onload = () => {
      setTimeout(initGantt, 100);
    };

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    if (window.Gantt && ganttRef.current) {
      setTimeout(initGantt, 100);
    }
  }, [tasks, viewMode]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = e.clientX - (containerRef.current?.getBoundingClientRect().left || 0);
      if (newWidth > 250 && newWidth < 800) {
        setTableWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  const initGantt = () => {
    if (!window.Gantt || !ganttRef.current) return;

    ganttRef.current.innerHTML = '';

    const ganttTasks = tasks.map(task => ({
      id: task.id,
      name: task.name,
      start: task.start,
      end: task.end,
      progress: task.progress,
      dependencies: task.dependencies || '',
      custom_class: task.completed ? 'bar-completed' : (task.blockedBy ? 'bar-blocked' : '')
    }));

    try {
      ganttInstance.current = new window.Gantt(ganttRef.current, ganttTasks, {
        view_mode: viewMode,
        bar_height: 40,
        bar_corner_radius: 3,
        arrow_curve: 5,
        padding: 25,
        view_modes: ['Day', 'Week', 'Month'],
        date_format: 'YYYY-MM-DD',
        custom_popup_html: (task) => {
          const taskData = tasks.find(t => t.id === task.id);
          const blockedByTask = taskData?.blockedBy ? tasks.find(t => t.id === taskData.blockedBy) : null;
          return `
            <div class="gantt-popup">
              <h5>${task.name}</h5>
              <p><strong>Start:</strong> ${task._start.toLocaleDateString()}</p>
              <p><strong>End:</strong> ${task._end.toLocaleDateString()}</p>
              <p><strong>Progress:</strong> ${task.progress}%</p>
              ${taskData?.assignee ? `<p><strong>Assignee:</strong> ${taskData.assignee.toUpperCase()}</p>` : ''}
              ${blockedByTask ? `<p><strong>Blocked By:</strong> ${blockedByTask.name}</p>` : ''}
            </div>
          `;
        },
        on_date_change: (task, start, end) => {
          updateTaskDates(task.id, start, end);
        },
        on_progress_change: (task, progress) => {
          updateTaskProgress(task.id, progress);
        }
      });
    } catch (e) {
      console.error('Gantt initialization error:', e);
    }
  };

  const updateTaskDates = (id, start, end) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, start: formatDate(start), end: formatDate(end) } : task
      )
    );
  };

  const updateTaskProgress = (id, progress) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, progress } : task
      )
    );
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const addTask = () => {
    if (!newTaskName.trim()) return;
    const today = formatDate(new Date());
    const newTask = {
      id: `task${Date.now()}`,
      name: newTaskName,
      start: today,
      end: today,
      progress: 0,
      dependencies: selectedBlocker || '',
      blockedBy: selectedBlockedBy || '',
      assignee: '',
      completed: false
    };
    setTasks([...tasks, newTask]);
    setNewTaskName('');
    setSelectedBlocker('');
    setSelectedBlockedBy('');
  };

  const toggleTaskComplete = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed, progress: !task.completed ? 100 : 0 } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const getAssigneeColor = (assignee) => {
    if (assignee === 'ja') return 'bg-purple-500';
    if (assignee === 'ab') return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const getBlockedByTaskName = (blockedById) => {
    if (!blockedById) return '—';
    const task = tasks.find(t => t.id === blockedById);
    return task ? task.name : '—';
  };

  return (
    <div className="h-screen w-screen bg-white text-gray-900 flex flex-col overflow-hidden" ref={containerRef}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Project Timeline</h1>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded">Today</span>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === 'Day' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('Day')}
          >
            Day
          </Button>
          <Button 
            variant={viewMode === 'Week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('Week')}
          >
            Week
          </Button>
          <Button 
            variant={viewMode === 'Month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('Month')}
          >
            Month
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          <Button variant="ghost" size="sm" title="Filter">
            <Filter className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Sort">
            <ArrowUpDown className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Group">
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Settings">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Search">
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Task Table */}
        <div className="border-r border-gray-200 flex flex-col bg-white overflow-hidden" style={{ width: `${tableWidth}px` }}>
          {/* Table Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 sticky top-0 z-10 flex-shrink-0">
            <div className="grid gap-3 text-xs font-semibold text-gray-700" style={{ gridTemplateColumns: '1fr 0.8fr 0.9fr 0.9fr' }}>
              <div>Name</div>
              <div>Due date</div>
              <div>Blocked by</div>
              <div></div>
            </div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {tasks.map((task) => (
              <div key={task.id} className="border-b border-gray-100 hover:bg-gray-50 transition px-4 py-3">
                <div className="grid gap-3 text-sm items-center" style={{ gridTemplateColumns: '1fr 0.8fr 0.9fr 0.9fr' }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <button 
                      onClick={() => toggleTaskComplete(task.id)} 
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                        task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {task.completed && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      )}
                    </button>
                    <span className={`truncate text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {task.name}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 truncate">
                    {task.end}
                  </div>

                  <div className="text-xs text-gray-500 truncate">
                    {getBlockedByTaskName(task.blockedBy)}
                  </div>

                  <div className="flex items-center">
                    <button 
                      className="p-1 hover:bg-gray-200 rounded transition" 
                      title="Delete"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Task Row */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="space-y-2">
                <Input
                  placeholder="Add new task..."
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  className="text-sm"
                />
                
                <div className="space-y-2">
                  <Select value={selectedBlocker || 'none'} onValueChange={(val) => setSelectedBlocker(val === 'none' ? '' : val)}>
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue placeholder="Depends on..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {tasks.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedBlockedBy || 'none'} onValueChange={(val) => setSelectedBlockedBy(val === 'none' ? '' : val)}>
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue placeholder="Blocked by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {tasks.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={addTask}
                  className="w-full bg-black hover:bg-gray-900 text-white"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Task
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={() => setIsResizing(true)}
          className="w-1 bg-gray-200 hover:bg-gray-400 cursor-col-resize transition-colors flex-shrink-0"
        />

        {/* Gantt Chart */}
        <div className="flex-1 bg-white overflow-auto" style={{ width: 'calc(100% - 1px)' }}>
          <div ref={ganttRef} style={{ minWidth: '100%' }} />
        </div>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        
        html, body {
          margin: 0;
          padding: 0;
          overflow: hidden;
        }

        .gantt {
          background-color: #ffffff;
        }

        .gantt .bar-wrapper .bar { 
          fill: #8b5cf6; 
          stroke: #7c3aed; 
          stroke-width: 1; 
        }
        
        .gantt .bar-wrapper .bar-completed { 
          fill: #10b981; 
          stroke: #059669;
        }
        
        .gantt .bar-wrapper .bar-blocked { 
          fill: #ef4444; 
          stroke: #dc2626;
          opacity: 0.7;
        }
        
        .gantt .bar-wrapper .bar-progress { 
          fill: #6366f1; 
        }
        
        .gantt .bar-wrapper:hover .bar { 
          fill: #a78bfa; 
          filter: brightness(1.1);
        }
        
        .gantt .arrow { 
          stroke: #ef4444; 
          stroke-width: 1.5; 
          fill: none; 
        }
        
        .gantt .grid-header { 
          fill: #f3f4f6; 
          stroke: #e5e7eb; 
          stroke-width: 1; 
        }
        
        .gantt .grid-row { 
          fill: #ffffff; 
        }
        
        .gantt .grid-row:nth-child(even) { 
          fill: #f9fafb; 
        }
        
        .gantt .tick { 
          stroke: #e5e7eb; 
          stroke-width: 0.5; 
        }
        
        .gantt .today-highlight { 
          fill: #3b82f6; 
          opacity: 0.1; 
        }
        
        .gantt .lower-text, 
        .gantt .upper-text { 
          fill: #6b7280; 
          font-size: 12px; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .gantt .upper-text { 
          fill: #374151; 
          font-size: 13px; 
          font-weight: 600; 
        }
        
        .gantt-popup { 
          background: #ffffff; 
          color: #1f2937; 
          padding: 12px; 
          border-radius: 8px; 
          border: 1px solid #e5e7eb;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        
        .gantt-popup h5 { 
          margin: 0 0 8px; 
          font-size: 14px; 
          font-weight: 700; 
          color: #111827; 
        }
        
        .gantt-popup p { 
          margin: 4px 0; 
          font-size: 12px; 
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default GanttChart;