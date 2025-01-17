import multer from "multer";
import { v4 } from "uuid";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files/temp");
  },
  filename: function (req, file, cb) {
    cb(null, v4());
  },
});

export const upload = multer({ storage });
export const uploadVideo = multer({ videoStorage });
