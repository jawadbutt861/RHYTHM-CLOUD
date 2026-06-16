import mongoose from "mongoose";

const musicSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    thumbnail : {
        type : String,
        required : true
    },
    song : {
        type : String,
        required : true
    },
    artist : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    }
},{timestamps : true})

const musicModel = mongoose.model('music',musicSchema)

export default musicModel