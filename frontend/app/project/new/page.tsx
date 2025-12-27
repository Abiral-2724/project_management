'use client'
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import decodeToken from '../../../util/decodeToken';

export default function AsanaProjectPage() {
    const [projectName, setProjectName] = useState('');
    const [projectDesc, setProjectDesc] = useState('');
    const [showError, setShowError] = useState(false);
    const [descshowError, setdescShowError] = useState(false);

    const router = useRouter();
    const user = decodeToken();
    
    // Store data in component state instead of localStorage
    const [storedName, setStoredName] = useState('');
    const [storedDesc, setStoredDesc] = useState('');

    // Load initial data
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

        // Save in state
        setStoredName(projectName);
        setStoredDesc(projectDesc);

        router.push('/project/new/view');
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white">
            {/* Container with responsive flex direction */}
            <div className="flex flex-col lg:flex-row">
                {/* Left Panel */}
                <div className="w-full lg:w-[500px] p-6 sm:p-8 md:p-12 flex flex-col">
                    <div className="mb-4">
                        <button
                            className="text-gray-400 hover:text-white transition-colors"
                            onClick={() => {
                                router.push(`/${user.id}/create-project`)
                                setStoredName('');
                                setStoredDesc('');
                            }}
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 lg:ml-6">
                        <h1 className="text-2xl sm:text-3xl font-normal mb-6 sm:mb-8">New project</h1>

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
                                        } rounded-md px-2 py-2 focus:border-blue-500 focus:ring-0 w-full`}
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
                                        } rounded-md px-2 py-2 focus:border-blue-500 focus:ring-0 w-full min-h-[100px]`}
                                />
                                {descshowError && (
                                    <p className="text-red-500 text-sm mt-2">
                                        Project description is required.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 sm:mt-12 space-y-3">
                            <Button
                                onClick={handleContinue}
                                className="w-full h-12 bg-transparent border border-gray-600 hover:bg-gray-800 text-white transition-colors"
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Hidden on mobile, visible on larger screens */}
                <div className="hidden lg:flex flex-1 items-center justify-center p-8">
                    <div className="w-full max-w-5xl relative">
                        <img
                            src="https://res.cloudinary.com/dci6nuwrm/image/upload/v1759513743/Updated_Dark_List_dkht3s.png"
                            alt="Project preview"
                            className="w-full h-auto rounded-lg shadow-lg"
                        />
                        {projectName && (
                            <div className="absolute top-4 left-8 md:left-12 lg:left-16">
                                <h2 className="text-lg md:text-xl font-mono text-white break-words max-w-[80%]">
                                    {projectName}
                                </h2>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}