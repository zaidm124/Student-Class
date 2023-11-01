const { authTokenHandler } = require("../middleware/authTokenHandler");
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt");

const express=require("express");
const registerRouter=express.Router();

registerRouter.post("/",async(req,res)=>{
    const {email,password}=req.body;
    const hashPass=await bcrypt.hash(password,10);
    const userInfo={email,hashPass};

    return res.status(200).json({status:"success",auth:true,userInfo});
})

module.exports=registerRouter;