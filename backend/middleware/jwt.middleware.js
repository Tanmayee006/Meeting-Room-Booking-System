import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
dotenv.config();

const ACESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;

const validateToken = async (req, res, next) => {
    let token;
    let authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
        console.log("Token received:", token);

        try {
            const decoded = jwt.verify(token, ACESS_TOKEN_SECRET);
            req.userName = decoded.name;
            req.userEmail = decoded.email;    
            console.log("Token validated successfully");
            next();
        } 
        catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({ "Message": "Access token expired" });
            }
            console.log("Token validation failed:", err.message);
            return res.status(403).json({ "Message": "User not registered" });
        }
    } 
    else {
        console.log("Token not provided");
        res.status(403).json({ "Message": "Token not provided" });
    }
};


export {validateToken};