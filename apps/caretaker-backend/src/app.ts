import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/database";
import router from "./routes";
import {logRequestMiddleware} from "./routes/middleware";
import { InvitationCleanupService } from "./services";

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
    app.use(cors());
    app.use(express.json());
    app.use(logRequestMiddleware);
    app.use(router);

    await initDB();
    
    // Start invitation cleanup service
    InvitationCleanupService.startCleanupSchedule();

    return app;
}


export default initApp;
