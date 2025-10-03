import { RequestHandler } from 'express';
import {
  downloadPostByUrl,
  fetchPostByUrlAndMode,
  URL_SANS_BOGUS,
} from '../utils/tiktok-api-wrappers';
import { isLikelyAssetUrl } from '../utils/url-helpers';
import { checkAndCleanPublicFolder } from '../utils/disk-utils';
import logger from '../utils/logger';

export const getVideoByUrl: RequestHandler = async (req, res) => {
  try {
    const { url } = req.params;
    if (isLikelyAssetUrl(url)) {
      res.status(400).send({ error: 'Provided URL looks like an asset, not a TikTok post' });
      return;
    }
    const usePlaywright = (req.query.fallback as string) === 'playwright';
    const postData = await fetchPostByUrlAndMode(
      url,
      URL_SANS_BOGUS.FETCH_POST,
      undefined,
      { usePlaywright }
    );

    if (postData && !(postData instanceof Error)) {
      if (postData.deleted) {
        // We delete post files for storage reasons, if a post is deleted, we re-fetch it.
        await downloadPostByUrl(
          postData.originalURL.length > 0 ? postData.originalURL : url,
          postData.id
        );
      }
      res.send(postData);
      return;
    } else {
      logger.info(postData);
      res.status(500).send({
        error: 'Video is unavailable',
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send({
        error: error.message,
      });
    } else {
      res.status(500).send({ error: 'Something went wrong' });
    }
  } finally {
    checkAndCleanPublicFolder().catch(() => {
      logger.info('Error cleaning public folder');
    });
  }
};
