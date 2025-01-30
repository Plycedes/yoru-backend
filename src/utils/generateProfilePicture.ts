import { createCanvas } from "canvas";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { uploadOnCloudinary } from "./cloudinary";
import { JsonObject, JsonValue } from "./jsonTypes";

export const generateProfilePicture = async (username: string): Promise<JsonObject | null> => {
    try {
        const initials = username
            .split(" ")
            .map((word) => word[0].toUpperCase())
            .join("");

        const uniqueId = uuidv4();
        const filePath = `./temp/files/${uniqueId}${username}.png`;
        const canvas = createCanvas(128, 128);
        const ctx = canvas.getContext("2d");

        // Background color
        ctx.fillStyle = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Text style
        ctx.font = "bold 64px Arial";
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Draw initials
        ctx.fillText(initials, canvas.width / 2, canvas.height / 2);

        const buffer = canvas.toBuffer("image/png");
        fs.writeFileSync(filePath, buffer);

        const pfp = await uploadOnCloudinary(filePath);
        return pfp;
    } catch (error) {
        console.log("Error generating profile image");
        throw error;
    }
};
