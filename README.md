# goalx

React, Vite, Tailwind CSS va Express asosida qurilgan minimal futbol platformasi.

## Texnologiyalar

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Ma’lumotlar qatlami: dev uchun lokal JSON ombor (model/controller/route tuzilmasi bilan), keyinroq MongoDB’ga oson almashtirish mumkin

## Ishga tushirish

1. Agar standart sozlamalarni o‘zgartirmoqchi bo‘lsangiz, `.env.example` faylini `.env` ga nusxalang.
2. Kutubxonalarni o‘rnating:

```bash
npm install
```

3. Frontend va backend’ni birga ishga tushiring:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Tayyor (seed) hisoblar

- Foydalanuvchi: `user@stadionhub.uz` / `User123!`
- Sotuvchi: `seller@stadionhub.uz` / `Seller123!`
- Stadion egasi: `owner@stadionhub.uz` / `Owner123!`

Backend ichida yashirin admin roli ham bor, lekin u ro‘yxatdan o‘tish interfeysida ko‘rsatilmagan.

## Asosiy funksiyalar

- JWT autentifikatsiya va lokal sessiya
- Stadionlar ro‘yxati, xarita, noyob nom tekshiruvi va bronni himoyalash
- Blok/kelmaslik (no-show) oqimi va blokni ochish so‘rovlari
- 30% avans va 100% to‘lov (100% to‘lovda avtomatik 10% chegirma)
- Do‘kon: sotuvchi mahsulot boshqaruvi va xaridor checkout
- Sotuvchi va stadion egalari uchun umumiy lenta (feed)
- Egalar uchun moliyaviy hisobotlar (grafiklar bilan)
- Futbol yangiliklari bo‘limi (maket)
- Rolga asoslangan panel, profil va sozlamalar
