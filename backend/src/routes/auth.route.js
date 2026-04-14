//Import tools/dependencies.
const express = require('express');
const router = express.Router();



//Defining functions
const signupRes = (req, res)=>{
    res.send("Sign up page");
}
const loginRes = (req, res)=>{
    res.send("Log in page");
}
const logoutRes = (req, res)=>{
    res.send("Log out page");
}



//Mounting routes and using their corresponding functions. 
router.get('/signup', signupRes)

router.get('/login', loginRes)

router.get('/logout', logoutRes)


//Export router
module.exports = router;