import express from 'express';
import { createThought, deleteThought, updateThought } from '../controllers/thoughtController.js';
import authMiddleware from '../middleware/auth.js';
console.log("inside thoughtRoutes.js");
const router = express.Router();
router.get("/", (req, res) => {
res.setHeader("Access-Control-Allow-Origin", "*")
res.setHeader("Access-Control-Allow-Credentials", "true");
res.setHeader("Access-Control-Max-Age", "1800");
res.setHeader("Access-Control-Allow-Headers", "content-type");
res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" ); 
 });
router.post('/', authMiddleware, createThought);
router.patch('/:id',authMiddleware,updateThought);
router.delete('/:id',authMiddleware,deleteThought);

export default router;
