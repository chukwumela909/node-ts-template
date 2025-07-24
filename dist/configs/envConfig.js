"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SENTRY_DSN = exports.MONGO_URI = exports.NODE_ENV = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { PORT, NODE_ENV, MONGO_URI, SENTRY_DSN } = process.env;
exports.PORT = PORT;
exports.NODE_ENV = NODE_ENV;
exports.MONGO_URI = MONGO_URI;
exports.SENTRY_DSN = SENTRY_DSN;
