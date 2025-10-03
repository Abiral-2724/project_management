'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Loader from '@/components/Loader';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function AsanaVerification({params}) {

  const { id } = React.use(params);
  const userId = id ;

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [loading ,setLoading] = useState(false);
  const [email ,SetEmail] = useState('') ; 

  const router = useRouter()  ; 

  useEffect(() => {

    const finduserinfo = async () => {
      try{
        const response = await axios.get(`http://localhost:4000/api/v1/user/getuser/${userId}`) ; 

        SetEmail(response.data.user.email) ; 
      }
      catch(e){
        const errorMessage = e.response?.data?.message || e.message || "Something went wrong";
          toast.error(errorMessage) ; 
      }
    }

    finduserinfo() ; 
    
  } ,[]) ; 

  const handlesubmit = async (e) => {
    e.preventDefault() ;
    try{
      setLoading(true) ; 
        
      const num = Number(code.join('')) ; 
        const response = await axios.post(`http://localhost:4000/api/v1/auth/user/verifyemail/${userId}` ,{
          otp:num
        })
      
        toast.success(response.data.message); 
        router.push(`/auth/account_setup/${id}/${email}`) ; 
    }
    catch(e){

      const errorMessage =
      e.response?.data?.message || e.message || "Something went wrong";
    toast.error(errorMessage);
              console.log("Error occurred while submitting form:", e.response?.data || e.message);

    }finally{
      setLoading(false)
    }
  }

  const resendotpfunction = async(e) => {
    try{
      const response = await axios.patch(`http://localhost:4000/api/v1/auth/user/resendemail/${userId}`) ; 

      toast.success(response.data.message) ; 

    }catch(e){
      const errorMessage =
      e.response?.data?.message || e.message || "Something went wrong";
    toast.error(errorMessage);
              console.log("Error occurred while submitting form:", e.response?.data || e.message);
    }
  }


  const handleInputChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode([...newCode, ...Array(6 - newCode.length).fill('')]);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };



  return (
    <div className="min-h-screen bg-[#f6f5f4] flex flex-col">
      <header className="p-6">
        <svg width="120" height="32" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="4" fill="#f06a6a"/>
          <circle cx="20" cy="6" r="4" fill="#f06a6a"/>
          <circle cx="20" cy="18" r="4" fill="#f06a6a"/>
          <text x="32" y="20" fontFamily="sans-serif" fontSize="20" fontWeight="600" fill="#151b26">asana</text>
        </svg>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-xl">
          <h1 className="text-4xl md:text-5xl font-normal text-[#151b26] text-center mb-6">
            We emailed you a code
          </h1>
          
          <p className="text-[#151b26] text-center mb-8">
            We sent a six digit code to {email}. Enter the code below:
          </p>

          <form onSubmit={handlesubmit}>
          <div className="flex justify-center gap-3 mb-6">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-16 h-20 text-center text-2xl font-normal bg-white border-b-2 border-[#d1d1d1] focus:border-[#151b26] focus:outline-none transition-colors"
              />
            ))}
          </div>

          <Button 
  className="w-full h-14 px-8 bg-[#151B26] hover:bg-rose-400 hover:text-black text-white text-base font-medium flex items-center justify-center gap-2"
  disabled={loading} // disable while loading
  type='submit'
 
>
  {loading ? (
    <>
      <Loader />
      <span>Verifying</span>
    </>
  ) : (
    "Verify"
  )}
</Button>
          </form>
         

         

          <p className="text-center text-[#6d6e6f] text-sm mt-8">
            Didn't receive an email? Try checking your junk folder.{' '}
            <button className="text-[#151b26] font-medium hover:underline" onClick={() => resendotpfunction()}>
              Resend code
            </button>
            .
          </p>
        </div>
      </main>
    </div>
  );
}