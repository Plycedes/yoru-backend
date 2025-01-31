import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { JsonObject } from "./jsonTypes";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath: string): Promise<JsonObject | null> => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        console.log("File uploaded", response.url);
        fs.unlinkSync(localFilePath);

        const result: JsonObject = {
            url: response.secure_url,
            public_id: response.public_id,
        };
        return result;
    } catch (error) {
        console.log("Error while uploading to cloudinary");
        fs.unlinkSync(localFilePath);
        return null;
    }
};

const deleteFromCloudinary = async (publicId: string): Promise<any | null> => {
    try {
        if (!publicId) return null;
        return await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
        });
    } catch (error) {
        console.log("Error deleting file", error);
        return null;
    }
};

const deleteVideoFromCloudinary = async (publicId: string): Promise<any | null> => {
    try {
        if (!publicId) return null;

        return await cloudinary.uploader.destroy(publicId, {
            resource_type: "video",
        });
    } catch (error) {
        console.error("Errro deleting file:", error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary, deleteVideoFromCloudinary };
