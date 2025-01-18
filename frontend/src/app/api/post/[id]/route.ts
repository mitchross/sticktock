// pages/api/post/[id].ts
import { parse, serialize } from 'cookie';
import crypto from 'crypto';
import { postSchema } from '../../../../../utils/types/posts';
import { NextRequest } from 'next/server';
import { API_URL_FOR_SERVER, FRONTEND_URL_FOR_BROWSER } from '../../../../../service.config';

function generateSessionToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  const headersList = new Headers();
  const cookies = req.headers.get('cookie')
    ? parse(req.headers.get('cookie') || '')
    : {};
  let sessionToken = cookies['SessionToken'];
  if (!sessionToken) {
    sessionToken = generateSessionToken();
    headersList.set(
      'Set-Cookie',
      serialize('SessionToken', sessionToken, {
        httpOnly: true,
        secure: FRONTEND_URL_FOR_BROWSER.startsWith('https:'),
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      })
    );
  }
  const fetchData = await fetch(
    `${API_URL_FOR_SERVER}/by_id/${id}`
  );

  const jsonData = await fetchData.json();
  const parsedData = postSchema.safeParse(jsonData);

  if (!parsedData.success) {
    return Response.json(parsedData.error, {
      status: 500,
    });
  }

  return Response.json(parsedData.data, {
    status: 200,
    headers: headersList,
  });
}
