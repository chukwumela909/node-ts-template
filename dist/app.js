"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Sentry = __importStar(require("@sentry/node"));
const cors_1 = __importDefault(require("cors"));
const examRoutes_1 = __importDefault(require("./routes/examRoutes"));
const submissionRoutes_1 = __importDefault(require("./routes/submissionRoutes"));
const catchAll404Errors_1 = __importDefault(require("./middlewares/catchAll404Errors"));
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
const health_1 = require("./utils/health");
const dbConfig_1 = require("./configs/dbConfig");
const rateLimitConfig_1 = require("./configs/rateLimitConfig");
require("./configs/sentryConfig");
const app = (0, express_1.default)();
// connect to DB
(0, dbConfig_1.connectToDatabase)();
// Rate limiting - Apply to all requests
app.use(rateLimitConfig_1.rateLimiter);
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
// Routes
app.get('/', async (req, res, next) => {
    res.status(200).send({
        status: 'success',
        message: 'Api is live',
    });
});
app.use('/health', health_1.healthCheck);
app.use('/api/v1/exams', examRoutes_1.default);
app.use('/api/v1/submissions', submissionRoutes_1.default);
app.get('/debug-sentry', (req, res) => {
    throw new Error('My first Sentry error!');
});
// Test rate limiting endpoint
app.get('/test-rate-limit', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Rate limiting test endpoint',
        timestamp: new Date().toISOString(),
        ip: req.ip,
        rateLimitInfo: {
            remaining: res.getHeader('X-RateLimit-Remaining'),
            limit: res.getHeader('X-RateLimit-Limit'),
            reset: res.getHeader('X-RateLimit-Reset'),
        },
    });
});
// Error handlers
Sentry.setupExpressErrorHandler(app); // sentry error handler middleware
app.use(catchAll404Errors_1.default); // Catch all 404 errors...
app.use(errorHandler_1.default); // Catch all errors...
exports.default = app;
