import { PrismaClient } from "@prisma/client";
import { z } from 'zod';

const client = new PrismaClient();

export const createNewProject = async (req, res) => {
    try {
        const reqBody = z.object({
            projectName: z.string().min(2).max(100),
            description: z.string().min(10).max(200),
            views: z.array(
                z.enum([
                    "overview",
                    "Board",
                    "List",
                    "Timeline",
                    "Dashboard",
                    "Gantt",
                    "Calenar",
                    "Note",
                    "Workload",
                    "Files",
                    "Messages",
                ])
            ).optional(),
        })

        const parse = reqBody.safeParse(req.body);

        if (!parse.success) {
            return res.status(400).json({
                message: 'Zod validation failed',
                error: parse.error.issues
            })
        }

        const { projectName, description, views = [] } = req.body;



        const userid = req.params.userid;

        if (!projectName || !description) {
            return res.status(400).json({
                success: false,
                message: "all fields are required"
            })
        }

        const oldProject = await client.projects.findFirst({
            where: {
                ownerId: userid,
                projectName: projectName
            }
        })

        if (oldProject) {
            return res.status(400).json({
                success: false,
                message: "A project with this name already exits choose another name and try again !"
            })
        }


        const project = await client.projects.create({
            data: {
                projectName: projectName,
                description: description,
                ownerId: userid
            }

        });

        const viewData = {
            project_id: project.id,
            overview: views.includes("overview"),
            Board: views.includes("Board"),
            Timeline: views.includes("Timeline"),
            Dashboard: views.includes("Dashboard"),
            Gantt: views.includes("Gantt"),
            Calenar: views.includes("Calenar"),
            Note: views.includes("Note"),
            Workload: views.includes("Workload"),
            Files: views.includes("Files"),
            Messages: views.includes("Messages"),
        }

        const updatedViews = await client.projectViews.create({
            data: viewData
        });

        return res.status(200).json({
            success: true,
            project: project,
            views: updatedViews
        })
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "error creating project , try again later"

        })
    }
} 

export const getAllProjectsOfUser = async(req ,res) => {
    try{
        const userid = req.params.userid ; 

        if(!userid){
            return res.status(400).json({
                success : false ,
                message : "user id not found"
            })
        }

        const projectsToWhichUserIsMember = await client.project_Members.findMany({
            where:{
                userId : userid
            }
        }) ; 

        const projectsToWhichUserIsOwner = await client.projects.findMany({
            where:{
                ownerId : userid
            }
        }) ; 

        return res.status(200).json({
            success : true ,
            MemberProject : projectsToWhichUserIsMember , 
            OwnerProject : projectsToWhichUserIsOwner
        })

    }catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "error getting all the projects of the user"

        }) ; 
    }
} 

export const getProjectById = async(req ,res) => {
    try{
        const projectId = req.params.projectId ; 

        if(!projectId){
            return res.status(400).json({
                success : false ,
                message : "user id not found"
            })
        }

        const project = await client.projects.findFirst({
            where:{
                id : projectId
            }
        }) 

        return res.status(200).json({
            success : true ,
            project : project
        })

    }
    catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "error getting project by id"

        })
    }
}


export const addMemberToProject = (req ,res) => {
    try{

    }
    catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "error adding memeber to the project"

        })
    }
}