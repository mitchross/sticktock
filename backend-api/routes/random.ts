import { RequestHandler } from 'express';
import {
  getRandomPost,
} from '../utils/db-helpers';
import { downloadPostByUrl } from '../utils/tiktok-api-wrappers';
import logger from '../utils/logger';

export const getRandomPostWithVideo: RequestHandler = async (req, res) => {
  try {
	 const postData = await getRandomPost();

	 if (postData && !(postData instanceof Error)) {
		if (postData.deleted && postData.originalURL.length > 0) {
		  // We delete post files for storage reasons, if a post is deleted, we re-fetch it.
		  await downloadPostByUrl(postData.originalURL, postData.id);
		}
		res.send(postData);
		return;
	 } else {
		logger.info(postData);
		res.status(500).send({
		  error: 'Video is unavailable',
		});
		return;
	 }
  } catch (error) {
	 return res.status(500).send({ error: 'Something went wrong' });
  }
};
