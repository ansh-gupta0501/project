import {Queue,Worker} from 'bullmq' // queue is used for entry in redis , and worker is used to listen that entries
import { defaultQueueConfig, redisConnection } from '../config/queue.js'
import logger from '../config/logger.js';
import { sendEmail } from '../config/mailer.js';

export const emailQueueName = 'email-queue'

export const emailQueue = new Queue(emailQueueName,{
    connection: redisConnection,            // need to set up redis connection along
    defaultJobOptions : defaultQueueConfig // for every job this will be applied 

})

// workers defining

export const handler = new Worker(
    emailQueueName,  // firstly queue name, // we are defining worker for this emailQueueName 
    async(job)=>{ //  what we send data , it will come in job 
       try {
         // console.log('The email worker data is ',job.data)
         const data = job.data 
         await Promise.all(
             data.map(item => sendEmail(item.toEmail, item.subject, item.body))
         );
       } catch (error) {
        console.log("error in sending email",error)
       }
    },
    {connection : redisConnection} // need to tell which redis connection to use 
);

// worker listeners

handler.on('completed',(job)=>{
    logger.info({job:job,message : "job completed"})
    console.log(`The job ${job.id} is completed`);

})

handler.on('failed',(job)=>{
    console.log(`The job ${job.id} is failed`);
})


