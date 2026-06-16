import {body,validationResult } from "express-validator";


const validation = async (req,res,next)=>{
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(400).json({
            errors : errors.array()
        })
    }

    next()
}


const validationRulesofRegister = [
    body("username")
    .isString()
    .withMessage("Username must be String")
    .isLength({min : 3 , max : 20})
    .withMessage("Username must be between 3 to 20 characters"),

    body("email")
    .isEmail()
    .withMessage("Use Valid Email"),


    body("password")
    .isLength({min : 6})
    .withMessage("Password must be greater than 6 characters"),

    validation
]

export default {validationRulesofRegister}