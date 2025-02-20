import { Response } from "express";

export const errorHandler = (res: Response, error: unknown, defaultMessage: string) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(defaultMessage, errorMessage, error);
    res.status(500).json({ message: defaultMessage });
}
