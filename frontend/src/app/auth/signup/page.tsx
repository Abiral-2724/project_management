'use client'
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Loader from '@/components/Loader';

export default function AsanaSignup() {
    const [loading ,setLoading] = useState(false); 
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
          {/* Heading */}
          <h1 className="text-center text-[#151B26] text-[42px] leading-tight font-medium mb-12">
            You're one click away<br />from less busywork
          </h1>

          {/* Sign-up Form */}
          <div className="space-y-4">
          
            {/* Email Input with Continue Button */}
            <div className="flex">
              <Input 
                type="email" 
                placeholder="name@company.com"
                className="flex-1 h-14 text-base placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 bg-white"
              />
             
            </div>

            <div className="flex">
              <Input 
                type="password" 
                placeholder="password"
                className="flex-1 h-14 text-base placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 bg-white"
              />
             
            </div>


            <Button 
  className="w-full h-14 px-8 bg-[#151B26] hover:bg-rose-400 hover:text-black text-white text-base font-medium flex items-center justify-center gap-2"
  disabled={loading} // disable while loading
  onClick={() => setLoading(!loading)}
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

            {/* Terms Text */}
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
        </div>
      </main>

     
    </div>
  );
}