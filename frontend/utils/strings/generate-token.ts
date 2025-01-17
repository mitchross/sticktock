import { NextApiRequest, NextApiResponse } from 'next';
import { parse, serialize } from 'cookie';
import crypto from 'crypto';
import { FRONTEND_NEXT_INTERNAL_URL } from '../../service.config';

export function generateSessionToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

export function getSessionToken(req: NextApiRequest, res: NextApiResponse) {
  const cookies = parse(req.headers.cookie || '');
  let sessionToken = cookies['SessionToken'];

  if (!sessionToken) {
    sessionToken = generateSessionToken();
    res.setHeader(
      'Set-Cookie',
      serialize('SessionToken', sessionToken, {
        httpOnly: true,
        secure: FRONTEND_NEXT_INTERNAL_URL.startsWith('https:'),
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      })
    );
  }

  return sessionToken;
}
