import mongoose from 'mongoose';

const ThemeSchema=mongoose.Schema(
    {
        name:{type:String,required:true},
        description:{type:String,default:'',required:false},
        color:{type:String,required:true},
        user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},

    },
    {
        timestamps:true,
    }
);

// one user cannot create the same theme multiple times 
ThemeSchema.index({user:1,name:1},{unique:true});

const Theme=mongoose.model('Theme',ThemeSchema);
export default Theme;