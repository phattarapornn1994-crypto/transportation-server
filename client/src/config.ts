// API Configuration
// ใน development จะใช้ proxy จาก vite.config.ts
// ใน production จะใช้ VITE_API_URL จาก environment variable
export const API_URL = import.meta.env.VITE_API_URL || '';

// Helper function สำหรับสร้าง API endpoint
export const getApiUrl = (endpoint: string): string => {
  // ถ้ามี API_URL ตั้งค่าไว้ (production) ให้ใช้ full URL
  if (API_URL) {
    // ตรวจสอบว่า endpoint เริ่มต้นด้วย / หรือไม่
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    // ตรวจสอบว่า API_URL จบด้วย / หรือไม่
    const cleanApiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    return `${cleanApiUrl}${cleanEndpoint}`;
  }
  // Development: ใช้ relative path (จะถูก proxy โดย Vite)
  return endpoint;
};

