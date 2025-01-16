import { createCanvas } from "canvas";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function generateProfilePicture(username, outputPath) {
  const initials = username
    .split(" ")
    .map((word) => word[0].toUpperCase())
    .join("");
  const canvas = createCanvas(128, 128);
  const ctx = canvas.getContext("2d");

  // Background color
  ctx.fillStyle = "#" + Math.floor(Math.random() * 16777215).toString(16);
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Text style
  ctx.font = "bold 64px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Draw initials
  ctx.fillText(initials, canvas.width / 2, canvas.height / 2);

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(outputPath, buffer);
}

export { generateProfilePicture };
