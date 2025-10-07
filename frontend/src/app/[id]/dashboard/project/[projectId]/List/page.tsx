'use client'
import ProjectNavbar from '@/components/ProjectNavbar'
import { useProjectNavbar } from '@/hooks/useProjectNavbar'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { use, useEffect, useState } from 'react'
import { toast } from 'react-toastify'

type Props = {}

const page = ({params} : any) => {

  const router =useRouter() ; 

  const [tasks,setTasks] = useState([]) ; 
  const [subTasks ,setSubTasks] = useState([]) ; 
  const [getAllTaskDetail ,setAllTaskDetail] = useState([]) ; 

  const { id, projectId } : any = use(params);
  const {
    activeTab,
    isStarred,
    projectDetail,
    projectViews,
    projectMember,
    handleNavClick,
    token,
    handleStarClick,
    handleShareClick,
    handleCustomizeClick,
    setProjectMember,
    navItems
  } = useProjectNavbar(id,projectId,'list') ;


  const addNewTasksfunction = async () => {

    try{
          const response = await axios.post(`http://localhost:4000/api/v1/task/${id}/project/${projectId}/add/tasks` ,
            {
              tasks
            }
          ) ;

          console.log(response.data.tasks);

          if(response.data.success === true){
            toast.success("Tasks created successsfully")
          }
    }
    catch(e : any){
      const errorMessage =
      e.response?.data?.message || e.message || "Something went wrong";
    toast.error(errorMessage);
    console.log("Error occurred while fetching project timeline:", e.response?.data || e.message);
    }

  }


  const addNewSubtasksfunction = async () => {
    try{
      const response = await axios.post(`http://localhost:4000/api/v1/task/${id}/project/${projectId}/task/add/subTasks` ,
        {
          subTasks
        }
      ) ;

      console.log("subtasks = " ,response.data.subtasks) ; 
      if(response.data.success === true){
        toast.success("SubTasks created successsfully")
      }


    }
    catch(e : any){
const errorMessage =
      e.response?.data?.message || e.message || "Something went wrong";
    toast.error(errorMessage);
    console.log("Error occurred while fetching project timeline:", e.response?.data || e.message);
    }
  }

  useEffect(() => {
    const getallTaskListWithTheirSubtasks = async () => {

      try {
        console.log(id) ; 
        console.log(projectId)
          const response = await axios.get(`http://localhost:4000/api/v1/task/${id}/project/${projectId}/task/get/complete/detail`) ; 

         console.log(response.data)
          if(response.data.success === true){
            toast.success("All tasks data got successfully")
          }

          setAllTaskDetail(response.data.TasksDetail) ; 


          console.log('all tasks details' ,response.data.TasksDetail) ; 

      }
      catch(e : any){
const errorMessage =
      e.response?.data?.message || e.message || "Something went wrong";
    toast.error(errorMessage);
    console.log("Error occurred while fetching project timeline:", e.response?.data || e.message);
    }
      }
    

      getallTaskListWithTheirSubtasks() ; 
  } ,[]) ;


  const markTaskCompleteorUncomplete = async (taskId : string) => {

      try{
          const response = await axios.patch(`http://localhost:4000/api/v1/task/${id}/project/${projectId}/task/updatedtask/status`,
            {
              taskId : taskId
            }
          ) ;

          if(response.data.success === true){
            toast.success("task mark completed succesfuuly") ; 
          }


      }catch(e : any){
        const errorMessage =
      e.response?.data?.message || e.message || "Something went wrong";
    toast.error(errorMessage);
    console.log("Error occurred while fetching project timeline:", e.response?.data || e.message);
    }
  }


  const marksubTaskCompleteorUncomplete = async (subtaskId : string) => {

    try{
        const response = await axios.patch(`http://localhost:4000/api/v1/task/${id}/project/${projectId}/task/updatedsubtask/status`,
          {
            subtaskId : subtaskId
          }
        ) ;

        if(response.data.success === true){
          toast.success("sub task mark completed succesfuuly") ; 
        }


    }catch(e : any){
      const errorMessage =
    e.response?.data?.message || e.message || "Something went wrong";
  toast.error(errorMessage);
  console.log("Error occurred while fetching project timeline:", e.response?.data || e.message);
  }
}
  

  const updatedsubtaskfunction = async(subtaskId : string) => {

    try{
      
      const updatetasks: any[] = [];
      for (let t of subTasks) {
        updatetasks.push({ ...(t as object), subtaskId });
      }
        const response = await axios.patch(`http://localhost:4000/api/v1/task/${id}/project/${projectId}/update/subtasks`,{
            subTasks : updatetasks
        }) ; 

        if(response.data.success === true){
          toast.success("subtasks updated successfully")
        }
    }catch(e : any){
      const errorMessage =
      e.response?.data?.message || e.message || "Something went wrong";
    toast.error(errorMessage);
    console.log("Error occurred while fetching project timeline:", e.response?.data || e.message);
    }
  }

  const updatetaskfunction = async(taskId : string) => {
    try{

      const updatetasks: any[] = [];
      for (let t of tasks) {
        updatetasks.push({ ...(t as object), taskId });
      }
     

        const response = await axios.patch(`http://localhost:4000/api/v1/task/${id}/project/${projectId}/update/tasks` ,
          {
            tasks : updatetasks
          
          }
        ) ; 

        if(response.data.success === true){
          toast.success("Tasks updated successfully")
        }
    }
    catch(e : any){
      const errorMessage =
      e.response?.data?.message || e.message || "Something went wrong";
    toast.error(errorMessage);
    console.log("Error occurred while fetching project timeline:", e.response?.data || e.message);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
       
      <ProjectNavbar
      projectDetail={projectDetail}
      projectMember={projectMember}
      navItems={navItems}
      activeTab={activeTab}
      handleNavClick={handleNavClick}
      isStarred={isStarred}
      handleStarClick={handleStarClick}
      handleShareClick={handleShareClick}
      handleCustomizeClick={handleCustomizeClick}
      ></ProjectNavbar>
</div>
  )
}

export default page