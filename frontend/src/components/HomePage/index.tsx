'use client';
import { FormEventHandler, useCallback, useState } from 'react';
import styles from './style.module.scss';
import { LoadingSpinner } from '../Loading';
import { checkURL } from '../../../utils/strings/check-url';
import { API_URL_FOR_SERVER, API_URL_FOR_BROWSER, BASE_DOMAIN } from '../../../service.config';

const ONION_HOST = 'b7vypdv52igjfg7vwhlofny45koaa4ltletx67ranlwfotiiqwza2eyd.onion';

export const HomePage = () => {
  const [videoURL, setVideoURL] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const getVideo: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      try {
        e.preventDefault();
        const isValidURL = checkURL(videoURL);

        if (!isValidURL) {
          setError('Please enter a valid TikTok video URL');
          return;
        }
        setLoading(true);
        setError('');
        const videoData = await fetch(
          `${API_URL_FOR_SERVER}/by_url/${encodeURIComponent(
            videoURL
          )}`
        ).then((res) => res.json());
        setLoading(false);

        if (videoData.error) {
          setLoading(false);
          setError(videoData.error);
          return;
        }
        window.location.href = `/post/${videoData.id}`;
      } catch (err) {
        if (err instanceof Error) {
          setLoading(false);
          setError(
            process.env.NODE_ENV === 'production'
              ? 'Woops... Something went wrong. Please try again.'
              : err.message
          );
        }
      }
    },
    [videoURL]
  );

  return (
    <div className="w-full px-5 container md:max-w-lg mx-auto flex flex-col items-center">
      <img src="/sticktock-wordmark.svg" />

      <form
        className={`w-full flex rounded-xl border-b-2 items-stretch mt-10 mb-0 ${
          error || loading ? 'mb-0' : ''
        } ${styles.InputHolder}`}
        onSubmit={getVideo}
      >
        <input
          className={`seasons  w-full rounded-lg pl-5 py-2 pr-2 ${styles.Input}`}
          value={videoURL}
          placeholder="Paste a TikTok video URL to get started"
          onChange={(e) => setVideoURL(e.target.value)}
        />
        <button
          disabled={loading}
          type="submit"
          className="px-4 py-2 rounded-lg flex items-center justify-center w-15"
        >
          {loading ? (
            <LoadingSpinner />
          ) : (
            <svg
              width="18"
              height="15"
              viewBox="0 0 18 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.98672 0.528914L17.4435 6.48383C17.9247 6.8681 17.9475 7.59181 17.4915 8.00569L10.0668 14.745C9.4251 15.3275 8.39685 14.8737 8.39467 14.0071L8.38837 11.5066L1.33593 10.8745C0.820309 10.8283 0.425201 10.3962 0.425201 9.87849V5.59404C0.425201 5.07845 0.817197 4.64738 1.33046 4.59854L8.36929 3.92868L8.3627 1.31284C8.36059 0.473561 9.3309 0.00518283 9.98672 0.528914Z"
                fill="#424242"
              />
            </svg>
          )}
        </button>
      </form>

      <p className="articulat text-sm my-5 text-blue text-center margin-bottom-48">
        {loading
          ? 'Processing video, this could take a minute...'
          : [ `Or replace "tiktok.com" with "${BASE_DOMAIN}" in your video URL.` ]}
        &nbsp;&nbsp;
        <a
          href="https://bitsontape.com/p/sticktock-share-tiktok-videos"
          target="_blank"
          className="link-orange"
        >How?</a>
      </p>

      {error && <p className="text-red-500 text-sm my-5">{error}</p>}

      <div className="w-full flex flex-col items-center mb-14">
        <h2 className="seasons text-xl text-white mb-3 margin-bottom-32">
        100% Free & Open Source. <a
          href="https://bitsontape.com/p/sticktock-share-tiktok-videos"
          target="_blank"
          className="link-orange"
        >Why?</a>
        </h2>

        <button
          onClick={async () => {
            const latestPost = await fetch(
              `${API_URL_FOR_BROWSER}/latest`
            ).then((res) => res.json());
            if (latestPost) {
              window.location.href = `/post/${latestPost.id}`;
            }
          }}
          className="articulat text-slate-100 font-semibold bg-gradient-to-t border-greeny green-gradient border-2 py-2 w-full rounded-full mt-5"
        >
          Watch TikTok
        </button>
      </div>

      <div
        className="text-align-center text-blue margin-bottom-12"
      >
        Made with <span style={{
          color: 'red'
        }}>❤️</span> by <a
          href="https://privacysafe.social"
          target="_blank"
          className="link-orange"
        >PrivacySafe</a>
      </div>

      <div
        className="text-align-center text-blue margin-bottom-32"
      >
        <a
          href="https://github.com/PrivacySafe/sticktock/blob/main/LICENSE"
          target="_blank"
          className="link-orange"
        >GNU AGPLv3</a> | <a
          href="https://github.com/PrivacySafe/sticktock"
          target="_blank"
          className="link-orange"
        >Source Code</a> | <a
          href="https://privacysafe.tools/terms/sticktock-com.html"
          target="_blank"
          className="link-orange"
        >Terms of Use</a> | <a
          href="https://liberapay.com/PrivacySafe/"
          target="_blank"
          className="link-orange"
        >Donate</a> | <a
        href="https://ko-fi.com/privacysafe"
        target="_blank"
        className="link-orange no-text-wrap"
      >Buy Us a Coffee</a>
      </div>

      <div
        className="text-align-center text-sm my-5 text-blue"
      >
        <a
          href={`http://${ONION_HOST}/`}
          target="_blank"
        >{ONION_HOST}</a>
      </div>

    </div>
  );
};
