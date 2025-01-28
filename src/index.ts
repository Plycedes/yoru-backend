import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import connectDB from "./db";
import { app } from "./app";

dotenv.config({ path: "./env" });

const PORT: number = parseInt(process.env.PORT || "8000", 10);
