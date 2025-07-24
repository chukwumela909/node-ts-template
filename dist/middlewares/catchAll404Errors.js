"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
exports.default = (req, res, next) => {
    return next((0, http_errors_1.default)(404, `Can't ${req.method} '${req.url}'`));
};
