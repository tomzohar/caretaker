import dotenv from 'dotenv';
import path from 'path';

const pathToEnv = path.resolve(__dirname + '../../../.env');
dotenv.config({
  path: pathToEnv,
});

async function startServer() {
    try {
        const PORT = process.env.PORT || 3000;
        const initApp = await import('./app').then(m => m.default);
        const app = await initApp();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.log(error)
    }
}

startServer()
    .then(() => console.log("Server started successfully"))
    .catch((error) => console.error(error));
