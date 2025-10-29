import setupServer from './configs/server.config.js';
import dotenv from 'dotenv';

dotenv.config();

const HOST = process.env.HOST;
const PORT = process.env.PORT;

setupServer()
  .then((server) => {
    server.listen(PORT, () => {
      console.log(`Server running on ${HOST}:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
