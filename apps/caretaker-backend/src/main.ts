import dotenv from 'dotenv';

dotenv.config();

import initApp from './app';

async function startServer() {
  try {
    const PORT = parseInt(process.env.PORT || '3333', 10);
    const app = await initApp();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error)
  }
}

startServer()
  .then(() => console.log("Server started successfully"))
  .catch((error) => console.error(error));

