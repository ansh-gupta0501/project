import prisma from '../DB/db.config.js'
import vine,{errors} from '@vinejs/vine'
import { registerSchema,loginSchema } from '../validations/authValidation.js';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sendEmail } from '../config/mailer.js';
import logger from '../config/logger.js';
import { emailQueue, emailQueueName } from '../jobs/SendEmailJob.js';
class AuthController{
    static async register(req,res){
        try {
            const body = req.body;
            const validator = vine.compile(registerSchema)
            const payload = await validator.validate(body) // it will throw the error 

            // check if email is exist 
            const findUser = await prisma.users.findUnique({
                where:{
                    email: payload.email
                }
            })

            if(findUser){
                return res.status(400).json({errors : {
                    email : "Email already taken . Please used another one "
                }})
            }
            // encrypt password 
            const salt = bcrypt.genSaltSync(10)
            payload.password = bcrypt.hashSync(payload.password,salt)

            //adding data to database
            const user = await prisma.users.create({data: payload})

            return res.status(200).json({message: "User created successfuly ",user})
        } catch (error) {
            if(error instanceof errors.E_VALIDATION_ERROR){
                // console.log(error.messages)
                return res.status(400).json({errors: error.messages})
            }else{
                return res.status(500).json({message: "Something went wrong.Please try again "})
            }
        }
    }

    static async login(req,res){
        try {
            console.log("inside login");
            
            const body = req.body;
            const validator = vine.compile(loginSchema)
            const payload = await validator.validate(body)

            // find user with email 
            const findUser = await prisma.users.findUnique({
                where : {
                    email : payload.email
                }
            })

            console.log("findUser",findUser)

            if(findUser){

                if(!bcrypt.compareSync(payload.password,findUser.password)){
                    return res.status(400).json({errors : {
                        email : "Invalid Credientails  "
                    }})
                }

                 // Issue token to user 
                const payloadData = {
                    id : findUser.id,
                    email : findUser.email,
                    name : findUser.name,
                    profile : findUser.profile
                }

                const token = jwt.sign(payloadData,process.env.JWT_SECRET,{
                    expiresIn : "365d"
                })


                return res.json({message : "Logged in ",access_token:`Bearer ${token}` })
            }


            return res.status(400).json({
                errors : {
                    email : "No user found with this email "
                }})

        } catch (error) {
            if(error instanceof errors.E_VALIDATION_ERROR){
                // console.log(error.messages)
                return res.status(400).json({errors: error.messages})
            }else{
                return res.status(500).json({message: "Something went wrong.Please try again "})
            }
        }
    }


    // send test email 
    static async sentTestEmail(req,res){
        try {
            const {email} = req.query

            // const payload = {
            //     toEmail: email,
            //     subject: "Hey i am just testing",
            //     body : "<h1>Hello bro how are you  </h1>",
            //     body1 : "<h1>Hello World , second email. </h1>"
            // }

        
            const payload = [
                {
                    toEmail: email,
                    subject: "1st ",
                    body : "<h1>1st  </h1>",
                },
                 {
                    toEmail: email,
                    subject: "2nd ",
                    body : "<h1>2nd </h1>",
                     
                },
                 {
                    toEmail: email,
                    subject: "last ",
                    body : "<h1>last  </h1>",
                     
                },

            ]


            //await sendEmail(payload.toEmail,payload.subject,payload.body)
            // await sendEmail(payload.toEmail,'second email',payload.body1)
            
            /*
                if we emails to  multiple users, then it will take a lot of time , so for this we use queue which sends email at background , main thread will be free. So we use BullMQ package 
                So instead of this sendEmail  , we use queue and inside this queue we use sendEmail 
            */

            await emailQueue.add(emailQueueName,payload) // adding to redis 

            /*
            we get in console this The email worker data is  {
            toEmail: 'anshgupta5667@gmail.com',
            subject: 'Hey i am just testing',
            body: '<h1>Hello bro how are you  </h1>',
            body1: '<h1>Hello World , second email. </h1>'
            }
            info: job completed {"job":{"attemptsMade":1,"attemptsStarted":1,"data":{"body":"<h1>Hello bro how are you  </h1>","body1":"<h1>Hello World , second email. </h1>","subject":"Hey i am just testing","toEmail":"anshgupta5667@gmail.com"},"delay":0,"finishedOn":1752472788669,"id":"1","name":"email-queue","opts":{"attempts":3,"backoff":{"delay":1000,"type":"exponential"},"delay":5000,"removeOnComplete":{"age":86400,"count":100}},"priority":0,"processedOn":1752472788443,"progress":0,"queueQualifiedName":"bull:email-queue","stacktrace":[],"stalledCounter":0,"timestamp":1752472782576,"token":"c95532b8-2a13-432f-ba22-c5e6728cb3c4:9"},"label":"right meow!","service":"user-service","timestamp":"2025-07-14T05:59:49.134Z"}
            The job 1 is completed

            and in redis it is stored as 
            
bull (100%)
└── email-queue (100%)
    ├── HASH: 1 (No limit, 1 KB)
    │   ├── returnvalue: null (TTL: No Limit)
    │   ├── data: {"toEmail":"anoshgupta56..."} (TTL: No Limit)
    │   ├── processedOn: 1752472788443 (TTL: No Limit)
    │   ├── delay: 0 (TTL: No Limit)
    │   └── ats: 1 TTL = "No Limit"
    │   ├── atm: 1 TTL = "No Limit"
    │   ├── priority: 0 TTL = "No Limit"
    │   ├── timestamp: 1752472782576 TTL = "No Limit"
    │   ├── finishedOn: 1752472788669 TTL = "No Limit"
    │   ├── opts: {"backoff":{"delay":1000,"type":"exponential"},"removeOnComplete":{"count":100,"age":86400},"delay":5000,"attempts":3} TTL = "No Limit"
    │   ├── name: email-queue TTL = "No Limit"
    │   
    ├── SORTED SET: completed 
    |   ├── 1: 1752472788669 
    │  
    ├── STREAM: events (No limit, 5 KB)
    ├── STRING: id (No limit, 64 B)
    ├── HASH: meta (No limit, 120 B)
    └── STRING: stalled-check (TTL: 11 s, 72 B)


           

             
*/
            
            return res.status(200).json({message: "job added succesfuly"})
        } catch (error) {
            console.log("error is ",error);
            
            logger.error({type : "Email Error",body : error});
            return res.status(500).json({message: "Something went wrong while sending email"})
        }
    }
}

export default AuthController