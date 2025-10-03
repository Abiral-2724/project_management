'use client'
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, X, Upload, Plus, ChevronDown, ThumbsUp, Calendar, Target, Bug, Users, FolderKanban, ListTodo } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function WorkflowGallery({params} : any) {

    const {id} : any = React.use(params); 
  const topWorkflows = [
    {
      icon: <FolderKanban className="w-6 h-6" />,
      title: "Project timeline",
      description: "Map out dependencies, milestones, and deadlines to keep your projects on track.",
      visual: "https://d3ki9tyy5l5ruj.cloudfront.net/obj/753ef4990c5893929a94b83af2f511290dc6fc12/Asana-PT-Timeline-LM.png"
    },
    {
      icon: <ListTodo className="w-6 h-6" />,
      title: "Request tracking",
      description: "Capture, prioritize, and monitor requests until completion.",
      visual: "https://d3ki9tyy5l5ruj.cloudfront.net/obj/b2037af53c0f1d150bb32a9cf3c88fe75668d1e5/Asana-PT-List-LM.png"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "New hire checklist",
      description: "Outline onboarding steps, assign tasks with due dates, and track milestones to guide new hires from day one.",
      visual: "https://d3ki9tyy5l5ruj.cloudfront.net/obj/8087100c633694d4f0c4c2833232ee9770fb4667/Asana-PT-Calendar-LM.png"
    }
  ];

  const popularWorkflows = [
    {
      icon: <Calendar className="w-6 h-6 text-purple-600" />,
      title: "Content calendar",
      description: "Plan content, organize assets, and view schedules by channel to keep your marketing teams organized.",
      badge: "Great for marketing",
      visual:"https://d3ki9tyy5l5ruj.cloudfront.net/obj/8087100c633694d4f0c4c2833232ee9770fb4667/Asana-PT-Calendar-LM.png"
    },
    {
      icon: <Target className="w-6 h-6 text-red-600" />,
      title: "Goals setting operations",
      description: "Manage the process of setting objectives across teams to enable alignment and progress towards company-wide goals.",
      badge: "Great for ops & PMO",
      visual: "https://d3ki9tyy5l5ruj.cloudfront.net/obj/b2037af53c0f1d150bb32a9cf3c88fe75668d1e5/Asana-PT-List-LM.png"
    },
    {
      icon: <Bug className="w-6 h-6 text-green-600" />,
      title: "Bug tracking",
      description: "File, assign, and prioritize bugs in one place to fix issues faster.",
      badge: "Great for IT",
      visual: "https://d3ki9tyy5l5ruj.cloudfront.net/obj/220bb454aa8f52b4af1071e478ae9bd473ce618f/Asana-PT-Board-LM.png"
    },
    {
      icon: <FolderKanban className="w-6 h-6 text-pink-600" />,
      title: "Cross-functional project plan",
      description: "Create tasks, add due dates, and organize work by stage to align teams across your organization.",
      badge: "Great for all teams",
      visual: "https://d3ki9tyy5l5ruj.cloudfront.net/obj/b2037af53c0f1d150bb32a9cf3c88fe75668d1e5/Asana-PT-List-LM.png"
    },
    {
      icon: <Users className="w-6 h-6 text-pink-600" />,
      title: "1:1 Meeting agenda",
      description: "Track agenda items, meeting notes, and next steps so you can keep your conversations focused and meaningful.",
      badge: "Great for all teams",
      visual: "https://d3ki9tyy5l5ruj.cloudfront.net/obj/b2037af53c0f1d150bb32a9cf3c88fe75668d1e5/Asana-PT-List-LM.png"
    },
    {
      icon: <ListTodo className="w-6 h-6 text-blue-600" />,
      title: "Meeting agenda",
      description: "Capture agenda items, next steps, and action items to keep meetings focused and productive.",
      badge: "Great for all teams",
      visual:"https://d3ki9tyy5l5ruj.cloudfront.net/obj/b2037af53c0f1d150bb32a9cf3c88fe75668d1e5/Asana-PT-List-LM.png"
    }
  ];

  const router = useRouter() ;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Workflow gallery</h1>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
              New
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/project/new')}>
                
                <Plus className="w-4 h-4" />
              Blank project
            
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.push(`/${id}/dashboard/home`)}>
                
                <X className="w-5 h-5" />
                
            </Button>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="px-6 py-12 max-w-7xl mx-auto">
        {/* Top Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-light mb-2">Workflows built for all teams</h2>
              <p className="text-gray-600">Help your teams track, plan, and deliver impactful work in Asana</p>
            </div>
          
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topWorkflows.map((workflow, index) => (
              <Card key={index} className="border bg-gray-100 border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                <div className="mb-4 p-4 relative mt-[-40]">
  <div className="absolute top-7 left-5 w-7 h-7 bg-none flex items-center justify-center shadow-sm z-10">
    {workflow.icon}
  </div>
  <div className="pt-2">
   <img src={workflow.visual} alt="" />
  </div>
</div>
                  <h3 className="text-lg font-semibold mb-2">{workflow.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{workflow.description}</p>
                 
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div>
          <div className="mb-6">
            <h2 className="text-3xl font-light mb-2">Start working in seconds</h2>
            <p className="text-gray-600">Power your everyday processes with Asana's most popular workflows</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularWorkflows.map((workflow, index) => (
              <Card key={index} className="border bg-gray-100 border-gray-100 hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                <div className="mb-4 bg-gray-100 rounded-lg p-4 relative mt-[-40]">
  <div className="absolute top-7 left-5 w-7 h-7 bg-none flex items-center justify-center shadow-sm z-10">
    {workflow.icon}
  </div>
  <div className="pt-2">
   <img src={workflow.visual} alt="" />
  </div>
</div>
                  <h3 className="text-lg font-semibold mb-2">{workflow.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{workflow.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{workflow.badge}</span>
                    </div>
                    <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L8 10H2L7 14L5 22L12 17L19 22L17 14L22 10H16L12 2Z" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}