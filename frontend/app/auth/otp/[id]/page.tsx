'use client'
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResendDialog, setShowResendDialog] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Check if user is already verified
    const isVerified = localStorage.getItem('planzo_verified');
    if (isVerified === 'true') {
      router.push('/');
      return;
    }

    // Get user ID from localStorage
    const planzoId = localStorage.getItem('planzo_id');
    if (!planzoId) {
      // No user ID found, redirect to signup
      router.push('/signup');
      return;
    }
    
    setUserId(planzoId);
  }, [router]);

  const handleChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and max 6 digits
    if (/^\d{0,6}$/.test(value)) {
      setOtp(value);
      setError('');
    }
  };

  const validateOTP = () => {
    if (!otp) {
      setError('Please enter the OTP');
      return false;
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return false;
    }

    const otpNumber = parseInt(otp);
    if (otpNumber < 100000) {
      setError('Please enter a valid 6-digit OTP');
      return false;
    }

    return true;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!validateOTP()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/auth/user/verifyemail/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          otp: parseInt(otp)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          const zodErrors = data.error.map(e => e.message).join(', ');
          setError(zodErrors);
        } else {
          setError(data.message || 'Verification failed');
        }
        return;
      }

      // Store verification status in localStorage
      localStorage.setItem('planzo_verified', 'true');

      // Show success toast
      toast.success("Email verified successfully!", {
        description: "Your account has been activated.",
      });

      // Clear OTP input
      setOtp('');
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push(`/auth/account_setup/${userId}`);
      }, 500);
      
    } catch (err) {
      setError('An error occurred during verification. Please try again.');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/user/resendemail/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to resend OTP');
        return;
      }

      // Show success dialog
      setShowResendDialog(true);
      
      // Auto close dialog after 3 seconds
      setTimeout(() => {
        setShowResendDialog(false);
      }, 3000);
      
    } catch (err) {
      toast.error('An error occurred while resending OTP. Please try again.');
      console.error('Resend OTP error:', err);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <Dialog open={showResendDialog} onOpenChange={setShowResendDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>OTP Sent Successfully!</DialogTitle>
            <DialogDescription>
              A new OTP has been sent to your email address. Please check your inbox and enter the code below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Button onClick={() => setShowResendDialog(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
            <CardDescription className="text-center">
              Enter the 6-digit OTP sent to your email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={otp}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-semibold"
                  required
                />
                <p className="text-xs text-gray-500 text-center">
                  Please enter the 6-digit code from your email
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleVerify}
                className="w-full" 
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?
                </p>
                <Button
                  variant="outline"
                  onClick={handleResendOTP}
                  disabled={resendLoading}
                  className="w-full"
                >
                  {resendLoading ? 'Sending...' : 'Resend OTP'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}