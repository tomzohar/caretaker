import fs, { existsSync } from 'fs';
import path from "node:path";

const CACHE_FILE_PATH = path.resolve(__dirname + '/cache.json');

class LocalCacheService {
    private cache: Record<string, string> = {};

    constructor() {
        try {
           const cacheExists = fs.existsSync(CACHE_FILE_PATH);
           if (!cacheExists) {
             fs.writeFileSync(CACHE_FILE_PATH, '{}');
           }
            const file = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
            this.cache = JSON.parse(file || '{}');
            console.log('Cache initialized', this.cache);
        } catch (err) {
            console.error('Error reading cache file', err);
        }
    }

    public set(key: string, value: unknown): void {
        this.cache[key] = JSON.stringify(value);
        this.updateCacheFile();
    }

    public get<T>(key: string): T | null {
        if (!this.has(key)) {
            return null;
        }
        try {
            const value = JSON.parse(this.cache[key]) as T;
            return value;
        } catch (err) {
            console.error(`Failed to get value for key ${key}`, err);
            throw err;
        }
    }

    public has(key: string): boolean {
        return !!this.cache[key];
    }

    public remove(key: string) {
        delete this.cache[key];
        this.updateCacheFile();
    }

    public clear() {
        this.cache = {};
        this.updateCacheFile();
    }

    private updateCacheFile() {
        fs.writeFile(
            CACHE_FILE_PATH,
            JSON.stringify(this.cache),
            {},
            (err) => {
                if (err) {
                    console.log(err);
                    throw new Error('Failed to write to cache file')
                }
            }
        );
    }

    get keys() {
        return Object.keys(this.cache || {});
    }

    get values() {
        return Object.values(this.cache || {}).map(v => JSON.parse(v));
    }

    get entries() {
        return Object.entries(this.cache || {})
            .map(([key, value]) => [key, JSON.parse(value)]);
    }

    private log() {
        console.log(this.cache);
    }
}

const localCacheService = new LocalCacheService();
export default localCacheService;
