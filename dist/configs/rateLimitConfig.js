"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const envConfig_1 = require("./envConfig");
// Simple rate limiter for all routes
exports.rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: envConfig_1.NODE_ENV === 'production' ? 100 : 1000, // 100 requests per 15 minutes in production, 1000 in development
    message: {
        status: 'error',
        message: 'Too many requests, please try again later.',
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable legacy headers
});
