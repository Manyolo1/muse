import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const authMiddleware=(req,res,next)=>{
    if (req.method === 'OPTIONS') return next();
    try{
        const authHeader=req.headers.authorization;
        if(!authHeader) return res.status(401).json({error:'Authentication header missing'});

        const token=authHeader.split(' ')[1];
        // Bearer <token>
        if(!token) return res.status(401).json({error:'Token missing'});

        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        
        req.user={userId:decoded.userId,email:decoded.email};
        
        next();

    } catch(err){
        return res.status(401).json({error:'Authentication failed'});
    }
};
export default authMiddleware;