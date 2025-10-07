'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  List, 
  LayoutDashboard, 
  Calendar, 
  BarChart3,
  FileText,
  Folder,
  MessageSquare,
  Workflow,
  Plus,
  Star,
  MoreHorizontal,
  Settings,
  User,
  MessageCircle,
  CalendarDays,
  ChevronDown,
  Lock,
  Sparkles,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '@/components/Loader';
import InviteTeammateDialog from '../../../../../../components/InviteTeammateDialog';
import ProjectNavbar from '@/components/ProjectNavbar';
import { useProjectNavbar } from '@/hooks/useProjectNavbar';
import {NavItems} from '../../../../../../../util/file';

export default function ProjectOverview({ params }: any) {
  const router = useRouter();
  
  const [status, setStatus] = useState('on-track');

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
  } = useProjectNavbar(id,projectId,'overview')

//   const baseUrl = `/${id}/dashboard/project/${projectId}`;

  const allNavItems = NavItems ; 

  const [projectTimeline, setProjectTimeline] = useState<any[]>([]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [userOwnerProject, setUserOwnerProject] = useState<any[]>([]);

  // Fetch project timeline
  useEffect(() => {
    if (!token) return;

    const getProjectTimeline = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/v1/${id}/project/${projectId}/get/project/Timeline`,
          {
            headers: {
              Authorization: `${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setProjectTimeline(response.data.timeline);
      } catch (e: any) {
        const errorMessage =
          e.response?.data?.message || e.message || "Something went wrong";
        toast.error(errorMessage);
        console.log("Error occurred while fetching project timeline:", e.response?.data || e.message);
      }
    };
    getProjectTimeline();
  }, [token, id, projectId,projectMember]);

  // Filter nav items based on projectViews
//   const navItems = projectViews 
//     ? allNavItems.filter(item => projectViews[item.label] === true)
//     : allNavItems;

  
  // Fetch user projects for invite dialog
  useEffect(() => {
    if (!token) return;

    const getUserProjects = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/v1/${id}/allProject`, {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          }
        });

        setUserOwnerProject(response.data.OwnerProject);
      } catch (e: any) {
        const errorMessage =
          e.response?.data?.message || e.message || "Error getting all projects";
        toast.error(errorMessage);
        console.log("Error occurred while fetching projects:", e.response?.data || e.message);
      }
    };

    getUserProjects();
  }, [token, id]);



  // Helper function to calculate time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    
    return 'just now';
  };

  // Handle invitation
  const handleInvite = async (email: string, selectedProjectId: string, role: string) => {
    try {
      const arrEmail: string[] = [email];
      await axios.post(
        `http://localhost:4000/api/v1/${id}/project/${selectedProjectId}/addMember/sendInvite`,
        {
          inviteEmail: arrEmail,
          role: role
        },
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          }
        }
      );
      toast.success(`Invitation sent to ${email}`);
      
      // Refresh project details to show new member
      const response = await axios.get(
        `http://localhost:4000/api/v1/${id}/project/${projectId}/get/complete/projectDetails`,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setProjectMember(response.data.projectMember);
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || e.message || "Error sending invitation";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <InviteTeammateDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        userOwnerProjects={userOwnerProject}
        onInvite={handleInvite}
      />
      
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

      {/* Main Content */}
      <div className="flex flex-1 bg-white overflow-hidden">
        {/* Left Column - Main Content */}
        <div className="flex-1 px-8 py-6 space-y-8 overflow-y-auto">
          {/* Project Description */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">Project description</h2>
              <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Show examples
              </button>
            </div>
            <textarea
  value={projectDetail?.description || ""}
  placeholder="What's this project about?"
  readOnly  // remove if you want it editable
  className={`w-full text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 p-4 min-h-[120px] ${
    projectDetail?.description ? "text-black" : "text-gray-500"
  }`}
/>

          </div>

          {/* Project Roles */}
          <div>
            <h2 className="text-base font-semibold mb-4">Project roles</h2>
            <div className="flex items-center gap-4 flex-wrap">
              <button 
                className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors"
                onClick={() => {
                  console.log("Add member clicked");
                  console.log("userOwnerProject:", userOwnerProject);
                  setInviteDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add member</span>
              </button>

              {projectMember.map((member) => (
                <div key={member.id} className="flex items-center gap-3 px-4 py-3 bg-white rounded-md border border-gray-200 hover:border-gray-300 transition-colors">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={member?.profile}></AvatarImage>
                    <AvatarFallback className="bg-cyan-500 text-white text-sm font-medium">
                      {member.emailuser?.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{member.emailuser}</div>
                    <div className="text-xs text-gray-500">{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Goals */}
          <div>
            <h2 className="text-base font-semibold mb-4">Connected goals</h2>
            <div className="text-center py-12 bg-white rounded-md border border-gray-200">
              <p className="text-sm text-gray-600 mb-4">
                Connect or create a goal to link this project to a<br />larger purpose.
              </p>
              <Button variant="outline" size="sm" className="text-sm border-gray-300">
                <Plus className="w-4 h-4 mr-2" />
                Add goal
              </Button>
            </div>
          </div>

          {/* Connected Portfolios */}
          <div>
            <h2 className="text-base font-semibold mb-4">Connected portfolios</h2>
            <div className="h-12 bg-white rounded-md border border-gray-200"></div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 flex-shrink-0 border-l border-gray-200 bg-white px-6 py-6 space-y-6 overflow-y-auto">
          {/* Status */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">What's the status?</h3>
            <div className="flex gap-2 flex-wrap">
              <Badge 
                variant="outline"
                className={`cursor-pointer px-3 py-1.5 text-xs font-medium rounded-full ${
                  status === 'on-track' 
                    ? 'bg-green-50 text-green-700 border-green-300' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setStatus('on-track')}
              >
                <span className="w-2 h-2 rounded-full bg-green-600 mr-1.5"></span>
                On track
              </Badge>
              <Badge 
                variant="outline"
                className={`cursor-pointer px-3 py-1.5 text-xs font-medium rounded-full ${
                  status === 'at-risk' 
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-300' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setStatus('at-risk')}
              >
                <span className="w-2 h-2 rounded-full bg-yellow-600 mr-1.5"></span>
                At risk
              </Badge>
              <Badge 
                variant="outline"
                className={`cursor-pointer px-3 py-1.5 text-xs font-medium rounded-full ${
                  status === 'off-track' 
                    ? 'bg-red-50 text-red-700 border-red-300' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setStatus('off-track')}
              >
                <span className="w-2 h-2 rounded-full bg-red-600 mr-1.5"></span>
                Off track
              </Badge>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Activity Timeline */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Activity</h3>
            <div className="space-y-4">
              {/* No due date */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-lg border-2 border-dashed border-gray-300">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">No due date</p>
                </div>
              </div>

              {/* Send message link */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-lg bg-blue-100">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <button className="text-sm text-blue-600 hover:underline font-medium">
                    Send message to members
                  </button>
                </div>
              </div>

              {/* Timeline with connecting line */}
              <div className="relative pl-6">
                {/* Vertical connecting line */}
                {projectTimeline.length > 0 && (
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200"></div>
                )}

                <div className="space-y-6">
                  {projectTimeline.length > 0 ? (
                    [...projectTimeline].reverse().map((item, index) => {
                      const timeAgo = getTimeAgo(item.createdTime);
                      
                      if (item.Type === "Project created") {
                        return (
                          <div key={index} className="relative">
                            <div className="absolute -left-6 mt-1 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Project created</p>
                              <p className="text-xs text-gray-500 mt-0.5">{timeAgo}</p>
                            </div>
                          </div>
                        );
                      } else if (item.Type === "Someone joined") {
                        return (
                          <div key={index} className="relative">
                            <div className="absolute -left-6 mt-1 flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {item.email} joined
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">{timeAgo}</p>
                              <div className="mt-2">
                                <Avatar className="w-8 h-8">
                                  {item.profile ? (
                                    <img 
                                      src={item.profile} 
                                      alt={item.email}
                                      className="w-full h-full object-cover rounded-full"
                                    />
                                  ) : (
                                    <AvatarFallback className="bg-purple-500 text-white text-xs font-medium">
                                      {item.email?.slice(0, 2)}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })
                  ) : (
                    <p className="text-sm text-gray-500">No timeline events yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}