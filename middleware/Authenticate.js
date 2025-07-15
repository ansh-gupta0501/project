import jwt from 'jsonwebtoken'

const authMiddleware = (req,res,next) =>{
    console.log("cookei",req.cookies?.access_token)
    const authHeader = req.cookies?.access_token || req.headers.authorization
    console.log("authheader is ",authHeader)
    if(authHeader === null || authHeader === undefined){
        return res.status(401).json({message : "Unauthorized"})
    }

    let token;
    if (authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
    } else {
    // authHeader is raw token (from cookie)
    token = authHeader;
    }
    console.log("token is ",token)
    //verify token 

    jwt.verify(token , process.env.JWT_SECRET,(err,user)=>{
        if(err) return res.status(401).json({message : "Unauthorized"})
        req.user = user;
        next()
    })



}

export default authMiddleware;