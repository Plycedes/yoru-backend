import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app: Application = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "*",
        credentials: true,
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.status(200).send({ status: "OK" });
});

app.get("/api/v1/", (req: Request, res: Response) => {
    res.status(200).send({ status: "OK" });
});

import userRouter from "./routers/user.router";
import videoRouter from "./routers/video.router";
import likeRouter from "./routers/like.router";
import commentRouter from "./routers/comment.router";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/comments", commentRouter);

export { app };
