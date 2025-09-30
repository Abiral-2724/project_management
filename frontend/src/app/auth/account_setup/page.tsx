'use client'
import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function AsanaSignup() {
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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

        {/* Main Content */}
        <div className="max-w-md">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">
            Welcome to Asana!
          </h1>

          <p className="text-gray-800 mb-12">
            You're signing up as 2724test2004@gmail.com.
          </p>

          <div className="flex items-start gap-6 mb-30">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-36 h-36 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="13" r="6" stroke="#9CA3AF" strokeWidth="2" />
                    <path
                      d="M8 32C8 25.373 13.373 20 20 20C26.627 20 32 25.373 32 32"
                      stroke="#9CA3AF"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="user" // opens camera on mobile
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Camera Button */}
              <button
                type="button"
                onClick={openFilePicker}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect
                    x="2"
                    y="4"
                    width="12"
                    height="9"
                    rx="1"
                    stroke="#6B7280"
                    strokeWidth="1.5"
                  />
                  <circle cx="8" cy="8.5" r="2" stroke="#6B7280" strokeWidth="1.5" />
                  <path d="M5.5 4L6.5 2H9.5L10.5 4" stroke="#6B7280" strokeWidth="1.5" />
                </svg>
              </button>
            </div>

            {/* Form Fields */}
            <div className="flex-8">
              <div className="mb-6">
                <label className="block text-gray-900 font-medium mb-2">
                  What's your full name?
                </label>
                <Input
                  type="text"
                  value={name}
                  placeholder="Enter name"
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 border-2 border-blue-500 focus:border-blue-600 focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <Button
            disabled={!name.trim()}
            className={`px-8 h-11 rounded-md transition-colors ${
              !name.trim()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Continue
          </Button>

          <div className="mt-8 text-sm text-gray-600">
            You're signing up as 2724test2004@gmail.com.
            <br />
            Wrong account?{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Log in
            </a>{' '}
            instead.
          </div>
        </div>
      </div>

      {/* Right Section - Illustration */}
      <div className="w-1/2 bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center p-12">
        <Image
          src="https://images.unsplash.com/photo-1611224885990-ab7363d1f2a9?q=80&w=1639&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Sample"
          width={1639}
          height={1000}
          className="rounded-lg object-cover"
        />
      </div>
    </div>
  );
}
