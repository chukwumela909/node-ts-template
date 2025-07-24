"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.pingServer = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const catchAsync_1 = __importDefault(require("./catchAsync"));
// Format uptime in readable format
const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const parts = [];
    if (days > 0)
        parts.push(`${days}d`);
    if (hours > 0)
        parts.push(`${hours}h`);
    if (minutes > 0)
        parts.push(`${minutes}m`);
    if (secs > 0)
        parts.push(`${secs}s`);
    return parts.length > 0 ? parts.join(' ') : '0s';
};
// Simple ping function
const pingServer = async (url) => {
    try {
        const response = await fetch(url);
        return response.ok ? 'online' : 'offline';
    }
    catch (error) {
        return 'offline';
    }
};
exports.pingServer = pingServer;
// Simple health check middleware
exports.healthCheck = (0, catchAsync_1.default)(async (req, res, next) => {
    const dbStatus = mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({
        status: 'success',
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: formatUptime(Math.floor(process.uptime())),
        database: dbStatus,
        server: 'online',
    });
});
