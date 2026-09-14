import {
  PORT,
  DIMENSION_X,
  DIMENSION_Y,
  BINARY_FILE_PATH,
  EMPTY_IMAGE_HEIGHT,
  EMPTY_IMAGE_WIDTH,
  EMPTY_MAP_IMAGE_PATH,
} from "./api/api-server";

const fs = require("fs");
const express = require("express");
const cors = require("cors");

const { createCanvas, loadImage } = require("@napi-rs/canvas");

let cached: Buffer | null = null;

export const app = express();
app.use(cors());

export const readBinaryFile = (filePath: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err: any, data: Buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const TEMP_MIN = 30;
const TEMP_MAX = 93;

const COLOR_STOPS: [number, number, number][] = [
  [13, 42, 140],
  [24, 80, 190],
  [41, 140, 220],
  [86, 196, 220],
  [190, 226, 160],
  [248, 230, 70],
  [245, 160, 40],
  [222, 60, 30],
  [140, 15, 15],
];

const setColorRgb = (temp: number): [number, number, number] => {
  const ratio = Math.min(
    1,
    Math.max(0, (temp - TEMP_MIN) / (TEMP_MAX - TEMP_MIN))
  );

  const position = ratio * (COLOR_STOPS.length - 1);
  const index = Math.min(COLOR_STOPS.length - 2, Math.floor(position));
  const blend = position - index;

  const [r1, g1, b1] = COLOR_STOPS[index];
  const [r2, g2, b2] = COLOR_STOPS[index + 1];

  return [
    Math.round(r1 + (r2 - r1) * blend),
    Math.round(g1 + (g2 - g1) * blend),
    Math.round(b1 + (b2 - b1) * blend),
  ];
};

export const setColor = (temp: number) => {
  const [r, g, b] = setColorRgb(temp);

  return `rgb(${r}, ${g}, ${b})`;
};

const generateHeatMap = async (binaryData: Buffer) => {
  const canvas = createCanvas(EMPTY_IMAGE_WIDTH, EMPTY_IMAGE_HEIGHT);
  const ctx = canvas.getContext("2d");

  try {
    const image = await loadImage(EMPTY_MAP_IMAGE_PATH);
    ctx.drawImage(image, 0, 0, EMPTY_IMAGE_WIDTH, EMPTY_IMAGE_HEIGHT);

    const tempArr = new Int8Array(binaryData);

    const imageData = ctx.getImageData(
      0,
      0,
      EMPTY_IMAGE_WIDTH,
      EMPTY_IMAGE_HEIGHT
    );
    const pixels = imageData.data;

    for (let py = 0; py < EMPTY_IMAGE_HEIGHT; py++) {
      const gridRow =
        Math.floor(
          ((EMPTY_IMAGE_HEIGHT - 1 - py) * DIMENSION_Y) / EMPTY_IMAGE_HEIGHT
        ) * DIMENSION_X;

      for (let px = 0; px < EMPTY_IMAGE_WIDTH; px++) {
        const temp =
          tempArr[gridRow + Math.floor((px * DIMENSION_X) / EMPTY_IMAGE_WIDTH)];

        if (temp === -1) continue;

        const [r, g, b] = setColorRgb(temp);
        const i = (py * EMPTY_IMAGE_WIDTH + px) * 4;

        pixels[i] = r;
        pixels[i + 1] = g;
        pixels[i + 2] = b;
        pixels[i + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const buf = canvas.toBuffer("image/jpeg");

    return buf;
  } catch (error) {
    throw error;
  }
};

app.get("/api/data", async (req: any, res: any) => {
  try {
    if (cached) {
      res.send(cached);
      return;
    }

    const binaryData = await readBinaryFile(BINARY_FILE_PATH);

    cached = await generateHeatMap(binaryData);

    res.send(cached);
  } catch (error) {
    console.log(error);
    res.status(500).send(`Error: ${error}`);
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
