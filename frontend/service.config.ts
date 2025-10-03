export const BASE_DOMAIN = 'example.com';

export const FRONTEND_URL_FOR_BROWSER = `https://www.${BASE_DOMAIN}`;
export const FRONTEND_URL_FOR_SERVER_SELF = `http://localhost:3000`;

// Dynamically determine API URL based on runtime environment
// If running in browser and hostname is localhost, use localhost:2000
// Otherwise use the production API domain
export const API_URL_FOR_BROWSER = typeof window !== 'undefined' 
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? `http://localhost:2000`
      : `https://api.${BASE_DOMAIN}`)
  : `http://localhost:2000`;

// For server-side rendering
// Use Docker internal network if in swarm, otherwise localhost
export const API_URL_FOR_SERVER = process.env.DOCKER_ENV === 'swarm'
  ? `http://backend-api:2000`
  : `http://localhost:2000`;
