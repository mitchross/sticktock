import { redirect } from 'next/navigation';
import { API_URL_FOR_SERVER } from '../../../service.config';

const proccess = async (catchAll: string[]) => {
  try {
    const buildUrl = `https://tiktok.com/${catchAll.join('/')}`;

    // quick server-side guard for obvious asset paths
    try {
      const u = new URL(buildUrl);
      if (/\.(jpg|jpeg|png|gif|mp4|webm|svg|ico)(\?|$)/i.test(u.pathname) || /\/authors\//.test(u.pathname)) {
        return { redirectTarget: '/404' };
      }
    } catch (e) {
      // ignore
    }

    const getData = await fetch(
      `${API_URL_FOR_SERVER}/by_url/${encodeURIComponent(
        buildUrl
      )}`
    );

    // DEBUG
    console.log(`call to ${getData.status} returns ${getData.status}`);

    const res = await getData.json();
    console.log(res);
    return {
      redirectTarget: res.id ? `/post/${res.id}` : '/404',
    };
  } catch (err) {

    // DEBUG
    console.log(`error in fetching url from tiktok`, err);

    return {
      redirectTarget: '/404',
    };
  }
};

export default async function CatchAll({
  params: { catchAll },
}: {
  params: {
    catchAll: string[];
  };
}) {
  const { redirectTarget } = await proccess(catchAll);

  redirect(redirectTarget);
  return <></>;
}
