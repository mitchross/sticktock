import cors from 'cors';
import express from 'express';
import { fetchNewestPost } from './utils/db-helpers';
import { getVideoByUrl } from './routes/by-url';
import { getVideoById } from './routes/by-id';
import { getRelatedVideos } from './routes/get-video';
import { setupVarDataFolder } from './utils/setup-funcs';
import { getRandomPostWithVideo } from './routes/random';

const { dirForStatic } = setupVarDataFolder();

const app = express();
const port = 2000;

app.use(
  cors({
    origin: '*',
    methods: 'GET', // Allow these HTTP methods
    allowedHeaders: 'Content-Type, Authorization, sessiontoken', // Allow these headers
  })
);

app.use(express.static(dirForStatic));

app.get('/', (req, res) => {
  res.send('Welcome to the StickTock API!');
});

app.get('/by_url/:url', getVideoByUrl);

app.get('/by_id/:id', getVideoById);

app.get('/get_related/:url', getRelatedVideos);

app.get('/random', getRandomPostWithVideo);

app.get('/latest', async (_req, res, next) => {
  try {
    const getLatest = await fetchNewestPost();

    res.send(getLatest);
  } catch (err) {
    next(err);
  }
});

app.listen(port, () => {
  console.log(`StickTock API server running on port ${port}`);
});
