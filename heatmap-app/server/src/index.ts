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

export const app = express();
app.use(cors());

const GRID_STEP = 10;

const slotWidth = EMPTY_IMAGE_WIDTH / DIMENSION_X;
const slotHeight = EMPTY_IMAGE_HEIGHT / DIMENSION_Y;

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

export const setColor = (temp: number) => {
  const ratio = Math.min(
    1,
    Math.max(0, (temp - TEMP_MIN) / (TEMP_MAX - TEMP_MIN))
  );

  const position = ratio * (COLOR_STOPS.length - 1);
  const index = Math.min(COLOR_STOPS.length - 2, Math.floor(position));
  const blend = position - index;

  const [r1, g1, b1] = COLOR_STOPS[index];
  const [r2, g2, b2] = COLOR_STOPS[index + 1];

  const r = Math.round(r1 + (r2 - r1) * blend);
  const g = Math.round(g1 + (g2 - g1) * blend);
  const b = Math.round(b1 + (b2 - b1) * blend);

  return `rgb(${r}, ${g}, ${b})`;
};

const generateHeatMap = async (binaryData: Buffer) => {
  const canvas = createCanvas(EMPTY_IMAGE_WIDTH, EMPTY_IMAGE_HEIGHT);
  const ctx = canvas.getContext("2d");

  try {
    const image = await loadImage(EMPTY_MAP_IMAGE_PATH);
    ctx.drawImage(image, 0, 0, EMPTY_IMAGE_WIDTH, EMPTY_IMAGE_HEIGHT);

    const tempArr = new Int8Array(binaryData);

    for (let y = 0; y < DIMENSION_Y; y += GRID_STEP) {
      for (let x = 0; x < DIMENSION_X; x += GRID_STEP) {
        const temp = tempArr[y * DIMENSION_X + x];

        if (temp === -1) {
          continue;
        }

        ctx.fillStyle = setColor(temp);
        ctx.fillRect(
          x * slotWidth,
          EMPTY_IMAGE_HEIGHT - y * slotHeight,
          slotWidth * GRID_STEP,
          slotHeight * GRID_STEP
        );
      }
    }

    const buf = canvas.toBuffer("image/jpeg");

    return buf;
  } catch (error) {
    throw error;
  }
};

app.get("/api/data", async (req: any, res: any) => {
  try {
    const binaryData = await readBinaryFile(BINARY_FILE_PATH);
    const bufferHeatMap = await generateHeatMap(binaryData);
    res.send(bufferHeatMap);
  } catch (error) {
    console.log(error);
    res.status(500).send(`Error: ${error}`);
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
