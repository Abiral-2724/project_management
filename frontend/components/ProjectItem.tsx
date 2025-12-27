// components/ProjectItem.jsx
'use client'
import React, { useState } from 'react'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useRouter } from 'next/navigation'

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

export function ProjectItem({ project, currentProject, userId, onNavigate } : any) {
  const router = useRouter()
  const [projectDetails, setProjectDetails] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchProjectDetails = async () => {
    if (projectDetails || loading) return
    
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/project/${project.id}/get`)
      const data = await response.json()
      
      if (data.success) {
        setProjectDetails(data.project)
      }
    } catch (error) {
      console.error('Error fetching project details:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <HoverCard openDelay={300}>
      <HoverCardTrigger asChild>
        <button
          onMouseEnter={fetchProjectDetails}
          onClick={() => router.push(`/${userId}/project/${project.id}/overview`)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ${
            currentProject === project.id ? 'bg-gray-800' : ''
          }`}
        >
          <div className={`${project.color} rounded h-5 w-5 flex-shrink-0`}></div>
          <span className="text-sm truncate flex-1 text-left">{project.projectName}</span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-gray-800 text-white border-gray-700" side="right" align="start">
        {loading ? (
          <div className="text-sm text-gray-400">Loading...</div>
        ) : projectDetails ? (
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`${project.color} rounded h-6 w-6`}></div>
                <h4 className="font-semibold text-base">{projectDetails.projectName}</h4>
              </div>
              {projectDetails.description && (
                <p className="text-sm text-gray-400">{projectDetails.description}</p>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Total Tasks</span>
                <span className="font-medium">{projectDetails.totalTasks || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Completed</span>
                <span className="font-medium text-green-400">{projectDetails.completedTasks || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">In Progress</span>
                <span className="font-medium text-orange-400">{projectDetails.inProgressTasks || 0}</span>
              </div>
            </div>

            {projectDetails.members && projectDetails.members.length > 0 && (
              <div className="pt-2 border-t border-gray-700">
                <div className="text-sm text-gray-400 mb-2">Team Members ({projectDetails.members.length})</div>
                <div className="flex flex-wrap gap-2">
                  {projectDetails.members.slice(0, 5).map((member, idx) => (
                    <div
                      key={member.id || idx}
                      className="flex items-center gap-2 px-2 py-1 bg-gray-700 rounded text-xs"
                    >
                      <div className={`${getProjectColor(idx)} rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium`}>
                        {(member.name || member.email).substring(0, 2).toUpperCase()}
                      </div>
                      <span className="truncate max-w-[120px]">{member.name || member.email}</span>
                    </div>
                  ))}
                  {projectDetails.members.length > 5 && (
                    <div className="flex items-center px-2 py-1 bg-gray-700 rounded text-xs text-gray-400">
                      +{projectDetails.members.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {projectDetails.createdAt && (
              <div className="pt-2 border-t border-gray-700 text-xs text-gray-400">
                Created: {new Date(projectDetails.createdAt).toLocaleDateString()}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <h4 className="font-semibold">{project.projectName}</h4>
            <p className="text-sm text-gray-400">Hover to load details...</p>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  )
}