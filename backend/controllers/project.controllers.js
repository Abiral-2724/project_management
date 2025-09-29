import { PrismaClient } from "@prisma/client";
import { z } from 'zod';
import nodemailer from 'nodemailer' ;
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

        const user = await client.user.findFirst({
            where : {
                id : userid 
            }
        })

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

        const projectMember = await client.project_Members.create({
            data:{
                projectId : project.id , 
                role:   "OWNER",
                emailuser : user.email
            }
        })

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
                message : "project id not found"
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

export const getAllMemberOfProject = async(req ,res) => {
    try{
        const projectId = req.params.projectId ; 

        if(!projectId){
            return res.status(400).json({
                success : false ,
                message : "user id not found"
            })
        }

        const member = await client.project_Members.findMany({
            where : {
                projectId : projectId
            }
        }) ; 

        return res.status(200).json({
            success : true ,
            member : member
        })
    }
    catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "error getting all the project member"

        })
    }
    
}



export const sendingInviteToAddMemberToProject = async (req ,res) => {
    try{
        const userid = req.params.userId ; 
        const projectid = req.params.projectId ; 

        const userDetail = await client.user.findFirst({
            where :{
                id : userid
            }
        }) ; 

        const doesProjectExits = await client.projects.findFirst({
            where : {
                id : projectid 
            }
        })
        if(!doesProjectExits){
            return res.status(400).json({
                success : false ,
                message : "project does not exits"
            })
        }

        const checkRoleOfCurrentUser = await client.project_Members.findFirst({
            where : {
                projectId : projectid , 
                emailuser : userDetail.email
            }
        }) ; 


        console.log(checkRoleOfCurrentUser)

        if(!checkRoleOfCurrentUser || (checkRoleOfCurrentUser.role !== "OWNER" && checkRoleOfCurrentUser.role !== "ADMIN")){
            return res.status(400).json({
                success : false ,
                message : "you have no right to add member to the project"
            })
        } 

        const {inviteEmail ,role} = req.body ; 

        if(inviteEmail.length === 0){
            return res.status(400).json({
                 success : false ,
                message : "error finding inviteEmail"
            })
        }

        if(!role){
            return res.status(400).json({
                 success : false ,
                message : "error finding role"
            })
        }

        

        const projectDetail = await client.projects.findFirst({
            where:{
                id : projectid
            }
        })

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        for(const email of inviteEmail){
            const isUserExits = await client.project_Members.findFirst({
                where : {
                    projectId : projectid , 
                    emailuser : email 
                }
            }) ;
            // console.log(isUserExits) ;
            if(isUserExits){
                return res.status(400).json({
                    success : false ,
                    message : `user with email ${email} already added to the project`
                })
            }
        }

        for(const email of inviteEmail) {

           
            const addmembertomembertable = await client.project_Members.create({
                data:{
                    projectId : projectid , 
                    role : role ,
                    emailuser : email
                }
            })
            
            let mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: `Action Required: ${userDetail.fullname} invited you to a project: ${projectDetail
                    .projectName
                }`,
                text: `Hi, ${userDetail.fullname} invited you to join the project "${projectDetail.projectName}".`,
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); text-align: center;">
                  <div style="margin-bottom: 16px;">
                    <img src="https://seeklogo.com/images/A/asana-logo-64D88F2F44-seeklogo.com.png" alt="Logo" height="32" />
                  </div>
                  
                  <div style="width: 48px; height: 48px; border-radius: 50%; background: #a3d3e7; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; margin-bottom: 12px;">
                    ${userDetail.fullname[0].toUpperCase()}
                  </div>
                  
                  <p><strong>${userDetail.fullname}</strong> shared project <strong>${projectDetail.projectName}</strong> with you</p>
                  <p style="color: #666; font-size: 13px;">Workspace: ${projectDetail.workspaceName || "My Workspace"}</p>
                  
                  <a href="https://your-app.com/login" style="display:inline-block; padding:12px 24px; background:#4a67d8; color:#fff; font-weight:bold; border-radius:6px; text-decoration:none; margin:20px 0;">Accept invite</a>
                  
                  <div style="border: 1px solid #ddd; border-radius: 6px; padding: 12px; text-align: left; margin-top: 12px;">
                    <div style="font-weight: bold; margin-bottom: 4px;">${projectDetail.projectName}</div>
                    <div style="font-size: 13px; color: #666;">${userDetail.fullname} and others</div>
                  </div>
                </div>
                `,
               
            };


            await transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    return res.status(400).json({
                        success: false,
                        message: "Error sending email"
                    });
                } else {
                    console.log('Email send', info.response);
                }
            })


        };
        

        
        return res.status(200).json({
            success : true ,
            message : "Invite send successfully"
        })
        


    }
    catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "error adding memeber to the project"

        })
    }
}


export const updateRole = async(req ,res) => {
    try{
            const projectid = req.params.projectId ; 
            const {email ,newRole} = req.body ; 

            if(!email || !newRole){
                return res.status(400).json({
                    success: false,
                    message: "missing fields"
        
                })
            }

            const findUser = await client.project_Members.findFirst({
                where : {
                    emailuser : email
                }
            }) ; 

            if(!findUser){
                return res.status(400).json({
                    success: false,
                    message: `the user with email : ${email} has no access to project`
        
                })
            }

            const updateRole = await client.project_Members.updateMany({
                where:{
                    projectId : projectid , 
                    emailuser : email
                } ,
                data : {
                    role : newRole 
                }
            }) ;

            

            return res.status(200).json({
                success : true ,
                updateRole : updateRole
            })

    }catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "error changing role of user"

        })
    }
}