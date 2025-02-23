/**
 * DO NOT RUN THIS FILE UNLESS YOU INTEND TO LOSE ALL DATA
 */
import * as dotenv from "dotenv";

dotenv.config();


import {AppDataSource} from "./src/config/database";
import LocalCacheService from "./src/cache/local-cache-service";

AppDataSource.initialize()
    .then(async () => {
        console.log('DB Connection established');
        console.log('Dropping DB...');
        return AppDataSource.dropDatabase();
    })
    .then(() => {
        console.log('Done.');
        LocalCacheService.clear();
        console.log('Local cache cleared');
        process.exit(0);
    })
    .catch(error => {
        console.log(error);
        process.exit(1);
    });
