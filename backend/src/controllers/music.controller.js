
import musicModel from '../models/music.model.js'
import uploadFile from '../services/storage.service.js'
import albumModel from '../models/album.model.js'


const createMusic = async (req,res)=>{
    try {
         const {title} = req.body

    const song = req.files.song[0]
    const thumbnail = req.files.thumbnail[0]

    const [uploadSong,uploadThumbnail] = await Promise.all([
        uploadFile(song.buffer,song.originalname,"tracks"),
        uploadFile(thumbnail.buffer,thumbnail.originalname,"thumbnails")
    ])
    
    const post = await musicModel.create({
        title,
        thumbnail : uploadThumbnail.url,
        song : uploadSong.url,
        artist : req.user.id
    })

    return res.status(201).json({
        message : "Uploaded Successfully"
    })
    } catch (error) {
        console.log("Error Occurred",error)
        return res.status(500).json({
            message : "Internal Server Error"
        })
        
    }

}

const getAllmusic = async (req,res)=>{
    try{
        const {page = 1,limit = 20,search} = req.query
        const skip = (Math.max(1,parseInt(page)) -1) * parseInt(limit)
        const filter = {}
        if(search){
            filter.$or = [
                {title:{$regex:search,$options:'i'}}
            ]
        }
        const musics = await musicModel.find(filter).skip(skip).limit(parseInt(limit)).populate('artist',"username email")
        const total = await musicModel.countDocuments(filter)
        return res.status(200).json({message:'Songs Fetched Successfully',musics,page:parseInt(page),limit:parseInt(limit),total})
    }catch(error){
        console.error(error)
        return res.status(500).json({message:'Internal Server Error'})
    }
}

const createAlbum = async (req,res)=>{
   try {
     const token = req.cookies.token
    if(!token){
        return res.status(401).json({
            message : "Please Login First"
        })
    }

    const {title,songs} = req.body

    const album = await albumModel.create({
        title,
        songs,
        artist : req.user.id
    })
    return res.status(201).json({
        message : "Album Created"
    })
   } catch (error) {
    console.error(error)
    return res.status(500).json({
        message : "Internal Server Error"
    })
   }    
}

const getAllalbums = async (req,res)=>{
    const albums = await albumModel.find().select("title artist").populate("artist","username email").populate('songs',"thumbnail title")

    return res.status(200).json({
        message : "Fetched Successfully",
        albums
    })
}

const getAlbumMusic =async (req,res)=>{
    const albumId = req.params.id;

    const albumMusic = await albumModel.findById(albumId).populate('artist',"username email").populate('songs', "title thumbnail song")

    return res.status(200).json({
        message : "Album Fetched",
        albumMusic
    })
}

const updateAlbum = async (req,res)=>{
    try{
        const id = req.params.id
        const album = await albumModel.findById(id)
        if(!album) return res.status(404).json({message:'Not Found'})
        if(String(album.artist)!==String(req.user.id)) return res.status(403).json({message:'Unauthorized'})
        const {title,songs} = req.body
        if(title) album.title = title
        if(songs) album.songs = songs
        await album.save()
        return res.status(200).json({message:'Updated',album})
    }catch(error){
        console.error(error)
        return res.status(500).json({message:'Internal Server Error'})
    }
}

const deleteAlbum = async (req,res)=>{
    try{
        const id = req.params.id
        const album = await albumModel.findById(id)
        if(!album) return res.status(404).json({message:'Not Found'})
        if(String(album.artist)!==String(req.user.id)) return res.status(403).json({message:'Unauthorized'})
        await album.remove()
        return res.status(200).json({message:'Deleted'})
    }catch(error){
        console.error(error)
        return res.status(500).json({message:'Internal Server Error'})
    }
}

const getMusicDetails = async (req,res)=>{
    try{
        const id = req.params.id
        const music = await musicModel.findById(id).populate('artist','username email')
        if(!music) return res.status(404).json({message:'Not Found'})
        return res.status(200).json({message:'Fetched',music})
    }catch(error){
        console.error(error)
        return res.status(500).json({message:'Internal Server Error'})
    }
}

const deleteMusic = async (req,res)=>{
    try{
        const id = req.params.id
        const music = await musicModel.findById(id)
        if(!music) return res.status(404).json({message:'Not Found'})
        if(String(music.artist) !== String(req.user.id)) return res.status(403).json({message:'Unauthorized'})
        await music.remove()
        return res.status(200).json({message:'Deleted'})
    }catch(error){
        console.error(error)
        return res.status(500).json({message:'Internal Server Error'})
    }
}

const updateMusic = async (req,res)=>{
    try{
        const id = req.params.id
        const music = await musicModel.findById(id)
        if(!music) return res.status(404).json({message:'Not Found'})
        if(String(music.artist) !== String(req.user.id)) return res.status(403).json({message:'Unauthorized'})
        const {title} = req.body
        if(req.files && req.files.thumbnail){
            const thumbnail = req.files.thumbnail[0]
            const uploadThumb = await uploadFile(thumbnail.buffer,thumbnail.originalname,'thumbnails')
            music.thumbnail = uploadThumb.url
        }
        if(title) music.title = title
        await music.save()
        return res.status(200).json({message:'Updated',music})
    }catch(error){
        console.error(error)
        return res.status(500).json({message:'Internal Server Error'})
    }
}

const getArtistSongs = async (req,res)=>{
    try{
        const artistId = req.params.id
        const songs = await musicModel.find({artist:artistId}).populate('artist','username email')
        return res.status(200).json({message:'Fetched',songs})
    }catch(error){
        console.error(error)
        return res.status(500).json({message:'Internal Server Error'})
    }
}

export default {
  createMusic,
  getAllmusic,
  createAlbum,
  getAllalbums,
  getAlbumMusic,
  updateAlbum,
  deleteAlbum,
  getMusicDetails,
  deleteMusic,
  updateMusic,
  getArtistSongs
}