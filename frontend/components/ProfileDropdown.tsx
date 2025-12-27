'use client'
import React, { useState, useEffect } from 'react'
import { X, ChevronRight, Users, FolderPlus, Menu, Home, CheckSquare, Target, ChevronLeft, Search, LogOut, User, Settings as SettingsIcon, Plus, Key } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Check, ChevronsUpDown, Info } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useRouter } from 'next/navigation'
import { InviteTeammateDialog } from '@/components/InviteTeammateDialog'

const API_BASE_URL = 'http://localhost:4000/api/v1'


// Profile Dropdown Component
export const ProfileDropdown = ({ userEmail, userName } : any) => {
  const handleLogout = () => {
    localStorage.removeItem('planzo_id')
    window.location.href = '/auth/login'
  }

  const router = useRouter();
  const id = localStorage.getItem("planzo_id")
  const initials = userName?.substring(0, 2).toUpperCase() || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors">
          <div className="bg-pink-300 rounded-full h-10 w-10 flex items-center justify-center text-sm font-medium text-gray-900">
            {initials}
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 rotate-90" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-gray-900 text-white border-gray-800 mr-4" align="end">
        <div className="px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-pink-300 rounded-full h-16 w-16 flex items-center justify-center text-xl font-medium text-gray-900">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-lg">My workspace</div>
              <div className="text-sm text-gray-400 truncate">{userEmail || 'user@example.com'}</div>
            </div>
          </div>
        </div>
        
        <div className="py-2 border-b border-gray-800">
          <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer px-4 py-2 focus:bg-gray-800 focus:text-white">
            <Key className="mr-3 h-4 w-4" />
            Admin console
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer px-4 py-2 focus:bg-gray-800 focus:text-white">
            <Plus className="mr-3 h-4 w-4" />
            New workspace
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer px-4 py-2 focus:bg-gray-800 focus:text-white">
            <Users className="mr-3 h-4 w-4" />
            Invite to Asana
          </DropdownMenuItem>
        </div>
        
        <div className="py-2 border-b border-gray-800">
        <DropdownMenuItem
  onClick={() => router.push(`/${id}/profile`)}
  className="hover:bg-gray-800 cursor-pointer px-4 py-2 focus:bg-gray-800 focus:text-white"
>
  <User className="mr-3 h-4 w-4" />
  Profile
</DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer px-4 py-2 focus:bg-gray-800 focus:text-white">
            <SettingsIcon className="mr-3 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer px-4 py-2 focus:bg-gray-800 focus:text-white">
            <Plus className="mr-3 h-4 w-4" />
            Add another account
          </DropdownMenuItem>
        </div>
        
        <div className="py-2">
          <DropdownMenuItem 
            onClick={handleLogout}
            className="hover:bg-gray-800 cursor-pointer px-4 py-2 focus:bg-gray-800 focus:text-white"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}