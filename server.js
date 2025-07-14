import express from "express"
import "dotenv/config"
const app = express()
const PORT = process.env.PORT || 8000
import fileUpload from 'express-fileupload'
import helmet from 'helmet'
import cors from 'cors'
import logger from "./config/logger.js"
import { limiter } from "./config/ratelimiter.js"
// Middlewares
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(fileUpload()) 
app.use(express.static("public")) 
app.use(helmet()) // The helmet package in Express is a middleware that helps secure your Express apps by setting various HTTP headers to protect against well-known web vulnerabilities. This adds a collection of security-related HTTP headers to your responses.
/*
    Key Uses of helmet:
    Prevent Clickjacking – via X-Frame-Options header.
    Prevent XSS attacks – via X-XSS-Protection and Content-Security-Policy.
    Prevent MIME-type sniffing – via X-Content-Type-Options.
    Hide Express info – removes X-Powered-By header.
    Control browser DNS prefetching – via X-DNS-Prefetch-Control.
    Set Referrer Policy – to control what referrer info is sent.

*/
app.use(cors())
// app.use(limiter) // Rate limiting middleware to limit the number of requests from a single IP address

app.get('/',(req,res)=>{
    return res.json({message: "Hello it is working"})
})

//import routes
import ApiRoutes from './routes/api.js'

app.use('/api',ApiRoutes)

// // logger 
// logger.info("Hey I am just testing... ")
// logger.error("Hey I am just testing error... ")


// jobs import 

import './jobs/index.js'

app.listen(PORT,()=>console.log(`server is running on port ${PORT}`))

