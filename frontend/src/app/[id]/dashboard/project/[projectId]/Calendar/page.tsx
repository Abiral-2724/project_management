'use client'
import React, { useState, useRef, use } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';
import { X, Filter, Check, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as DatePicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProjectNavbar from '@/components/ProjectNavbar';
import { useProjectNavbar } from '@/hooks/useProjectNavbar';

const assignees = [
  { id: '1', name: 'John Doe', avatar: 'JD', color: '#3b82f6' },
  { id: '2', name: 'Jane Smith', avatar: 'JS', color: '#ec4899' },
  { id: '3', name: 'Mike Johnson', avatar: 'MJ', color: '#10b981' },
  { id: '4', name: 'Sarah Williams', avatar: 'SW', color: '#f59e0b' },
];

const sampleEvents = [
  { id: '1', title: 'Team Meeting', start: '2025-10-09', backgroundColor: '#3b82f6', borderColor: '#3b82f6', allDay: true, extendedProps: { assignee: assignees[0], completed: false } },
  { id: '2', title: 'Project Review', start: '2025-10-14', backgroundColor: '#8b5cf6', borderColor: '#8b5cf6', allDay: true, extendedProps: { assignee: assignees[1], completed: true } },
  { id: '3', title: 'Client Presentation', start: '2025-10-16', backgroundColor: '#ec4899', borderColor: '#ec4899', allDay: true, extendedProps: { assignee: assignees[2], completed: false } },
  { id: '4', title: 'Workshop', start: '2025-10-20', end: '2025-10-22', backgroundColor: '#10b981', borderColor: '#10b981', allDay: true, extendedProps: { assignee: assignees[3], completed: false } }
];

const taskColors = [
  { name: 'Blue', value: '#3b82f6' }, { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' }, { name: 'Green', value: '#10b981' },
  { name: 'Orange', value: '#f59e0b' }, { name: 'Red', value: '#ef4444' },
  { name: 'Teal', value: '#14b8a6' }, { name: 'Indigo', value: '#6366f1' },
];

export default function CalendarUI({params} : any) {
  const { id, projectId } : any = use(params);

  const {
    activeTab,
    isStarred,
    projectDetail,
    projectViews,
    projectMember,
    handleNavClick,
    token,
    handleStarClick,
    handleShareClick,
    handleCustomizeClick,
    setProjectMember,
    navItems
  } = useProjectNavbar(id,projectId,'calendar')
  const [events, setEvents] = useState(sampleEvents);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskColor, setTaskColor] = useState(taskColors[0].value);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedAssignee, setSelectedAssignee] = useState(assignees[0].id);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const calendarRef = useRef(null);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from({ length: 10 }, (_, i) => 2020 + i);

  const createEvent = async (eventData) => {
    console.log('Create event via API:', eventData);
    setEvents([...events, { id: Date.now().toString(), ...eventData, allDay: true }]);
  };

  const updateEvent = async (eventId, eventData) => {
    console.log('Update event via API:', eventId, eventData);
    setEvents(events.map(evt => evt.id === eventId ? { ...evt, ...eventData } : evt));
  };

  const deleteEvent = async (eventId) => {
    console.log('Delete event via API:', eventId);
    setEvents(events.filter(evt => evt.id !== eventId));
  };

  const toggleEventComplete = (eventId) => {
    const event = events.find(evt => evt.id === eventId);
    if (event) updateEvent(eventId, { ...event, extendedProps: { ...event.extendedProps, completed: !event.extendedProps.completed } });
  };

  const handleSaveTask = () => {
    if (taskTitle.trim() && startDate) {
      createEvent({
        title: taskTitle,
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        backgroundColor: taskColor,
        borderColor: taskColor,
        extendedProps: { assignee: assignees.find(a => a.id === selectedAssignee), completed: false }
      });
      setTaskTitle('');
      setIsDialogOpen(false);
    }
  };

  const changeView = (view) => {
    setCurrentView(view);
    calendarRef.current?.getApi().changeView(view);
  };

  const formatDate = (date) => date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pick a date';

  const renderEventContent = (eventInfo) => {
    const { assignee, completed } = eventInfo.event.extendedProps;
    return (
      <div className="flex items-center gap-2 px-2 py-1">
        <div onClick={(e) => { e.stopPropagation(); toggleEventComplete(eventInfo.event.id); }} className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center cursor-pointer ${completed ? 'bg-green-500' : 'bg-gray-600 hover:bg-gray-500'}`}>
          {completed && <Check size={14} className="text-white" />}
        </div>
        {assignee && <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ backgroundColor: assignee.color }}>{assignee.avatar}</div>}
        <span className={`flex-1 text-sm truncate ${completed ? 'line-through opacity-60' : ''}`}>{eventInfo.event.title}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
       
    <ProjectNavbar
    projectDetail={projectDetail}
    projectMember={projectMember}
    navItems={navItems}
    activeTab={activeTab}
    handleNavClick={handleNavClick}
    isStarred={isStarred}
    handleStarClick={handleStarClick}
    handleShareClick={handleShareClick}
    handleCustomizeClick={handleCustomizeClick}
    ></ProjectNavbar>
     <div className="min-h-screen bg-[#1a1a1a] text-white p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="bg-[#2a2a2a] hover:bg-[#333333] border-[#404040] text-white">
            <span className="text-lg mr-2">+</span>Add task
          </Button>
          <div className="flex items-center gap-2">
            <Button onClick={() => { calendarRef.current?.getApi().prev(); setCurrentDate(calendarRef.current?.getApi().getDate()); }} variant="outline" size="icon" className="bg-[#2a2a2a] hover:bg-[#333333] border-[#404040] text-white">‹</Button>
            <Button onClick={() => { calendarRef.current?.getApi().today(); setCurrentDate(new Date()); }} variant="outline" className="bg-[#2a2a2a] hover:bg-[#333333] border-[#404040] text-white">Today</Button>
            <Button onClick={() => { calendarRef.current?.getApi().next(); setCurrentDate(calendarRef.current?.getApi().getDate()); }} variant="outline" size="icon" className="bg-[#2a2a2a] hover:bg-[#333333] border-[#404040] text-white">›</Button>
          </div>
          <div className="text-xl font-semibold px-4">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2 bg-[#2a2a2a] rounded-lg p-1 border border-[#404040]">
            <Button onClick={() => changeView('timeGridWeek')} variant="ghost" className={currentView === 'timeGridWeek' ? 'bg-[#3b82f6] text-white hover:bg-[#2563eb]' : 'hover:bg-[#333333] text-white'}>Weeks</Button>
            <Button onClick={() => changeView('dayGridMonth')} variant="ghost" className={currentView === 'dayGridMonth' ? 'bg-[#3b82f6] text-white hover:bg-[#2563eb]' : 'hover:bg-[#333333] text-white'}>Months</Button>
            <Button onClick={() => changeView('multiMonthYear')} variant="ghost" className={currentView === 'multiMonthYear' ? 'bg-[#3b82f6] text-white hover:bg-[#2563eb]' : 'hover:bg-[#333333] text-white'}>Year</Button>
          </div>
          <Button onClick={() => setIsFilterOpen(!isFilterOpen)} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
            <Filter size={16} className="mr-2" />Filters: 1<X size={16} className="ml-2" />
          </Button>
          <Button variant="outline" className="bg-[#2a2a2a] hover:bg-[#333333] border-[#404040] text-white">Options</Button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="mb-4 p-4 bg-[#2a2a2a] rounded-lg border border-[#404040]">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">Month</label>
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="bg-[#1a1a1a] border-[#404040] text-white"><SelectValue placeholder="Select Month" /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#404040] text-white">{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">Year</label>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="bg-[#1a1a1a] border-[#404040] text-white"><SelectValue placeholder="Select Year" /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#404040] text-white">{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={() => { if (filterMonth && filterYear) { const api = calendarRef.current?.getApi(); const date = new Date(parseInt(filterYear), months.indexOf(filterMonth), 1); api?.gotoDate(date); setCurrentDate(date); setIsFilterOpen(false); }}} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">Apply Filter</Button>
          </div>
        </div>
      )}

      <div className="bg-[#1e1e1e] rounded-lg border border-[#404040] p-4">
        <style>{`
          .fc{--fc-border-color:#404040;--fc-today-bg-color:rgba(59,130,246,0.1)}
          .fc .fc-col-header-cell{background:#2a2a2a;color:#9ca3af;font-weight:600;text-transform:uppercase;font-size:0.75rem;padding:0.75rem;border-color:#404040}
          .fc .fc-daygrid-day{background:#1a1a1a;min-height:120px}
          .fc .fc-daygrid-day:hover{background:#242424}
          .fc .fc-daygrid-day-number{color:white;padding:0.5rem;font-size:1rem}
          .fc .fc-daygrid-day.fc-day-today{background:rgba(59,130,246,0.05)}
          .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number{background:#3b82f6;border-radius:50%;width:2rem;height:2rem;display:flex;align-items:center;justify-content:center;margin:0.25rem}
          .fc .fc-event{border-radius:0.5rem;cursor:pointer;border:none;margin:0.25rem}
          .fc .fc-event:hover{opacity:0.9}
          .fc-theme-standard td,.fc-theme-standard th{border-color:#404040}
          .fc .fc-scrollgrid{border-color:#404040}
          .fc-multimonth{background:#1a1a1a}
          .fc-multimonth-month{border-color:#404040!important}
          .fc-multimonth-header{background:#2a2a2a}
          .fc-multimonth-title{color:white!important;padding:0.5rem}
          .fc-timeGridWeek-view .fc-timegrid-axis,.fc-timeGridWeek-view .fc-timegrid-slot-label,.fc-timeGridWeek-view .fc-timegrid-divider{display:none}
          .fc-timeGridWeek-view .fc-timegrid-body{min-height:500px}
        `}</style>
        <FullCalendar ref={calendarRef} plugins={[dayGridPlugin,timeGridPlugin,interactionPlugin,multiMonthPlugin]} initialView={currentView} headerToolbar={false} events={events} editable selectable dateClick={(arg) => { setStartDate(new Date(arg.dateStr)); setEndDate(new Date(arg.dateStr)); setIsDialogOpen(true); }} eventClick={(info) => { if (confirm(`Delete '${info.event.title}'?`)) deleteEvent(info.event.id); }} eventDrop={(info) => updateEvent(info.event.id, { start: info.event.start, end: info.event.end })} eventResize={(info) => updateEvent(info.event.id, { start: info.event.start, end: info.event.end })} eventContent={renderEventContent} height="auto" multiMonthMaxColumns={3} />
      </div>

      {isDialogOpen && (
        <div className="fixed top-20 right-8 bg-[#2a2a2a] rounded-lg border-2 border-[#3b82f6] shadow-2xl p-6 w-96 z-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Add Task</h2>
            <Button onClick={() => setIsDialogOpen(false)} variant="ghost" size="icon" className="text-gray-400 hover:text-white"><X size={24} /></Button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Task Title</label>
              <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Enter task title" className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#404040] rounded-lg focus:outline-none focus:border-[#3b82f6] text-white" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-[#1a1a1a] border-[#404040] text-white hover:bg-[#242424]">
                      <Calendar className="mr-2 h-4 w-4" />{formatDate(startDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-[#404040]">
                    <DatePicker mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="bg-[#1a1a1a] text-white" />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-[#1a1a1a] border-[#404040] text-white hover:bg-[#242424]">
                      <Calendar className="mr-2 h-4 w-4" />{formatDate(endDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-[#404040]">
                    <DatePicker mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="bg-[#1a1a1a] text-white" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Task Color</label>
              <div className="grid grid-cols-8 gap-2">
                {taskColors.map(c => <button key={c.value} onClick={() => setTaskColor(c.value)} className={`w-8 h-8 rounded-full transition-all ${taskColor === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#2a2a2a]' : ''}`} style={{backgroundColor:c.value}} title={c.name} />)}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Assignee</label>
              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger className="bg-[#1a1a1a] border-[#404040] text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#404040] text-white">
                  {assignees.map(a => <SelectItem key={a.id} value={a.id}><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{backgroundColor:a.color}}>{a.avatar}</div>{a.name}</div></SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="bg-[#1a1a1a] hover:bg-[#333333] border-[#404040] text-white">Cancel</Button>
              <Button onClick={handleSaveTask} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">Save Task</Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
   
  );
}