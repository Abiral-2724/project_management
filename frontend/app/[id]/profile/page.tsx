'use client'
import React, { useState, useEffect } from 'react'
import { CheckSquare, Users, Target, ChevronRight, Camera, Plus, Lock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useRouter } from 'next/navigation'
import { InviteTeammateDialog } from '@/components/InviteTeammateDialog'

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

const ProfilePage = () => {
  const userId = localStorage.getItem("planzo_id")
  const router = useRouter()
  const [userDetails, setUserDetails] = useState(null)
  const [myTasks, setMyTasks] = useState([])
  const [recentProjects, setRecentProjects] = useState([])
  const [collaborators, setCollaborators] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [userOwnerProjects, setUserOwnerProjects] = useState([])

  useEffect(() => {
    const fetchProfileData = async () => {
      // Check if userId exists
      if (!userId) {
        setError('User ID is missing')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      
      try {
        console.log('Fetching user details for userId:', userId)
        
        // Fetch user details first
        const userResponse = await fetch(`${API_BASE_URL}/user/getuser/${userId}`)
        if (!userResponse.ok) {
          throw new Error(`Failed to fetch user: ${userResponse.status}`)
        }
        
        const userData = await userResponse.json()
        console.log(userData)
        console.log('User data:', userData)
        
        if (!userData.success) {
          throw new Error('Failed to load user details')
        }
        
        setUserDetails(userData.user)
        const currentUserEmail = userData.user?.email

        // Fetch user tasks
        try {
          const tasksResponse = await fetch(`${API_BASE_URL}/task/${userId}/project/get/myTasks`)
          const tasksData = await tasksResponse.json()
          console.log('Tasks data:', tasksData)
          
          if (tasksData.success && tasksData.tasks) {
            setMyTasks(tasksData.tasks.slice(0, 3))
          }
        } catch (err) {
          console.error('Error fetching tasks:', err)
          // Continue even if tasks fail
        }

        // Fetch all projects
        try {
          const projectsResponse = await fetch(`${API_BASE_URL}/${userId}/allProject`)
          const projectsData = await projectsResponse.json()
          console.log('Projects data:', projectsData)
          
          if (projectsData.success) {
            const ownerProjects = projectsData.OwnerProject || []
            const memberProjects = projectsData.MemberProject || []
            const allProjects = [...ownerProjects, ...memberProjects]
            
            setUserOwnerProjects(ownerProjects)
            setRecentProjects(allProjects.slice(0, 3))

            // Fetch members for each project
            const collaboratorsMap = new Map()
            
            for (const project of allProjects) {
              try {
                const membersResponse = await fetch(`${API_BASE_URL}/${userId}/project/${project.id}/get/members`)
                const membersData = await membersResponse.json()
                
                if (membersData.success && Array.isArray(membersData.member)) {
                  membersData.member.forEach(member => {
                    // Exclude current user from collaborators
                    if (member.emailuser && member.emailuser !== currentUserEmail) {
                      collaboratorsMap.set(member.emailuser, {
                        email: member.emailuser,
                        role: member.role || 'Member',
                        name: member.emailuser.split('@')[0],
                        initials: member.emailuser.substring(0, 2).toUpperCase()
                      })
                    }
                  })
                }
              } catch (error) {
                console.error(`Error fetching members for project ${project.id}:`, error)
                // Continue with other projects
              }
            }
            
            setCollaborators(Array.from(collaboratorsMap.values()))
          }
        } catch (err) {
          console.error('Error fetching projects:', err)
          // Continue even if projects fail
        }

      } catch (error) {
        console.error('Error fetching profile data:', error)
        setError(error.message || 'Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [userId])

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.substring(0, 2).toUpperCase()
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date'
    try {
      const date = new Date(dateString)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      if (date.toDateString() === today.toDateString()) {
        return 'Today'
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow'
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
    } catch (e) {
      return 'Invalid date'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // No user data state
  if (!userDetails) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">User not found</p>
          <Button onClick={() => router.push('/')}>
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="relative">
              <Avatar className="h-32 w-32">
  <AvatarImage
    src={userDetails?.profile} // image URL
    alt={userDetails?.fullname || userDetails?.name}
  />
  <AvatarFallback className="bg-pink-300 text-4xl font-semibold text-gray-800">
    {getInitials(userDetails?.fullname || userDetails?.name)}
  </AvatarFallback>
</Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <h1 className="text-2xl font-semibold">
                    {userDetails?.fullname || userDetails?.name || 'User'}
                  </h1>
                  <Badge variant="outline" className="text-gray-500">
                    <Lock className="h-3 w-3 mr-1" />
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-gray-600 mb-4">
                  <button className="flex items-center gap-1 hover:text-gray-900">
                    <Plus className="h-4 w-4" />
                    <span>Add job title</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-gray-900">
                    <Plus className="h-4 w-4" />
                    <span>Add team or dept.</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-gray-900">
                    <Plus className="h-4 w-4" />
                    <span>Add about me</span>
                  </button>
                </div>

                <Button className="bg-blue-600 hover:bg-blue-700">
                  Edit profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tasks and Projects */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Tasks */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2">
                  <span>My tasks</span>
                  <Lock className="h-4 w-4 text-gray-400" />
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/${userId}/mytask`)}
                >
                  View all tasks
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {myTasks.length > 0 ? (
                  myTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={task.status === 'COMPLETED'}
                          className="h-5 w-5 rounded border-gray-300"
                          onChange={() => {}}
                        />
                        <span className={task.status === 'COMPLETED' ? 'line-through text-gray-500' : ''}>
                          {task.taskName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.assignee_email && (
                          <Badge variant="secondary" className="text-xs">
                            {task.assignee_email.substring(0, 10)}...
                          </Badge>
                        )}
                        <span className="text-sm text-gray-600">
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No tasks assigned</p>
                )}
              </CardContent>
            </Card>

            {/* My Recent Projects */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>My recent projects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentProjects.length > 0 ? (
                  recentProjects.map((project, index) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      onClick={() => router.push(`/${userId}/project/${project.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`${getProjectColor(index)} h-10 w-10 rounded flex items-center justify-center`}>
                          <CheckSquare className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-medium">{project.projectName}</span>
                      </div>
                      <div className="flex items-center -space-x-2">
                        {[1, 2, 3].map((i) => (
                          <Avatar key={i} className="h-8 w-8 border-2 border-white">
                            <AvatarFallback className={getProjectColor(i)}>
                              {i === 1 ? 'AJ' : i === 2 ? 'ja' : '...'}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent projects</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Collaborators and Goals */}
          <div className="space-y-6">
            {/* Frequent Collaborators */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Frequent collaborators</span>
                  <Lock className="h-4 w-4 text-gray-400" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={() => setInviteDialogOpen(true)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="h-12 w-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-gray-400" />
                  </div>
                  <span className="text-gray-600">Invite teammates</span>
                </button>

                {collaborators.slice(0, 5).map((collaborator, index) => (
                  <div
                    key={collaborator.email}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={getProjectColor(index)}>
                        {collaborator.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{collaborator.email}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* My Goals */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2">
                  <span>My goals</span>
                  <Lock className="h-4 w-4 text-gray-400" />
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/${userId}/goals/create`)}
                >
                  Create goal
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="font-medium mb-2">You don't own any goals yet</p>
                  <p className="text-sm text-gray-600 mb-6">
                    Add a goal so the team can see what you hope to achieve.
                  </p>
                  
                  {/* Progress bars */}
                  <div className="space-y-4">
                    <div>
                      <div className="h-2 bg-green-200 rounded-full mb-1"></div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span>On track (85%)</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="h-2 bg-yellow-200 rounded-full mb-1"></div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                        <span>At risk (60%)</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="h-2 bg-red-200 rounded-full mb-1"></div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <span>Off track (30%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Invite Teammate Dialog */}
      <InviteTeammateDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        userOwnerProjects={userOwnerProjects}
        onInvite={(email, projectId, role) => {
          console.log('Invitation sent:', { email, projectId, role })
        }}
        userId={userId}
      />
    </div>
  )
}

export default ProfilePage