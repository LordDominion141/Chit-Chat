//Import tools/dependencies
import express from 'express';
import authControl from '../controllers/auth.controller.js'
import {protectRoute} from '../middleware/auth.middleware.js'

const router = express.Router();


//Mounting routes and using their corresponding functions. 
router.post('/signup', authControl.signupRes)

router.post('/login', authControl.loginRes)

router.post('/logout', authControl.logoutRes)
router.post('/update-profile', protectRoute, authControl.updateProfile)

router.get('/check', protectRoute, (req, res)=>{
    res.status(200).json(req.user);
    
})



//Export router
export default router;