import { ChevronDown, LayoutDashboard, Loader2, Lock, Plus, Settings, Star } from 'lucide-react';
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

type Props = {}

const ProjectNavbar = ({projectDetail ,projectMember ,navItems ,handleNavClick ,activeTab} : any) => {
  return (
    <div>
        <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
           
            <h1 className="text-lg font-semibold">
              {projectDetail?.projectName ? (
                projectDetail.projectName
              ) : (
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
              )}
            </h1>

            <button className="text-gray-400 hover:text-gray-600">
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="text-gray-400 hover:text-yellow-500">
              <Star className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded border border-gray-200 hover:border-gray-300">
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              Set status
            </button>
          </div>
          <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
  {projectMember.map((member : any) => (
    <Avatar key={member.id} className="w-9 h-9 border-2 border-white rounded-full">
      <AvatarImage src={member?.profile} />
      <AvatarFallback className="bg-cyan-500 text-white text-xs font-medium">
        {member.emailuser?.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  ))}
</div>

            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-sm">
              <Lock className="w-3 h-3 mr-1.5" />
              Share
            </Button>
            <Button size="sm" variant="outline" className="border-gray-300 h-8 text-sm">
              <Settings className="w-3 h-3 mr-1.5" />
              Customize
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 flex items-center gap-0 overflow-x-auto">
          {navItems.map((item : any) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`px-3 py-2.5 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === item.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
          <button className="px-2 py-2.5 text-gray-600 hover:text-gray-900 ml-1">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProjectNavbar ; 

