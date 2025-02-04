import multer, { StorageEngine } from "multer";
import { Request } from "express";
import { CustomRequest } from "./auth.middleware";
import { v4 as uuidv4 } from "uuid";

export interface MulterRequest extends Request, CustomRequest {
    file?: Express.Multer.File;
}

const storage: StorageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./temp/files");
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + file.originalname);
    },
});

export const upload = multer({ storage });
