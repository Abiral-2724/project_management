'use client'
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Menu, HelpCircle, List, ChevronRight, MoreHorizontal, Settings, Sliders, UserPlus, User, LogOut, X, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import axios from 'axios';
import { toast } from 'react-toastify';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';

export default function AsanaDashboard({params}) {
    const {id} = React.use(params);
  const [tasks, setTasks] = useState([
    { id: 1, title: 'heelloo', completed: false, dueDate: 'Today' }
  ]);
  const [user ,setUser] = useState({}) ; 
 
  const router = useRouter() ; 

  const today = new Date(); 
  const day = today.toLocaleString('en-US', { weekday: 'long' });
  const date = today.getDate();
  const month = today.toLocaleString('en-US', { month: 'long' }); 

  useEffect(() => {
    const getuserinfo = async() => {
        try{
    
            const response = await axios.get(`http://localhost:4000/api/v1/user/getuser/${id}`) ; 
    
            setUser(response.data.user) ; 
    
    
        }catch(e){
            const errorMessage =
            e.response?.data?.message || e.message || "Something went wrong";
          toast.error(errorMessage);
                    console.log("Error occurred while submitting form:", e.response?.data || e.message);
        
        }
      }
      getuserinfo() ; 
  } ,[]) ; 

  

  const [overdueCount] = useState(2);
  const [completedCount] = useState(1);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [selectedBgColor, setSelectedBgColor] = useState('from-blue-500 via-blue-600 to-blue-700');

  const bgColors = [
    { name: 'Purple', gradient: 'from-purple-900 via-purple-800 to-purple-900', color: 'bg-purple-900' },
    { name: 'Orange', gradient: 'from-orange-400 via-orange-500 to-orange-600', color: 'bg-orange-400' },
    { name: 'Green', gradient: 'from-lime-400 via-lime-500 to-lime-600', color: 'bg-lime-400' },
    { name: 'Teal Dark', gradient: 'from-teal-700 via-teal-800 to-teal-900', color: 'bg-teal-800' },
    { name: 'Cyan', gradient: 'from-cyan-400 via-cyan-500 to-cyan-600', color: 'bg-cyan-500' },
    { name: 'Cyan Light', gradient: 'from-cyan-200 via-cyan-300 to-cyan-400', color: 'bg-cyan-300' },
    { name: 'Blue', gradient: 'from-blue-500 via-blue-600 to-blue-700', color: 'bg-blue-600' },
    { name: 'Purple Light', gradient: 'from-purple-300 via-purple-400 to-purple-500', color: 'bg-purple-400' },
    { name: 'Purple Medium', gradient: 'from-purple-400 via-purple-500 to-purple-600', color: 'bg-purple-500' },
    { name: 'Pink', gradient: 'from-pink-300 via-pink-400 to-pink-500', color: 'bg-pink-400' },
    { name: 'Gray', gradient: 'from-gray-200 via-gray-300 to-gray-400', color: 'bg-gray-300' },
    { name: 'White', gradient: 'from-gray-50 via-gray-100 to-gray-200', color: 'bg-white' },
  ];

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="flex h-screen bg-gray-50">
    
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <Topbar user={user}></Topbar>

        {/* Customize Drawer */}
        <Drawer open={isCustomizeOpen} onOpenChange={setIsCustomizeOpen} direction="right">
          <DrawerContent className="h-full w-[500px] fixed right-0 top-0 rounded-l-xl">
            <div className="h-full flex flex-col">
              <DrawerHeader className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <DrawerTitle className="text-2xl font-semibold">Customize home</DrawerTitle>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                {/* Background Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Background</h3>
                  <div className="grid grid-cols-6 gap-3">
                    {bgColors.map((bg, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedBgColor(bg.gradient)}
                        className={`w-14 h-14 rounded-full ${bg.color} relative transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      >
                        {selectedBgColor === bg.gradient && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="w-6 h-6 text-white" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Widgets Section */}
                <div>
                  <h3 className="text-xl font-semibold mb-2">Widgets</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Click add or drag widgets below to your home screen. You can also reorder and remove them.
                  </p>

                  {/* Goals Widget */}
                  <div className="border rounded-lg p-4 mb-4 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">Goals</h4>
                      <Button variant="ghost" size="sm" className="text-gray-600">
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-400 w-3/4"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 w-1/2"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-400 w-1/4"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Portfolios Widget */}
                  <div className="border rounded-lg p-4 mb-4 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">Portfolios</h4>
                      <Button variant="ghost" size="sm" className="text-gray-600">
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-400 rounded"></div>
                        <div className="h-2 flex-1 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded"></div>
                        <div className="h-2 flex-1 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-lime-400 rounded"></div>
                        <div className="h-2 flex-1 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-500 rounded"></div>
                        <div className="h-2 flex-1 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-cyan-400 rounded"></div>
                        <div className="h-2 flex-1 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-pink-400 rounded"></div>
                        <div className="h-2 flex-1 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>

                  {/* Status Updates Widget */}
                  <div className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">Status updates</h4>
                      <Button variant="ghost" size="sm" className="text-gray-600">
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="flex justify-end mt-3">
                        <div className="h-8 w-24 bg-red-400 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Content */}
        <div className={`p-8 bg-gradient-to-br ${selectedBgColor} min-h-[calc(100vh-64px)]`}>
          {/* Header */}
          <div className="mb-8">
            <p className="text-sm text-white/90 mb-2">{day}, {month} {date}</p>
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold text-white">Good afternoon, {user.fullname || 'abiral'}</h1>
              <div className="flex items-center gap-4">
                <Button variant="outline" className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20">
                  My week
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-4 text-sm text-white">
                  <span>✓ {completedCount} task completed</span>
                  <span>👥 1 collaborator</span>
                </div>
                <Button className="gap-2 bg-white text-gray-900 hover:bg-gray-100" onClick={() => setIsCustomizeOpen(true)}>
                  <Settings className="h-4 w-4" />
                  Customize
                </Button>
              </div>
            </div>
          </div>

          {/* My Tasks Card - Full Width */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-3">
                <Avatar>
                <AvatarImage src={user.profile} />
                  <AvatarFallback className="bg-cyan-400 text-gray-900 font-semibold">
                    {user.fullname ? user.fullname.substring(0, 2).toLowerCase() : 'ab'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg font-semibold">My tasks</CardTitle>
                  <span className="text-xs text-gray-500">🔒</span>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4 border-b">
                <button className="px-1 pb-2 text-sm font-medium border-b-2 border-gray-900">
                  Upcoming
                </button>
                <button className="px-1 pb-2 text-sm text-gray-600 hover:text-gray-900">
                  Overdue ({overdueCount})
                </button>
                <button className="px-1 pb-2 text-sm text-gray-600 hover:text-gray-900">
                  Completed
                </button>
              </div>
              
              <Button variant="ghost" className="w-full justify-start text-gray-600 mb-4">
                <Plus className="h-4 w-4 mr-2" />
                Create task
              </Button>

              <div className="space-y-2">
                {tasks.map(task => (
                  <div 
                    key={task.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          task.completed ? 'bg-teal-500 border-teal-500' : 'border-gray-300'
                        }`}
                      >
                        {task.completed && <span className="text-white text-xs">✓</span>}
                      </button>
                      <span className={task.completed ? 'line-through text-gray-400' : ''}>
                        {task.title}
                      </span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Projects and People Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Projects Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-semibold">Projects</CardTitle>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-600">
                    Recents
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border-2 border-dashed border-gray-300">
                    <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                      <Plus className="h-5 w-5 text-gray-400" />
                    </div>
                    <span className="text-gray-600">Create project</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div className="w-12 h-12 bg-blue-400 rounded flex items-center justify-center">
                      <List className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-medium">sample project</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div className="w-12 h-12 bg-teal-400 rounded flex items-center justify-center">
                      <List className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-medium">Cross-functional proje...</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* People Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-semibold">People</CardTitle>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-600">
                    Frequent collaborators
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border-2 border-dashed border-gray-300">
                    <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                      <Plus className="h-5 w-5 text-gray-400" />
                    </div>
                    <span className="text-gray-600">Invite</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-purple-400 text-white text-lg font-semibold">ja</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">jainabiral2004@gma...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tasks I've assigned Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-semibold">Tasks I've assigned</CardTitle>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-6 border-b">
                    <button className="px-1 pb-2 text-sm font-medium border-b-2 border-gray-900">
                      Upcoming
                    </button>
                    <button className="px-1 pb-2 text-sm text-gray-600 hover:text-gray-900">
                      Overdue
                    </button>
                    <button className="px-1 pb-2 text-sm text-gray-600 hover:text-gray-900">
                      Completed
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-20 h-20 rounded-full border-4 border-gray-300 flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-center mb-4 max-w-md">
                      Assign tasks to your colleagues, and keep track of them here.
                    </p>
                    <Button variant="outline">Assign task</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customization Area */}
            <div className="lg:col-span-1">
              <div className="relative h-full min-h-[400px] bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-lg overflow-hidden">
                <button className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1.5 transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <h3 className="text-white text-xl font-semibold mb-6">
                    Drag and drop new widgets
                  </h3>
                  <Button className="bg-white text-gray-900 hover:bg-gray-100 gap-2 shadow-lg">
                    <Settings className="h-4 w-4" />
                    Customize
                  </Button>
                </div>
                {/* Decorative geometric shapes */}
                <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/20 rounded-lg transform rotate-12"></div>
                <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-white/20 rounded-lg transform -rotate-12"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-white/10 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}