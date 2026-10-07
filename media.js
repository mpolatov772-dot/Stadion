export const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Faylni o‘qib bo‘lmadi'));
    reader.readAsDataURL(file);
  });

export const readFilesAsDataUrls = async (fileList) => {
  const files = Array.from(fileList || []);
  return Promise.all(files.map((file) => readFileAsDataUrl(file)));
};

export const normalizeTelegramUsername = (value = '') =>
  String(value || '')
    .trim()
    .replace(/^@+/, '');
