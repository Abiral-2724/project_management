import { PrismaClient } from "@prisma/client";
import { z } from 'zod';
import nodemailer from 'nodemailer';
import cloudinary from "../utils/cloudinary.js";
const client = new PrismaClient();


export const uploadfile = async (req, res) => {
    try {   

        const userId = req.params.userId ; 
        const projectId = req.params.projectId ; 
        const taskId = req.params.taskId ; 
        const result = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
            {
              folder: 'project_files',
              resource_type: 'auto' 
            }
          );
          const file = result.secure_url
        if(!file){
            return res.status(400).json({
                success : false ,
                message : "no file found" ,
            })
        }

        const projectfile = await client.projectFiles.create({
            data:{
                project_id : projectId , 
                task_id : taskId,
                uploader_id : userId ,
                file : file
            }
            
        }) ;

        return res.status(200).json({
            success : true ,
            message : "file uploaded successfully" ,
            file : projectfile
        })

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "error uploading file"

        })
    }
}

export const getAllFilesOfProject = async(req ,res)=>{
    try{
        const projectId = req.params.projectId ; 
        //const userId = req.params.userId ; 
        
        const files = await client.projectFiles.findMany({
            where:{
                project_id : projectId 
            }
        }) ; 
        const filesDetail = []
        

        for(const file of files){
            const projectdetail = await client.projects.findFirst({
                where : {
                    id : files.project_id
                }
            }) ; 
    
            const userinfo = await client.user.findFirst({
                where : {
                    id : files.uploader_id
                }
            }) ;
    
            const taskinfo = await client.project_Tasks.findFirst({
                where : {
                    id : files.task_id
                }
            })

            filesDetail.push({
                id : file.id,
                profile : file.file ,
                projectname : projectdetail. projectName,
                ownername : userinfo.fullname,
                taskname : taskinfo.title
            })
        }

        

       


        return res.status(200).json({
            success : true ,
            files : filesDetail
        })

    }catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "error uploading file"

        })
    }
}