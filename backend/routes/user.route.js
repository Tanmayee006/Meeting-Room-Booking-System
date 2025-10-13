import { Router  } from "express";
import {login, register, getUsers, getUserByEmail} from '../controllers/user.controller.js'
import {validateToken} from '../middleware/jwt.middleware.js'
const router = Router();


router.post('/user/register', register);

router.post('/user/login', login);

router.get('/user', validateToken, getUsers);

router.get('/user/:email', validateToken, getUserByEmail);


export default router;