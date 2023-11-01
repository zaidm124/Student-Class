const jwt=require("jsonwebtoken");

exports.authTokenHandler=(req,res,next)=>{
    try{
        const token=req.headers["x-access-token"];
        if(!token){
            return res.status(401).json({auth:false,status:"error",error:"Auth token missing"});
        }
        jwt.verify(token,process.env.JWTSECRET,(err,user)=>{
            if(err){
                return res.status(401).json({auth:false,status:"error",error:"Authentication token error"});
            }
            req.user=user;
            console.log(user);
            next();
        })
    }catch(error){
        return res.status(500).json({status:"error",error})
    }
}