import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model.js";
import { IUser } from "../types/user.js";
import jwt from "jsonwebtoken";

// Extend the Express Request type to include the user property
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

interface JwtPayload {
    _id: string;
    // Add other properties that your JWT payload might have
}

export const verifyJWT = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            res.status(401).json({ message: "Unauthorized Request" });
            return;
        }

        const secretKey = process.env.ACCESS_TOKEN_SECRET;
        if (!secretKey) {
            throw new Error("ACCESS_TOKEN_SECRET is not defined");
        }

        const decodedToken = jwt.verify(token, secretKey) as JwtPayload;

        User.findById(decodedToken._id)
            .select("-password -refreshToken -otp -otpExpires")
            .then((user) => {
                if (!user) {
                    res.status(401).json({ message: "Invalid Access Token" });
                    return;
                }
                req.user = user;
                next();
            })
            .catch((error) => {
                console.log("Error finding user:", error);
                res.status(500).json({ message: "Internal Server Error" });
            });
    } catch (error) {
        let errorMessage = "Failed";
        if (error instanceof Error) {
            if (error.name === "TokenExpiredError") {
                res.status(401).json({ message: "Access Token Expired" });
                return;
            }
            if (error.name === "JsonWebTokenError") {
                res.status(401).json({ message: "Invalid Access Token" });
                return;
            }
            errorMessage = error.message;
        }
        console.log("Invalid Request: ", errorMessage);
        res.status(401).json({ message: "Invalid Request" });
    }
};