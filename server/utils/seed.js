import bcrypt from 'bcryptjs';

import { writeDb, readDb } from './fileDb.js';
import { ROLES } from './constants.js';

const now = new Date();

const buildIsoDate = (offsetDays = 0) => {
  const date = new Date(now);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
};

export const ensureSeedData = async () => {
  const currentDb = await readDb();

  // Demo ma'lumotlar faqat SEED_DEMO=true bo'lsa yaratiladi.
  // Aks holda loyiha "bo'sh baza" bilan boshlanadi.
  if (process.env.SEED_DEMO !== 'true') {
    return currentDb;
  }

  if (currentDb.users?.length) {
    return currentDb;
  }

  const users = [
    {
      _id: 'user-owner-1',
      fullName: 'Aziz Beknazarov',
      email: 'owner@stadionhub.uz',
      phone: '+998901112233',
      role: ROLES.STADIUM_OWNER,
      avatar: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?auto=format&fit=crop&w=400&q=80',
      passwordHash: bcrypt.hashSync('Owner123!', 10),
      preferences: {
        notifications: true,
        weeklyDigest: true,
        compactCards: false,
        proFeaturesPreview: true,
      },
      createdAt: buildIsoDate(-30),
    },
    {
      _id: 'user-seller-1',
      fullName: 'Sardor Xasanov',
      email: 'seller@stadionhub.uz',
      phone: '+998909998877',
      role: ROLES.SELLER,
      avatar: 'https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=400&q=80',
      passwordHash: bcrypt.hashSync('Seller123!', 10),
      preferences: {
        notifications: true,
        weeklyDigest: true,
        compactCards: true,
        proFeaturesPreview: false,
      },
      createdAt: buildIsoDate(-25),
    },
    {
      _id: 'user-fan-1',
      fullName: 'Jahongir Aliyev',
      email: 'user@stadionhub.uz',
      phone: '+998937778899',
      role: ROLES.USER,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      passwordHash: bcrypt.hashSync('User123!', 10),
      preferences: {
        notifications: true,
        weeklyDigest: false,
        compactCards: false,
        proFeaturesPreview: false,
      },
      createdAt: buildIsoDate(-12),
    },
    {
      _id: 'user-admin-1',
      fullName: 'Tizim administratori',
      email: 'admin@stadionhub.uz',
      phone: '+998900000000',
      role: ROLES.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
      passwordHash: bcrypt.hashSync('Admin123!', 10),
      preferences: {
        notifications: true,
        weeklyDigest: true,
        compactCards: true,
        proFeaturesPreview: true,
      },
      createdAt: buildIsoDate(-100),
    },
  ];

  const news = [
    {
      _id: 'news-1',
      title: "Toshkentda tungi futbol seanslariga talab oshmoqda",
      description:
        "Shahar futbolchilari kechki vaqt oralig'ini ko'proq tanlamoqda, bu esa stadion egalarini yoritish va qulaylikni yaxshilashga undamoqda.",
      image: 'https://images.unsplash.com/photo-1543357480-c60d40007a3f?auto=format&fit=crop&w=1200&q=80',
      publishedAt: buildIsoDate(-1),
      category: 'Local',
    },
    {
      _id: 'news-2',
      title: "Havaskor futbol jamoalarida jihozlarga talab kuchaydi",
      description:
        "Sotuvchilar O'zbekiston bo'ylab mashg'ulot manishkalari, ko'chma darvozalar va sifatli o'yin to'plariga talab oshganini aytmoqda.",
      image: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80',
      publishedAt: buildIsoDate(-3),
      category: 'Marketplace',
    },
    {
      _id: 'news-3',
      title: "Egalar haftalik ligalar uchun yaxshiroq jadval vositalariga e'tibor qaratmoqda",
      description:
        "Bron ishonchliligi va to'lov shaffofligi mustaqil stadion egalari uchun asosiy operatsion ustuvor yo'nalishga aylanmoqda.",
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      publishedAt: buildIsoDate(-6),
      category: 'Operations',
    },
  ];

  const seedDb = {
    meta: {
      seeded: true,
      seededAt: new Date().toISOString(),
    },
    users,
    stadiums: [],
    bookings: [],
    products: [],
    payments: [],
    orders: [],
    reports: [],
    blocks: [],
    unblockRequests: [],
    news,
    feed: [],
    messages: [],
    notifications: [],
  };

  await writeDb(seedDb);
  return seedDb;
};
