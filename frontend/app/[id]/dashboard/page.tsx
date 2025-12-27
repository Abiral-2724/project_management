// 'use client'
// import React, { useState, useEffect } from 'react'
// import { X, ChevronRight, Users, FolderPlus, Menu, Home, CheckSquare, Target, ChevronLeft, Search, LogOut, User, Plus, Key, Settings, MoreVertical } from 'lucide-react'
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Button } from "@/components/ui/button"
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
// } from "@/components/ui/command"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
// } from "@/components/ui/dropdown-menu"
// import {
//   HoverCard,
//   HoverCardContent,
//   HoverCardTrigger,
// } from "@/components/ui/hover-card"
// import { Check, ChevronsUpDown, Info } from "lucide-react"
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
// import { useRouter } from 'next/navigation'
// import { InviteTeammateDialog } from '@/components/InviteTeammateDialog'
// import { ProfileDropdown } from '@/components/ProfileDropdown'
// import { TopNavBar } from '@/components/TopNavBar'

// const API_BASE_URL = 'http://localhost:4000/api/v1'

// // Color generator for projects
// const getProjectColor = (index) => {
//   const colors = [
//     'bg-cyan-400',
//     'bg-purple-400',
//     'bg-green-400',
//     'bg-orange-400',
//     'bg-pink-400',
//     'bg-blue-400',
//     'bg-yellow-400',
//     'bg-red-400',
//     'bg-indigo-400',
//     'bg-teal-400'
//   ]
//   return colors[index % colors.length]
// }

// // Project Item Component with Hover Card
// const ProjectItem = ({ project, currentProject, userId, onNavigate }) => {
//   const router = useRouter()
//   const [projectDetails, setProjectDetails] = useState(null)
//   const [loading, setLoading] = useState(false)

//   const fetchProjectDetails = async () => {
//     if (projectDetails || loading) return
    
//     setLoading(true)
//     try {
//       const response = await fetch(`${API_BASE_URL}/${userId}/project/${project.id}`)
//       const data = await response.json()
      
//       if (data.success) {
//         setProjectDetails(data.project)
//       }
//     } catch (error) {
//       console.error('Error fetching project details:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <HoverCard openDelay={300}>
//       <HoverCardTrigger asChild>
//         <button
//           onMouseEnter={fetchProjectDetails}
//           onClick={() => router.push(`/${userId}/project/${project.id}`)}
//           className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ${
//             currentProject === project.id ? 'bg-gray-800' : ''
//           }`}
//         >
//           <div className={`${project.color} rounded h-5 w-5 flex-shrink-0`}></div>
//           <span className="text-sm truncate flex-1 text-left">{project.projectName}</span>
//         </button>
//       </HoverCardTrigger>
//       <HoverCardContent className="w-80 bg-gray-800 text-white border-gray-700" side="right" align="start">
//         {loading ? (
//           <div className="text-sm text-gray-400">Loading...</div>
//         ) : projectDetails ? (
//           <div className="space-y-3">
//             <div>
//               <div className="flex items-center gap-2 mb-2">
//                 <div className={`${project.color} rounded h-6 w-6`}></div>
//                 <h4 className="font-semibold text-base">{projectDetails.projectName}</h4>
//               </div>
//               {projectDetails.description && (
//                 <p className="text-sm text-gray-400">{projectDetails.description}</p>
//               )}
//             </div>

//             <div className="space-y-2 pt-2 border-t border-gray-700">
//               <div className="flex items-center justify-between text-sm">
//                 <span className="text-gray-400">Total Tasks</span>
//                 <span className="font-medium">{projectDetails.totalTasks || 0}</span>
//               </div>
//               <div className="flex items-center justify-between text-sm">
//                 <span className="text-gray-400">Completed</span>
//                 <span className="font-medium text-green-400">{projectDetails.completedTasks || 0}</span>
//               </div>
//               <div className="flex items-center justify-between text-sm">
//                 <span className="text-gray-400">In Progress</span>
//                 <span className="font-medium text-orange-400">{projectDetails.inProgressTasks || 0}</span>
//               </div>
//             </div>

//             {projectDetails.members && projectDetails.members.length > 0 && (
//               <div className="pt-2 border-t border-gray-700">
//                 <div className="text-sm text-gray-400 mb-2">Team Members ({projectDetails.members.length})</div>
//                 <div className="flex flex-wrap gap-2">
//                   {projectDetails.members.slice(0, 5).map((member, idx) => (
//                     <div
//                       key={member.id || idx}
//                       className="flex items-center gap-2 px-2 py-1 bg-gray-700 rounded text-xs"
//                     >
//                       <div className={`${getProjectColor(idx)} rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium`}>
//                         {(member.name || member.email).substring(0, 2).toUpperCase()}
//                       </div>
//                       <span className="truncate max-w-[120px]">{member.name || member.email}</span>
//                     </div>
//                   ))}
//                   {projectDetails.members.length > 5 && (
//                     <div className="flex items-center px-2 py-1 bg-gray-700 rounded text-xs text-gray-400">
//                       +{projectDetails.members.length - 5} more
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {projectDetails.createdAt && (
//               <div className="pt-2 border-t border-gray-700 text-xs text-gray-400">
//                 Created: {new Date(projectDetails.createdAt).toLocaleDateString()}
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="space-y-2">
//             <h4 className="font-semibold">{project.projectName}</h4>
//             <p className="text-sm text-gray-400">Hover to load details...</p>
//           </div>
//         )}
//       </HoverCardContent>
//     </HoverCard>
//   )
// }

// // Sidebar Content Component
// const SidebarContent = ({ onNavigate, onInvite, currentProject, isCollapsed, onToggleCollapse, userEmail, userName, userId, currentPage }) => {
//   const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
//   const [memberProjects, setMemberProjects] = useState([])
//   const [ownerProjects, setOwnerProjects] = useState([])
//   const [allProjects, setAllProjects] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [teamMembers, setTeamMembers] = useState([])
//   const router = useRouter()

//   // Fetch projects from API
//   useEffect(() => {
//     const fetchProjects = async () => {
//       if (!userId) {
//         console.error('No user ID available')
//         return
//       }

//       setLoading(true)
//       try {
//         // Fetch all projects user is part of
//         const allProjectsResponse = await fetch(`${API_BASE_URL}/${userId}/allProject`)
//         const allProjectsData = await allProjectsResponse.json()
        
//         if (allProjectsData.success) {
//           const memberProjs = allProjectsData.MemberProject || []
//           const ownerProjs = allProjectsData.OwnerProject || []
          
//           // Add colors to projects if not present
//           const memberWithColors = memberProjs.map((proj, idx) => ({
//             ...proj,
//             color: proj.color || getProjectColor(idx)
//           }))
          
//           const ownerWithColors = ownerProjs.map((proj, idx) => ({
//             ...proj,
//             color: proj.color || getProjectColor(idx + memberProjs.length)
//           }))
          
//           setMemberProjects(memberWithColors)
//           setOwnerProjects(ownerWithColors)
//         }

//         // Fetch all projects with roles
//         const userProjectsResponse = await fetch(`${API_BASE_URL}/user/${userId}/project`)
//         const userProjectsData = await userProjectsResponse.json()
        
//         if (userProjectsData.success) {
//           const projectsWithColors = (userProjectsData.Projects || []).map((proj, idx) => ({
//             ...proj,
//             color: proj.color || getProjectColor(idx)
//           }))
//           setAllProjects(projectsWithColors)
          
//           // Extract team members from projects
//           const members = new Map()
//           projectsWithColors.forEach(project => {
//             if (project.members) {
//               project.members.forEach(member => {
//                 if (!members.has(member.email)) {
//                   members.set(member.email, {
//                     id: member.id || member.email,
//                     name: member.name || member.email.split('@')[0],
//                     initials: (member.name || member.email.substring(0, 2)).substring(0, 2).toUpperCase(),
//                     color: getProjectColor(members.size)
//                   })
//                 }
//               })
//             }
//           })
//           setTeamMembers(Array.from(members.values()).slice(0, 2))
//         }
//       } catch (error) {
//         console.error('Error fetching projects:', error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchProjects()
//   }, [userId])

//   const handleInviteTeammate = (email, projectId, role) => {
//     console.log('Invitation sent:', { email, projectId, role })
//     if (onInvite) {
//       onInvite(email, projectId, role)
//     }
//   }

//   return (
//     <div className={`flex flex-col h-full bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64 lg:w-72'}`}>
//       {/* Toggle button for desktop */}
//       <div className="hidden md:flex justify-end p-2">
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={onToggleCollapse}
//           className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
//         >
//           {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
//         </Button>
//       </div>

//       {!isCollapsed && (
//         <>
//           <div className="px-4 pb-4">
//             <h1 className="text-xl font-semibold mb-6">Team</h1>
            
//             {/* Navigation tabs */}
//             <div className="space-y-1 mb-4">
//               <button
//                 onClick={() => router.push(`/${userId}/home`)}
//                 className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ${
//                   currentPage === 'home' ? 'bg-gray-800' : ''
//                 }`}
//               >
//                 <Home className="h-5 w-5 text-gray-400" />
//                 <span className="text-base">Home</span>
//               </button>
              
//               <button
//                 onClick={() => router.push(`/${userId}/mytask`)}
//                 className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ${
//                   currentPage === 'mytask' ? 'bg-gray-800' : ''
//                 }`}
//               >
//                 <CheckSquare className="h-5 w-5 text-gray-400" />
//                 <span className="text-base">My Tasks</span>
//               </button>
              
//               <button
//                 onClick={() => router.push(`/${userId}/goals`)}
//                 className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ${
//                   currentPage === 'goals' ? 'bg-gray-800' : ''
//                 }`}
//               >
//                 <Target className="h-5 w-5 text-gray-400" />
//                 <span className="text-base">Goals</span>
//               </button>
//             </div>
            
//             {/* My workspace section */}
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors group">
//                   <div className="flex items-center gap-3">
//                     <Users className="h-5 w-5 text-gray-400" />
//                     <span className="text-base">My workspace</span>
//                   </div>
//                   <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
//                 </button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent className="w-56 bg-gray-800 text-white border-gray-700" align="end">
//                 <DropdownMenuItem 
//                   onClick={() => onNavigate?.('workspace')}
//                   className="hover:bg-gray-700 cursor-pointer focus:bg-gray-700 focus:text-white"
//                 >
//                   <Users className="mr-2 h-4 w-4" />
//                   View Workspace
//                 </DropdownMenuItem>
//                 <DropdownMenuItem 
//                   onClick={() => onNavigate?.('settings')}
//                   className="hover:bg-gray-700 cursor-pointer focus:bg-gray-700 focus:text-white"
//                 >
//                   <Settings className="mr-2 h-4 w-4" />
//                   Settings
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>

//           <div className="px-4 py-2 border-t border-gray-800">
//             {/* Invite teammates */}
//             <button 
//               onClick={() => setInviteDialogOpen(true)}
//               className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-800 transition-colors"
//             >
//               <div className="flex items-center gap-3 flex-1">
//                 <Users className="h-5 w-5 text-gray-400" />
//                 <span className="text-base">Invite teammates</span>
//               </div>
//               <div className="flex items-center -space-x-2">
//                 {teamMembers.length > 0 ? (
//                   teamMembers.map((member) => (
//                     <div
//                       key={member.id}
//                       className={`${member.color} rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium border-2 border-gray-900`}
//                     >
//                       {member.initials}
//                     </div>
//                   ))
//                 ) : (
//                   <>
//                     <div className="bg-gray-700 border-2 border-gray-900 rounded-full h-8 w-8 flex items-center justify-center">
//                       <Users className="h-4 w-4" />
//                     </div>
//                     <div className="bg-gray-700 border-2 border-gray-900 rounded-full h-8 w-8 flex items-center justify-center">
//                       <Users className="h-4 w-4" />
//                     </div>
//                   </>
//                 )}
//               </div>
//             </button>

//             {/* Create project */}
//             <button
//               onClick={() => router.push(`/${userId}/create-project`)}
//               className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-800 transition-colors mt-1"
//             >
//               <FolderPlus className="h-5 w-5 text-gray-400" />
//               <span className="text-base">Create project</span>
//             </button>
//           </div>

//           {/* Projects list */}
//           <div className="flex-1 overflow-y-auto px-4 py-2 border-t border-gray-800">
//             {loading ? (
//               <div className="text-gray-400 text-sm px-3 py-2">Loading projects...</div>
//             ) : (
//               <>
//                 {ownerProjects.length > 0 && (
//                   <div className="mb-4">
//                     <div className="text-xs text-gray-400 px-3 py-2 font-semibold uppercase tracking-wider">
//                       My Projects
//                     </div>
//                     <div className="space-y-1">
//                       {ownerProjects.map((project) => (
//                         <ProjectItem
//                           key={project.id}
//                           project={project}
//                           currentProject={currentProject}
//                           userId={userId}
//                           onNavigate={onNavigate}
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {memberProjects.length > 0 && (
//                   <div>
//                     <div className="text-xs text-gray-400 px-3 py-2 font-semibold uppercase tracking-wider">
//                       Shared with me
//                     </div>
//                     <div className="space-y-1">
//                       {memberProjects.map((project) => (
//                         <ProjectItem
//                           key={project.id}
//                           project={project}
//                           currentProject={currentProject}
//                           userId={userId}
//                           onNavigate={onNavigate}
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {ownerProjects.length === 0 && memberProjects.length === 0 && !loading && (
//                   <div className="text-gray-400 text-sm px-3 py-2">
//                     No projects found. Create your first project!
//                   </div>
//                 )}
//               </>
//             )}
//           </div>

//           <InviteTeammateDialog
//             open={inviteDialogOpen}
//             onOpenChange={setInviteDialogOpen}
//             userOwnerProjects={[...ownerProjects, ...memberProjects]}
//             onInvite={handleInviteTeammate}
//             userId={userId}
//           />
//         </>
//       )}

//       {isCollapsed && (
//         <div className="flex-1 flex flex-col items-center gap-4 py-4">
//           <button
//             onClick={() => router.push(`/${userId}/home`)}
//             className="p-3 rounded-lg hover:bg-gray-800 transition-colors"
//             title="Home"
//           >
//             <Home className="h-5 w-5 text-gray-400" />
//           </button>
//           <button
//             onClick={() => router.push(`/${userId}/mytask`)}
//             className="p-3 rounded-lg hover:bg-gray-800 transition-colors"
//             title="My Tasks"
//           >
//             <CheckSquare className="h-5 w-5 text-gray-400" />
//           </button>
//           <button
//             onClick={() => router.push(`/${userId}/goals`)}
//             className="p-3 rounded-lg hover:bg-gray-800 transition-colors"
//             title="Goals"
//           >
//             <Target className="h-5 w-5 text-gray-400" />
//           </button>
//           <button
//             onClick={() => onNavigate?.('workspace')}
//             className="p-3 rounded-lg hover:bg-gray-800 transition-colors"
//             title="My workspace"
//           >
//             <Users className="h-5 w-5 text-gray-400" />
//           </button>
//           <button
//             onClick={() => setInviteDialogOpen(true)}
//             className="p-3 rounded-lg hover:bg-gray-800 transition-colors"
//             title="Invite teammates"
//           >
//             <Users className="h-5 w-5 text-gray-400" />
//           </button>
//           <button
//             onClick={() => router.push(`/${userId}/create-project`)}
//             className="p-3 rounded-lg hover:bg-gray-800 transition-colors"
//             title="Create project"
//           >
//             <FolderPlus className="h-5 w-5 text-gray-400" />
//           </button>
//         </div>
//       )}
//     </div>
//   )
// }

// // Main App Component
// export default function ProjectManagementSidebar() {
//   const [currentProject, setCurrentProject] = useState(null)
//   const [currentPage, setCurrentPage] = useState('home')
//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
//   const [userEmail, setUserEmail] = useState('')
//   const [userName, setUserName] = useState('')
//   const [userId, setUserId] = useState('')

//   // Fetch user info on mount
//   useEffect(() => {
//     const getUserInfo = async () => {
//       const storedUserId = localStorage.getItem('planzo_id')
      
//       if (!storedUserId) {
//         console.error('No user ID found in localStorage')
//         return
//       }

//       setUserId(storedUserId)

//       try {
//         const response = await fetch(`${API_BASE_URL}/user/getuser/${storedUserId}`)
//         const data = await response.json()
        
//         if (data.success && data.user) {
//           setUserEmail(data.user.email || 'user@example.com')
//           setUserName(data.user.fullname || data.user.name || 'User')
//         } else {
//           console.error('Failed to fetch user info:', data.message)
//         }
//       } catch (error) {
//         console.error('Error fetching user info:', error)
//       }
//     }

//     getUserInfo()
//   }, [])

//   const handleNavigation = (destination) => {
//     console.log('Navigating to:', destination)
//     setCurrentPage(destination)
    
//     if (destination.startsWith('project/')) {
//       const projectId = destination.split('/')[1]
//       setCurrentProject(projectId)
//     }
//   }

//   const handleInvite = (email, projectId, role) => {
//     console.log('Invitation sent:', { email, projectId, role })
//   }

//   return (
//     <div className="flex h-screen bg-gray-950">
//       {/* Desktop Sidebar */}
//       <aside className={`hidden md:block border-r border-gray-800 transition-all duration-300 ${
//         isSidebarCollapsed ? 'w-16' : 'w-64 lg:w-72'
//       }`}>
//         <SidebarContent 
//           onNavigate={handleNavigation}
//           onInvite={handleInvite}
//           currentProject={currentProject}
//           currentPage={currentPage}
//           isCollapsed={isSidebarCollapsed}
//           onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
//           userEmail={userEmail}
//           userName={userName}
//           userId={userId}
//         />
//       </aside>

//       {/* Mobile Sidebar */}
//       <div className="md:hidden">
//         <Sheet>
//           <SheetTrigger asChild>
//             <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 bg-gray-900 hover:bg-gray-800">
//               <Menu className="h-6 w-6 text-white" />
//             </Button>
//           </SheetTrigger>
//           <SheetContent side="left" className="p-0 w-64 bg-gray-900">
//             <SidebarContent 
//               onNavigate={handleNavigation}
//               onInvite={handleInvite}
//               currentProject={currentProject}
//               currentPage={currentPage}
//               isCollapsed={false}
//               onToggleCollapse={() => {}}
//               userEmail={userEmail}
//               userName={userName}
//               userId={userId}
//             />
//           </SheetContent>
//         </Sheet>
//       </div>

//       {/* Main Content Area */}
//       <main className="flex-1 overflow-y-auto bg-gray-950 text-white flex flex-col">
//         {/* Top Navigation Bar */}
//         <TopNavBar userEmail={userEmail} userName={userName} />

//         {/* Main Content */}
//         <div className="flex-1 overflow-y-auto p-8">
//           <div className="max-w-4xl">
//             <h2 className="text-3xl font-semibold mb-2">Welcome Back!</h2>
//             <p className="text-gray-400 mb-8">Navigate using the sidebar to access different sections.</p>
            
//             <div className="grid gap-6">
//               <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
//                 <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
//                 <p className="text-gray-400">Use the sidebar to navigate to Home, My Tasks, Goals, or your projects. Hover over any project to see quick details!</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }

import React from 'react'

type Props = {}

const page = (props: Props) => {
  return (
    <div>page</div>
  )
}

export default page