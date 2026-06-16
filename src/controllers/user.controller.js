import userModel from '../models/user.model.js'
import musicModel from '../models/music.model.js'
import bcrypt from 'bcrypt'

const getProfile = async (req,res)=>{
    try{
        const user = await userModel.findById(req.user.id).select('-password -refreshToken')
        if(!user) return res.status(404).json({message:'Not Found'})
        return res.status(200).json({message:'Fetched',user})
    }catch(error){
        console.error(error)
        return res.status(500).json({message:'Internal Server Error'})
    }
}

const updateProfile = async (req,res)=>{
    try{
        const user = await userModel.findById(req.user.id)
        if(!user) return res.status(404).json({message:'Not Found'})
        const {username,email,password} = req.body
        if(username) user.username = username
        if(email) user.email = email
        if(password) user.password = await bcrypt.hash(password,10)
        await user.save()
        return res.status(200).json({message:'Updated'})
    }catch(error){
        console.error(error)
        return res.status(500).json({message:'Internal Server Error'})
    }
}

const toggleFavorite = async (req,res)=>{
    try{
        const user = await userModel.findById(req.user.id)
        const musicId = req.params.id
        const idx = user.favorites.findIndex(f=>String(f)===String(musicId))
        if(idx>-1){
            user.favorites.splice(idx,1)
            await user.save()
            return res.status(200).json({message:'Removed from favorites'})
        }else{
            user.favorites.push(musicId)
            await user.save()
            return res.status(200).json({message:'Added to favorites'})
        }
    }catch(error){
        console.error(error)
        return res.status(500).json({message:'Internal Server Error'})
    }
}

const getFavorites = async (req,res)=>{
    try{
        const user = await userModel.findById(req.user.id).populate('favorites')
        return res.status(200).json({message:'Fetched',favorites:user.favorites})
    }catch(error){
        console.error(error)
        return res.status(500).json({message:'Internal Server Error'})
    }
}

const getArtistSongs = async (req,res)=>{
    try{
        const artistId = req.params.id
        const songs = await musicModel.find({artist:artistId})
        return res.status(200).json({message:'Fetched',songs})
    }catch(error){
        console.error(error)
        return res.status(500).json({message:'Internal Server Error'})
    }
}

export default {getProfile,updateProfile,toggleFavorite,getFavorites,getArtistSongs}
