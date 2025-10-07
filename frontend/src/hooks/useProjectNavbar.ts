'use client'
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { NavItems } from "../../util/file";

export function useProjectNavbar(id: string, projectId: string, initialTab: string){
    const router = useRouter();

    const [activeTab, setActiveTab] = useState(initialTab);
  const [isStarred, setIsStarred] = useState(false);

    const baseUrl = `/${id}/dashboard/project/${projectId}`;

    const [projectDetail, setProjectDetail] = useState<any>(null);
    const [projectMember, setProjectMember] = useState<any[]>([]);
    const [projectViews, setProjectViews] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);

    const allNavItems = NavItems ; 

    useEffect(() => {
        if (typeof window !== "undefined") {
          setToken(localStorage.getItem("token"));
        }
      }, []);

      useEffect(() => {
        if (!token) return;
    
        const getProjectDetails = async () => {
          try {
            const response = await axios.get(
              `http://localhost:4000/api/v1/${id}/project/${projectId}/get/complete/projectDetails`,
              {
                headers: {
                  Authorization: `${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
    
            setProjectDetail(response.data.projectDetail);
            setProjectMember(response.data.projectMember);
            setProjectViews(response.data.projectViews);
    
            console.log("API Response:", response.data);
          } catch (e: any) {
            const errorMessage =
              e.response?.data?.message || e.message || "Something went wrong";
            toast.error(errorMessage);
            console.log("Error occurred while fetching project details:", e.response?.data || e.message);
          }
        };
    
        getProjectDetails();
      }, [token, id, projectId]);
    

      const handleNavClick = (item: any) => {
        setActiveTab(item.id);
        router.push(`${baseUrl}/${item.label}`);
      };

      const handleStarClick = () => {
        setIsStarred(!isStarred);
        // Add API call to save star status
      };
    
      const handleShareClick = () => {
        // Implement share functionality
        console.log('Share clicked');
      };
    
      const handleCustomizeClick = () => {
        router.push(`${baseUrl}/customize`);
      };

       // Filter nav items based on projectViews
  const navItems = projectViews 
  ? allNavItems.filter(item => projectViews[item.label] === true)
  : allNavItems;

    
      return {
        activeTab,
        projectDetail,
        projectMember,
        projectViews,
        isStarred,
        token,
        baseUrl,
        handleNavClick,
        handleCustomizeClick,
        handleShareClick,
        handleStarClick,
        setProjectMember ,
        navItems
      }

}