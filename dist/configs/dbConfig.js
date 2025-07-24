"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
const mongoose_1 = require("mongoose");
const envConfig_1 = require("./envConfig");
const loggerConfig_1 = require("./loggerConfig");
async function connectToDatabase(retryOptions = { maxRetries: 5, initialDelay: 3000 }) {
    let attempts = 0;
    const { maxRetries, initialDelay } = retryOptions;
    async function connectWithRetry() {
        try {
            loggerConfig_1.dbLog.warn(`Attempt ${attempts + 1}: Connecting to database...`);
            if (envConfig_1.MONGO_URI) {
                await (0, mongoose_1.connect)(envConfig_1.MONGO_URI);
            }
            else {
                loggerConfig_1.dbLog.error('Mongo URI is not defined in environment variables.');
            }
            loggerConfig_1.dbLog.info('Database connection successful!');
        }
        catch (error) {
            attempts++;
            const typedError = error;
            loggerConfig_1.dbLog.error(`Error on attempt ${attempts + 1}: ${typedError.message}`);
            if (attempts < maxRetries) {
                const delay = initialDelay * Math.pow(2, attempts - 1);
                loggerConfig_1.dbLog.warn(`Retrying connection in ${delay / 1000}s...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                return connectWithRetry();
            }
            else {
                loggerConfig_1.dbLog.error(`Max retries has been exceeded. Could not connect to DB. Shutting down now....`);
                process.exit(1);
            }
        }
    }
    await connectWithRetry();
}
