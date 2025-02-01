import multer, { StorageEngine } from "multer";
import { v4 as uuidv4 } from "uuid";

export interface MulterRequest extends Express.Request {
    file: Express.Multer.File;
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
