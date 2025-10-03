'use client'
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Loader from '@/components/Loader';
import axios from 'axios' ; 
import { useRouter } from 'next/navigation';
import { toast } from "react-toastify";

export default function AsanaSignup() {
    const [loading ,setLoading] = useState(false); 
    const [email ,setEmail] = useState('') ; 
    const [password ,setPassword] = useState('') ; 

    const router = useRouter() ; 

    const handleformsubmit = async (e:any) => {
        e.preventDefault();
        try{
           
            setLoading(true)
            const response = await axios.post('http://localhost:4000/api/v1/auth/user/register',
                {
                    email ,
                    password
                }
            ) ; 

            console.log("response = " ,response) ; 
            toast.success(response.data?.message || "User registered successfully 🎉");
            router.push(`/auth/otp/${response.data.user.id}`) ; 
        }
        catch(e : any){
            const errorMessage =
    e.response?.data?.message || e.message || "Something went wrong";
  toast.error(errorMessage);
            console.log("Error occurred while submitting form:", e.response?.data || e.message);
        } 
        finally{
            setLoading(false) ; 
        }
    }
  return (
    <div className="min-h-screen bg-[#f6f8f9] flex flex-col">
      {/* Header */}
      <header className="p-6">
        <svg width="120" height="32" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8" r="6" fill="#F06A6A"/>
          <circle cx="24" cy="20" r="6" fill="#F06A6A"/>
          <circle cx="12" cy="20" r="6" fill="#F06A6A"/>
          <text x="36" y="22" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="600" fill="#151B26">asana</text>
        </svg>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          
          <h1 className="text-center text-[#151B26] text-[42px] leading-tight font-medium mb-12">
            You're one click away<br />from less busywork
          </h1>

          <form onSubmit={handleformsubmit}>
          <div className="space-y-4">
            <div className="flex">
              <Input 
                type="email" 
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-14 text-base placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 bg-white"
              />
             
            </div>

            <div className="flex">
              <Input 
                type="password" 
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 h-14 text-base placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 bg-white"
              />
             
            </div>


            <Button 
  className="w-full h-14 px-8 bg-[#151B26] hover:bg-rose-400 hover:text-black text-white text-base font-medium flex items-center justify-center gap-2"
  disabled={loading} // disable while loading
  type='submit'
>
  {loading ? (
    <>
      <Loader />
      <span>Signing up...</span>
    </>
  ) : (
    "Continue"
  )}
</Button>
  
<p className="text-center text-sm text-gray-600 mt-6">
              By signing up, you agree to Asana's{' '}
              <a href="#" className="text-[#151B26] font-semibold hover:underline">
                Terms of Service
              </a>{' '}
              and acknowledge the Asana{' '}
              <a href="#" className="text-[#151B26] font-semibold hover:underline">
                Privacy Statement
              </a>
              .
            </p>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
              Already have a account ? {' '}
              <a href="/auth/login" className="text-[#151B26] font-semibold hover:underline">
               Login
              </a>
            </p>
         
          </form>
          
        </div>
      </main>

     
    </div>
  );
}