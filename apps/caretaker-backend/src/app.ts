import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/database";
import router from "./routes";
import {logRequestMiddleware} from "./routes/middleware";
import { InvitationCleanupService } from "./services";

const isProd = process.env.NODE_ENV === 'production';
const allowedOrigins = isProd 
  ? ['https://caretaker.center', 'https://www.caretaker.center']
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
    
    // Log all incoming requests and their origin
    app.use((req, res, next) => {
        console.log('Incoming request:', {
            origin: req.headers.origin,
            method: req.method,
            path: req.path
        });
        next();
    });

    app.use(cors({
        origin: true, // Allow all origins during debugging
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: '*', // Allow all headers during debugging
        credentials: true
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
