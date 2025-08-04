import mongoose from 'mongoose';

const ThoughtSchema=mongoose.Schema(
    {
        content:{type:String,required:true},
        createdAt:{type:Date,default:Date.now},
        theme:{type:mongoose.Schema.Types.ObjectId,ref:'Theme',default:null},
        user:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    }
);

const Thought=mongoose.model('Thought',ThoughtSchema);
export default Thought;
