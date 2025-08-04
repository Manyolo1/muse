import Thought from "../models/Thought.js";
import Theme from "../models/Theme.js";
import {categoriseThought} from '../services/geminiService.js';

//gemini service 
// CRUD - C 
const createThought=async(req,res)=>{
    try{

        const userId=req.user.userId;
        const {content}=req.body;

        if(!content || content.trim().length == 0){
            return res.status(400).json({error:'Thought content required'});     
        }

        const themes=await Theme.find({user:userId});
        const themenames=themes.map(t=>t.name);

        //gemini service 
        const predictedTheme=await categoriseThought(content,themenames);

        let matchedtheme=null;
        if(predictedTheme && predictedTheme.toLowerCase()!=='none'){
            matchedtheme=themes.find(
                t=>t.name.toLowerCase()===predictedTheme.toLowerCase()
            );
        //let gemini create a new theme 
        if(!matchedtheme){
            matchedtheme=await Theme.create({
                name:predictedTheme,
                user:userId,
            });

            themes.push(matchedtheme);
        }
        }

        // fallback to general
        if(!matchedtheme){
            matchedtheme=themes.find(t.name.toLowerCase()==='general');
            if(!matchedtheme){
                return res.status(500).json({error:'General theme not found'})
            }
        }
        const thought=new Thought(
            {content,theme:matchedtheme?matchedtheme._id : null,user:userId}
        );
        await thought.save();
        await thought.populate('theme');

        res.status(201).json(thought);
    

    } catch(err){
        console.error(err);
        res.status(500).json({error:'Failed to create thought'})
    };
}

// CRUD - U
const updateThought=async(req,res)=>{
    try{
        const userId=req.user.userId;
        const {content} = req.body;
        const {id}=req.params;

        if (!content || content.trim() === "") {
        return res.status(400).json({ error: 'Thought content is required.' });}

        const thought=await Thought.findOne({_id:id,user:userId});
        if(!thought) return res.status(404).json({error:'Thought not found'});
        
        thought.content=content;
        await thought.save();
        res.json(thought);

    }
    catch(err){
        console.error(err);
        res.status(500).json({error:'Failed to update thought'});
    }
}


// CRUD - D
const deleteThought=async(req,res)=>{
    try{
        const userId=req.user.userId;
        const{id}=req.params;

        const thought=await Thought.findOneAndDelete({_id:id,user:userId});
        if(!thought) return res.status(404).json({error:'Thought not found'});

        res.json({message: 'Thought deleted'});
    }
    catch(err){
        console.error(err);
        res.status(500).json({error:'Failed to delete thought'})
    }
}
export {createThought,deleteThought,updateThought};