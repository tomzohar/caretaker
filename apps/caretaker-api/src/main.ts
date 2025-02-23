import dotenv from 'dotenv';

dotenv.config();

import initApp from './app';

async function startServer() {
  try {
    const PORT = process.env.PORT || 3000;
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

