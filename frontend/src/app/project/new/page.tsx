'use client'
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import decodeToken from '../../../../util/decodeToken';

export default function AsanaProjectPage() {
    const [projectName, setProjectName] = useState('');
    const [projectDesc, setProjectDesc] = useState('');
    const [showError, setShowError] = useState(false);
    const [descshowError, setdescShowError] = useState(false);

    const router = useRouter();
    const user = decodeToken();
    const storedName = localStorage.getItem('project_name');
    const storedDesc = localStorage.getItem('project_description');

    // ✅ Load from localStorage when component mounts
    useEffect(() => {

        if (storedName) setProjectName(storedName);
        if (storedDesc) setProjectDesc(storedDesc);
    }, []);

    const handleContinue = () => {
        let hasError = false;

        if (!projectName.trim()) {
            setShowError(true);
            hasError = true;
        } else {
            setShowError(false);
        }

        if (!projectDesc.trim()) {
            setdescShowError(true);
            hasError = true;
        } else {
            setdescShowError(false);
        }

        if (hasError) return;

        // ✅ Save in localStorage
        localStorage.setItem('project_name', projectName);
        localStorage.setItem('project_description', projectDesc);

        router.push('/project/new/view');
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white flex">
            {/* Left Panel */}
            <div className="w-[500px] p-12 flex flex-col">
                <div className="mb-4">
                    <button
                        className="text-gray-400 hover:text-white"
                        onClick={() => {
                            router.push(`/${user.id}/create-project`)
                            if (storedName) {
                                localStorage.removeItem('project_name')
                            }
                            if (storedDesc) {
                                localStorage.removeItem('project_description')
                            }
                        }}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 ml-6">
                    <h1 className="text-3xl font-normal mb-8">New project</h1>

                    <div className="space-y-6">
                        {/* Project Name */}
                        <div>
                            <label className="block text-sm text-gray-300 mb-2">
                                Project name
                            </label>
                            <Input
                                type="text"
                                value={projectName}
                                onChange={(e) => {
                                    setProjectName(e.target.value);
                                    if (e.target.value.trim()) setShowError(false);
                                }}
                                className={`bg-transparent border-b-2 ${showError ? 'border-red-500' : 'border-gray-600'
                                    } rounded-md px-2 py-2 focus:border-blue-500 focus:ring-0`}
                                placeholder="Enter project name"
                            />
                            {showError && (
                                <p className="text-red-500 text-sm mt-2">
                                    Project name is required.
                                </p>
                            )}
                        </div>

                        {/* Project Description */}
                        <div>
                            <label className="block text-sm text-gray-300 mb-2">
                                Project description
                            </label>
                            <Textarea
                                placeholder="Type your project description here..."
                                value={projectDesc}
                                onChange={(e) => {
                                    setProjectDesc(e.target.value);
                                    if (e.target.value.trim()) setdescShowError(false);
                                }}
                                className={`bg-transparent border-b-2 ${descshowError ? 'border-red-500' : 'border-gray-600'
                                    } rounded-md px-2 py-2 focus:border-blue-500 focus:ring-0`}
                            />
                            {descshowError && (
                                <p className="text-red-500 text-sm mt-2">
                                    Project description is required.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-12 space-y-3">
                        <Button
                            onClick={handleContinue}
                            className="w-full h-12 bg-transparent border border-gray-600 hover:bg-gray-800 text-white"
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex items-center justify-center ml-15 mb-8">
                <div className="w-full max-w-5xl relative">
                    <img
                        src="https://res.cloudinary.com/dci6nuwrm/image/upload/v1759513743/Updated_Dark_List_dkht3s.png"
                        alt="Project preview"
                        className="w-full h-auto rounded-lg shadow-lg"
                    />
                    {projectName && (
                        <div className="absolute top-4 left-21">
                            <h2 className="text-xl font-mono text-white">{projectName}</h2>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
