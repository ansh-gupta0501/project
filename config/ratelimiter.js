import rateLimit from 'express-rate-limit'

export const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
	limit: 1, // Limit each IP to 1 requests per `window` (here, per 1 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header // Sends rate limit info in a single RateLimit header (newer standard).
	legacyHeaders: false, // Disables old-style headers like X-RateLimit-Limit, X-RateLimit-Remaining, etc.


	// store: ... , // Redis, Memcached, etc. // You can store request counts in an external store like Redis for scaling across multiple servers.


})

/*
Too many requests, please try again later. This message is sent when the rate limit is exceeded.with status code 429.
*/