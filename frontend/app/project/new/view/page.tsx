'use client'
import React, { useState } from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import axios from 'axios';
import decodetokenfunction from '../../../../util/decodeToken';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

const viewImages: any = {
    Overview: 'https://res.cloudinary.com/dci6nuwrm/image/upload/v1759514054/Updated_Dark_Overview_np22nf.png',
    List: 'https://res.cloudinary.com/dci6nuwrm/image/upload/v1759513743/Updated_Dark_List_dkht3s.png',
    Board: 'https://res.cloudinary.com/dci6nuwrm/image/upload/v1759514117/Updated_Dark_Board_dvbn9e.png',
    Timeline: 'https://res.cloudinary.com/dci6nuwrm/image/upload/v1759513653/Dark_Timeline_kcjwte.png',
    Dashboard: 'https://res.cloudinary.com/dci6nuwrm/image/upload/v1759513506/Dark_Dashboard_j6teup.png',
    Gantt: 'https://res.cloudinary.com/dci6nuwrm/image/upload/v1759513592/Dark_Gantt_btz6dj.png',
    Calendar: 'https://res.cloudinary.com/dci6nuwrm/image/upload/v1759513536/Dark_Calendar_zbdobn.png',
    Note: 'https://res.cloudinary.com/dci6nuwrm/image/upload/v1759513435/Updated_Dark_Note_edi301.png',
    Workload: 'https://res.cloudinary.com/dci6nuwrm/image/upload/v1759513370/Dark_Workload_ytzlmw.png',
    Files: 'https://res.cloudinary.com/dci6nuwrm/image/upload/v1759513567/Dark_Files_mtw8d2.png',
    Messages: 'https://res.cloudinary.com/dci6nuwrm/image/upload/v1759513623/Dark_Messages_pdj80w.png',
};

export default function AsanaProjectViews() {
    const [selectedViews, setSelectedViews] = useState(['Overview', 'List', 'Board', 'Timeline', 'Dashboard']);
    const [hoveredView, setHoveredView] = useState('List');
    const [loading, setLoading] = useState(false);

    const projectname = localStorage?.getItem('project_name');
    const projectdescription = localStorage?.getItem('project_description');
    const token = localStorage?.getItem('token');

    const router = useRouter();

    const handlecreateproject = async () => {
        try {
            setLoading(true);
            const user = decodetokenfunction();
            console.log(selectedViews);

            const response = await axios.post(`http://localhost:4000/api/v1/${user.id}/project/new/create`,
                {
                    projectName: projectname?.toString(),
                    description: projectdescription?.toString(),
                    views: selectedViews
                }, {
                headers: {
                    Authorization: `${token}`,
                    "Content-Type": "application/json",
                }
            });

            console.log(response.data);
            
            localStorage?.removeItem('project_name');
            localStorage?.removeItem('project_description');
            toast.success("Project created successfully");
            const url = `${response.data.project.ownerId}/project/${response.data.project.id}/Overview`;
            console.log(url);

            router.push(`/${response.data.project.ownerId}/dashboard/project/${response.data.project.id}/Overview`);
        }
        catch (e: any) {
            const errorMessage = e.response?.data?.message || e.message || "Something went wrong";
            toast.error(errorMessage);
            console.log("Error occurred while submitting form:", e.response?.data || e.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleView = (viewId: any) => {
        if (viewId === 'List') return;
        setSelectedViews(prev =>
            prev.includes(viewId)
                ? prev.filter(id => id !== viewId)
                : [...prev, viewId]
        );
    };

    const RecommendedCard = ({ id, title, description, required = false }: any) => {
        const isSelected = selectedViews.includes(id);
        return (
            <Card
                onClick={() => toggleView(id)}
                onMouseEnter={() => setHoveredView(id)}
                className={`relative w-full p-4 sm:p-5 rounded-lg border transition-all ${
                    required ? 'cursor-not-allowed' : 'cursor-pointer'
                } ${
                    isSelected
                        ? 'bg-blue-900/40 border-blue-600 hover:bg-blue-900/50'
                        : 'bg-[#1a1a1a] border-gray-700 hover:border-gray-600 hover:bg-[#1a1a1a]/80'
                }`}
            >
                {isSelected && (
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                        <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        </div>
                    </div>
                )}
                <div className={`${isSelected ? 'pl-8 sm:pl-9' : ''}`}>
                    <h3 className="text-white font-medium text-sm sm:text-base">
                        {title}
                        {required && <span className="text-gray-400 text-xs sm:text-sm ml-1">(required)</span>}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">{description}</p>
                </div>
            </Card>
        );
    };

    const PopularCard = ({ id, icon, title, description }: any) => {
        const isSelected = selectedViews.includes(id);
        return (
            <Card
                onClick={() => toggleView(id)}
                onMouseEnter={() => setHoveredView(id)}
                className={`w-full p-3 sm:p-4 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                        ? 'bg-gray-800/60 border-gray-700 hover:bg-gray-800/70'
                        : 'bg-[#1a1a1a] border-gray-800 hover:border-gray-700 hover:bg-[#1a1a1a]/80'
                }`}
            >
                <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm sm:text-base">{title}</h3>
                        <p className="text-gray-400 text-xs sm:text-sm mt-0.5">{description}</p>
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-[#1d1d1d] text-white">
            <div className="flex flex-col lg:flex-row">
                {/* Left Panel */}
                <div className="w-full lg:w-[700px] px-4 sm:px-6 lg:px-7 py-4 sm:py-5 overflow-y-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="mb-4 sm:mb-6 text-gray-400 hover:text-white hover:bg-transparent"
                        onClick={() => router.push('/project/new')}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>

                    <div className="sm:ml-6 lg:ml-10">
                        <h1 className="text-lg sm:text-xl lg:text-[20px] font-normal mb-4 sm:mb-6">
                            Choose views for your project
                        </h1>

                        {/* Asana Recommended */}
                        <div className="mb-8 sm:mb-10">
                            <h2 className="text-gray-400 text-xs font-medium mb-3 sm:mb-4 uppercase tracking-wider">
                                Asana recommended
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm font-extralight">
                                <RecommendedCard
                                    id="Overview"
                                    title="Overview"
                                    description="Align on project info and resources"
                                />
                                <RecommendedCard
                                    id="List"
                                    title="List"
                                    description="Organize tasks in a powerful table"
                                    required={true}
                                />
                                <RecommendedCard
                                    id="Board"
                                    title="Board"
                                    description="Track work in a Kanban view"
                                />
                                <RecommendedCard
                                    id="Timeline"
                                    title="Timeline"
                                    description="Schedule work over time"
                                />
                                <RecommendedCard
                                    id="Dashboard"
                                    title="Dashboard"
                                    description="Monitor project metrics and insights"
                                />
                            </div>
                        </div>

                        {/* Popular */}
                        <div className="mb-8 sm:mb-10">
                            <h2 className="text-gray-400 text-xs font-medium mb-3 sm:mb-4 uppercase tracking-wider">
                                Popular
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <PopularCard
                                    id="Gantt"
                                    icon={
                                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <rect x="3" y="6" width="18" height="3" rx="1" />
                                            <rect x="7" y="12" width="10" height="3" rx="1" />
                                        </svg>
                                    }
                                    title="Gantt"
                                    description="Track dependencies and baselines"
                                />
                                <PopularCard
                                    id="Calendar"
                                    icon={
                                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" />
                                            <line x1="3" y1="9" x2="21" y2="9" />
                                            <line x1="9" y1="4" x2="9" y2="9" />
                                            <line x1="15" y1="4" x2="15" y2="9" />
                                        </svg>
                                    }
                                    title="Calendar"
                                    description="Plan weekly or monthly work"
                                />
                                <PopularCard
                                    id="Note"
                                    icon={
                                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                            <line x1="9" y1="15" x2="15" y2="15" />
                                        </svg>
                                    }
                                    title="Note"
                                    description="Write meeting notes and more"
                                />
                                <PopularCard
                                    id="Workload"
                                    icon={
                                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="3" />
                                            <path d="M12 1v6m0 6v6m5.2-15.2l-4.2 4.2m-2 2l-4.2 4.2m12.4-2l-4.2-4.2m-2-2l-4.2-4.2" />
                                        </svg>
                                    }
                                    title="Workload"
                                    description="Manage your team's time and capacity"
                                />
                            </div>
                        </div>

                        {/* Other */}
                        <div className="mb-8 sm:mb-10">
                            <h2 className="text-gray-400 text-xs font-medium mb-3 sm:mb-4 uppercase tracking-wider">
                                Other
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                                <PopularCard
                                    id="Files"
                                    icon={
                                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                        </svg>
                                    }
                                    title="Files"
                                    description="View all attachments"
                                />
                                <PopularCard
                                    id="Messages"
                                    icon={
                                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                    }
                                    title="Messages"
                                    description="Communicate with others"
                                />
                            </div>
                        </div>

                        {/* Bottom Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 pb-6 sm:pb-0">
                            <Button
                                variant="outline"
                                className="w-full sm:flex-1 border-gray-700 bg-black text-white hover:border-gray-600 hover:bg-transparent hover:text-white"
                                onClick={() => router.push('/project/new')}
                            >
                                Back
                            </Button>
                            <Button
                                className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={handlecreateproject}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner />
                                        <span>Creating project ..</span>
                                    </>
                                ) : "Create project"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Preview (Hidden on mobile/tablet) */}
                <div className="hidden lg:flex flex-1 p-6 xl:p-10 items-center justify-center">
                    <div className="w-full h-full max-w-6xl flex items-center justify-center">
                        <img
                            key={hoveredView}
                            src={viewImages[hoveredView]}
                            alt="Preview"
                            className="w-full h-auto max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}