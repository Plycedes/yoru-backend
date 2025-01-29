import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import connectDB from "./db";
import { app } from "./app";

dotenv.config();

const PORT: number = parseInt(process.env.PORT || "8000", 10);

const initializeServer = async (): Promise<void> => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}`);
        });

        const tempDir: string = path.join(__dirname, "../", "temp", "files");
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
            console.log("Folder created");
        }
    } catch (error) {
        console.error("Failed to start server!!", error);
    }
};

initializeServer();
