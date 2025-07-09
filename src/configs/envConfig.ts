import dotenv from 'dotenv';
dotenv.config();

const { PORT, NODE_ENV, MONGO_URI } = process.env;

export { PORT, NODE_ENV, MONGO_URI };
