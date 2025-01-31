import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { fileURLToPath } from "url";

dotenv.config({ path: "./env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SSL_KEY_PATH = path.join(__dirname, "..", "certs", "server.key");
const SSL_CERT_PATH = path.join(__dirname, "..", "certs", "server.crt");

connectDB()
  .then(() => {
    const tempDir = path.join("./temp/files");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      console.log("Folder created");
    }

    const options = {
      key: fs.readFileSync(SSL_KEY_PATH),
      cert: fs.readFileSync(SSL_CERT_PATH),
    };

    https.createServer(options, app).listen(443, () => {
      console.log("HTTPS Server Running at PORT: 443");
    });

    http.createServer(app).listen(80, () => {
      console.log("HTTP Server Running at PORT: 80");
    });

    app.listen(8000, () => {
      console.log("Server Running on custom PORT: 8000");
    });
  })
  .catch((err) => {
    console.log("Failed to start server!!", err);
  });
