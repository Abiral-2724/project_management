import { PrismaClient } from "@prisma/client";
import { z } from 'zod';
import nodemailer from 'nodemailer' ;
const client = new PrismaClient();

export const addTasks = async (req ,res) => {
    try{
        const userId = req.params.userId ; 
        const projectId = req.params.projectId ; 

        const user = await client.user.findFirst({
            where : {
                id : userId
            }
        }) ; 

        const projectuserdetail = await client.project_Members.findMany({
            where:{
                projectId : projectId ,
                emailuser : user.email
            }
           
        }) ; 

        if(!projectuserdetail){
            return res.status(400).json({
                success : false ,
                message : "no such project exits for user"
            })
        } 

        if(projectuserdetail.role === "COMMENTER" || projectuserdetail.role === "VIEWER"){
            return res.status(400).json({
                success : false ,
                message : "user have no right to edit tasks"
            })
        }

        const {title ,priority,startDate ,dueDate ,assigneEmail,status ,description} = req.body ; 

        if(!title || !priority || !startDate || !dueDate || !assigneEmail || !status){
            return res.status(400).json({
                success: false,
                message: "all fields are required"
    
            })
        } 

        const checkassigne = await client.project_Members.findMany({
                where:{
                    projectId : projectId ,
                    emailuser : assigneEmail 
                }
        }) ; 

        if(!checkassigne){
            return res.status(400).json({
                success: false,
                message: "no such assigne exits"
    
            })
        }

        const newTasks = await client.project_Tasks.create({
            data : {
                title : title ,
                description : description,
                status : status ,
                project_id : projectId ,
                assignee_email : assigneEmail , 
                priority   : priority ,
                startDate : startDate ,
                dueDate : dueDate
            }
        });


        return res.status(200).json({
            success : true ,
            task : newTasks
        })


    }
    catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "error getting all project of the user"

        })
    }
}

export const addSubTasks = async(req ,res)=>{
    try{
            const taskId = req.params.taskId ; 

            const {title ,description ,status ,priority ,assigneEmail ,startDate ,dueDate} = req.body ; 

            if(!title || !status || !priority || !assigneEmail || !startDate || !dueDate){
                return res.status(500).json({
                    success: false,
                    message: "error : missing field"
        
                })
            }


            const addingsubtask = await client.project_SubTasks.create({
                data : {
                    title : title ,
                    description : description ,
                    status : status ,
                    priority : priority ,
                    assignee_email : assigneEmail ,
                    startDate : startDate ,
                    dueDate : dueDate,
                    project_Tasks_id : taskId
                }
            }) ;

            return res.status(200).json({
                success : true ,
                subtasks : addingsubtask
            })


    }
    catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "error getting all project subtasks"

        })
    }
}

export const markTaskComplete = async(req ,res) => {
    try{
            const {taskId} = req.body ; 

            if(!taskId){
                return res.status(400).json({
                    success: false,
                    message: "no task id found"
        
                })
            }

            const task = await client.project_Tasks.findFirst({
                where : {
                    id : taskId
                } 
            });

            const updatedtask = await client.project_Tasks.update({
                where : {
                    id : taskId
                } ,
                data : {
                    mark_complete : !task.mark_complete
                }
            });

            return res.status(200).json({
                success : true ,
                message : "task completion status updated"
            })
    }
    catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "error marking tasks complete"

        })
    }
}

export const markSubTaskComplete = async(req ,res) => {
    try{
            const {subtaskId} = req.body ; 

            if(!subtaskId){
                return res.status(400).json({
                    success: false,
                    message: "no task id found"
        
                })
            }

            const subtask = await client.project_SubTasks.findFirst({
                where : {
                    id : subtaskId
                }
            })

            const updatedtask = await client.project_SubTasks.update({
                where : {
                    id : subtaskId
                } ,
                data : {
                    mark_complete : !subtask.mark_complete
                }
            });

            return res.status(200).json({
                success : true ,
                message : "task completion status updated"
            })
    }
    catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "error marking tasks complete"

        })
    }
}

export const getTaskoftheUser = async(req ,res) => {
    try{
        const userId = req.params.id ; 

        const user = await client.user.findFirst({
            where : {
                id : userId
            }
        }) ; 

        if(!user){
            console.log(e);
        return res.status(500).json({
            success: false,
            message: "user does not exits"

        })
        }

        const tasksofUser = await client.project_Tasks.findMany({
            where:{
                assignee_email : user.email
            }
        }) ;

        return res.status(200).json({
            success : true ,
            tasks : tasksofUser
        })
    }catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "error marking tasks complete"

        })
    }
}