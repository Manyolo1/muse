import express from 'express';
import {createTheme, deleteTheme, updateTheme} from '../controllers/themeController.js';
import authMiddleware from '../middleware/auth.js'

console.log("inside themeroutes.js");
const router=express.Router();
router.get("/", (req, res) => {
res.setHeader("Access-Control-Allow-Origin", "*")
res.setHeader("Access-Control-Allow-Credentials", "true");
res.setHeader("Access-Control-Max-Age", "1800");
res.setHeader("Access-Control-Allow-Headers", "content-type");
res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" ); 
 });
router.post('/',authMiddleware,createTheme);
router.delete('/:id',authMiddleware,deleteTheme);
router.patch('/:id',authMiddleware,updateTheme);

export default router;

