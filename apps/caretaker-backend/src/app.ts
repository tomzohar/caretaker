import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/database";
import router from "./routes";
import {logRequestMiddleware} from "./routes/middleware";
import { InvitationCleanupService } from "./services";

const isProd = process.env.NODE_ENV === 'production';

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

    // Single CORS configuration
    app.use(cors({
        origin: 'https://caretaker.center',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Origin',
            'Accept',
            'X-Requested-With'
        ],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204
    }));
    
    // Request logging
    app.use((req, res, next) => {
        console.log('Request:', {
            method: req.method,
            path: req.path,
            origin: req.headers.origin,
            headers: req.headers
        });
        next();
    });

    app.use(express.json());
    app.use(logRequestMiddleware);
    
    app.use(router);

    await initDB();
    
    // Start invitation cleanup service
    InvitationCleanupService.startCleanupSchedule();

    return app;
}

export default initApp;
