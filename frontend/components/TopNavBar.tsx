'use client'
import { Search } from "lucide-react"
import { ProfileDropdown } from "./ProfileDropdown"
import { Input } from "./ui/input"
import { useState } from "react"

// Top Navigation Bar Component
export const TopNavBar = ({ userEmail, userName, isSidebarCollapsed }: any) => {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="border-b border-gray-800 px-6 py-3 flex items-center justify-between bg-gray-900">
      {/* Logo - Only shown when sidebar is collapsed */}
      {isSidebarCollapsed && (
        <div className="flex-shrink-0 mr-4">
          <img 
            src="https://res.cloudinary.com/dci6nuwrm/image/upload/v1766469977/planzo-navbar-logo_ioj9gb.svg" 
            alt="Planzo Logo" 
            className="h-10 w-auto"
          />
        </div>
      )}

      {/* Search Bar - Centered when sidebar is collapsed */}
      <div className={`${isSidebarCollapsed ? 'flex-1 max-w-2xl mx-auto' : 'flex-1 max-w-2xl'}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-gray-600"
          />
        </div>
      </div>

      {/* Profile Dropdown */}
      <div className="ml-4 flex-shrink-0">
        <ProfileDropdown userEmail={userEmail} userName={userName} />
      </div>
    </div>
  )
}