const env =
	(globalThis as typeof globalThis & {
		process?: { env: Record<string, string | undefined> };
	}).process?.env ?? {};

export const BASE_DOMAIN = env.NEXT_PUBLIC_BASE_DOMAIN ?? '';

export const FRONTEND_URL_FOR_BROWSER =
	env.NEXT_PUBLIC_FRONTEND_URL ?? 'http://localhost:3000';

export const FRONTEND_URL_FOR_SERVER_SELF =
	env.FRONTEND_URL_FOR_SERVER_SELF ?? 'http://localhost:3000';

export const API_URL_FOR_BROWSER =
	env.NEXT_PUBLIC_API_URL ?? '/api';

export const API_URL_FOR_SERVER =
	env.API_URL_FOR_SERVER ?? 'http://localhost:2000';
