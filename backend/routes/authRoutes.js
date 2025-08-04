import express from 'express';
import {register,login} from '../controllers/authController.js';
console.log("inside authroutes.js");
const router=express.Router();
router.get("/", (req, res) => {
res.setHeader("Access-Control-Allow-Origin", "*")
res.setHeader("Access-Control-Allow-Credentials", "true");
res.setHeader("Access-Control-Max-Age", "1800");
res.setHeader("Access-Control-Allow-Headers", "content-type");
res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" ); 
 });
router.post('/register',register);
router.post('/login',login);

export default router;
