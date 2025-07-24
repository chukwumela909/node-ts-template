"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const envConfig_1 = require("./configs/envConfig");
const DEFAULT_PORT = Number(envConfig_1.PORT);
const httpServer = (0, http_1.createServer)(app_1.default);
httpServer.listen(DEFAULT_PORT, () => {
    console.log(`Server listening on 'http://localhost:${DEFAULT_PORT}'`);
});
