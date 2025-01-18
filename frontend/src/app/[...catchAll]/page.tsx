import { redirect } from 'next/navigation';
import { API_URL_FOR_SERVER } from '../../../service.config';

const proccess = async (catchAll: string[]) => {
  try {
    const buildUrl = `https://tiktok.com/${catchAll.join('/')}`;

    const getData = await fetch(
      `${API_URL_FOR_SERVER}/by_url/${encodeURIComponent(
        buildUrl
      )}`
    );

    const res = await getData.json();
    console.log(res);
    return {
      redirectTarget: res.id ? `/post/${res.id}` : '/404',
    };
  } catch (err) {
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
