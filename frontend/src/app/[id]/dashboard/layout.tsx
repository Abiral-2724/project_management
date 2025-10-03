import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { ToastContainer } from "react-toastify";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
       
        {children}
      </main>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
