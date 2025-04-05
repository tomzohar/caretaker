import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/database";
import router from "./routes";
import {logRequestMiddleware} from "./routes/middleware";
import { InvitationCleanupService } from "./services";

const isProd = process.env.NODE_ENV === 'production';
const allowedOrigins = isProd 
  ? ['https://caretaker.center']
  : ['http://localhost:4200', 'http://localhost:4300'];

async function initDB() {
    try {
        await AppDataSource.initialize();
        console.log("Database connected successfully");
    } catch (error) {
        console.log(error);
    }
}

async function initApp() {
    const app = express();
    
    app.use(cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) {
                return callback(null, true);
            }
            
            if (allowedOrigins.indexOf(origin) === -1) {
                const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        maxAge: 86400 // 24 hours
    }));
    
    app.use(express.json());
    app.use(logRequestMiddleware);
    app.use(router);

    await initDB();
    
    // Start invitation cleanup service
    InvitationCleanupService.startCleanupSchedule();

    return app;
}

export default initApp;
