import User from "../models/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// register 
const register=async (req,res) =>{
    try{
        const {username,email,password}=req.body;

        //edgecase : already a user?
        const existinguser=await User.findOne({email});
        if(existinguser) return res.status(400).json({error:'Email already in use'});

        const hashedPassword=await bcrypt.hash(password,12);
        const user=new User({username,email,password:hashedPassword});
        await user.save();

        res.status(201).json({message:'User registered succesfully!'});


    } catch(err){
        console.error(err);
        res.status(500).json({error:'Sign up failed'});
    }
}

// login 
const login= async(req,res)=>{
    try{
        const {email,password}=req.body;

        const user=await User.findOne({email});

        if(!user) return res.status(401).json({error:'Invalid credentials'});

        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch) return res.status(401).json({error:'Invalid password'});

        const token=jwt.sign(
            {userId:user._id,email:user.email},
            process.env.JWT_SECRET,
            {expiresIn:'1h'}
        );

        res.status(200).json({token,userId:user._id});

    } catch(err){
        console.error(err);
        res.status(500).json({error:'Login failed'});
    }
};

export {register,login};