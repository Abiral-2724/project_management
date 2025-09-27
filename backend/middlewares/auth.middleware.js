import jwt from 'jsonwebtoken' ; 
import dotenv from 'dotenv' ; 

dotenv.config({}) ; 

export const authMiddleware = (req ,res ,next) => {
    const token = req.header('Authorization') ; 
    if(!token){
        return res.status(401).json({
            success : false , 
            message : "Authentication failed" , 
            error : 'Access denied'
        })
    }

    try{
            const decode = jwt.verify(token , process.env.SECERET_KEY) ; 
            req.id = decode.id ; 
            next() ; 
    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false , 
            message : "Invalid token" ,
            error : "Invalid token"
        })
    }
}