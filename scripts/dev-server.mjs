#!/usr/bin/env node
/**
 * Zero-dependency static server emulating the R2 bucket layout locally.
 * Serves ./content-seed/ exactly like the future bucket root:
 *   /content/manifest.json · /content/{lang}/… · /licenses/asset-ledger.json · /media/**
 * Usage: npm run seed   (PORT env optional, default 8787)
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const ROOT = resolve(process.cwd(), "content-seed");
const PORT = Number(process.env.PORT ?? 8787);

const MIME = {
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ogg": "audio/ogg",
  ".opus": "audio/opus",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    // Bucket root == content-seed/: strip nothing; requests are "/content/..." or "/media/..."
    const safe = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
    const filePath = join(ROOT, safe);
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    const body = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=60",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "not found" }));
  }
});

server.listen(PORT, () => {
  console.log(`[seed] serving ${ROOT} at http://localhost:${PORT}`);
});
