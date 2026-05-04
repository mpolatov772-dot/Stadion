export const DEFAULT_PORT = 5000;

export const ROLES = {
  USER: 'user',
  SELLER: 'seller',
  STADIUM_OWNER: 'stadiumOwner',
  ADMIN: 'admin',
};

export const PUBLIC_SIGNUP_ROLES = [ROLES.USER, ROLES.SELLER, ROLES.STADIUM_OWNER];

export const BOOKING_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  NO_SHOW: 'no_show',
};

export const PAYMENT_OPTIONS = {
  PREPAY_30: 'PREPAY_30',
  FULL_100: 'FULL_100',
  OFFLINE: 'OFFLINE',
};

export const PAYMENT_CONTEXTS = {
  STADIUM: 'stadium',
  PRODUCT: 'product',
};

export const UZBEKISTAN_CITIES = [
  'Tashkent',
  'Samarkand',
  'Bukhara',
  'Namangan',
  'Andijan',
  'Fergana',
  'Nukus',
  'Karshi',
  'Termez',
  'Urgench',
  'Jizzakh',
  'Gulistan',
  'Navoi',
];

export const UZBEKISTAN_CITY_COORDINATES = {
  Tashkent: { lat: 41.3111, lng: 69.2797 },
  Samarkand: { lat: 39.6542, lng: 66.9597 },
  Bukhara: { lat: 39.7681, lng: 64.4556 },
  Namangan: { lat: 41.0011, lng: 71.6726 },
  Andijan: { lat: 40.7821, lng: 72.3442 },
  Fergana: { lat: 40.3864, lng: 71.7843 },
  Nukus: { lat: 42.4600, lng: 59.6166 },
  Karshi: { lat: 38.8610, lng: 65.7847 },
  Termez: { lat: 37.2242, lng: 67.2783 },
  Urgench: { lat: 41.5500, lng: 60.6333 },
  Jizzakh: { lat: 40.1158, lng: 67.8422 },
  Gulistan: { lat: 40.4897, lng: 68.7842 },
  Navoi: { lat: 40.1039, lng: 65.3688 },
};

export const UZBEKISTAN_BOUNDS = {
  minLat: 37.0,
  maxLat: 45.8,
  minLng: 55.9,
  maxLng: 73.2,
};

export const TELEGRAM_USERNAME = 'tohtasinov10';

export const USER_BLOCK_STRIKE_LIMIT = 10;
export const USER_BLOCK_COOLDOWN_HOURS = 24;

export const WEEKDAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];
