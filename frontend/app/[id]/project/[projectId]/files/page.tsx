'use client';

import React, { use, useEffect, useState } from 'react';
import { FileText, Image, File, User, Folder } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ProjectNavbar from '@/components/ProjectNavbar';
import { useProjectNavbar } from '@/hooks/useProjectNavbar';
import axios from 'axios';
import { toast } from 'react-toastify';


const Page = ({ params }: any) => {
 
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

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
  } = useProjectNavbar(id,projectId,'files')

  useEffect(() => {
    toast.success('This can take few seconds, Please wait !!')
    const getallfilesofproject = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/v1/files/${id}/project/${projectId}/file/getAll`)
        
        setFiles(response.data.files);
      } catch (e: any) {
        const errorMessage = e.message || 'Something went wrong';
        console.error('Error occurred while fetching project files:', e);
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    getallfilesofproject();
  }, [id, projectId]);



  const FilePreview = ({ file }:any) => {
   

    return (
      <div className="mt-0 bg-gray-900/50 flex items-center justify-center">
        {/* <div className="mt-0 overflow-hidden"> */}
          <img
            src={file.profile}
            alt="File preview"
            className="w-full h-[300px] object-cover"
          />
        {/* </div> */}
      
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] p-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-[#2a2a2a] rounded-2xl border border-[#3a3a3a] p-4">
                  <div className="h-12 bg-[#3a3a3a] rounded-lg mb-3" />
                  <div className="h-64 bg-[#3a3a3a] rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
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
<div className="min-h-screen text-black p-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Files Grid */}
        {files.length === 0 ? (
          <div className="text-center py-16">
            <Folder className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No files yet</h3>
            <p className="text-gray-500">Files uploaded to this project will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 pl-20 pr-20">
            {files.map((file : any) => (
              <div
                key={file.id }
                className="bg-[#2a2a2a] rounded-2xl overflow-hidden border border-[#3a3a3a]"
              >
                {/* Header Card */}
                <div className="bg-[#2a2a2a] p-4 border-b border-[#3a3a3a]">
                  <div className="flex items-center space-x-3">
                    {/* File Icon */}
                    <div className="w-12 h-12 rounded-lg bg-[#3a3a3a] flex items-center justify-center flex-shrink-0">
                      <Image className="w-6 h-6 text-gray-400" />
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-base font-medium truncate">
                        {file.projectname}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <svg className="w-4 h-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-400">{file.ownername}</span>
                        <span className="text-gray-600">·</span>
                        <span className="text-sm text-gray-400">{file.taskname}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Content Preview */}
                <div className="p-0">
                  <FilePreview file={file} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
      </div>
    
  );
};

export default Page;