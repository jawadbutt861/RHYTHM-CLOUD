import jwt from 'jsonwebtoken'

const getTokenPayload = (token)=>{
    try{
        return jwt.verify(token,process.env.JWT_SECRET_KEY)
    }catch(err){
        return null
    }
}

const requireRole = (role)=>{
    return (req,res,next)=>{
        try{
            const token = req.cookies.token
            if(!token) return res.status(401).json({message:'Please Login First'})
            const decoded = getTokenPayload(token)
            if(!decoded) return res.status(401).json({message:'Invalid token'})
            if(role && decoded.role !== role) return res.status(403).json({message:"You don't have access"})
            req.user = decoded
            next()
        }catch(error){
            console.error(error)
            return res.status(500).json({message:'Internal Server Error'})
        }
    }
}

export default {authArtist:requireRole('artist'),authUser:requireRole('user'),requireRole}