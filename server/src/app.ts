import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
});

import authRouter from "./routes/auth.routes.js";
import postRouter from "./routes/post.routes.js"
import userRouter from "./routes/user.routes.js"

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/posts", postRouter)
app.use("/api/v1/users", userRouter)

export default app;
