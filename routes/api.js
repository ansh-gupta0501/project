import {Router} from 'express'
import AuthController from '../controllers/AuthController.js'
import authMiddleware from '../middleware/Authenticate.js'
import ProfileController from '../controllers/ProfileController.js'
import NewsController from '../controllers/NewsController.js'
import { limiter } from '../config/ratelimiter.js'
// import redisCache from '../DB/redis.config.js'
const router = Router()

router.post('/auth/register',AuthController.register)
router.post('/auth/login',AuthController.login)
router.post('/auth/logout',AuthController.logout)

router.get('/send-email',AuthController.sentTestEmail)

//profile routes

router.get('/profile',authMiddleware,ProfileController.index)
router.put('/profile/:id',authMiddleware,ProfileController.update)

// news routes

router.get('/news',
    // redisCache.route(),
    limiter,
    NewsController.index
)
router.post('/news',authMiddleware,NewsController.store)
router.get('/news/:id', limiter, NewsController.show)
router.put('/news/:id',authMiddleware,NewsController.update)
router.delete('/news/:id',authMiddleware,NewsController.destroy)



export default router