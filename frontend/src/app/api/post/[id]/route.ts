// pages/api/post/[id].ts
import { parse, serialize } from 'cookie';
import crypto from 'crypto';
import { postSchema } from '../../../../../utils/types/posts';
import { NextRequest } from 'next/server';
import { BACKEND_API_URL, FRONTEND_NEXT_INTERNAL_URL } from '../../../../../service.config';

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
        secure: FRONTEND_NEXT_INTERNAL_URL.startsWith('https:'),
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      })
    );
  }
  console.log({
    fetching: `${BACKEND_API_URL}/by_id/${id}`,
  });
  const fetchData = await fetch(
    `${BACKEND_API_URL}/by_id/${id}`
  );

  const jsonData = await fetchData.json();
  console.log({
    jsonData,
  });
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
