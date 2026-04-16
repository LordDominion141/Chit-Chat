//Import tools/dependencies
import express from 'express';
import authControl from '../controllers/auth.controller.js'


const router = express.Router();


//Mounting routes and using their corresponding functions. 
router.post('/signup', authControl.signupRes)

router.get('/login', authControl.loginRes)

router.get('/logout', authControl.logoutRes)


//Export router
export default router;