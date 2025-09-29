import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import {z} from 'zod' ; 
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import cloudinary from "../utils/cloudinary.js";
dotenv.config({}) ; 

const client = new PrismaClient() ; 

export const register = async (req ,res) => {
    try{
        // zod validation
        const reqBody = z.object({
            email : z.string().min(3).max(100).email() , 
            password : z.string().min(6).max(100)
        })

        const parse = reqBody.safeParse(req.body) ; 

        if(!parse.success){
            return res.status(400).json({
                message: 'Zod validation failed',
                error: parse.error.issues
            })
        }

        const {email ,password} = req.body ; 

        if(!email || !password){
            return res.status(400).json({
                message : "All fields are required"
            })
        } 


        const findUser = await client.user.findFirst({
            where : {
                email : email
            }
        }) 

        if(findUser){
            return res.status(400).json({
                message : "User already exits with this email try login"
            })
        }

        const saltRounds = 10;
        const newPassword = await bcrypt.hash(password, saltRounds);

        const otp = Math.floor(100000 + Math.random() * 900000);

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        let mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'One Time Password ( OTP )',
            text: `The OTP to verify email : OTP = ${otp}`
        };

        const user = await client.user.create({
            data : {
                email : email ,
                password : newPassword,
                OTP : otp
            }
        }) ; 

        transporter.sendMail(mailOptions, (error, info) => {
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
        
        return res.status(200).json({
            message : "user register successfully" ,
            user : user
        })

    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            message : "Error while registering user !"
        })
    }
}

export const login = async(req ,res) => {

    try{
        const reqBody = z.object({ 
            email : z.string().min(3).max(100).email() , 
            password : z.string().min(6).max(100)
        })

        const parse = reqBody.safeParse(req.body) ; 

        if(!parse.success){
            return res.status(400).json({
                message: 'Zod validation failed',
                error: parse.error.issues
            })
        }

        const {email ,password} = req.body ; 

        if(!email || !password){
            return res.status(400).json({
                message : "All fields are required"
            })
        } 

        const user = await client.user.findFirst({
            where : {
                email : email
            }
        }) 

        if(!user){
            return res.status(400).json({
                message : "wrong email or password"
            })
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if(!isPasswordMatch){
            return res.status(400).json({
                message : "wrong email or password"
            })
        }

        const tokenData = {
            id: user.id
        }

        const token = await jwt.sign(tokenData, process.env.SECERET_KEY, { expiresIn: '10h' }) ; 

        return res.status(200).json({
            success: true,
            message: "User loged in succesffuly",
            token: token
        });


    }
    catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while login ,Please try later !"
        });
    }
   
}

export const verifyEmail = async(req ,res) => {
    try{
        const reqBody = z.object({
            otp: z.number().positive().min(100000)
        })

        const parse = reqBody.safeParse(req.body);

        if (!parse.success) {
            return res.json({
                message: "zod validation failed",
                error: parse.error.issues
            })
        }


        const id = req.params.id;

        const { otp } = req.body;

        const user = await client.user.findFirst({
            where: {
                id: id
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Error finding user"
            });
        }

        if (user.isVerified === true) {
            return res.status(400).json({
                success: false,
                message: "User already verified"
            });
        }

        if (user.OTP !== otp) {
            return res.status(400).json({
                success: false,
                message: "Wrong OTP"
            });
        }

        const updatedUser = await client.user.updateMany({
            where: {
                id: id
            },
            data: {
                isVerified: true,
                OTP: 0
            }
        });

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
        });


    }
    catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while verifying email !"
        });
    }
}

export const resendOTPEmail = async(req ,res) => {
    try{
        const id = req.params.id ; 

        const user = await client.user.findFirst({
            where: {
                id: id
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "user does not exits "
            });
        }

        if (user.isVerified === true) {
            return res.status(400).json({
                success: false,
                message: "User already verified"
            });
        }

        const email = user.email ; 

        const otp = Math.floor(100000 + Math.random() * 900000);

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        let mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'One Time Password ( OTP )',
            text: `The OTP to verify email : OTP = ${otp}`
        };



        const updatedUser = await client.user.update({
            where : {
                id : id 
            } ,
            data:{
                OTP : otp
            }
        })


        transporter.sendMail(mailOptions, (error, info) => {
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

        return res.status(200).json({
            message : "otp resend successfully !" ,
            user : updatedUser
        })




    }
    catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "Error while resending otp"
        });
    }
}

export const accountSetup = async(req ,res) => {
    try{
        // sending file and full name under -> Body / form-data
            const id = req.params.id ; 
            const {fullname ,myrole} = req.body ; 
             
            if (!id) {
                return res.status(404).json({
                    success: false,
                    message: "User id not found !"
                });
            }
            if(!fullname || !myrole){
                return res.status(400).json({
                    success : false ,
                    message : "all fields are required !"
                })
            }

            const result = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
                {
                    folder: 'profile_photos',
                }
            );

            const profile = result.secure_url;

            const updatedUser = await client.user.updateMany({
                where : {
                    id : id
                } ,
                data : {
                    profile : profile,
                    fullname : fullname,
                    myRole : myrole
                }
            })

            return res.status(200).json({
                message : "Account step up done successfully" , 

                user : updatedUser
            })
    }
    catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while set up account . try again later !"
        });
    }
}

export const getUserDetails = async(req ,res) => {
    try{
            const id = req.params.id ; 

            if(!id){
                return res.status(400).json({
                    success : false ,
                    message : "id not found"
                })
            }

            const user = await client.user.findFirst({
                where : {
                    id : id
                }
            }) ; 

            if(!user){
                return res.status(400).json({
                    success : false ,
                    message : "No user found , invalid ID"
                })
            }

            return res.status(200).json({
                    success : true ,
                    message : "user found successfully" ,
                    user : user
            })
    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : "error getting user , please try again"
        })
    }
}

export const getAllProjectUserIsPartof = async (req ,res) => {
    try{
        const userId = req.params.userId ; 

        const user = await client.user.findFirst({
            where : {
                id : userId
            }
        })

        const userProjectPartOf = await client.project_Members.findMany({
            where : {
                emailuser : user.email , 
            }
        })

        let projectdetails = [] ; 

        for(const pro of userProjectPartOf){
            const projectId = pro.projectId ; 
            const role = pro.role ;

            const projectdetail = await client.projects.findFirst({
                where : {
                    id : projectId
                }
            }) ; 

            projectdetail.userRoleInProject = role ;

            projectdetails.push(projectdetail) ;
        }

        return res.status(200).json({
            success : true ,
            Projects : projectdetails
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