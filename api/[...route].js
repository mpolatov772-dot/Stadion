import dotenv from 'dotenv';

import app from '../server/app.js';
import { ensureSeedData } from '../server/utils/seed.js';

dotenv.config();

export default async function handler(req, res) {
  try {
    await ensureSeedData();
    return app(req, res);
  } catch (error) {
    console.error('Vercel API handler xatosi', error);

    return res.status(500).json({
      success: false,
      message: 'Server initialization failed',
    });
  }
}
