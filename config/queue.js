export const redisConnection = {
    username : process.env.REDIS_USERNAME, 
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
    
}

export const defaultQueueConfig = {
    // delay: 5000, // delay the job for 5 seconds
    // removeOnComplete: true // when the job complete , remove from redis database 
    removeOnComplete : {
        count : 100,
        age : 60*60*24   // keep for 1 day after job complete
    },
    attempts : 3,   // if first time job gets failed , then try again for 3 times 
    backoff : {
        type : 'exponential',
        delay : 1000
    },               // 1 second delay for next attempt
}