import { Router  } from "express";
import {createUser, getUsers, getUserByEmail} from '../controllers/user.controller.js'
const router = Router();


router.post('/user', createUser);

router.get('/user', getUsers);

router.get('/user/:id', getUserByEmail);


export default router;