import { BASE_DOMAIN } from '../../service.config';

/**
 * Get the API URL for browser-side requests
 * This function is evaluated at runtime in the browser, not at build time
 */
export function getApiUrl(): string {
  // Only run in browser
  if (typeof window === 'undefined') {
    return 'http://localhost:2000';
  }

  const hostname = window.location.hostname;
  
  // For local development (localhost or 127.0.0.1)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('[API Config] Running locally, using http://localhost:2000');
    return 'http://localhost:2000';
  }
  
  // For production
  console.log(`[API Config] Running in production, using https://api.${BASE_DOMAIN}`);
  return `https://api.${BASE_DOMAIN}`;
}
