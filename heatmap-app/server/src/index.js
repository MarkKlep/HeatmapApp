"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setColor = exports.readBinaryFile = exports.app = void 0;
var api_server_1 = require("./api/api-server");
var fs = require("fs");
var express = require("express");
var cors = require("cors");
var _a = require("canvas"), createCanvas = _a.createCanvas, loadImage = _a.loadImage;
exports.app = express();
exports.app.use(cors());
var slotWidth = api_server_1.EMPTY_IMAGE_WIDTH / api_server_1.DIMENSION_X;
var slotHeight = api_server_1.EMPTY_IMAGE_HEIGHT / api_server_1.DIMENSION_Y;
var readBinaryFile = function (filePath) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filePath, function (err, data) {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
};
exports.readBinaryFile = readBinaryFile;
var setColor = function (temp) {
    var celcius = (temp - 32) / 1.8;
    var color;
    if (celcius <= 0) {
        color = "blue";
    }
    else if (celcius > 0 && celcius < 10) {
        color = "lightblue";
    }
    else if (celcius >= 10 && celcius < 20) {
        color = "lime";
    }
    else if (celcius >= 20 && celcius < 30) {
        color = "yellow";
    }
    else if (celcius >= 30 && celcius < 40) {
        color = "orange";
    }
    else {
        color = "red";
    }
    return color;
};
exports.setColor = setColor;
var generateHeatMap = function (binaryData) { return __awaiter(void 0, void 0, void 0, function () {
    var canvas, ctx, image, tempArr, y, x, temp, buf, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                canvas = createCanvas(api_server_1.EMPTY_IMAGE_WIDTH, api_server_1.EMPTY_IMAGE_HEIGHT);
                ctx = canvas.getContext("2d");
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, loadImage(api_server_1.EMPTY_MAP_IMAGE_PATH)];
            case 2:
                image = _a.sent();
                ctx.drawImage(image, 0, 0, api_server_1.EMPTY_IMAGE_WIDTH, api_server_1.EMPTY_IMAGE_HEIGHT);
                tempArr = new Int8Array(binaryData);
                for (y = 0; y < api_server_1.DIMENSION_Y; y++) {
                    for (x = 0; x < api_server_1.DIMENSION_X; x++) {
                        temp = tempArr[y * api_server_1.DIMENSION_X + x];
                        if (temp === -1) {
                            continue;
                        }
                        ctx.fillStyle = (0, exports.setColor)(temp);
                        ctx.fillRect(x * slotWidth, api_server_1.EMPTY_IMAGE_HEIGHT - y * slotHeight, slotWidth, slotHeight);
                    }
                }
                buf = canvas.toBuffer("image/jpeg");
                return [2 /*return*/, buf];
            case 3:
                error_1 = _a.sent();
                throw error_1;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.app.get("/api/data", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var binaryData, bufferHeatMap, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, (0, exports.readBinaryFile)(api_server_1.BINARY_FILE_PATH)];
            case 1:
                binaryData = _a.sent();
                return [4 /*yield*/, generateHeatMap(binaryData)];
            case 2:
                bufferHeatMap = _a.sent();
                res.send(bufferHeatMap);
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.log(error_2);
                res.status(500).send("Error: ".concat(error_2));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.app.listen(api_server_1.PORT, function () {
    console.log("Server is running on port: ".concat(api_server_1.PORT));
});
