import ApiResponse from '../utils/apiResponse.util.js'
import UserService from '../services/user.service.js'
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import argon2 from "argon2";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_TOKEN_EXPIRY;

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ Message: "Please enter email and password" });
        }

        let user = await UserService.getByEmail(email);
        if (!user || !user.password) {
            return res.status(403).json({ Message: "Invalid email or password" });
        }

        const isPasswordValid = await argon2.verify(user.password, password);
        if (!isPasswordValid) {
            return res.status(403).json({ Message: "Invalid email or password" });
        }
        const userObj = user.toObject();
        const accessToken = jwt.sign({ email: user.email, name:userObj.name }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
        userObj.accessToken = accessToken;
        return res.status(200).json(new ApiResponse(200, userObj,  "User logged in successfully", true));

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ Message: "Server error during login" });
    }
};

const register = async (req, res) => {
    try {
        const { name, email, designation, team, password } = req.body;

        if (!name || !email || !designation || !team || !password) {
            return res.status(400).json({ Message: "Please enter all fields" });
        }

        const existingUser = await UserService.getByEmail(email);
        if (existingUser) {
            return res.status(403).json({ Message: "Email already exists" });
        }

        const hashedPassword = await argon2.hash(password);

        let newUser = await UserService.addData({
            name,
            email,
            designation,
            team,
            password: hashedPassword,
        });
        const userObj = newUser.toObject();
        const accessToken = jwt.sign({ email: newUser.email, name:name }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
        userObj.accessToken = accessToken;
        console.log(newUser);
        return res.status(200).json(new ApiResponse(200, userObj,  "User registered successfully", true));

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ Message: "Server error during registration" });
    }
};




const getUsers = async (req, res) => {
    try {
        const users = await UserService.getData();
        return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully", true));
    } 
    catch (error) {
        return res.status(500).json(new ApiResponse(500, {}, error.message, false));
    }
};
  
const getUserByEmail = async (req, res) => {
    try {
        const user = await UserService.getByEmail(req.params.email);
        console.log(req.params.email)
        if (!user) return res.status(404).json(new ApiResponse(404, {}, "User not found", false));
        return res.status(200).json(new ApiResponse(200, user, "User fetched successfully", true));
    } 
    catch (error) {
        return res.status(500).json(new ApiResponse(500, {}, error.message, false));
    }
};

export { login, register, getUsers, getUserByEmail };
