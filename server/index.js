import dotenv from 'dotenv';

import app from './app.js';
import { DEFAULT_PORT } from './utils/constants.js';
import { ensureSeedData } from './utils/seed.js';

dotenv.config();

const port = Number(process.env.PORT || DEFAULT_PORT);

const startServer = async () => {
  await ensureSeedData();

  app.listen(port, () => {
    console.log(`API server ishga tushdi: http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error('Serverni ishga tushirib bo‘lmadi', error);
  process.exit(1);
});
