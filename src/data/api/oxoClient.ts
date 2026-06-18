import axios from 'axios';

// Em produção, usar a URL do tunnel Cloudflare
// Em dev local, usar localhost
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export const oxoClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

oxoClient.interceptors.response.use(
  (r) => r,
  (err) => {
    console.warn('[OXO API]', err?.message);
    return Promise.reject(err);
  },
);
