// API Configuration
export const API_URL = __DEV__
  ? 'http://10.0.2.2:8000' // Android emulator
  // ? 'http://localhost:8000' // iOS simulator
  // ? 'http://192.168.1.100:8000' // Physical device (replace with your LAN IP)
  : 'https://your-production-api.com';

export const CONFIG = {
  API_TIMEOUT: 10000,
  REFRESH_INTERVAL: 1000,
  DEBOUNCE_DELAY: 500,
};