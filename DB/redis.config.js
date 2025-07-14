import redis from 'express-redis-cache'

const redisCache = redis({
    port : process.env.REDIS_PORT, // Redis server port
    host : process.env.REDIS_HOST, // Redis server host
    username : process.env.REDIS_USERNAME, // Redis username
    // password : process.env.REDIS_PASSWORD, // Redis password
    auth_pass: process.env.REDIS_PASSWORD,
    prefix: 'master_backend:', // Prefix for cache keys
    expire : 60 * 60 // Cache expiration time in seconds (1 hour)
})

export default redisCache

/*
we see that first time we hit request , it takes time 915ms and as in console , we see the corresponding sql query as it comes from database , but after that if we again hit the same request , it takes time 225ms as it comes from cache memory and not from database therefore in console , no sql query is shown 
also in redis insight , we get data store as 

Hash  master_backend:/api/news/

+----------+----------------------------------------------------------+-----------+
| Field    | Value                                                    | TTL       |
+----------+----------------------------------------------------------+-----------+
| expire   | 3600                                                     | No Limit  |
| touched  | 1752408056761                                            | No Limit  |
| body     | {"news":[{"id":1,"heading":...                           | No Limit  |
| type     | application/json; charset=utf-8                           | No Limit  |
+----------+----------------------------------------------------------+-----------+
in body we have stored like this 
{"news":[{"id":1,"heading":"breaking news","news":"dasmfklalfcmalzmdlasml","image":"http://localhost:8000/images/dcbd3ec4-3713-41b8-beee-3e040b64807e.png","created_at":"2025-07-10T17:53:47.852Z","reporter":{"id":2,"name":"ansh","profile":"http://localhost:8000/images/2795e42f-3d14-40a7-a9ad-b671adac6816.png"}}],"metadata":{"totalPages":4,"currentPage":1,"currentLimit":1}}
*/