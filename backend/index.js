import express from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

const app = express() ; 
import userAuthRoute from "./routes/user.auth.routes.js";
import userRoute from "./routes/user.routes.js"
import projectRoute from "./routes/project.routes.js"
const client = new PrismaClient() ; 


dotenv.config({}) ; 



const PORT = process.env.PORT|| 4000 ;

app.use(express.json()) ;
app.use(express.urlencoded({extended : true})) ; 



app.use("/api/v1/auth/user" ,userAuthRoute) ; 
app.use("/api/v1/user" ,userRoute) ; 

app.use("/api/v1",projectRoute)

app.listen(PORT ,()=>{
    console.log(`Server running at port ${PORT}`) ; 
}) ; 

