'use client';
import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AsanaSignup({ params }) {
  const { id, email } = React.use(params);
  const decodedEmail = decodeURIComponent(email);

  const router = useRouter();

  // States
  const [name, setName] = useState('');
  const [myRole, setMyRole] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewImage(URL.createObjectURL(selectedFile));
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !myRole || !file) {
      toast.error('Please fill all fields and select a profile image.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('fullname', name);
      formData.append('myrole', myRole);
      formData.append('image', file);

      const response = await axios.patch(
        `http://localhost:4000/api/v1/auth/user/account_setup/${id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      toast.success(response.data.message || 'Account setup successful!');
      router.push('/auth/account_setup/addrole'); // Redirect to next step
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Something went wrong!');
      console.error(err);
    } finally {
      setLoading(false);
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

        {/* Form */}
        <div className="max-w-md">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">Welcome to Asana!</h1>
          <p className="text-gray-800 mb-12">You're signing up as {decodedEmail}</p>

          <form onSubmit={handleSubmit}>
            {/* Profile Image */}
            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                <div className="w-36 h-36 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
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

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <button
                  type="button"
                  onClick={openFilePicker}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="4" width="12" height="9" rx="1" stroke="#6B7280" strokeWidth="1.5" />
                    <circle cx="8" cy="8.5" r="2" stroke="#6B7280" strokeWidth="1.5" />
                    <path d="M5.5 4L6.5 2H9.5L10.5 4" stroke="#6B7280" strokeWidth="1.5" />
                  </svg>
                </button>
              </div>

              {/* Name & Role */}
              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <label className="block text-gray-900 font-medium mb-2">Full Name</label>
                  <Input
                    type="text"
                    value={name}
                    placeholder="Enter full name"
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-12 border-2 border-blue-500 focus:border-blue-600 focus:ring-0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Role</label>
                  <Select value={myRole} onValueChange={setMyRole}>
                    <SelectTrigger className="w-full h-12 bg-white border border-gray-300 rounded-md">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Team_member">Team_member</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Director">Director</SelectItem>
                      <SelectItem value="Executive">Executive</SelectItem>
                      <SelectItem value="Business_owner">Business_owner</SelectItem>
                      <SelectItem value="Freelancer">Freelancer</SelectItem>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer_not_to_say">Prefer_not_to_say</SelectItem>
                      <SelectItem value="NONE">NONE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!name.trim() || !myRole.trim() || !file || loading}
              className={`px-8 h-11 rounded-md transition-colors ${
                !name.trim() || !myRole.trim() || !file || loading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Submitting...' : 'Continue'}
            </Button>
          </form>

          <div className="mt-8 text-sm text-gray-600">
            You're signing up as {decodedEmail}.
            <br />
            Wrong account?{' '}
            <a href="/auth/login" className="text-blue-600 hover:underline">
              Log in
            </a>{' '}
            instead.
          </div>
        </div>
      </div>

      {/* Right Section Illustration */}
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
