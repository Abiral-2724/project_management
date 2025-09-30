'use client'
import React from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AsanaSignup() {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Section */}
      <div className="w-1/2 pl-16 pt-10 flex flex-col">
        {/* Logo */}
        <div className="mb-16">
          <svg width="120" height="36" viewBox="0 0 120 36" fill="none">
            <circle cx="12" cy="12" r="6" fill="#F06A6A" />
            <circle cx="24" cy="18" r="6" fill="#F06A6A" />
            <circle cx="12" cy="24" r="6" fill="#F06A6A" />
            <text
              x="40"
              y="24"
              fill="#151525"
              style={{ fontSize: '24px', fontWeight: '600', fontFamily: 'system-ui' }}
            >
              asana
            </text>
          </svg>
        </div>

        <h1 className="text-4xl font-normal text-gray-900 mb-4">
          Tell us about your work
        </h1>
        
        {/* Subtitle */}
        <p className="text-gray-800 mb-12 text-base">
          This will help us tailor Asana for you. We may also reach out to help you find the right Asana products for your team.
        </p>

        {/* Form Fields */}
        <div className="space-y-8">
          {/* Role Field */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              What's your role?
            </label>
            <Select>
              <SelectTrigger className="w-80 h-12 bg-white border border-gray-300 rounded-md">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="individual">Individual Contributor</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Continue Button */}
        <div className="mt-40">
          <Button className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-2 rounded-md font-medium">
            Continue
          </Button>
        </div>
      </div>

      {/* Right Section - Illustration */}
      <div className="w-1/2 bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center p-12">
        <Image
          src="https://plus.unsplash.com/premium_vector-1725614217789-0bb3c7fccbd8?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Sample"
          width={1639}
          height={1000}
          className="rounded-lg object-cover"
        />
      </div>
    </div>
  );
}
