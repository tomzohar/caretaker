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
            path: req.path,
            headers: req.headers
        });
        next();
    });

    // Configure CORS
    app.use(cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.log(`Origin ${origin} not allowed by CORS`);
                callback(null, true); // Allow all origins in development
            }
        },
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
    
    app.use(express.json());
    app.use(logRequestMiddleware);
    app.use(router);

    await initDB();
    
    // Start invitation cleanup service
    InvitationCleanupService.startCleanupSchedule();

    return app;
}

export default initApp;
