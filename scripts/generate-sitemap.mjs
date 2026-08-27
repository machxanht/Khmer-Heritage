#!/usr/bin/env node
/**
 * Generates web SEO files from the content seed:
 *   app/public/sitemap.xml  — one URL per entry + category + home
 *   app/public/robots.txt   — allow all crawlers + sitemap reference
 *
 * Env:
 *   SITE_URL — canonical site origin (no trailing slash), e.g. https://khmerheritage.example
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const seedDir = path.join(root, 'content-seed', 'content');
const publicDir = path.join(root, 'app', 'public');

const siteUrl = (process.env.SITE_URL ?? 'https://khmerheritage.example.com').replace(/\/+$/, '');

const manifest = JSON.parse(fs.readFileSync(path.join(seedDir, 'manifest.json'), 'utf8'));
const categories = JSON.parse(
  fs.readFileSync(path.join(seedDir, 'en', 'categories.json'), 'utf8'),
);

const urls = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  ...manifest.entries.map((e) => ({
    loc: `/entry/${e.slug}`,
    lastmod: e.updatedAt,
    changefreq: 'weekly',
    priority: '0.8',
  })),
  ...categories.categories.map((c) => ({
    loc: `/category/${c.id}`,
    changefreq: 'weekly',
    priority: '0.6',
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${siteUrl}${u.loc}</loc>\n${
        u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''
      }    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
  )
  .join('\n')}
</urlset>
`;

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots);
console.log(`sitemap.xml (${urls.length} URLs) + robots.txt → app/public/ [SITE_URL=${siteUrl}]`);
