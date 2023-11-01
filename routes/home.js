const express=require("express");
const { authTokenHandler } = require("../middleware/authTokenHandler");
const homeRouter=express.Router();

homeRouter.get("/",(req,res)=>{
    res.send("home page");
})

module.exports=homeRouter;