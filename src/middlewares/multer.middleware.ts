import multer, { StorageEngine } from "multer";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";

import { IUser } from "../models/user.model";

export interface MulterRequest<T = any> extends Request {
    user?: IUser;
    body: T;
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
