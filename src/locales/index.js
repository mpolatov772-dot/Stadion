import uz from './uz.json';
import { uzExtra } from './uz-extra';

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const deepMerge = (base, extension) => {
  if (!isObject(base) || !isObject(extension)) {
    return extension;
  }

  const result = { ...base };

  Object.entries(extension).forEach(([key, value]) => {
    result[key] = isObject(value) && isObject(base[key]) ? deepMerge(base[key], value) : value;
  });

  return result;
};

export const DEFAULT_LOCALE = 'uz';

export const locales = {
  uz: deepMerge(uz, uzExtra),
};
