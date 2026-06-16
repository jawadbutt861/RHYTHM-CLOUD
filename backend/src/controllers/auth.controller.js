
import 'dotenv/config'
import userModel from '../models/user.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import 'dotenv/config'

const registerUser = async (req,res)=>{
    try {
        const {email,password,username,role} = req.body

        const isUserExist = await userModel.findOne({
            $or : [
                {email},
                {username}
            ]
        })

        if(isUserExist){
            return res.status(409).json({
                message : "User already exist"
            })
        }

        const hash = await bcrypt.hash(password,10)

        const user = await userModel.create({
            username,
            email,
            role,
            password : hash
        })

        const accessToken = jwt.sign({
            id : user._id,
            role : user.role
        },process.env.JWT_SECRET_KEY,{expiresIn:'15m'})

        const refreshToken = jwt.sign({id:user._id},process.env.JWT_REFRESH_KEY,{expiresIn:'7d'})
        user.refreshToken = refreshToken
        await user.save()

        res.cookie("token",accessToken,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax'})
        res.cookie("refreshToken",refreshToken,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax'})

        return res.status(201).json({
            message : "User Registered Successfully"
        })

    } catch (error) {
        console.error("Error Occurred",error)
        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

const loginUser = async (req,res)=>{
    try {
        const {email,username,password} = req.body

        const user = await userModel.findOne({
            $or : [
                {email},
                {username}
            ]
        })

        if(!user){
            return res.status(401).json({
                message : "Invalid Credentials"
            })
        }

        const isPasswordMatched = await bcrypt.compare(password,user.password)

        if(!isPasswordMatched){
            return res.status(401).json({
                message : "Invalid Credentials"
            })
        }

        const accessToken = jwt.sign({
            id : user._id,
            role : user.role
        },process.env.JWT_SECRET_KEY,{expiresIn:'15m'})

        const refreshToken = jwt.sign({id:user._id},process.env.JWT_REFRESH_KEY,{expiresIn:'7d'})
        user.refreshToken = refreshToken
        await user.save()

        res.cookie("token",accessToken,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax'})
        res.cookie("refreshToken",refreshToken,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax'})

        return res.status(200).json({
            message : "Login Successfully"
        })
    } catch (error) {
        console.error("Error Occurred",error)
        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

const logOut = async (req,res)=>{
    try{
        const refreshToken = req.cookies.refreshToken
        if(refreshToken){
            const user = await userModel.findOne({refreshToken})
            if(user){
                user.refreshToken = undefined
                await user.save()
            }
        }

        res.clearCookie('token')
        res.clearCookie('refreshToken')
        return res.status(200).json({message:'Logout Successfully'})
    }catch(error){
        console.error(error)
        return res.status(500).json({message:'Internal Server Error'})
    }
}

const refreshAccessToken = async (req,res)=>{
    try{
        const refreshToken = req.cookies.refreshToken
        if(!refreshToken) return res.status(401).json({message:'No refresh token'})

        const payload = jwt.verify(refreshToken,process.env.JWT_REFRESH_KEY)
        const user = await userModel.findById(payload.id)
        if(!user || user.refreshToken !== refreshToken) return res.status(401).json({message:'Invalid refresh token'})

        const accessToken = jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET_KEY,{expiresIn:'15m'})
        res.cookie('token',accessToken,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax'})
        return res.status(200).json({message:'Token refreshed'})
    }catch(error){
        console.error(error)
        return res.status(401).json({message:'Invalid token'})
    }
}

// Email verification and password reset helpers
const sendEmail = async (to,subject,text)=>{
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })

    await transporter.sendMail({from:process.env.SMTP_FROM||process.env.SMTP_USER,to,subject,text})
}

const sendVerificationEmail = async (user)=>{
    const token = crypto.randomBytes(32).toString('hex')
    user.verifyToken = token
    await user.save()
    const url = `${process.env.APP_URL}/api/auth/verify/${token}`
    await sendEmail(user.email,'Verify Your Email',`Click to verify: ${url}`)
}

const verifyEmail = async (req,res)=>{
    try{
        const token = req.params.token
        const user = await userModel.findOne({verifyToken:token})
        if(!user) return res.status(400).json({message:'Invalid token'})
        user.isVerified = true
        user.verifyToken = undefined
        await user.save()
        return res.status(200).json({message:'Email verified'})
    }catch(error){
        console.error(error)
        return res.status(500).json({message:'Internal Server Error'})
    }
}

const forgotPassword = async (req,res)=>{
    try{
        const {email} = req.body
        const user = await userModel.findOne({email})
        if(!user) return res.status(200).json({message:'If the email exists, a reset link was sent'})
        const token = crypto.randomBytes(32).toString('hex')
        user.resetPasswordToken = token
        await user.save()
        const url = `${process.env.APP_URL}/api/auth/reset/${token}`
        await sendEmail(user.email,'Reset Password',`Reset link: ${url}`)
        return res.status(200).json({message:'If the email exists, a reset link was sent'})
    }catch(error){
        console.error(error)
        return res.status(500).json({message:'Internal Server Error'})
    }
}

const resetPassword = async (req,res)=>{
    try{
        const {token} = req.params
        const {password} = req.body
        const user = await userModel.findOne({resetPasswordToken:token})
        if(!user) return res.status(400).json({message:'Invalid token'})
        user.password = await bcrypt.hash(password,10)
        user.resetPasswordToken = undefined
        await user.save()
        return res.status(200).json({message:'Password reset successful'})
    }catch(error){
        console.error(error)
        return res.status(500).json({message:'Internal Server Error'})
    }
}

export default {
  registerUser,
  loginUser,
  logOut,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  resetPassword
}