import 'dotenv/config'
import mongoose from "mongoose";

const connectdb = async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Database Connected Successfully")
    } catch (error) {
        console.error("Error Occurred",error)
    }
}

export default connectdb