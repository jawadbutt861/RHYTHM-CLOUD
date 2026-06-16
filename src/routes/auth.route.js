import express from 'express'
import authController from '../controllers/auth.controller.js'
import validation from '../middlewares/validation.middleware.js'

const router = express.Router()

router.post('/register',validation.validationRulesofRegister,authController.registerUser)
router.post('/login',authController.loginUser)
router.post('/logout',authController.logOut)
router.post('/refresh',authController.refreshAccessToken)
router.get('/verify/:token',authController.verifyEmail)
router.post('/forgot',authController.forgotPassword)
router.post('/reset/:token',authController.resetPassword)

export default router