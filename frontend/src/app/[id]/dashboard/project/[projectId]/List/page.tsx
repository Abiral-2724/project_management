'use client'
import ProjectNavbar from '@/components/ProjectNavbar'
import { useProjectNavbar } from '@/hooks/useProjectNavbar'
import { useRouter } from 'next/navigation'
import React, { use } from 'react'

type Props = {}

const page = ({params} : any) => {

  const router =useRouter() ; 

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