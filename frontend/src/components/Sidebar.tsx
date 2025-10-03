'use client'
import { ChevronRight, Menu, Plus, X } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button';
import decodetokenfunction from '../../util/decodeToken';
import { useRouter } from 'next/navigation';

type Props = {}

const Sidebar = (props: Props) => {
  const [isOpen, setIsOpen] = useState(true);

  const user = decodetokenfunction() ; 

  const router = useRouter() ; 

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      
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
        <nav className="flex-1 p-4 space-y-1 min-w-[256px]">
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
              <span className="text-xs font-semibold text-gray-400 uppercase">Projects</span>
              <Plus className="h-4 w-4 text-gray-400" />
            </div>
            <NavItem icon="●" label="Cross-functional project plan" color="text-teal-400" />
          </div>

          <div className="pt-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase">Teams</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded hover:bg-gray-800 cursor-pointer">
              <div className="flex items-center gap-3">
                <span>👥</span>
                <span className="text-sm">Abiral's first team</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </nav>

        {/* Trial Banner */}
        <div className="p-4 border-t border-gray-800 min-w-[256px]">
          <div className="bg-gray-800 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full" />
              <div>
                <p className="text-xs font-semibold">Advanced free trial</p>
                <p className="text-xs text-gray-400">8 days left</p>
              </div>
            </div>
          </div>
          <Button className="w-full bg-orange-400 hover:bg-orange-500 text-gray-900 font-semibold">
            Add billing info
          </Button>
          <Button variant="ghost" className="w-full text-white hover:bg-gray-800 mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Invite teammates
          </Button>
        </div>
      </div>

      {/* Toggle button when sidebar is closed */}
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
      className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer ${
        active ? 'bg-gray-800' : 'hover:bg-gray-800'
      }`}
    >
      <span className={color}>{icon}</span>
      <span className="text-sm">{label}</span>
    </div>
  );
}