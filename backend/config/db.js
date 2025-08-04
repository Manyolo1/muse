import connect  from "http2";
import mongoose from "mongoose";

const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB sucessfully!")

    } catch(error) {
       console.error('MongoDB connection error:',error);
       process.exit(1);
    }
};

export default connectDB;