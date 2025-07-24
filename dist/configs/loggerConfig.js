"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLog = exports.dbLog = exports.globalLog = void 0;
const winston_1 = require("winston");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
require("winston-daily-rotate-file");
const logDir = path_1.default.join(__dirname, '../../', 'logs');
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
const { combine, timestamp, label, printf, colorize } = winston_1.format;
const logLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
    },
};
function logger(labelName) {
    return (0, winston_1.createLogger)({
        levels: logLevels.levels,
        format: combine(label({ label: labelName }), // Helps identify where you're logging from
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Timestamp format
        printf(({ timestamp, level, message, label }) => {
            return `[${level}] : ${timestamp} [${label}] : ${message}`;
        })),
        transports: [
            new winston_1.transports.Console({
                level: 'info',
                format: winston_1.format.combine(colorize({ all: true }), winston_1.format.simple()), // colorize the console output, and show simple format
            }),
            new winston_1.transports.DailyRotateFile({
                level: 'error',
                filename: 'logs/error-%DATE%.log',
                datePattern: 'YYYY-MM-DD-HH',
                zippedArchive: true, // Compress old log files
                maxSize: '20m', // maximum size of 20MB
                maxFiles: '14d', // keep log files for a total of 14 days
                format: winston_1.format.combine(winston_1.format.json(), winston_1.format.timestamp(), winston_1.format.prettyPrint()),
            }), // Log all error files to logs/error.log
            new winston_1.transports.DailyRotateFile({
                level: 'info',
                filename: 'logs/combined-%DATE%.log',
                datePattern: 'YYYY-MM-DD-HH',
                zippedArchive: true, // Compress old log files
                maxSize: '20m', // maximum size of 20MB
                maxFiles: '14d', // keep log files for a total of 14 days
                format: winston_1.format.combine(winston_1.format.json(), winston_1.format.timestamp(), winston_1.format.prettyPrint()),
            }), // Log all information files to logs/combined.log
        ],
    });
}
const globalLog = logger('Global');
exports.globalLog = globalLog;
const dbLog = logger('Database');
exports.dbLog = dbLog;
const authLog = logger('Auth');
exports.authLog = authLog;
// Catch unhandled promise rejections
process.on('unhandledRejection', (error) => {
    globalLog.error(`Unhandled Rejection : ${error.message || error}`);
    // Shutting down the application is optional
    process.exit(1);
});
// Catch uncaught exceptions
process.on('uncaughtException', (error) => {
    globalLog.error(`Uncaught Exceptions : ${error.message || error}`);
    // Shutting down the applicaiton is ooptional
    process.exit(1);
});
// Catch warnings
process.on('warning', (warning) => {
    globalLog.warn(`Warning : ${warning.message || warning}`);
});
