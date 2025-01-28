import express, { Application, Request, Response } from "express";
//import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

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

export { app };
