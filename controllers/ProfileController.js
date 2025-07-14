
import prisma from "../DB/db.config.js";
import { imageValidator,generateRandomNumber } from "../utils/helper.js";

class ProfileController {
    // get user 
    static async index(req,res){
        try {
            const user = req.user;
            return res.status(200).json({user})
        } catch (error) {
            return res.status(500).json({message : "Something went wrong "})
        }
    }

    static async store(){
        
    }

    static async show(){
        
    }

    static async update(req,res){
       try {
         const {id} = req.params
         const authUser = req.user 
        // console.log("auth user is",authUser)
         if(!req.files || Object.keys(req.files).length === 0){
             return res.status(400).json({message : "profile image is required"})
         }
 
         const profile = req.files.profile
         console.log("profile is",profile)
         const message = imageValidator(profile?.size,profile.mimetype)
         console.log("message is ",message)
         if(message !== null){
             return res.status(400).json({
                 errors : {
                     profile: message
                 }
             })
         }
 
         const imgExt = profile?.name.split(".")
         const imgName = generateRandomNumber() + "." + imgExt[1];
         const uploadPath = process.cwd() + "/public/images/" + imgName
         console.log("upload path ",uploadPath)
 
         profile.mv(uploadPath,(err)=>{
             if(err) throw err
         })
 
 
         await prisma.users.update({
             data : {
                 profile: imgName
             },
             where:{
                 id : Number(id)
             }
         })
 
         // return res.json({name:profile.name,size: profile?.size,mime: profile?.mimetype})
         return res.status(200).json({message : "Profile updated successfuly"})
 
       } catch (error) {
            console.log("error is",error)
            return res.status(500).json({message : "Something went wrong "})
       }
    }

    static async destroy(){
        
    }
}

export default ProfileController