import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ResponseHandler } from "../utils/responseHandler.js";

interface JwtPayload {
    roles: string[];
}

export const checkRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return ResponseHandler.error(res, "Unauthorized - No token provided", 401);
        }

        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;
            const userRoles = decoded.roles;

            const hasRole = roles.some(role => userRoles.includes(role));
            if (!hasRole) {
                return ResponseHandler.error(res, "Unauthorized - Insufficient permissions", 403);
            }

            next();
        } catch (error) {
            return ResponseHandler.error(res, "Unauthorized - Invalid token", 401);
        }
    };
};