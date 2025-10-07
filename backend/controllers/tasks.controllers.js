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

        const projectuserdetail = await client.project_Members.findFirst({
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

        const {tasks} = req.body ; 

        if(!Array.isArray(tasks) || tasks.length === 0){
            return res.status(400).json({
                success: false,
                message: "tasks array is required"
    
            })
        } 

        const createdTasks = [] ; 

        for(const task of tasks){
            const { title, priority, startDate, dueDate, assigneEmail, status, description } = task;

            if (!title || !priority || !startDate || !dueDate || !assigneEmail || !status) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required for each task"
                });
            }

            const checkassigne = await client.project_Members.findMany({
                where:{
                    projectId : projectId ,
                    emailuser : assigneEmail 
                }
            }) ; 

            if (!checkassigne) {
                return res.status(400).json({
                    success: false,
                    message: `No such assignee exists: ${assigneEmail}`
                });
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
                    dueDate : dueDate , 
                    project_task_creator_id : userId
                }
            });
            

            createdTasks.push(newTasks);


        }

        return res.status(200).json({
            success : true ,
            tasks : createdTasks
        })


    }
    catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "error adding tasks by user"

        })
    }
}

export const addSubTasks = async(req ,res)=>{
    try{
        const userId = req.params.userId ; 
        const projectId = req.params.projectId ; 

        const user = await client.user.findFirst({
            where : {
                id : userId
            }
        }) ; 

        const projectuserdetail = await client.project_Members.findFirst({
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

            const {subtasks} = req.body ; 

            if(!Array.isArray(subtasks) || subtasks.length === 0){
                return res.status(400).json({
                    success: false,
                    message: "tasks array is required"
        
                })
            } 

            const createdSubtasks = [] ; 

            for(const subtask of subtasks){

                const { title, priority, startDate, dueDate, assigneEmail, status, description ,taskId } = subtask ;

                if(!title || !status || !priority || !assigneEmail || !startDate || !dueDate || !taskId){
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
                        projectId : projectId ,
                        project_Tasks_id : taskId ,
                        project_sub_task_creator_id:userId
                    }
                }) ;

                createdSubtasks.push(addingsubtask) ; 
            }

            


           

            return res.status(200).json({
                success : true ,
                subtasks : createdSubtasks
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

export const getmycreatedTask = async(req ,res) => {
    try{
        const userId = req.params.userId ; 

        if(!userId){
            return res.status(500).json({
                success: false,
                message: "error getting userid"
            })
        }

        const createdtasks = await client.project_Tasks.findMany({
            where : {
                project_task_creator_id : userId 
            }
        }) ; 

        return res.status(200).json({
            success : true ,
            message : "my created tasks got successfully" , 
            tasks : createdtasks 
        })

    }
    catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "error getting all created tasks"

        })
    }
}

export const markTaskComplete = async(req ,res) => {
    try{
            const {taskId} = req.body ; 

            const userId = req.params.userId ; 
            const projectId = req.params.projectId ; 

            const user = await client.user.findFirst({
                where : {
                    id : userId 
                }
            }) ; 

            const projectmember = await client.project_Members.findFirst({
                where : {
                    projectId : projectId ,
                    emailuser : user.email
                }
            }) 

            if(!projectmember){
                return res.status(400).json({
                    success: false,
                    message: "User is not the member of the project"
        
                })
            }

            const role = projectmember.role ; 

            if(role === "COMMENTER" || role === "VIEWER"){
                return res.status(400).json({
                    success: false,
                    message: "you do not have right to mark the task as complete"
        
                })
            }

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

            let completeTaskDate = task.createdAt
            if(task.mark_complete === true){
                completeTaskDate = new Date();
            }

            const updatedtask = await client.project_Tasks.update({
                where : {
                    id : taskId
                } ,
                data : {
                    mark_complete : !task.mark_complete ,
                    time_TaskCompletion : completeTaskDate
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

            const userId = req.params.userId ; 
            const projectId = req.params.projectId ; 

            const user = await client.user.findFirst({
                where : {
                    id : userId 
                }
            }) ; 


            const projectmember = await client.project_Members.findFirst({
                where : {
                    projectId : projectId ,
                    emailuser : user.email
                }
            }) 

            if(!projectmember){
                return res.status(400).json({
                    success: false,
                    message: "User is not the member of the project"
        
                })
            }

            const role = projectmember.role ; 

            if(role === "COMMENTER" || role === "VIEWER"){
                return res.status(400).json({
                    success: false,
                    message: "you do not have right to mark the task as complete"
        
                })
            }

            const subtask = await client.project_SubTasks.findFirst({
                where : {
                    id : subtaskId
                }
            })

            let completeTaskDate = subtask.createdAt
            if(subtask.mark_complete === true){
                completeTaskDate = new Date();
            }

            const updatedtask = await client.project_SubTasks.update({
                where : {
                    id : subtaskId
                } ,
                data : {
                    mark_complete : !subtask.mark_complete,
                    time_SubTaskCompletion : completeTaskDate
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

export const getTaskAssignedoftheUser = async(req ,res) => {
    try{
        const userId = req.params.userId; 
        // console.log(userId) ; 
        const user = await client.user.findFirst({
            where : {
                id : userId
            }
        }) ; 

        // console.log(user.email)

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

export const getalltaskswiththeirsubtasks = async(req ,res) => {
    try{
        const userId = req.params.userId ; 
        const projectId = req.params.projectId ; 

        const allTasksoftheproject = await client.project_Tasks.findMany({
            where : {
                project_id : projectId 
            }
        }) ;

        const completeTaskListWithSubtasks = [] ; 

         for(const tasks of allTasksoftheproject){

            const taskId = tasks.id ; 

            const allSubtasksDestail = await client.project_SubTasks.findMany({
                where : {
                    project_Tasks_id : taskId
                }
            });
                const newlist = {...tasks ,allSubtasksDestail} ; 
            // tasks.push(allSubtasksDestail) ; 

            completeTaskListWithSubtasks.push(newlist) ; 

         }

        return res.status(200).json({
            success : true ,
            TasksDetail : completeTaskListWithSubtasks
        })
    } 
    catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "error getting all tasks with their subtasks"

        })
    }
}

export const editTasks = async(req ,res) => {
    try{
        const userId = req.params.userId ; 
        const projectId = req.params.projectId ; 

        const user = await client.user.findFirst({
            where : {
                id : userId
            }
        }) ; 

        const projectuserdetail = await client.project_Members.findFirst({
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

        const role = projectuserdetail.role ; 
        console.log(role) ; 

        if(role === "COMMENTER" || role === "VIEWER"){
            console.log(role)
            return res.status(400).json({
                success : false ,
                message : "user have no right to edit tasks"
            })
        }


    const {tasks} = req.body ;

    if(!Array.isArray(tasks) || tasks.length === 0){
        return res.status(400).json({
            success: false,
            message: "tasks array is required"

        })
    } 

    const editTasks = [] ; 

    for(const task of tasks){
        const { title, priority, startDate, dueDate, assigneEmail, status, description ,taskId } = task;

        if(!taskId){
            return res.status(400).json({
                success: false,
                message: "missing task id"
    
            })
        }


        const newUpdatedTasks = await client.project_Tasks.updateMany({
            where : {
                id : taskId
            } ,
            data : {
                title : title ,
                description : description,
                status : status ,
                project_id : projectId ,
                assignee_email : assigneEmail , 
                priority   : priority ,
                startDate : startDate ,
                dueDate : dueDate , 
                project_task_creator_id : userId ,
               
            }
        });

        editTasks.push(newUpdatedTasks)


    }

    return res.status(200).json({
        success : true ,
        updatedTasks : editTasks
    })

    }
    catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "error editing tasks"

        })
    }
}

export const editsubTasks = async(req ,res) => {
        try{

            const userId = req.params.userId ; 
        const projectId = req.params.projectId ; 

        const user = await client.user.findFirst({
            where : {
                id : userId
            }
        }) ; 

        const projectuserdetail = await client.project_Members.findFirst({
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

        const {subtasks} = req.body ;

    if(!Array.isArray(subtasks) || subtasks.length === 0){
        return res.status(400).json({
            success: false,
            message: "tasks array is required"

        })
    } 

    const editSubTasks = [] ; 

    for(const task of subtasks){
        const { title, priority, startDate, dueDate, assigneEmail, status, description ,subtaskId } = task;

        if(!subtaskId){
            return res.status(400).json({
                success: false,
                message: "missing task id"
    
            })
        }


        const newUpdatedSubTasks = await client.project_SubTasks.updateMany({
            where : {
                id : subtaskId
            } ,
            data : {
                title : title ,
                description : description ,
                status : status ,
                priority : priority ,
                assignee_email : assigneEmail ,
                startDate : startDate ,
                dueDate : dueDate,
            }
        });

        editSubTasks.push(newUpdatedSubTasks)


    }

    return res.status(200).json({
        success : true ,
        updatedSubTasks : editSubTasks
    })


    }
    catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "error editing subtasks"

        })
    }
}

export const projectDashboard = async(req ,res) => {
    try{
            const userId = req.params.userId ; 
            const projectId = req.params.projectId ; 

            const projectTask = await client.project_Tasks.findMany({
                where : {
                    project_id : projectId
                }
            }) ; 

            const projectSubTasks = await client.project_SubTasks.findMany({
                where : {
                    projectId : projectId
                }
            }) ;

            const totalTask = projectTask.length + projectSubTasks.length ; 

            const projectTaskMarkComplete = projectTask.filter((el) => {
                return el.mark_complete === true
            }) ; 

            const projectSubTasksMarkComplete = projectSubTasks.filter((el) => {
                return el.mark_complete === true 
            })

            const totalCompletedTask = projectTaskMarkComplete.length + projectSubTasksMarkComplete.length

            const totalNotCompletedTask = totalTask - totalCompletedTask ;


            let taskcompletionOvertime = [] ;
            let countLowPriority = 0 ; 
            let countHighPriority = 0 ;
            let countMediumPriority = 0 ; 

            let taskwithassignemail = [] ; 

            let profileMap = {};

            for (const el of projectTask) {
               // if(el.mark_complete === true){
                    taskcompletionOvertime.push({
                        complete : el.mark_complete ,
                        timeofcompletion : el.time_TaskCompletion
                    })
              //  }
                if(el.priority === "High"){
                    countHighPriority = countHighPriority + 1 ; 
                }
                if(el.priority === "Low"){
                    countLowPriority = countLowPriority + 1 ; 
                }
                if(el.priority === "Medium"){
                    countMediumPriority = countMediumPriority + 1 ; 
                }

                const user = await client.user.findUnique({
                    where : {
                        email : el.assignee_email
                    }
                })

                if(!user){
                    return res.status(400).json({
                        success : false ,
                        message : "user not found"
                    })
                }
console.log(user.profile)

profileMap[user.email] = user.profile;

                taskwithassignemail.push({
                    email : el.assignee_email ,
                    complete : el.mark_complete,
                    
                    profile : user?.profile || null
                })

            }
            

            for (const el of projectSubTasks) {
               // if(el.mark_complete === true){
                    taskcompletionOvertime.push({
                        complete : el.mark_complete ,
                        timeofcompletion : el.time_SubTaskCompletion
                    })
                //}
                if(el.priority === "High"){
                    countHighPriority = countHighPriority + 1 ; 
                }
                if(el.priority === "Low"){
                    countLowPriority = countLowPriority + 1 ; 
                }
                if(el.priority === "Medium"){
                    countMediumPriority = countMediumPriority + 1 ; 
                }
                const user = await client.user.findUnique({
                    where : {
                        email : el.assignee_email
                    }
                })

                //console.log(user) ; 

                if(!user){
                    return res.status(400).json({
                        success : false ,
                        message : "user not found"
                    })
                }

                profileMap[user.email] = user.profile;


                taskwithassignemail.push({
                    email : el.assignee_email ,
                    complete : el.mark_complete,
                    profile : user?.profile || null
                })
            } ;


            const countOfUncompletedTaskByAssigne = taskwithassignemail.reduce((acc, curr) => {
                if (!acc[curr.email]) {
                  acc[curr.email] = { email: curr.email, incompleteCount: 0,completeCount:0 };
                }
                if (curr.complete === false) {
                  acc[curr.email].incompleteCount += 1;
                }
                if(curr.complete === true){
                    acc[curr.email].completeCount += 1
                }
                return acc;
              },[]) ; 

              const counttaskWithAssignEmails = Object.values(countOfUncompletedTaskByAssigne);
              

            


            return res.status(200).json({
                success : true ,
                //   projectTask : projectTask ,
                //   projectSubTasks : projectSubTasks ,
                totalTask : totalTask,
                completedTask : totalCompletedTask ,
                notcompletedTask : totalNotCompletedTask,
                taskcompletion : taskcompletionOvertime ,
                highPriority : countHighPriority ,
                lowPriority : countLowPriority ,
                mediumPriority : countMediumPriority,
                counttaskWithAssignEmails : counttaskWithAssignEmails,
                profile : profileMap
            })
    }
    catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "error getting project daskhbord "

        })
    }
}