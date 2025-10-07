'use client'

import React, { use, useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend, Label } from 'recharts'
import { Maximize2, Edit2, MoreHorizontal, Plus, X, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card' ;
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useProjectNavbar } from '@/hooks/useProjectNavbar';
import ProjectNavbar from '@/components/ProjectNavbar';

const TaskDashboard = ({params} : any) => {
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
  } = useProjectNavbar(id,projectId,'dashboard')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<{
    title: string
    filters: string
    chart: React.ReactNode
  } | null>(null) ; 

  const [dashboardDetail ,setDashboardDetail] = useState<any>({}) ;

  
  useEffect(() => {
    const getDashboardDetail = async() => {
      try{
          const response = await axios.get(`http://localhost:4000/api/v1/task/${id}/project/${projectId}/dashboard/detail`);
  
          console.log(response.data) ; 
          await setDashboardDetail(response.data)
      }catch(e : any){
        const errorMessage =
        e.response?.data?.message || e.message || "Something went wrong";
      toast.error(errorMessage);
      console.log("Error occurred while fetching project timeline:", e.response?.data || e.message);
      
      }
    }

    getDashboardDetail() ; 
  } ,[])


  

  // Sample data
  const incompleteBySectionData = [
    { section: 'Tasks no...', count: 3 }
  ]

  const completionStatusData = [
    { name: 'Completed', value: 4, color: '#8B5CF6' },
    { name: 'Incomplete', value: 3, color: '#C4B5FD' }
  ]

  // Process task completion over time from API
  const taskCompletionOverTimeData = React.useMemo(() => {
    if (!dashboardDetail.taskcompletion) return [];
    
    const dateMap = new Map();
    
    dashboardDetail.taskcompletion.forEach((task: any) => {
      const date = new Date(task.timeofcompletion);
      const dateKey = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { date: dateKey, total: 0, completed: 0 });
      }
      
      const entry = dateMap.get(dateKey);
      entry.total += 1;
      if (task.complete) {
        entry.completed += 1;
      }
    });
    
    // Sort by date
    return Array.from(dateMap.values()).sort((a, b) => {
      const [dayA, monthA] = a.date.split('/').map(Number);
      const [dayB, monthB] = b.date.split('/').map(Number);
      return monthA !== monthB ? monthA - monthB : dayA - dayB;
    });
  }, [dashboardDetail]);

  const priorityData = [
    { priority: 'low', count: dashboardDetail.lowPriority || 0, color: '#86EFAC' },
    { priority: 'medium', count: dashboardDetail.mediumPriority || 0, color: '#FCA5A5' },
    { priority: 'high', count: dashboardDetail.highPriority || 0, color: 'blue' }
  ]
  let totalPriority =
  (dashboardDetail.lowPriority || 0) +
  (dashboardDetail.mediumPriority || 0) +
  (dashboardDetail.highPriority || 0);

const steps = 10;

// ensure stepSize is at least 1
const stepSize = Math.max(1, Math.ceil(totalPriority / steps));

// build array
let totalPriorityArray: number[] = [];
for (let i = 0; i <= totalPriority; i += stepSize) {
  totalPriorityArray.push(i);
}

// ensure last value > totalPriority
if (totalPriorityArray[totalPriorityArray.length - 1] <= totalPriority) {
  totalPriorityArray.push(totalPriority + stepSize);
}

  // Process assignee data from API
  const upcomingByAssigneeData = React.useMemo(() => {
    if (!dashboardDetail.counttaskWithAssignEmails) return [];
    return dashboardDetail.counttaskWithAssignEmails.map((item: any) => ({
      counttotal: (item.incompleteCount || 0) + (item.completeCount || 0),
      email: item.email,
      count: item.incompleteCount,
      countcomplete : item.completeCount,
      profile : dashboardDetail.profile?.[item.email],
      initials: item.email.substring(0, 2).toUpperCase()
    }));
  }, [dashboardDetail]);

  console.log("upcomming" ,upcomingByAssigneeData)

  const openModal = (title: string, filters: string, chart: React.ReactNode) => {
    setModalContent({ title, filters, chart })
    setModalOpen(true)
  }

  

  const COLORS = {
    primary: '#3b82f6',
    primaryLight: '#93c5fd',
    purple: '#8b5cf6',
    purpleLight: '#c4b5fd',
    green: '#86efac',
    red: '#fca5a5',
    gray: '#e5e7eb'
  }
  const description = "Total tasks by completion status"
const chartData = [
  { browser: "Completed", visitors: dashboardDetail.completedTask, fill: "var(--color-safari)" },
  { browser: "Incomplete", visitors: dashboardDetail.notcompletedTask, fill: "var(--color-firefox)" },
]
const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig
const totalVisitors = React.useMemo(() => {
  return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
}, [])

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
 <div className="min-h-screen bg-gray-50 p-6 font-extralight">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" className="gap-2">
          <Plus size={16} />
          Add widget
        </Button>
        <Button variant="ghost" className="text-gray-600">
          Send feedback
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-5">
        <StatCard title="Total completed tasks" value={dashboardDetail.completedTask || 0} filter="1 Filter" />
        <StatCard title="Total incomplete tasks" value={dashboardDetail.notcompletedTask || 0} filter="1 Filter" />
        <StatCard title="Total overdue tasks" value="0" filter="1 Filter" />
        <StatCard title="Total tasks" value={dashboardDetail.totalTask || 0} filter="No Filters" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Incomplete by Section */}
        <ChartCard 
          title="Total incomplete tasks" 
          filters="2 Filters"
          showSeeAll
          onMaximize={() => openModal(
            "Total incomplete tasks by section",
            "2 Filters",
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={incompleteBySectionData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="section" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  stroke="#9ca3af"
                />
                <YAxis 
                  label={{ value: 'Task (count, in numbers)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
                  domain={[0, 4]}
                  ticks={[0, 1, 2, 3, 4]}
                  stroke="#9ca3af"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                  {incompleteBySectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#3b82f6" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        >
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={incompleteBySectionData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
                dataKey="section" 
                angle={-45}
                textAnchor="end"
                height={80}
                stroke="#9ca3af"
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                label={{ value: 'Task (count)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
                domain={[0, 4]}
                ticks={[0, 1, 2, 3, 4]}
                stroke="#9ca3af"
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                {incompleteBySectionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#3b82f6" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Completion Status Donut */}
        <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Total tasks by completion status</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total tasks
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="ml-8 space-y-3 flex flex-row gap-4">
              <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-[var(--chart-2)]"></div>

                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 rounded-sm bg-[var(--chart-3)]"></div>
                <span className="text-sm">Incomplete</span>
              </div>
            </div>
        <div className="text-muted-foreground leading-none">
          Showing total tasks of the last
        </div>
      </CardFooter>
    </Card>

      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Upcoming by Assignee */}
        <ChartCard 
          title="Total upcoming tasks by assignee" 
          filters="2 Filters"
          showSeeAll
          onMaximize={() => openModal(
            "Total upcoming tasks by assignee",
            "2 Filters",
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={upcomingByAssigneeData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
  dataKey="email"
  tick={({ x, y, payload }) => {
    const item = upcomingByAssigneeData.find(
      (d: any) => d.email.trim().toLowerCase() === payload.value.trim().toLowerCase()
    );

    return (
      <g transform={`translate(${x},${y})`}>
        <defs>
          <clipPath id={`circleClip-${payload.value}`}>
            <circle cx="0" cy="25" r="20" />
          </clipPath>
        </defs>

        {/* Circle background */}
        <circle cx={0} cy={25} r={20} fill="#93C5FD" />

        {/* Profile Image */}
        {item?.profile ? (
          <image
            xlinkHref={item.profile}
            x={-20}
            y={5}
            width={40}
            height={40}
            clipPath={`url(#circleClip-${payload.value})`}
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          <text 
            x={0} 
            y={32} 
            textAnchor="middle" 
            fill="#1E3A8A"
            fontSize={14}
            fontWeight={600}
          >
            {item?.initials || ''}
          </text>
        )}

        {/* Email label */}
        <text
          x={0}
          y={65}
          textAnchor="middle"
          fill="#6b7280"
          fontSize={11}
        >
          {payload.value}
        </text>
      </g>
    );
  }}
  height={120} // ⬆️ Increased height for better spacing
/>


                <YAxis 
                  label={{ value: 'Task (count, in numbers)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
                  stroke="#9ca3af"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                  {upcomingByAssigneeData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill="#3b82f6" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        >
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={upcomingByAssigneeData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
  dataKey="email"
  tick={({ x, y, payload }) => {
    const item = upcomingByAssigneeData.find(
      (d: any) => d.email.trim().toLowerCase() === payload.value.trim().toLowerCase()
    );

    return (
      <g transform={`translate(${x},${y})`}>
        <defs>
          <clipPath id={`circleClip-${payload.value}`}>
            <circle cx="0" cy="25" r="20" />
          </clipPath>
        </defs>

        {/* Circle background */}
        <circle cx={0} cy={25} r={20} fill="#93C5FD" />

        {/* Profile Image */}
        {item?.profile ? (
          <image
            xlinkHref={item.profile}
            x={-20}
            y={5}
            width={40}
            height={40}
            clipPath={`url(#circleClip-${payload.value})`}
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          <text 
            x={0} 
            y={32} 
            textAnchor="middle" 
            fill="#1E3A8A"
            fontSize={14}
            fontWeight={600}
          >
            {item?.initials || ''}
          </text>
        )}

        {/* Email label */}
        <text
          x={0}
          y={65}
          textAnchor="middle"
          fill="#6b7280"
          fontSize={11}
        >
          {payload.value}
        </text>
      </g>
    );
  }}
  height={120} // ⬆️ Increased height for better spacing
/>


              <YAxis 
                label={{ value: 'Task (count)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
                stroke="#9ca3af"
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                {upcomingByAssigneeData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill="#3b82f6" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Task Completion Over Time */}
        <ChartCard 
          title="Task completion over time" 
          filters="No Filters"
          showSeeAll
          onMaximize={() => openModal(
            "Task completion over time",
            "No Filters",
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={taskCompletionOverTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="date"
                  tick={{ fontSize: 14, fill: '#000000' }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  label={{ value: 'Task (count)', angle: -90, position: 'insideLeft', style: { fill: 'black' } }}
                  stroke="#9ca3af"
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  align="right"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stackId="1"
                  stroke="none" 
                  fill="#93c5fd" 
                  name="Total"
                />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stackId="2"
                  stroke="none" 
                  fill="#3b82f6" 
                  name="Completed"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        >
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={taskCompletionOverTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
                dataKey="date"
                tick={{ fontSize: 12, fill: 'black' }}
                stroke="#9ca3af"
              />
              <YAxis 
                label={{ value: 'Task (count)', angle: -90, position: 'insideLeft', style: { fill: 'black' } }}
                stroke="black"
                tick={{ fill: 'black' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Legend 
                verticalAlign="bottom" 
                align="right"
                wrapperStyle={{ paddingTop: '10px' }}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stackId="1"
                stroke="none" 
                fill="#93c5fd" 
                name="Total"
              />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stackId="2"
                stroke="none" 
                fill="#3b82f6" 
                name="Completed"
              />
            </AreaChart>
          </ResponsiveContainer>
         
        </ChartCard>
      </div>

      {/* Priority Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard 
          title="Total tasks by priority" 
        >
          <ResponsiveContainer width="100%" height={390}>
            <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
                dataKey="priority"
                tick={{ fontSize: 14, fill: 'black' }}
                stroke="#9ca3af"
              />
              <YAxis 
                label={{ value: 'Task(count)', angle: -90, position: 'insideLeft', style: { fill: 'black' } }}
                domain={[0, 'auto']}
                ticks={totalPriorityArray}
                stroke="#9ca3af"
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' ,textAlign:'center' }} 
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard 
          title="Total tasks by assignee" 
          filters="2 Filters"
          showSeeAll
          onMaximize={() => openModal(
            "Total tasks by assignee",
            "2 Filters",
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={upcomingByAssigneeData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
  dataKey="email"
  tick={({ x, y, payload }) => {
    const item = upcomingByAssigneeData.find(
      (d: any) => d.email.trim().toLowerCase() === payload.value.trim().toLowerCase()
    );

    return (
      <g transform={`translate(${x},${y})`}>
        <defs>
          <clipPath id={`circleClip-${payload.value}`}>
            <circle cx="0" cy="25" r="20" />
          </clipPath>
        </defs>

        {/* Circle background */}
        <circle cx={0} cy={25} r={20} fill="#93C5FD" />

        {/* Profile Image */}
        {item?.profile ? (
          <image
            xlinkHref={item.profile}
            x={-20}
            y={5}
            width={40}
            height={40}
            clipPath={`url(#circleClip-${payload.value})`}
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          <text 
            x={0} 
            y={32} 
            textAnchor="middle" 
            fill="#1E3A8A"
            fontSize={14}
            fontWeight={600}
          >
            {item?.initials || ''}
          </text>
        )}

        {/* Email label */}
        <text
          x={0}
          y={65}
          textAnchor="middle"
          fill="#6b7280"
          fontSize={11}
        >
          {payload.value}
        </text>
      </g>
    );
  }}
  height={120} // ⬆️ Increased height for better spacing
/>


                <YAxis 
                  label={{ value: 'Task (count, in numbers)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
                  stroke="#9ca3af"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar dataKey="counttotal" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                  {upcomingByAssigneeData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill="#3b82f6" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        >
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={upcomingByAssigneeData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
  dataKey="email"
  tick={({ x, y, payload }) => {
    const item = upcomingByAssigneeData.find(
      (d: any) => d.email.trim().toLowerCase() === payload.value.trim().toLowerCase()
    );

    return (
      <g transform={`translate(${x},${y})`}>
        <defs>
          <clipPath id={`circleClip-${payload.value}`}>
            <circle cx="0" cy="25" r="20" />
          </clipPath>
        </defs>

        {/* Circle background */}
        <circle cx={0} cy={25} r={20} fill="#93C5FD" />

        {/* Profile Image */}
        {item?.profile ? (
          <image
            xlinkHref={item.profile}
            x={-20}
            y={5}
            width={40}
            height={40}
            clipPath={`url(#circleClip-${payload.value})`}
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          <text 
            x={0} 
            y={32} 
            textAnchor="middle" 
            fill="#1E3A8A"
            fontSize={14}
            fontWeight={600}
          >
            {item?.initials || ''}
          </text>
        )}

        {/* Email label */}
        <text
          x={0}
          y={65}
          textAnchor="middle"
          fill="#6b7280"
          fontSize={11}
        >
          {payload.value}
        </text>
      </g>
    );
  }}
  height={120} // ⬆️ Increased height for better spacing
/>


              <YAxis 
                label={{ value: 'Task (count)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
                stroke="#9ca3af"
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              />
              <Bar dataKey="counttotal" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                {upcomingByAssigneeData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill="#3b82f6" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>{modalContent?.title}</span>
             
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {modalContent?.chart}
          </div>
        </DialogContent>
      </Dialog>

    </div>
   </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  filter: string
}

interface ChartCardProps {
  title: string
  children: React.ReactNode
  filters?: string
  showSeeAll?: boolean
  onMaximize?: () => void
}

const StatCard: React.FC<StatCardProps> = ({ title, value, filter }) => {
  return (
    <Card className="p-2">
      <CardHeader className="p-2 pb-0">
        <CardDescription className="text-sm font-medium text-gray-700 mx-auto">
          {title}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-1 pt-0 mt-[-16] mx-auto">
        <div className="text-4xl font-extralight">{value}</div>
      </CardContent>
    </Card>
  )
}

const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  children,
  filters,
  showSeeAll,
  onMaximize
}) => {
  return (
    <Card className="p-3 h-[500px]">
      <CardHeader className="flex justify-between items-start p-2 pb-0">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {onMaximize && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMaximize}
            className="h-6 w-6 text-gray-500 hover:text-gray-800"
          >
            <Maximize2 size={14} />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-2 pt-2">
        {children}
      </CardContent>
    </Card>
  )
}

export default TaskDashboard