'use client'
import React, { useState, useRef, use } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import { X, Filter, Check, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as DatePicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjectNavbar } from '@/hooks/useProjectNavbar';
import ProjectNavbar from '@/components/ProjectNavbar';

const assignees = [
  { id: '1', name: 'John Doe', avatar: 'JD', color: '#3b82f6' },
  { id: '2', name: 'Jane Smith', avatar: 'JS', color: '#ec4899' },
  { id: '3', name: 'Mike Johnson', avatar: 'MJ', color: '#10b981' },
  { id: '4', name: 'Sarah Williams', avatar: 'SW', color: '#f59e0b' },
];

const sampleEvents = [
  {
    id: '1',
    resourceId: '1',
    title: 'firsttask 2',
    start: '2025-09-30',
    end: '2025-10-01',
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
    extendedProps: { assignee: assignees[0], completed: true, dueDate: '30 Sep' }
  },
  {
    id: '2',
    resourceId: '1',
    title: 'hello',
    start: '2025-10-01',
    end: '2025-10-02',
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
    extendedProps: { assignee: assignees[0], completed: true, dueDate: '1 Oct' }
  },
  {
    id: '3',
    resourceId: '1',
    title: 'lsllslsls',
    start: '2025-10-01',
    end: '2025-10-02',
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
    extendedProps: { assignee: assignees[1], completed: true, dueDate: '1 Oct' }
  },
  {
    id: '4',
    resourceId: '1',
    title: 'I',
    start: '2025-10-06',
    end: '2025-10-07',
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    extendedProps: { assignee: assignees[2], completed: false, dueDate: '6 Oct' }
  },
  {
    id: '5',
    resourceId: '1',
    title: 'II',
    start: '2025-10-06',
    end: '2025-10-07',
    backgroundColor: '#10b981',
    borderColor: '#10b981',
    extendedProps: { assignee: assignees[1], completed: false, dueDate: '6 Oct' }
  },
  {
    id: '6',
    resourceId: '1',
    title: 'IIIII',
    start: '2025-10-06',
    end: '2025-10-07',
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
    extendedProps: { assignee: assignees[3], completed: false, dueDate: '6 Oct' }
  },
  {
    id: '7',
    resourceId: '1',
    title: 'IIII',
    start: '2025-10-06',
    end: '2025-10-07',
    backgroundColor: '#ec4899',
    borderColor: '#ec4899',
    extendedProps: { assignee: assignees[0], completed: false, dueDate: '6 Oct' }
  },
  {
    id: '8',
    resourceId: '1',
    title: 'make calender',
    start: '2025-10-08',
    end: '2025-10-09',
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
    extendedProps: { assignee: assignees[2], completed: true, dueDate: 'yesterday' }
  },
  {
    id: '9',
    resourceId: '1',
    title: 'llll',
    start: '2025-10-08',
    end: '2025-10-09',
    backgroundColor: '#14b8a6',
    borderColor: '#14b8a6',
    extendedProps: { assignee: assignees[1], completed: true, dueDate: 'yesterday' }
  },
  {
    id: '10',
    resourceId: '1',
    title: 'kksksks',
    start: '2025-11-04',
    end: '2025-11-05',
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
    extendedProps: { assignee: assignees[3], completed: false, dueDate: '4 Nov' }
  },
];

const resources = [{ id: '1', title: '' }];

const taskColors = [
  { name: 'Blue', value: '#3b82f6' }, { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' }, { name: 'Green', value: '#10b981' },
  { name: 'Orange', value: '#f59e0b' }, { name: 'Red', value: '#ef4444' },
  { name: 'Teal', value: '#14b8a6' }, { name: 'Indigo', value: '#6366f1' },
];

const timelineViews = [
  { value: 'resourceTimelineDays', label: 'Days' },
  { value: 'resourceTimelineWeeks', label: 'Weeks' },
  { value: 'resourceTimelineMonths', label: 'Months' },
  { value: 'resourceTimelineQuarter', label: 'Quarterly' },
  { value: 'resourceTimelineSixMonths', label: 'Half Year' },
  { value: 'resourceTimelineYear', label: 'Yearly' },
];

export default function TimelineCalendarUI({params} : any) {

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
  } = useProjectNavbar(id,projectId,'timeline')
  const [events, setEvents] = useState(sampleEvents);
  const [currentView, setCurrentView] = useState('resourceTimelineWeeks');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskColor, setTaskColor] = useState(taskColors[0].value);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedAssignee, setSelectedAssignee] = useState(assignees[0].id);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [visibleRange, setVisibleRange] = useState('');
  const calendarRef = useRef(null);
  const scrollTimeout = useRef(null);

  const createEvent = async (eventData) => {
    console.log('Create event via API:', eventData);
    setEvents([...events, { id: Date.now().toString(), resourceId: '1', ...eventData }]);
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
      const assignee = assignees.find(a => a.id === selectedAssignee);
      createEvent({
        title: taskTitle,
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        backgroundColor: taskColor,
        borderColor: taskColor,
        extendedProps: { assignee, completed: false, dueDate: startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) }
      });
      setTaskTitle('');
      setIsDialogOpen(false);
    }
  };

  const changeView = (view) => {
    setCurrentView(view);
    calendarRef.current?.getApi().changeView(view);
    updateVisibleRange();
  };

  const updateVisibleRange = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const view = calendarApi.view;
      const start = view.currentStart;
      const end = view.currentEnd;
      
      let rangeText = '';
      if (currentView.includes('Days')) {
        rangeText = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      } else if (currentView.includes('Weeks')) {
        rangeText = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      } else if (currentView.includes('Months')) {
        rangeText = `${start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
      } else if (currentView.includes('Quarter')) {
        rangeText = `Q${Math.floor(start.getMonth() / 3) + 1} ${start.getFullYear()} - Q${Math.floor(end.getMonth() / 3) + 1} ${end.getFullYear()}`;
      } else if (currentView.includes('SixMonths')) {
        rangeText = `${start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
      } else if (currentView.includes('Year')) {
        rangeText = `${start.getFullYear()} - ${end.getFullYear()}`;
      }
      
      setVisibleRange(rangeText);
    }
  };

  const handleScroll = (e) => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    
    scrollTimeout.current = setTimeout(() => {
      const scroller = e.target;
      const scrollWidth = scroller.scrollWidth;
      const scrollLeft = scroller.scrollLeft;
      const clientWidth = scroller.clientWidth;
      
      // If scrolled near the end (90%), load more future dates
      if (scrollLeft + clientWidth >= scrollWidth * 0.9) {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
          calendarApi.next();
          updateVisibleRange();
        }
      }
    }, 150);
  };

  const formatDate = (date) => date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pick a date';

  const renderEventContent = (eventInfo) => {
    const { assignee, completed, dueDate } = eventInfo.event.extendedProps;
    return (
      <div className="flex items-center gap-2 px-2 py-1 h-full">
        <div onClick={(e) => { e.stopPropagation(); toggleEventComplete(eventInfo.event.id); }} className={`flex-shrink-0 w-4 h-4 rounded flex items-center justify-center cursor-pointer ${completed ? 'bg-green-500' : 'bg-gray-600 hover:bg-gray-500'}`}>
          {completed && <Check size={10} className="text-white" />}
        </div>
        {assignee && <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-white" style={{ backgroundColor: assignee.color }}>{assignee.avatar}</div>}
        <div className="flex flex-col">
          <span className={`text-xs truncate ${completed ? 'line-through opacity-60' : ''}`}>{eventInfo.event.title}</span>
          <span className="text-[10px] text-gray-400">Due {dueDate}</span>
        </div>
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
            <Plus size={16} className="mr-2" />Add task
          </Button>
          <div className="flex items-center gap-2">
            <Button onClick={() => { calendarRef.current?.getApi().prev(); updateVisibleRange(); }} variant="outline" size="icon" className="bg-[#2a2a2a] hover:bg-[#333333] border-[#404040] text-white">‹</Button>
            <Button onClick={() => { calendarRef.current?.getApi().today(); setCurrentDate(new Date()); updateVisibleRange(); }} variant="outline" className="bg-[#2a2a2a] hover:bg-[#333333] border-[#404040] text-white">Today</Button>
            <Button onClick={() => { calendarRef.current?.getApi().next(); updateVisibleRange(); }} variant="outline" size="icon" className="bg-[#2a2a2a] hover:bg-[#333333] border-[#404040] text-white">›</Button>
          </div>
          {visibleRange && (
            <div className="px-4 py-2 bg-[#2a2a2a] rounded-lg border border-[#404040]">
              <span className="text-sm text-gray-300 font-medium">{visibleRange}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">No date (1)</span>
          <Select value={currentView} onValueChange={changeView}>
            <SelectTrigger className="w-32 bg-[#2a2a2a] border-[#404040] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#2a2a2a] border-[#404040] text-white">
              {timelineViews.map(view => <SelectItem key={view.value} value={view.value}>{view.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-[#333333]">−</Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-[#333333]">+</Button>
          </div>
          <Button variant="outline" className="bg-[#2a2a2a] hover:bg-[#333333] border-[#404040] text-white">
            <Filter size={16} className="mr-2" />Filter
          </Button>
          <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
            Sort: Start date<X size={16} className="ml-2" />
          </Button>
          <Button variant="outline" className="bg-[#2a2a2a] hover:bg-[#333333] border-[#404040] text-white">Options</Button>
          <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">Save view</Button>
        </div>
      </div>

      <div className="bg-[#1e1e1e] rounded-lg border border-[#404040]">
        <style>{`
          .fc{--fc-border-color:#404040;--fc-today-bg-color:rgba(59,130,246,0.05)}
          .fc-theme-standard td,.fc-theme-standard th{border-color:#404040}
          .fc .fc-scrollgrid{border-color:#404040}
          .fc .fc-col-header-cell{background:#2a2a2a;color:#9ca3af;font-weight:600;font-size:0.75rem;padding:0.5rem;border-color:#404040}
          .fc .fc-timeline-slot{background:#1a1a1a;color:#9ca3af}
          .fc .fc-timeline-slot:hover{background:#242424}
          .fc .fc-resource-timeline .fc-resource{background:#2a2a2a;border-color:#404040;padding:0.5rem}
          .fc-timeline-event{border-radius:0.375rem;border:none;margin:2px 0}
          .fc-timeline-event:hover{opacity:0.9}
          .fc-direction-ltr .fc-timeline-event{margin-right:2px}
          .fc .fc-datagrid-cell{border-color:#404040;background:#2a2a2a}
          .fc-timeline-slot-cushion{color:#9ca3af;font-size:0.75rem}
          .fc .fc-resource-timeline-divider{border-color:#404040;width:0}
          .fc-timegrid-slot-label-cushion{color:#9ca3af}
          .fc .fc-toolbar-title{color:white}
          .fc .fc-datagrid-expander{display:none}
          .fc-resource-timeline .fc-timeline-slot-frame{min-height:80px}
          .fc-timeline-event-harness{min-height:35px}
          .fc-resource-timeline-divider{width:0 !important}
          .fc .fc-datagrid-body{width:0 !important}
          .fc .fc-datagrid-header{width:0 !important}
          .fc .fc-resource-timeline .fc-datagrid{width:0 !important}
          .fc .fc-scroller-harness{overflow:visible !important}
          .fc .fc-scroller{overflow-x:auto !important;overflow-y:auto !important}
          .fc .fc-scroller-liquid-absolute{overflow:auto !important}
          .fc-timeline-body .fc-scroller{max-height:none !important}
          .fc .fc-timeline-body .fc-scroller-harness{overflow-x:auto !important}
          .fc .fc-scrollgrid-section-body .fc-scroller{overflow-x:scroll !important}
          
          /* Custom scrollbar styling */
          .fc .fc-scroller::-webkit-scrollbar{height:12px;background:#1a1a1a}
          .fc .fc-scroller::-webkit-scrollbar-track{background:#1a1a1a;border-radius:6px}
          .fc .fc-scroller::-webkit-scrollbar-thumb{background:#4a4a4a;border-radius:6px}
          .fc .fc-scroller::-webkit-scrollbar-thumb:hover{background:#5a5a5a}
        `}</style>
        <div 
          onScroll={handleScroll}
          style={{ height: '600px', overflow: 'auto' }}
        >
          <FullCalendar
          ref={calendarRef}
          plugins={[resourceTimelinePlugin, interactionPlugin]}
          initialView={currentView}
          views={{
            resourceTimelineDays: {
              type: 'resourceTimeline',
              duration: { days: 60 },
              slotDuration: { days: 1 },
              slotLabelFormat: { weekday: 'short', day: 'numeric' }
            },
            resourceTimelineWeeks: {
              type: 'resourceTimeline',
              duration: { weeks: 52 },
              slotDuration: { weeks: 1 },
              slotLabelFormat: { month: 'short', day: 'numeric' }
            },
            resourceTimelineMonths: {
              type: 'resourceTimeline',
              duration: { months: 36 },
              slotDuration: { months: 1 },
              slotLabelFormat: { month: 'short', year: 'numeric' }
            },
            resourceTimelineQuarter: {
              type: 'resourceTimeline',
              duration: { years: 8 },
              slotDuration: { months: 3 },
              slotLabelFormat: [
                { year: 'numeric' },
                { month: 'short' }
              ]
            },
            resourceTimelineSixMonths: {
              type: 'resourceTimeline',
              duration: { years: 10 },
              slotDuration: { months: 6 },
              slotLabelFormat: [
                { year: 'numeric' },
                { month: 'short' }
              ]
            },
            resourceTimelineYear: {
              type: 'resourceTimeline',
              duration: { years: 20 },
              slotDuration: { years: 1 },
              slotLabelFormat: { year: 'numeric' }
            }
          }}
          headerToolbar={false}
          resources={resources}
          events={events}
          resourceAreaWidth="0"
          editable={true}
          selectable={true}
          eventClick={(info) => { if (confirm(`Delete '${info.event.title}'?`)) deleteEvent(info.event.id); }}
          eventDrop={(info) => updateEvent(info.event.id, { start: info.event.start, end: info.event.end })}
          eventResize={(info) => updateEvent(info.event.id, { start: info.event.start, end: info.event.end })}
          eventContent={renderEventContent}
          height="600px"
          slotMinWidth={120}
          stickyHeaderDates={true}
          scrollTime="00:00:00"
          nowIndicator={true}
          eventResizableFromStart={true}
          datesSet={updateVisibleRange}
        />
        </div>
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