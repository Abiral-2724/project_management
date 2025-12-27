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

const API_BASE_URL = 'http://localhost:4000/api/v1'

// Invite Dialog Component
const ROLES = [
  { value: 'ADMIN', label: 'Admin', description: 'Can manage project settings and members' },
  { value: 'EDITOR', label: 'Editor', description: 'Can edit tasks and content' },
  { value: 'COMMENTER', label: 'Commenter', description: 'Can comment on tasks' },
  { value: 'VIEWER', label: 'Viewer', description: 'Can only view content' },
]

export const InviteTeammateDialog = ({
  open,
  onOpenChange,
  userOwnerProjects,
  onInvite,
  userId
} : any) => {
  const [email, setEmail] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (email.trim() && selectedProject && selectedRole && userId) {
      setSending(true)
      try {
        const response = await fetch(
          `${API_BASE_URL}/${userId}/project/${selectedProject}/addMember/sendInvite`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inviteEmail: [email.trim()],
              role: selectedRole
            })
          }
        )

        const data = await response.json()

        if (data.success) {
          alert('Invitation sent successfully!')
          setEmail('')
          setSelectedProject('')
          setSelectedRole('')
          onOpenChange(false)
          if (onInvite) {
            onInvite(email.trim(), selectedProject, selectedRole)
          }
        } else {
          alert(data.message || 'Failed to send invitation')
        }
      } catch (error) {
        console.error('Error sending invitation:', error)
        alert('Error sending invitation. Please try again.')
      } finally {
        setSending(false)
      }
    }
  }

  const isFormValid = Boolean(email.trim()) && Boolean(selectedProject) && Boolean(selectedRole)

  const selectedProjectData = userOwnerProjects.find(
    p => p.id === selectedProject
  )
  const selectedProjectName = selectedProjectData?.projectName || ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-light">
              Invite people to My workspace
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-3">
          <div className="space-y-2 mt-[-13]">
            <Label htmlFor="email" className="text-base font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-base font-medium text-gray-700">
                Add to projects
              </Label>
              <Info className="h-4 w-4 text-gray-400" />
            </div>
            
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between font-normal"
                >
                  <span className={selectedProjectName ? "text-gray-900" : "text-gray-500"}>
                    {selectedProjectName || "Start typing to add projects"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[552px] p-0">
                <Command>
                  <CommandInput placeholder="Search projects..." />
                  <CommandEmpty>No project found.</CommandEmpty>
                  <CommandGroup>
                    {userOwnerProjects.map((project) => (
                      <CommandItem
                        key={project.id}
                        value={project.projectName}
                        onSelect={() => {
                          setSelectedProject(project.id)
                          setComboboxOpen(false)
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            selectedProject === project.id
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                        {project.projectName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-base font-medium text-gray-700">
              Role
            </Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{role.label}</span>
                      <span className="text-xs text-gray-500">{role.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end">
          <Button
            onClick={handleSend}
            disabled={!isFormValid || sending}
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
