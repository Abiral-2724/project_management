'use client'
import { ChevronRight, Mail, Menu, Plus, UserRound, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import decodetokenfunction from '../../util/decodeToken'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-toastify'
import InviteTeammateDialog from './InviteTeammateDialog'

type Props = {}

const Sidebar = ({ params }: { params: Promise<{ id: string }> }) => {
    const [isOpen, setIsOpen] = useState(true)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

    const { id } = React.use(params)

    const user = decodetokenfunction()

    const router = useRouter()

    const [userOwnerProject, setUserOwnerProject] = useState([])

    const [userMemberProject, setUserMemberProject] = useState([])

    const [userMemberProfileLinks, setUserMemberProfileLinks] = useState([])

    const toggleSidebar = () => {
        setIsOpen(!isOpen)
    }

    const token = localStorage?.getItem("token")

    useEffect(() => {
        const getUserProjects = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/v1/${id}/allProject`,
                    {
                        headers: {
                            Authorization: `${token}`,
                            "Content-Type": "application/json",
                        }
                    }
                )

                setUserOwnerProject(response.data.OwnerProject)
                setUserMemberProject(response.data.MemberProject)

                // Fetch profile links for member projects
                if (response.data.MemberProject && response.data.MemberProject.length > 0) {
                    const profileLinks = []
                    for (const project of response.data.MemberProject) {
                        try {
                            const ownerId = project.ownerId
                            const userResponse = await axios.get(`http://localhost:4000/api/v1/user/getuser/${ownerId}`, {
                                headers: {
                                    Authorization: `${token}`,
                                    "Content-Type": "application/json",
                                }
                            })
                            if (userResponse.data.user.profile) {
                                profileLinks.push(userResponse.data.user.profile)
                            }
                        } catch (err) {
                            console.log("Error fetching user profile:", err)
                        }
                    }
                    setUserMemberProfileLinks(profileLinks)
                }

            }
            catch (e: any) {
                const errorMessage =
                    e.response?.data?.message || e.message || "Error getting all projects"
                toast.error(errorMessage)
                console.log("Error occurred while submitting form:", e.response?.data || e.message)

            }
        }
        getUserProjects()
    }, [])

    const handleInvite = async (email: string, projectId: string, role: string) => {
        try {
            const arrEmail = [];
            arrEmail.push(email);
            const response = await axios.post(`http://localhost:4000/api/v1/${id}/project/${projectId}/addMember/sendInvite`,
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
            )
            toast.success(`Invitation sent to ${email}`)
        } catch (e: any) {
            const errorMessage = e.response?.data?.message || e.message || "Error sending invitation"
            toast.error(errorMessage)
        }
    }

    console.log(userOwnerProject)
    console.log(userMemberProject)

    const allProjects = [...userOwnerProject, ...userMemberProject]

    return (
        <>
            <InviteTeammateDialog
                open={inviteDialogOpen}
                onOpenChange={setInviteDialogOpen}
                userOwnerProjects={userOwnerProject}
                onInvite={handleInvite}
            />

            <div className={`${isOpen ? 'w-64' : 'w-0'} bg-gray-900 text-white flex flex-col transition-all duration-300 overflow-hidden`}>

                <div className="p-4 flex items-center gap-3 border-b border-gray-800 min-w-[256px]">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-gray-800"
                        onClick={toggleSidebar}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 flex-1"
                        onClick={() => router.push(`/${user.id}/create-project`)}
                    >
                        <Plus className="h-4 w-4" />
                        Create
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-2 space-y-0.5 min-w-[256px]">
                    <NavItem icon="🏠" label="Home" active />
                    <NavItem icon="✓" label="My tasks" />
                    <NavItem icon="📥" label="Inbox" />

                    <div className="pt-6 pb-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-400 uppercase">Insights</span>
                            <Plus className="h-4 w-4 text-gray-400" />
                        </div>
                        <NavItem icon="📊" label="Reporting" />
                        <NavItem icon="📁" label="Portfolios" />
                        <NavItem icon="🎯" label="Goals" />
                    </div>

                    <div className="pt-4 pb-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-400 ml-3">My Projects</span>
                            <Plus className="h-4 w-4 text-gray-400" />
                        </div>
                        {
                            userOwnerProject.map((ownerproject, index) => {
                                return (
                                    <NavItem key={index} icon="●" label={ownerproject.projectName} color="text-teal-400" />
                                )
                            })
                        }

                    </div>

                    <div className="pt-4 pb-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-400 ml-3">Member Projects</span>
                            <Plus className="h-4 w-4 text-gray-400" />
                        </div>
                        {
                            userMemberProject.map((memberproject, index) => {
                                return (
                                    <NavItem key={index} icon="●" label={memberproject.projectName} color="text-teal-400" />
                                )
                            })
                        }

                    </div>

                    <div className="pt-4 pb-2">
                        <div className="flex items-center justify-between mb-2 px-2">
                            <span className="text-xs font-semibold text-gray-400 uppercase">Teams</span>
                        </div>
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                                <div
                                    className="flex items-center justify-between px-3 py-2 rounded hover:bg-gray-800 cursor-pointer"
                                    onMouseEnter={() => setPopoverOpen(true)}
                                    onMouseLeave={() => setPopoverOpen(false)}
                                >
                                    <div className="flex items-center gap-3">
                                        <span>👥</span>
                                        <span className="text-sm">My workspace</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4" />
                                </div>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-80 bg-white border border-gray-200 shadow-lg p-4"
                                side="right"
                                align="start"
                                onMouseEnter={() => setPopoverOpen(true)}
                                onMouseLeave={() => setPopoverOpen(false)}
                            >
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-900">My workspace</h3>

                                    <div className="space-y-1">
                                        <div
                                            className="flex items-center gap-3 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
                                            onClick={() => {
                                                setPopoverOpen(false)
                                                setInviteDialogOpen(true)
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <UserRound className="h-5 w-5 text-gray-600" />
                                                <span className="text-sm text-gray-900">Invite teammates</span>
                                            </div>
                                            <div className="ml-auto flex items-center gap-1">
                                                <div className="w-8 h-8 bg-teal-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                                    ab
                                                </div>
                                                {userMemberProfileLinks.length > 0 ? (
                                                    <>
                                                        {userMemberProfileLinks.slice(0, 3).map((profileLink, idx) => (
                                                            <div key={idx} className="w-8 h-8 rounded-full overflow-hidden">
                                                                <img
                                                                    src={profileLink}
                                                                    alt="Member"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        ))}
                                                        {userMemberProfileLinks.length < 3 &&
                                                            Array.from({ length: 3 - userMemberProfileLinks.length }).map((_, idx) => (
                                                                <div key={`empty-${idx}`} className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                                                                    <UserRound className="h-4 w-4 text-gray-400" />
                                                                </div>
                                                            ))
                                                        }
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                                                            <UserRound className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                        <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                                                            <UserRound className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                        <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                                                            <UserRound className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div
                                            className="flex items-center gap-3 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
                                            onClick={() => router.push(`/${user.id}/create-project`)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="text-sm text-gray-900">Create project</span>
                                            </div>
                                        </div>
                                    </div>

                                    {allProjects.length > 0 && (
                                        <div className="border-t border-gray-200 pt-2">
                                            <div className="space-y-1">
                                                {allProjects.map((project, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-1 py-1 px-3 hover:bg-gray-100 rounded cursor-pointer"
                                                    >
                                                        <div className={`w-3 h-3 rounded ${index === 0 ? 'bg-teal-400' :
                                                                index === 1 ? 'bg-pink-400' :
                                                                    'bg-blue-400'
                                                            }`}></div>
                                                        <span className="text-sm text-gray-900">{project.projectName}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </nav>

                <div className="p-4 border-2 border-gray-800 min-w-[256px]">
                    <Button
                        className="w-full bg-[#2A2B2D] border-[0.3px] text-white hover:bg-[#2A2B2E] hover:text-white mt-2"
                        onClick={() => setInviteDialogOpen(true)}
                    >
                        <Mail className="h-4 w-4 mr-2" />
                        Invite teammates
                    </Button>
                </div>
            </div>

            {!isOpen && (
                <div className="fixed left-1 top-3 z-50">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="bg-gray-900 text-white hover:bg-gray-800 hover:text-white rounded-lg"
                        onClick={toggleSidebar}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            )}
        </>
    )
}

export default Sidebar

function NavItem({ icon, label, active = false, color = 'text-white' }: { icon: string, label: string, active?: boolean, color?: string }) {
    return (
        <div
            className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer ${active ? 'bg-gray-800' : 'hover:bg-gray-800'
                }`}
        >
            <span className={color}>{icon}</span>
            <span className="text-sm">{label}</span>
        </div>
    )
}