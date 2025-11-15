
// API Base URL Configuration - Used across the entire application
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default API_BASE_URL;

// Export as named export as well for flexibility
export { API_BASE_URL };
