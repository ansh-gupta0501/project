import { newsSchema } from "../validations/newsValidations.js";
import vine from '@vinejs/vine'
import { errors } from "@vinejs/vine";
import { generateRandomNumber, imageValidator, removeImage, uploadImage } from "../utils/helper.js";
import prisma from "../DB/db.config.js";
import NewsApiTransform from "../transformer/newsApiTransform.js";
import logger from "../config/logger.js";
// import redisCache from "../DB/redis.config.js";


class NewsController {
    static async index(req,res){

        const page = Number(req.query.page) || 1
        const limit = Number (req.query.limit) || 1

        if(page <= 0) page = 1
        if(limit <= 0 || limit >100) limit = 10

        const skip = (page - 1) * limit 


        const news = await prisma.news.findMany({
            take : limit,
            skip : skip,
            include : {
                user : {
                    select : {
                        id : true,
                        name : true,
                        profile : true
                    }
                }
            }
        }) // this news will be an array 
        
    /*
        we get news like this 

         
    "news": [
        {
            "id": 1,
            "user_id": 1,
            "title": "Breaking news",
            "content": "nbjbhvghjklkhbjghnvg",
            "image": "577e940f-bc8d-4fa6-94ec-974b02b7ddbc.png",
            "created_at": "2025-07-10T10:06:30.670Z",
            "updated_at": "2025-07-10T10:06:30.670Z"
        },
        {
            "id": 2,
            "user_id": 1,
            "title": "Breaking news",
            "content": "nbjbhvghjklkhbjghnvg",
            "image": "21b76eb9-51b5-4914-8872-677706854fa0.png",
            "created_at": "2025-07-10T10:07:22.512Z",
            "updated_at": "2025-07-10T10:07:22.512Z"
        }
    ]

    */

    // need to transform this news so that we get image link and other details 
        
        const newsTransform = news?.map((item)=>{
            return NewsApiTransform.transform(item)
        })

        const totalNews = await prisma.news.count()
        const totalPages = Math.ceil(totalNews/limit)

        return res.json({news : newsTransform,metadata : {
            totalPages,
            currentPage : page,
            currentLimit : limit
        }}) 


    }
    
    static async store(req,res){
       try {
         const user = req.user
         const body = req.body;
 
         const validator = vine.compile(newsSchema)
         const payload = await validator.validate(body)

        if(!req.files || Object.keys(req.files).length === 0){
            return res.status(400).json({errors : {
                image : "Image field is required "
            }})
         }

        const image = req.files?.image

        // image custom validator
        const message = imageValidator(image?.size , image?.mimetype)

        if(message !== null){
            return res.status(400).json({errors : {
                image : message
            }})
        }

       
        const imgName = uploadImage(image)

        payload.image = imgName
        payload.user_id = user.id

        const news = await prisma.news.create({
            data : payload
        })

        // remove cache  
        // we did so because whenever new news is created, we need to remove the cache so that next time when we fetch news, it will be fetched from database and not from cache
        // if we don't do this then we will always get the old news from cache and not the new news that we just created

        // redisCache.del("/api/news/",(err)=>{
        //     if(err) {
        //         // console.error("Error deleting cache:", err);
        //         throw new Error("Error deleting cache")
        //     }
        // }) // need to write the key, don't write prefix , 

         return res.status(200).json({message : " News created successfuly ",news})
 
       } catch (error) {
        logger.error(error)
        if(error instanceof errors.E_VALIDATION_ERROR){

            // console.log(error.messages)
            return res.status(400).json({errors: error.messages})
        }else {
            console.log("Error is ",error)
            return res.status(500).json({message: "Something went wrong.Please try again "})
        }
        
       }


    }

    static async show(req,res){
       try {
         const {id} = req.params
         const news = await prisma.news.findUnique({
             where : {
                 id : Number(id)
             },
             include : {
                 user : {
                     select : {
                         id : true,
                         name : true,
                         profile : true
                     }
                 }
             }
         })
 
         const transformNews = news? NewsApiTransform.transform(news) : null
 
         return res.status(200).json({news :transformNews})
       } catch (error) {
         return res.status(500).json({message : "Something went wrong please try again "})
       }
    }
    static async update(req,res){
       try {
         const {id} = req.params
         const user = req.user 
         const body = req.body
         const news = await prisma.news.findUnique({
             where : {
                 id : Number(id)
             }
         })
 
        //  console.log("user.id is ",user.id)
        //  console.log("news.user_id is ",news.user_id)

         if(user.id !== news.user_id){
             return res.status(400).json({message : "Unauthorized"})
         }
 
         const validator = vine.compile(newsSchema)
         const payload = await validator.validate(body)
 
         
 
         const image = req?.files?.image
         
         
 
         if(image){
             const message = imageValidator(image?.size,image?.mimetype)
             if(message !== null){
                 return res.status(400).json({errors : {
                     image : message
                 }})
             }
 
             // upload new image 
 
             const imageName = uploadImage(image)
             payload.image = imageName
 
             // delete old image 
 
             removeImage(news.image)
 
         }
 
         await prisma.news.update({
             data : payload,
             where : {
                 id : Number(id)
             }
         })

         return res.status(200).json({message : "News updated Successfuly"})
       } catch (error) {
        if(error instanceof errors.E_VALIDATION_ERROR){

            // console.log(error.messages)
            return res.status(400).json({errors: error.messages})
        }else {
            console.log("Error is ",error)
            return res.status(500).json({message: "Something went wrong.Please try again "})
        }
        
       }
    }
    static async destroy(req,res){
        try {
            const {id} = req.params
            const user = req.user
            const news = await prisma.news.findUnique({
                where : {
                    id : Number(id)
                }
            })
    
            if(user.id !== news.user_id){
                return res.status(400).json({message : "Unauthorized"})
            }
    
            //delete image from file sytem 
            removeImage(news.image)
    
            await prisma.news.delete({
                where : {
                    id : Number(id)
                }
            })

            return res.status(200).json({message : "News deleted successfuly"})

        } catch (error) {
             return res.status(500).json({message: "Something went wrong.Please try again "})
        }
    }
}

export default NewsController