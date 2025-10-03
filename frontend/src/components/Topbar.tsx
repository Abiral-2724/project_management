import { HelpCircle, LogOut, Plus, Search, Settings, Sliders, User, UserPlus } from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

type Props = {}

const Topbar = ({user} : any) => {

    const router = useRouter() ; 

    const handlelogout = async() => {
        try{
                    const response = await axios.get('http://localhost:4000/api/v1/auth/user/logout') ; 

                    localStorage.removeItem('token') ; 

                    toast.success(response.data.message) ; 
                router.push('/auth/login') ; 
        }catch(e : any){
            const errorMessage =
            e.response?.data?.message || e.message || "Something went wrong";
          toast.error(errorMessage);
                    console.log("Error occurred while submitting form:", e.response?.data || e.message);
        
        }
  }
  return (
    <div className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <Search className="h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search nivaasconnect.com"
              className="flex-1 outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="cursor-pointer">
                <AvatarImage src={user.profile} />
                  <AvatarFallback className="bg-cyan-400 text-gray-900 font-semibold">
                    {user.fullname ? user.fullname.substring(0, 2).toLowerCase() : 'ab'}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0" align="end">
                <div className="bg-gray-50 p-4 border-b">
                 
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-16 h-16">
                    <AvatarImage src={user.profile} />
                      <AvatarFallback className="bg-cyan-400 text-gray-900 text-xl font-semibold">
                        {user.fullname ? user.fullname.substring(0, 2).toLowerCase() : 'ab'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">My workspace</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="w-3 h-3 bg-green-600 rounded-full ml-auto" />
                  </div>
                </div>
                <div className="py-2">
                <button className="w-full px-4 py-3 text-left hover:bg-gray-200 flex items-center gap-3 mb-2 focus:outline-none">
  <Sliders className="h-5 w-5" />
  <span className="font-medium">Admin console</span>
</button>

                  <button className="w-full px-4 py-3 text-left hover:bg-gray-200 flex items-center gap-3 mb-2 focus:outline-none">
                    <Plus className="h-5 w-5" />
                    <span>New workspace</span>
                  </button>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-200 flex items-center gap-3 mb-2 focus:outline-none">
                    <UserPlus className="h-5 w-5" />
                    <span>Invite to Asana</span>
                  </button>
                  <div className="my-2 border-t" />
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-200 flex items-center gap-3 mb-2 focus:outline-none">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </button>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-200 flex items-center gap-3 mb-2 focus:outline-none">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </button>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-200 flex items-center gap-3 mb-2 focus:outline-none">
                    <Plus className="h-5 w-5" />
                    <span>Add another account</span>
                  </button>
                  <div className="my-2 border-t" />
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-200 flex items-center gap-3 mb-2 focus:outline-none" onClick={handlelogout}>
                    <LogOut className="h-5 w-5" />
                    <span>Log out</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
  )
}

export default Topbar