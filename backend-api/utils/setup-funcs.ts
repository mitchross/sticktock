import fs from 'fs';
import path from 'path';

const dataFolder = '/var/local/sticktock';
const staticDir = 'public';
const prismaDir = 'prisma';
const dbFileName = 'prisma-db.sqlite';

function ensureFolderPresence(folderPath: string): void {
  try {
    const stats = fs.statSync(folderPath);
    if (!stats.isDirectory()) {
      throw new Error(`${folderPath} is not a directory`);
    }
  } catch (err) {
    if ((err as any).code === 'ENOENT') {
      console.log(`Creating folder ${folderPath}`);
      fs.mkdirSync(folderPath);
    } else {
      console.error(`Error in setting up data folder ${folderPath}`);
      throw err;
    }
  }
}

function ensureLinkPresence(target: string, linkPath: string): void {
  try {
    const existingLinkTarget = fs.readlinkSync(linkPath);
    if (existingLinkTarget !== target) {
      throw new Error(`Link ${linkPath} exists but point to ${existingLinkTarget} instead of ${target}`);
    }
  } catch (err) {
    if ((err as any).code === 'ENOENT') {
      console.log(`Creating symlink to ${target} at path ${linkPath}`);
      fs.symlinkSync(target, linkPath);
    } else {
      console.error(`Error in setting up link ${linkPath} to ${target}`);
      throw err;
    }
  }
}

function ensurePresenceOfSqliteDBFile(): void {
  for (const fName of fs.readdirSync(prismaDir)) {
    if (fName.startsWith(dbFileName)) {
      const dest = path.join(dataFolder, fName);
      const src = path.join(prismaDir, fName);
      try {
        const stats = fs.statSync(dest);
        if (!stats.isFile()) {
          throw new Error(`${dest} is not a file`);
        }
      } catch (err) {
        if ((err as any).code === 'ENOENT') {
          console.log(`Copying initial db file ${src} to ${dest}`);
          fs.copyFileSync(src, dest);
        } else {
          console.error(`Error in setting up sqlite db file ${dest} from ${src}`);
          throw err;
        }
      }
    }
  }
}

export function setupVarDataFolder(): { dirForStatic: string } {
  ensureFolderPresence(dataFolder);
  const publicDataFolder = path.join(dataFolder, staticDir);
  ensureFolderPresence(publicDataFolder);
  for (const dir of [
    'audio', 'authors', 'hls', 'images', 'thumbnails', 'videos'
  ]) {
    ensureFolderPresence(path.join(publicDataFolder, dir));
  }
  ensureLinkPresence(publicDataFolder, staticDir);
  ensurePresenceOfSqliteDBFile();
  return { dirForStatic: staticDir };
}
