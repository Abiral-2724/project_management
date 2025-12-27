// app/[id]/layout.tsx
'use client'
import React, { useState, useEffect } from 'react'
import { SidebarContent } from '@/components/SidebarContent'
import { TopNavBar } from '@/components/TopNavBar'
import { useRouter, usePathname, useParams } from 'next/navigation'

const API_BASE_URL = 'http://localhost:4000/api/v1'

interface LayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [userDetails, setUserDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
 
  // Get user ID from localStorage OR params
  useEffect(() => {
    const storedUserId = localStorage.getItem('planzo_id')
  
    // Prefer localStorage, fall back to URL param
    const id = storedUserId 
    
    if (id) {
      setUserId(id)
      // Store in localStorage if not already there
      if (!storedUserId) {
        localStorage.setItem('planzo_id')
      }
    } else {
      console.error('No user ID found')
      setLoading(false)
      router.push('/auth/login')
    }
  }, [router])

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) {
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/user/getuser/${userId}`)
        const data = await response.json()

        if (data.success && data.user) {
          setUserDetails(data.user)
        } else {
          console.error('Failed to fetch user details:', data.message)
        }
      } catch (error) {
        console.error('Error fetching user details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserDetails()
  }, [userId])

  // Determine current page from pathname
  const getCurrentPage = () => {
    if (pathname.includes('/home')) return 'home'
    if (pathname.includes('/mytask')) return 'mytask'
    if (pathname.includes('/goals')) return 'goals'
    if (pathname.includes('/dashboard')) return 'dashboard'
    if (pathname.includes('/project/')) return 'project'
    if (pathname.includes('/create-project')) return 'create-project'
    if (pathname.includes('/profile')) return 'profile'
    return 'home'
  }

  // Get current project ID if on project page
  const getCurrentProjectId = () => {
    const match = pathname.match(/\/project\/([^/]+)/)
    return match ? match[1] : null
  }

  const handleNavigate = (destination: string) => {
    if (!userId) return

    switch (destination) {
      case 'workspace':
        router.push(`/${userId}/workspace`)
        break
      case 'settings':
        router.push(`/${userId}/settings`)
        break
      default:
        console.log('Unknown navigation destination:', destination)
    }
  }

  const handleInvite = async (email: string, projectId: string, role: string) => {
    console.log('Invite handled:', { email, projectId, role })
    
    // Refresh project details after invite
    if (userId && projectId) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/${userId}/project/${projectId}/get/complete/projectDetails`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        const data = await response.json()
        
        if (data.success) {
          console.log('Project details refreshed:', data.projectMember)
          // You can trigger a refresh of the sidebar projects here if needed
          // by adding a state update or event emitter
        }
      } catch (error) {
        console.error('Error refreshing project details:', error)
      }
    }
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">No user found. Please log in.</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-900">
      {/* Sidebar */}
      <aside className="flex-shrink-0">
        <SidebarContent
          onNavigate={handleNavigate}
          onInvite={handleInvite}
          currentProject={getCurrentProjectId()}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          userEmail={userDetails?.email || ''}
          userName={userDetails?.name || ''}
          userId={userId}
          currentPage={getCurrentPage()}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="flex-shrink-0">
          <TopNavBar
            userEmail={userDetails?.email || ''}
            userName={userDetails?.name || ''}
            isSidebarCollapsed={isSidebarCollapsed}
          />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  )
}