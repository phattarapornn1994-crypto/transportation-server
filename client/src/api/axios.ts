import axios from 'axios';
import { getApiUrl } from '../config';

// สร้าง axios instance ที่ตั้งค่า base URL อัตโนมัติ
const apiClient = axios.create();

// Request interceptor เพื่อเพิ่ม base URL
apiClient.interceptors.request.use((config) => {
  // ถ้ามี API_URL ตั้งค่าไว้ (production) ให้ใช้ full URL
  // ถ้าไม่มี (development) จะใช้ relative path ที่จะถูก proxy โดย Vite
  if (config.url) {
    config.url = getApiUrl(config.url);
  }
  return config;
});

export default apiClient;

