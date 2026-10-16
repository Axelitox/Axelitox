#!/usr/bin/env node
/**
 * Récupère les images du site d'origine (clichy-natation.com, hébergé sur Wix)
 * et les convertit en WebP optimisé dans public/images/_inbox/.
 *
 * À lancer depuis une machine ayant accès au site :  npm run assets:fetch
 *
 * Produit public/images/_inbox/inventory.json : pour chaque image, sa page
 * d'origine, son URL source, son texte alternatif et le fichier local.
 * Il reste ensuite à choisir les visuels, vérifier les autorisations (photos
 * de mineurs notamment) et renseigner `src` dans src/data/media.ts.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ORIGIN = "https://www.clichy-natation.com";
const PAGES = [
  "/",
  "/activites-grand-public",
  "/initiation-a-la-natation",
  "/bebe-nageur",
  "/cours-de-natation-adultes",
  "/aquabike-nouveau",
  "/aqua-yoga",
  "/handisport",
  "/equipe-competition",
  "/interclubs-18",
  "/tarifs",
  "/inscriptions-21",
  "/cgu-cgv",
];
const OUT = path.resolve("public/images/_inbox");

const slug = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "image";

/** URL Wix d'origine, sans les paramètres de recadrage (/v1/fill/...). */
const wixOriginal = (url) => {
  const m = url.match(/https:\/\/static\.wixstatic\.com\/media\/[^/"'\s)]+/);
  return m ? m[0] : url;
};

async function main() {
  await mkdir(OUT, { recursive: true });
  const seen = new Map();

  for (const page of PAGES) {
    const res = await fetch(ORIGIN + page);
    if (!res.ok) {
      console.warn(`✗ ${page} → HTTP ${res.status}`);
      continue;
    }
    const html = await res.text();
    const found = [];
    for (const m of html.matchAll(/<img[^>]+>/g)) {
      const tag = m[0];
      const src = tag.match(/src="([^"]+)"/)?.[1];
      const alt = tag.match(/alt="([^"]*)"/)?.[1] ?? "";
      if (src) found.push({ src, alt });
    }
    for (const m of html.matchAll(/https:\/\/static\.wixstatic\.com\/media\/[^"'\s)\\]+/g)) found.push({ src: m[0], alt: "" });
    const og = html.match(/property="og:image" content="([^"]+)"/)?.[1];
    if (og) found.push({ src: og, alt: "og:image" });

    for (const { src, alt } of found) {
      const url = wixOriginal(src);
      if (!/^https?:/.test(url) || seen.has(url)) continue;
      seen.set(url, { page, url, alt });
    }
    console.log(`✓ ${page} — ${found.length} références`);
  }

  const inventory = [];
  let i = 0;
  for (const item of seen.values()) {
    i++;
    try {
      const res = await fetch(item.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const isSvg = item.url.endsWith(".svg") || res.headers.get("content-type")?.includes("svg");
      const base = `${String(i).padStart(3, "0")}-${slug(item.page === "/" ? "accueil" : item.page)}-${slug(item.alt)}`;
      let file;
      let meta = {};
      if (isSvg) {
        file = `${base}.svg`;
        await writeFile(path.join(OUT, file), buf);
      } else {
        file = `${base}.webp`;
        const img = sharp(buf).rotate().resize({ width: 2400, withoutEnlargement: true });
        meta = await img.metadata();
        await img.webp({ quality: 82 }).toFile(path.join(OUT, file));
      }
      inventory.push({ ...item, file: `/images/_inbox/${file}`, width: meta.width, height: meta.height });
    } catch (e) {
      inventory.push({ ...item, error: String(e) });
    }
  }

  await writeFile(path.join(OUT, "inventory.json"), JSON.stringify(inventory, null, 2));
  console.log(`\n${inventory.filter((x) => x.file).length}/${inventory.length} images enregistrées dans ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
