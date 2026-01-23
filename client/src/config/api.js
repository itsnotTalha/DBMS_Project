// ============================================================
// API CONFIGURATION
// ============================================================
// Change the SERVER_URL below to point to your backend server.
// For local development: 'http://localhost:5000'
// For remote backend: 'http://100.108.xx.xx:5000'
// ============================================================

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

// Base API endpoints
export const API_BASE = `${SERVER_URL}/api`;
export const API_AUTH = `${SERVER_URL}/api/auth`;
export const API_MANUFACTURER = `${SERVER_URL}/api/manufacturer`;
export const API_RETAILER = `${SERVER_URL}/api/retailer`;
export const API_CUSTOMER = `${SERVER_URL}/api/customer`;
export const API_ADMIN = `${SERVER_URL}/api/admin`;
export const API_SETTINGS = `${SERVER_URL}/api/settings`;

// Export the raw server URL for special cases
export { SERVER_URL };

// Default export for convenience
export default {
  SERVER_URL,
  API_BASE,
  API_AUTH,
  API_MANUFACTURER,
  API_RETAILER,
  API_CUSTOMER,
  API_ADMIN,
  API_SETTINGS
};
