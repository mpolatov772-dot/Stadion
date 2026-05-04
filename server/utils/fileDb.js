import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const bundledDbDirectory = path.resolve(__dirname, '../data');
const bundledDbFilePath = path.join(bundledDbDirectory, 'db.json');
const isVercelRuntime = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
const runtimeDbDirectory = isVercelRuntime ? path.join('/tmp', 'goalx-data') : bundledDbDirectory;
const runtimeDbFilePath = path.join(runtimeDbDirectory, 'db.json');

const defaultDb = {
  meta: {
    seeded: false,
  },
  users: [],
  stadiums: [],
  bookings: [],
  products: [],
  payments: [],
  orders: [],
  reports: [],
  blocks: [],
  unblockRequests: [],
  news: [],
  feed: [],
  messages: [],
  notifications: [],
  loginCodes: [],
};

const mergeDefaults = (rawDb = {}) => ({
  ...defaultDb,
  ...rawDb,
  meta: {
    ...defaultDb.meta,
    ...(rawDb.meta || {}),
  },
});

let cachedDb = null;
let cachedDbLoaded = false;
let updateChain = Promise.resolve();

const buildInitialDb = async () => {
  try {
    const raw = await readFile(bundledDbFilePath, 'utf8');
    return mergeDefaults(raw ? JSON.parse(raw) : defaultDb);
  } catch {
    return defaultDb;
  }
};

export const ensureDbFile = async () => {
  await mkdir(runtimeDbDirectory, { recursive: true });

  try {
    await readFile(runtimeDbFilePath, 'utf8');
  } catch {
    const initialDb = await buildInitialDb();
    await writeFile(runtimeDbFilePath, JSON.stringify(initialDb, null, 2), 'utf8');
  }
};

export const readDb = async () => {
  await ensureDbFile();
  if (cachedDbLoaded && cachedDb) {
    return cachedDb;
  }
  const raw = await readFile(runtimeDbFilePath, 'utf8');
  cachedDb = mergeDefaults(raw ? JSON.parse(raw) : defaultDb);
  cachedDbLoaded = true;
  return cachedDb;
};

export const writeDb = async (db) => {
  await ensureDbFile();
  const nextDb = mergeDefaults(db);
  cachedDb = nextDb;
  cachedDbLoaded = true;
  await writeFile(runtimeDbFilePath, JSON.stringify(nextDb, null, 2), 'utf8');
};

export const updateDb = async (updater) => {
  updateChain = updateChain.then(async () => {
    const db = await readDb();
    const result = await updater(db);
    await writeDb(db);
    return result;
  });
  return updateChain;
};
