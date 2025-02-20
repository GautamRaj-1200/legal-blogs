import { Response } from "express";

export class ResponseHandler {
    static success(res: Response, message: string, data: unknown = null, statusCode: number = 200): void {
        res.status(statusCode).json({ message, data });
    }

    static error(res: Response, message: string, statusCode: number = 500): void {
        res.status(statusCode).json({ message });
    }

    static notFound(res: Response, message: string): void {
        res.status(404).json({ message });
    }

    static unauthorized(res: Response, message: string): void {
        res.status(401).json({ message });
    }

    static badRequest(res: Response, message: string): void {
        res.status(400).json({ message });
    }

    static forbidden(res: Response, message: string): void {
        res.status(403).json({ message });
    }
}
