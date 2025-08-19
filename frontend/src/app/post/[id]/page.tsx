// app/posts/[id]/page.tsx
import clsx from 'clsx';
import { Metadata, ResolvingMetadata } from 'next';
import { redirect } from 'next/navigation';
import { postSchema } from '../../../../utils/types/posts';
import { Feed } from '../../../components/Feed';
import styles from './page.module.scss';
import { API_URL_FOR_BROWSER, API_URL_FOR_SERVER, FRONTEND_URL_FOR_SERVER_SELF } from '../../../../service.config';

const fetchPostData = async (id: string) => {
  const fetchData = await fetch(
    `${FRONTEND_URL_FOR_SERVER_SELF}/api/post/${id}`
  );
  
  // DEBUG
  console.log(`...post/[id] returns ${fetchData.status} in call to ${fetchData.url}`);

  const jsonData = await fetchData.json();
  const parsedData = postSchema.safeParse(jsonData);

  const cookies = fetchData.headers.get('set-cookie');
  const cookiesArray = cookies?.split(';');
  const sessionToken = cookiesArray
    ?.find((cookie) => cookie.toLowerCase().includes('sessiontoken'))
    ?.split('=')[1];
  console.log({
    data: jsonData,
  });
  return {
    data: parsedData.data,
    sessionToken: sessionToken,
  };
};

export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    // read route params
    const controller = new AbortController();

    setTimeout(() => {
      controller.abort();
    }, 1000 * 5);

    const fetchData = await fetch(
      `${API_URL_FOR_SERVER}/by_id/${params.id}`,
      {
        signal: controller.signal,
      }
    );
    const jsonData = await fetchData.json();

    const { data } = postSchema.safeParse(jsonData);
    if (data && ('video' in data || 'carousel' in data) && 'author' in data) {
      const image =
        data?.video?.thumbnail || data?.carousel?.images.split(',')[0];
      const video = data?.video?.mp4URL;

      return {
        title: `Watch ${data?.author.name}'s video via StickTock`,
        description: data?.postDescription || undefined,
        openGraph: {
          siteName: 'StickTock',
          title: `Watch ${data?.author.name}'s video via StickTock`,
          description: data?.postDescription || undefined,
          type: 'video.other',
          locale: 'en_US',
          images: image ? [`${API_URL_FOR_BROWSER}${image}`] : undefined,
          videos: video ? [ {
            url: `${API_URL_FOR_BROWSER}${video}`,
            secureUrl: `${API_URL_FOR_BROWSER}${video}`,
            width: 1080,
            height: 1920,
            type: 'video/mp4',
          } ]: undefined,
        },
        creator: data?.author.handle,
        twitter: {
          card: 'summary_large_image',
        },
      };
    } else {
      return {
        title:
          "StickTock | Share TikToks Safely. No Ads, No Spying, No Phone App.",
        description:
        "StickTock",
      };
    }
  } catch {
    return {
      title:
        "StickTock | Share TikToks Safely. No Ads, No Spying, No Phone App.",
      description:
      "StickTock",
    };
  }
}

const PostPage = async ({ params }: { params: { id: string } }) => {
  const { data: postData, sessionToken } = await fetchPostData(params.id);

  if (!postData && process.env.NODE_ENV === 'production') {
    redirect('/404');
  } else if (!postData) {
    console.log('No post data found');
    return;
  }

  return (
    <main className="flex min-h-dvh	 flex-col items-center justify-between">
      <a
        href="/"
        className={clsx(
          'flex md:hidden absolute top-2 left-2 h-8 z-20',
          styles.Logo
        )}
      >
        <img src="/sticktock-wordmark-small.svg" />
      </a>
      <a
        href="/"
        className={clsx(
          'hidden md:flex absolute top-2 left-2 h-8 z-20',
          styles.Logo
        )}
      >
        <img src="/sticktock-wordmark-small.svg" />
      </a>
      <div
        className={clsx(
          'container md:rounded-2xl md:m-auto h-full relative overflow-hidden flex',
          styles.Player
        )}
      >
        <Feed rootPost={postData} token={sessionToken} />
      </div>
    </main>
  );
};

export default PostPage;
