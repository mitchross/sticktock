'use client';
import { FormEventHandler, useCallback, useState } from 'react';
import styles from './style.module.scss';
import { LoadingSpinner } from '../Loading';
import { checkURL } from '../../../utils/strings/check-url';
import { BACKEND_API_URL, BASE_DOMAIN } from '../../../service.config';

export const HomePage = () => {
  const [videoURL, setVideoURL] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // const [showPopUp, setShowPopUp] = useState(false);
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
          `${BACKEND_API_URL}/by_url/${encodeURIComponent(
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

      <p className="articulat text-sm my-5 text-blue">
        {loading
          ? 'Processing video, this could take a minute...'
          : [ `Or replace "tiktok.com" with "${BASE_DOMAIN}" in your video URL.` ]}
        &nbsp;&nbsp;
        <a
          href="https://psafe.ly/QX9P9K"
          target="_blank"
          className="link-orange no-text-wrap"
        >Learn More</a>
      </p>

      {error && <p className="text-red-500 text-sm my-5">{error}</p>}

      <div className="w-full flex flex-col items-center mb-14">
        <h2 className="seasons text-xl text-white mb-3">
          100% Open Source TikTok Experiment
        </h2>

        <div className="grid grid-flow-col gap-5 w-full px-2">
          <div className="articulat text-sm text-white text-left">
            No Ads
          </div>
          <div className="articulat text-sm text-white text-center">
          &nbsp;&nbsp;&nbsp;No Spying
          </div>
          <div className="articulat text-sm text-white text-right">
            No Phone App
          </div>
        </div>

        <button
          onClick={async () => {
            const latestPost = await fetch(
              `${BACKEND_API_URL}/latest`
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
        className="text-align-center text-blue"
      >
        Made with <span style={{
          color: 'red'
        }}>❤️</span> by <a
          href="https://psafe.ly/Nx4A3m"
          target="_blank"
          className="link-orange"
        >PrivacySafe</a>
        <br />
        <a
          href="https://psafe.ly/xnUPwZ"
          target="_blank"
          className="link-orange"
        >Source Code</a> | <a
          href="https://psafe.ly/DVm2pY"
          target="_blank"
          className="link-orange"
        >Terms of Use</a> | <a
          href="https://psafe.ly/A3NU4b"
          target="_blank"
          className="link-orange"
        >Donate</a>
      </div>

    </div>
  );
};
