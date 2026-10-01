import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "app", "icon.svg");
const pngOutput = path.join(root, "desktop", "think-anas-sahara.png");
const icoOutput = path.join(root, "desktop", "think-anas-sahara.ico");
const sizes = [16, 24, 32, 48, 64, 128, 256];

const svg = await readFile(source);
const images = await Promise.all(
  sizes.map((size) =>
    sharp(svg, { density: 384 })
      .resize(size, size)
      .png()
      .toBuffer()
  )
);

await sharp(svg, { density: 384 }).resize(512, 512).png().toFile(pngOutput);

const directorySize = 6 + images.length * 16;
let imageOffset = directorySize;
const header = Buffer.alloc(directorySize);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);

images.forEach((image, index) => {
  const size = sizes[index];
  const entry = 6 + index * 16;
  header.writeUInt8(size === 256 ? 0 : size, entry);
  header.writeUInt8(size === 256 ? 0 : size, entry + 1);
  header.writeUInt8(0, entry + 2);
  header.writeUInt8(0, entry + 3);
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(image.length, entry + 8);
  header.writeUInt32LE(imageOffset, entry + 12);
  imageOffset += image.length;
});

await writeFile(icoOutput, Buffer.concat([header, ...images]));
