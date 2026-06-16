import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    artist : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    songs : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'music'
        }
    ]
})


const albumModel = mongoose.model("album",albumSchema)

export default albumModel