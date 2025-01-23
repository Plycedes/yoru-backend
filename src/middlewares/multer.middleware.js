import multer from "multer";
import { v4 } from "uuid";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./temp/files");
  },
  filename: function (req, file, cb) {
    cb(null, v4() + file.originalname);
  },
});

export const upload = multer({ storage });
