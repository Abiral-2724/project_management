// components/SidebarContent.jsx
'use client'
import React, { useState, useEffect } from 'react'
import { ChevronRight, Users, FolderPlus, Home, CheckSquare, Target, ChevronLeft, Settings } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'
import { InviteTeammateDialog } from '@/components/InviteTeammateDialog'
import { ProjectItem } from '@/components/ProjectItem'
import Image from 'next/image'

const API_BASE_URL = 'http://localhost:4000/api/v1'

const getProjectColor = (index) => {
  const colors = [
    'bg-cyan-400',
    'bg-purple-400',
    'bg-green-400',
    'bg-orange-400',
    'bg-pink-400',
    'bg-blue-400',
    'bg-yellow-400',
    'bg-red-400',
    'bg-indigo-400',
    'bg-teal-400'
  ]
  return colors[index % colors.length]
}

export function SidebarContent({ onNavigate, onInvite, currentProject, isCollapsed, onToggleCollapse, userEmail, userName, userId, currentPage }) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [memberProjects, setMemberProjects] = useState([])
  const [ownerProjects, setOwnerProjects] = useState([])
  const [allProjects, setAllProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [teamMembers, setTeamMembers] = useState([])
  const router = useRouter()

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      if (!userId) {
        console.error('No user ID available')
        return
      }

      setLoading(true)
      try {
        const allProjectsResponse = await fetch(`${API_BASE_URL}/${userId}/allProject`)
        const allProjectsData = await allProjectsResponse.json()
        
        if (allProjectsData.success) {
          const memberProjs = allProjectsData.MemberProject || []
          const ownerProjs = allProjectsData.OwnerProject || []
          
          const memberWithColors = memberProjs.map((proj, idx) => ({
            ...proj,
            color: proj.color || getProjectColor(idx)
          }))
          
          const ownerWithColors = ownerProjs.map((proj, idx) => ({
            ...proj,
            color: proj.color || getProjectColor(idx + memberProjs.length)
          }))
          
          setMemberProjects(memberWithColors)
          setOwnerProjects(ownerWithColors)
        }

        const userProjectsResponse = await fetch(`${API_BASE_URL}/user/${userId}/project`)
        const userProjectsData = await userProjectsResponse.json()
        
        if (userProjectsData.success) {
          const projectsWithColors = (userProjectsData.Projects || []).map((proj, idx) => ({
            ...proj,
            color: proj.color || getProjectColor(idx)
          }))
          setAllProjects(projectsWithColors)
          
          const members = new Map()
          projectsWithColors.forEach(project => {
            if (project.members) {
              project.members.forEach(member => {
                if (!members.has(member.email)) {
                  members.set(member.email, {
                    id: member.id || member.email,
                    name: member.name || member.email.split('@')[0],
                    initials: (member.name || member.email.substring(0, 2)).substring(0, 2).toUpperCase(),
                    color: getProjectColor(members.size)
                  })
                }
              })
            }
          })
          setTeamMembers(Array.from(members.values()).slice(0, 2))
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [userId])

  const handleInviteTeammate = (email, projectId, role) => {
    console.log('Invitation sent:', { email, projectId, role })
    if (onInvite) {
      onInvite(email, projectId, role)
    }
  }

  return (
    <div className={`flex flex-col h-full bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64 lg:w-72'}`}>
      {/* Logo and Toggle Section */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!isCollapsed ? (
          <>
           
             <img 
              src="https://res.cloudinary.com/dci6nuwrm/image/upload/v1766469977/planzo-navbar-logo_ioj9gb.svg"
              alt="Planzo Logo" 
              className="h-10 w-auto ml-[-15px]"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-600"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8 mx-auto text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {!isCollapsed && (
        <>
          <div className="px-4 pb-4 pt-4">
            <h1 className="text-xl font-semibold mb-6">Team</h1>
            
            {/* Navigation tabs */}
            <div className="space-y-1 mb-4">
              <button
                onClick={() => router.push(`/${userId}/home`)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ${
                  currentPage === 'home' ? 'bg-gray-800' : ''
                }`}
              >
                <Home className="h-5 w-5 text-gray-400" />
                <span className="text-base">Home</span>
              </button>
              
              <button
                onClick={() => router.push(`/${userId}/mytask`)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ${
                  currentPage === 'mytask' ? 'bg-gray-800' : ''
                }`}
              >
                <CheckSquare className="h-5 w-5 text-gray-400" />
                <span className="text-base">My Tasks</span>
              </button>
              
              <button
                onClick={() => router.push(`/${userId}/goals`)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ${
                  currentPage === 'goals' ? 'bg-gray-800' : ''
                }`}
              >
                <Target className="h-5 w-5 text-gray-400" />
                <span className="text-base">Goals</span>
              </button>
            </div>
            
            {/* My workspace section */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="text-base">My workspace</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-gray-800 text-white border-gray-700" align="end">
                <DropdownMenuItem 
                  onClick={() => onNavigate?.('workspace')}
                  className="hover:bg-gray-700 cursor-pointer focus:bg-gray-700 focus:text-white"
                >
                  <Users className="mr-2 h-4 w-4" />
                  View Workspace
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onNavigate?.('settings')}
                  className="hover:bg-gray-700 cursor-pointer focus:bg-gray-700 focus:text-white"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="px-4 py-2 border-t border-gray-800">
            <button 
              onClick={() => setInviteDialogOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Users className="h-5 w-5 text-gray-400" />
                <span className="text-base">Invite teammates</span>
              </div>
              <div className="flex items-center -space-x-2">
                {teamMembers.length > 0 ? (
                  teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`${member.color} rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium border-2 border-gray-900`}
                    >
                      {member.initials}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="bg-gray-700 border-2 border-gray-900 rounded-full h-8 w-8 flex items-center justify-center">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="bg-gray-700 border-2 border-gray-900 rounded-full h-8 w-8 flex items-center justify-center">
                      <Users className="h-4 w-4" />
                    </div>
                  </>
                )}
              </div>
            </button>

            <button
              onClick={() => router.push(`/${userId}/create-project`)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-600 transition-colors mt-1 bg-red-700"
            >
              <FolderPlus className="h-5 w-5 text-gray-400" />
              <span className="text-base">Create project</span>
            </button>
          </div>

          {/* Projects list */}
          <div className="flex-1 overflow-y-auto px-4 py-2 border-t border-gray-800">
            {loading ? (
              <div className="text-gray-400 text-sm px-3 py-2">Loading projects...</div>
            ) : (
              <>
                {ownerProjects.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 px-3 py-2 font-semibold uppercase tracking-wider">
                      My Projects
                    </div>
                    <div className="space-y-1">
                      {ownerProjects.map((project) => (
                        <ProjectItem
                          key={project.id}
                          project={project}
                          currentProject={currentProject}
                          userId={userId}
                          onNavigate={onNavigate}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {memberProjects.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-400 px-3 py-2 font-semibold uppercase tracking-wider">
                      Shared with me
                    </div>
                    <div className="space-y-1">
                      {memberProjects.map((project) => (
                        <ProjectItem
                          key={project.id}
                          project={project}
                          currentProject={currentProject}
                          userId={userId}
                          onNavigate={onNavigate}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {ownerProjects.length === 0 && memberProjects.length === 0 && !loading && (
                  <div className="text-gray-400 text-sm px-3 py-2">
                    No projects found. Create your first project!
                  </div>
                )}
              </>
            )}
          </div>

          <InviteTeammateDialog
            open={inviteDialogOpen}
            onOpenChange={setInviteDialogOpen}
            userOwnerProjects={[...ownerProjects, ...memberProjects]}
            onInvite={handleInviteTeammate}
            userId={userId}
          />
        </>
      )}

      {isCollapsed && (
        <div className="flex-1 flex flex-col items-center gap-4 py-4">
          <button
            onClick={() => router.push(`/${userId}/home`)}
            className="p-3 rounded-lg hover:bg-gray-800 transition-colors"
            title="Home"
          >
            <Home className="h-5 w-5 text-gray-400" />
          </button>
          <button
            onClick={() => router.push(`/${userId}/mytask`)}
            className="p-3 rounded-lg hover:bg-gray-800 transition-colors"
            title="My Tasks"
          >
            <CheckSquare className="h-5 w-5 text-gray-400" />
          </button>
          <button
            onClick={() => router.push(`/${userId}/goals`)}
            className="p-3 rounded-lg hover:bg-gray-800 transition-colors"
            title="Goals"
          >
            <Target className="h-5 w-5 text-gray-400" />
          </button>
          <button
            onClick={() => onNavigate?.('workspace')}
            className="p-3 rounded-lg hover:bg-gray-800 transition-colors"
            title="My workspace"
          >
            <Users className="h-5 w-5 text-gray-400" />
          </button>
          <button
            onClick={() => setInviteDialogOpen(true)}
            className="p-3 rounded-lg hover:bg-gray-800 transition-colors"
            title="Invite teammates"
          >
            <Users className="h-5 w-5 text-gray-400" />
          </button>
          <button
            onClick={() => router.push(`/${userId}/create-project`)}
            className="p-3 rounded-lg hover:bg-gray-800 transition-colors"
            title="Create project"
          >
            <FolderPlus className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      )}
    </div>
  )
}