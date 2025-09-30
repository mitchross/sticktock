-- Migration: add usedPuppeteer boolean column to Post
ALTER TABLE "Post" ADD COLUMN "usedPuppeteer" BOOLEAN NOT NULL DEFAULT 0;
