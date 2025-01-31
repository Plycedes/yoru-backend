import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import fs from "fs";
import path from "path";
import https from "https";

dotenv.config({ path: "./env" });

const SSL_KEY_PATH = path.join(__dirname, "..", "certs", "server.key"); // Private Key
const SSL_CERT_PATH = path.join(__dirname, "..", "certs", "server.crt"); // Certificate

connectDB()
  .then(() => {
    const tempDir = path.join("./temp/files");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      console.log("Folder created");
    }

    // Read SSL Certificates
    const options = {
      key: fs.readFileSync(SSL_KEY_PATH),
      cert: fs.readFileSync(SSL_CERT_PATH),
    };

    // Start HTTPS Server
    https.createServer(options, app).listen(process.env.PORT || 8000, () => {
      console.log(`HTTPS Server Running at PORT: ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.log("Failed to start server!!", err);
  });
