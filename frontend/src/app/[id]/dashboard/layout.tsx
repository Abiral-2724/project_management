'use client'
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

export default function HomeLayout({
  children, params
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;
  const [user, setUser] = useState({});

  useEffect(() => {
    const getuserinfo = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/v1/user/getuser/${id}`);
        setUser(response.data.user);
      } catch (e: any) {
        const errorMessage =
          e.response?.data?.message || e.message || "Something went wrong";
        toast.error(errorMessage);
        console.log("Error occurred while submitting form:", e.response?.data || e.message);
      }
    }
    getuserinfo();
  }, [id]);

  return (
    <div className="flex overflow-hidden">
      <Sidebar params={params} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar user={user}></Topbar>
        {children}
      </main>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}