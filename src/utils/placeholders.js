const buildPlaceholder = (title, accent) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="720" fill="url(#bg)" />
      <circle cx="1020" cy="150" r="120" fill="rgba(255,255,255,0.08)" />
      <circle cx="890" cy="280" r="48" fill="rgba(255,255,255,0.08)" />
      <text x="90" y="320" fill="#86efac" font-family="Arial, sans-serif" font-size="28">STADION MARKAZI</text>
      <text x="90" y="390" fill="#ffffff" font-family="Arial, sans-serif" font-size="56" font-weight="700">${title}</text>
    </svg>
  `)}`;

export const productPlaceholderImage = buildPlaceholder('Mahsulot rasmi', '#15803d');
export const stadiumPlaceholderImage = buildPlaceholder('Stadion rasmi', '#1d4ed8');
