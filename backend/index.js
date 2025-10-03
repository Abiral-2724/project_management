import express from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import cors from 'cors'

const app = express() ; 
import userAuthRoute from "./routes/user.auth.routes.js";
import userRoute from "./routes/user.routes.js" ;
import projectRoute from "./routes/project.routes.js" ;
import tasksRoute from "./routes/project.tasks.route.js" ;
import filesRoute from './routes/project.files.routes.js' ; 
const client = new PrismaClient() ; 


dotenv.config({}) ; 



const PORT = process.env.PORT|| 4000 ;

app.use(express.json()) ;
app.use(express.urlencoded({extended : true})) ; 

const corsOptions = {
    origin: 'http://localhost:3001',
    credentials: true, // Enable credentials (cookies)
};

app.use(cors(corsOptions)) ; 


app.use("/api/v1/auth/user" ,userAuthRoute) ; 
app.use("/api/v1/user" ,userRoute) ; 

app.use("/api/v1",projectRoute) ;

app.use("/api/v1/task" ,tasksRoute) ;

app.use("/api/v1/files" ,filesRoute)

app.listen(PORT ,()=>{
    console.log(`Server running at port ${PORT}`) ; 
}) ; 

