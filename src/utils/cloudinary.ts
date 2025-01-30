import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath: string): Promise<any | null> => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        console.log("File uploaded", response.url);
        fs.unlinkSync(localFilePath);
        return response;
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
