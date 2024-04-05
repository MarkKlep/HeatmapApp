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

const { createCanvas, loadImage } = require("canvas");

export const app = express();
app.use(cors());

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

export const setColor = (temp: number) => {
  const celcius = (temp - 32) / 1.8;
  let color;

  if (celcius <= 0) {
    color = "blue";
  } else if (celcius > 0 && celcius < 10) {
    color = "lightblue";
  } else if (celcius >= 10 && celcius < 20) {
    color = "lime";
  } else if (celcius >= 20 && celcius < 30) {
    color = "yellow";
  } else if (celcius >= 30 && celcius < 40) {
    color = "orange";
  } else {
    color = "red";
  }

  return color;
};

const generateHeatMap = async (binaryData: Buffer) => {
  const canvas = createCanvas(EMPTY_IMAGE_WIDTH, EMPTY_IMAGE_HEIGHT);
  const ctx = canvas.getContext("2d");

  try {
    const image = await loadImage(EMPTY_MAP_IMAGE_PATH);
    ctx.drawImage(image, 0, 0, EMPTY_IMAGE_WIDTH, EMPTY_IMAGE_HEIGHT);

    const tempArr = new Int8Array(binaryData);

    for (let y = 0; y < DIMENSION_Y; y++) {
      for (let x = 0; x < DIMENSION_X; x++) {
        const temp = tempArr[y * DIMENSION_X + x];

        if (temp === -1) {
          continue;
        }

        ctx.fillStyle = setColor(temp);
        ctx.fillRect(
          x * slotWidth,
          EMPTY_IMAGE_HEIGHT - y * slotHeight,
          slotWidth,
          slotHeight
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
