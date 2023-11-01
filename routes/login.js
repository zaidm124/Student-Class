const express=require("express");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt")

const loginRouter=express.Router();

loginRouter.post("/",async(req,res)=>{
    const {email,userPass,correctPass,username}=req.body;
    console.log(userPass)
    console.log(correctPass)
    let isAuthorized=await bcrypt.compare(userPass,correctPass);
    if(isAuthorized){
        let userInfo={
            email,username
        }
        let token=jwt.sign(userInfo,process.env.JWTSECRET,{expiresIn:'10d'})
        return res.json({isAuthorized,token,auth:true})
    }else{
        return res.json({isAuthorized,token:"No token",auth:false, error:"Password incorrect"});
    }
})

module.exports=loginRouter;