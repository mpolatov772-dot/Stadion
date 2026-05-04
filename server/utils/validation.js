import { AppError } from './appError.js';
import {
  PUBLIC_SIGNUP_ROLES,
  UZBEKISTAN_BOUNDS,
  UZBEKISTAN_CITIES,
  UZBEKISTAN_CITY_COORDINATES,
} from './constants.js';

export const assertRequired = (fields, payload) => {
  const missing = fields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length) {
    throw new AppError(`Missing required fields: ${missing.join(', ')}`, 400);
  }
};

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const normalizeList = (items = []) =>
  items
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean);

export const normalizeStadiumName = (value = '') =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

export const phoneticStadiumName = (value = '') =>
  normalizeStadiumName(value)
    .replace(/ce/g, 'se')
    .replace(/ci/g, 'si')
    .replace(/c/g, 'k')
    .replace(/q/g, 'k')
    .replace(/ph/g, 'f')
    .replace(/x/g, 'ks')
    .replace(/w/g, 'v');

export const levenshteinDistance = (source = '', target = '') => {
  const rows = target.length + 1;
  const cols = source.length + 1;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let row = 0; row < rows; row += 1) matrix[row][0] = row;
  for (let col = 0; col < cols; col += 1) matrix[0][col] = col;

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = source[col - 1] === target[row - 1] ? 0 : 1;
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + cost,
      );
    }
  }

  return matrix[target.length][source.length];
};

export const areStadiumNamesConflicting = (incomingName, existingName) => {
  const incoming = normalizeStadiumName(incomingName);
  const current = normalizeStadiumName(existingName);
  const incomingPhonetic = phoneticStadiumName(incomingName);
  const currentPhonetic = phoneticStadiumName(existingName);

  if (!incoming || !current) return false;
  if (incoming === current) return true;
  if (incomingPhonetic === currentPhonetic) return true;

  const distance = levenshteinDistance(incoming, current);
  const maxLength = Math.max(incoming.length, current.length);
  const similarityScore = 1 - distance / maxLength;

  return distance <= 2 || similarityScore >= 0.84;
};

export const assertSignupRole = (role) => {
  if (!PUBLIC_SIGNUP_ROLES.includes(role)) {
    throw new AppError('The selected role is not allowed for signup', 400);
  }
};

const isInsideUzbekistanBounds = (latNumber, lngNumber) =>
  !Number.isNaN(latNumber) &&
  !Number.isNaN(lngNumber) &&
  latNumber >= UZBEKISTAN_BOUNDS.minLat &&
  latNumber <= UZBEKISTAN_BOUNDS.maxLat &&
  lngNumber >= UZBEKISTAN_BOUNDS.minLng &&
  lngNumber <= UZBEKISTAN_BOUNDS.maxLng;

export const normalizeUzbekistanLocation = (location = {}) => {
  const { city } = location;

  if (!city || !UZBEKISTAN_CITIES.includes(city)) {
    throw new AppError('Stadium city must be one of the supported Uzbekistan cities', 400);
  }

  const latNumber = Number(location.lat);
  const lngNumber = Number(location.lng);
  const fallbackCoordinates = UZBEKISTAN_CITY_COORDINATES[city];

  return {
    city,
    address: location.address?.trim() || '',
    lat: isInsideUzbekistanBounds(latNumber, lngNumber) ? latNumber : fallbackCoordinates.lat,
    lng: isInsideUzbekistanBounds(latNumber, lngNumber) ? lngNumber : fallbackCoordinates.lng,
  };
};

export const assertUzbekistanLocation = (location = {}) => {
  normalizeUzbekistanLocation(location);
};

export const assertPositiveNumber = (value, label) => {
  const number = Number(value);

  if (Number.isNaN(number) || number < 0) {
    throw new AppError(`${label} must be a positive number`, 400);
  }

  return number;
};
