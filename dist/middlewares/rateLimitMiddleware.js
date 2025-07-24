"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bypassRateLimitForTrustedIPs = exports.trustedIPs = exports.skipRateLimitFor = exports.rateLimitInfo = exports.createDynamicRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const loggerConfig_1 = require("../configs/loggerConfig");
const envConfig_1 = require("../configs/envConfig");
// Dynamic rate limiter based on user authentication status
const createDynamicRateLimiter = (authenticatedMax, guestMax) => {
    return (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: (req) => {
            // If user is authenticated (you can check for JWT token, session, etc.)
            // For now, we'll use a simple check - you can modify this based on your auth implementation
            const isAuthenticated = req.headers.authorization || req.headers['x-auth-token'];
            if (isAuthenticated) {
                return envConfig_1.NODE_ENV === 'production' ? authenticatedMax : authenticatedMax * 10;
            }
            return envConfig_1.NODE_ENV === 'production' ? guestMax : guestMax * 10;
        },
        message: {
            status: 'error',
            message: 'Rate limit exceeded. Consider signing in for higher limits.',
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            const isAuthenticated = req.headers.authorization || req.headers['x-auth-token'];
            loggerConfig_1.globalLog.warn(`Dynamic rate limit exceeded for ${isAuthenticated ? 'authenticated' : 'guest'} user from IP: ${req.ip} on route: ${req.originalUrl}`);
            res.status(429).json({
                status: 'error',
                message: 'Rate limit exceeded. Consider signing in for higher limits.',
            });
        },
    });
};
exports.createDynamicRateLimiter = createDynamicRateLimiter;
// Rate limiting info middleware - adds rate limit info to response headers
const rateLimitInfo = (req, res, next) => {
    // Add custom headers with rate limit information
    res.setHeader('X-RateLimit-Policy', 'Dynamic based on authentication');
    res.setHeader('X-RateLimit-Environment', envConfig_1.NODE_ENV || 'development');
    next();
};
exports.rateLimitInfo = rateLimitInfo;
// Skip rate limiting for certain conditions (e.g., internal requests, health checks)
const skipRateLimitFor = (paths) => {
    return (req, res, next) => {
        // Skip rate limiting for specified paths
        if (paths.some(path => req.path.startsWith(path))) {
            return next();
        }
        // Skip for localhost in development
        if (envConfig_1.NODE_ENV !== 'production' && (req.ip === '127.0.0.1' || req.ip === '::1')) {
            return next();
        }
        next();
    };
};
exports.skipRateLimitFor = skipRateLimitFor;
// Rate limit bypass for trusted IPs (you can add your trusted IPs here)
exports.trustedIPs = ['127.0.0.1', '::1']; // Add your trusted IPs
const bypassRateLimitForTrustedIPs = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    if (exports.trustedIPs.includes(clientIP)) {
        // Skip rate limiting for trusted IPs
        return next();
    }
    next();
};
exports.bypassRateLimitForTrustedIPs = bypassRateLimitForTrustedIPs;
