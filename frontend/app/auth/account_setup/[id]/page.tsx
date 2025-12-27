'use client';
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Spinner } from '@/components/ui/spinner';

export default function AccountSetup() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();

  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [name, setName] = useState('');
  const [myRole, setMyRole] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Check if user ID exists in localStorage
    const planzoId = localStorage.getItem('planzo_id');
    if (!planzoId) {
      router.push('/auth/login');
      return;
    }
    
    setUserId(planzoId);
    
    // Fetch user details to get email
    fetchUserDetails(planzoId);
  }, [router]);

  const fetchUserDetails = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/user/getuser/${id}`);
      const data = await response.json();

      if (response.ok && data.user) {
        setUserEmail(data.user.email || '');
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewImage(URL.createObjectURL(selectedFile));
      setError('');
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError('Full name is required');
      return false;
    }

    if (!myRole) {
      setError('Please select your role');
      return false;
    }

    if (!file) {
      setError('Please upload a profile image');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('fullname', name);
      formData.append('myrole', myRole);
      formData.append('image', file!);

      const response = await fetch(`${API_BASE}/auth/user/account_setup/${userId}`, {
        method: 'PATCH',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Account setup failed');
        return;
      }

      toast.success('Account setup successful!');
      
      // Redirect after successful setup
      setTimeout(() => {
        router.push(`/${userId}/dashboard`);
      }, 500);
      
    } catch (err: any) {
      setError(err.message || 'Something went wrong!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-white flex flex-col lg:flex-row">
        {/* Left Section */}
        <div className="w-full lg:w-1/2 px-6 sm:px-12 lg:pl-16 pt-6 sm:pt-10 flex flex-col">
          {/* Logo */}
          <div className="mb-8 ml-[-30px] sm:mb-12 lg:mb-16">
           <img src="https://res.cloudinary.com/dci6nuwrm/image/upload/v1765728997/planzo-navbar-logo-black_vm2bqg.svg" alt="Planzo" className='h-15' />
          </div>

          {/* Form */}
          <div className="max-w-md w-full pb-8 lg:pb-0">
            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-3 sm:mb-4">Welcome to Planzo!</h1>
            <p className="text-gray-800 mb-8 sm:mb-12 text-sm sm:text-base">
              {userEmail ? `You're signing up as ${userEmail}` : 'Complete your profile setup'}
            </p>

            <div>
              {/* Profile Image - Stack on mobile, side by side on larger screens */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
                <div className="relative flex-shrink-0">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
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
                <div className="flex-1 w-full flex flex-col gap-4">
                  <div>
                    <label className="block text-gray-900 font-medium mb-2 text-sm sm:text-base">Full Name</label>
                    <Input
                      type="text"
                      value={name}
                      placeholder="Enter full name"
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 sm:h-12 border-2 border-blue-500 focus:border-blue-600 focus:ring-0"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Role</label>
                    <Select value={myRole} onValueChange={setMyRole} disabled={loading}>
                      <SelectTrigger className="w-full h-11 sm:h-12 bg-white border border-gray-300 rounded-md">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Team_member">Team Member</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Director">Director</SelectItem>
                        <SelectItem value="Executive">Executive</SelectItem>
                        <SelectItem value="Business_owner">Business Owner</SelectItem>
                        <SelectItem value="Freelancer">Freelancer</SelectItem>
                        <SelectItem value="Student">Student</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!name.trim() || !myRole || !file || loading}
                className={`w-full sm:w-auto px-8 h-11 rounded-md transition-colors ${
                  !name.trim() || !myRole || !file || loading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? 'Submitting ' : 'Continue'}
                {
                  loading ? <Spinner /> : <></>
                }
              </Button>

              <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-600">
                {userEmail && (
                  <>
                    You're signing up as {userEmail}.
                    <br />
                  </>
                )}
                Wrong account?{' '}
                <a href="/auth/login" className="text-blue-600 hover:underline">
                  Log in
                </a>{' '}
                instead.
              </div>
            </div>
          </div>
        </div>

        {/* Right Section Illustration - Hidden on mobile, visible on lg+ */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-pink-50 to-pink-100 items-center justify-center p-12">
          <Image
            src="https://images.unsplash.com/photo-1611224885990-ab7363d1f2a9?q=80&w=1639&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Sample"
            width={1639}
            height={1000}
            className="rounded-lg object-cover max-w-full h-auto"
          />
        </div>
      </div>
    </>
  );
}