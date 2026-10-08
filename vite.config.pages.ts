// GitHub Pages build config — layered on top of Chantan's vite.config.ts.
//
// WHY A SEPARATE FILE: Chantan owns (and overwrites on every sync) almost every
// file in this repo — see .chantan/pushed-files.json. Anything we change in
// vite.config.ts, App.tsx or Index.tsx would silently vanish on the next sync.
// This file is ours, so the Pages fixes live here and survive syncs.
//
// What it fixes, all at build time, without editing the source files:
//   1. base path   — the site lives at /<repo>/, not at the domain root.
//   2. router      — <BrowserRouter> needs basename, or "/" never matches and
//                    every visit renders the NotFound page.
//   3. public URLs — JSX like src="/assets/x.webp" is a plain string Vite never
//                    rewrites; we prefix it with the base path.
//   4. images      — public/assets/*.webp are not in git; Chantan serves them
//                    from its CDN (chantan-assets.json). We download them.
//   5. deep links  — copy index.html to 404.html (the usual GitHub Pages SPA trick).
//
// Usage:  PAGES_BASE=/searchAIOv1/ npx vite build --config vite.config.pages.ts
// (PAGES_BASE defaults to /searchAIOv1/; CI passes the real one from configure-pages.)

import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { defineConfig, mergeConfig, type Plugin, type UserConfig } from "vite"
import baseConfig from "./vite.config"

const root = process.cwd()
const publicDir = path.join(root, "public")
const assetManifest = path.join(root, "chantan-assets.json")

function normalizeBase(raw: string | undefined): string {
  const trimmed = (raw || "/searchAIOv1/").trim().replace(/^\/+|\/+$/g, "")
  return trimmed ? `/${trimmed}/` : "/"
}

async function readAssetManifest(): Promise<Record<string, string>> {
  if (!existsSync(assetManifest)) return {}
  return JSON.parse(await readFile(assetManifest, "utf8"))
}

async function download(url: string, dest: string) {
  let lastError: unknown
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await mkdir(path.dirname(dest), { recursive: true })
      await writeFile(dest, Buffer.from(await res.arrayBuffer()))
      return
    } catch (error) {
      lastError = error
      await new Promise((r) => setTimeout(r, attempt * 1000))
    }
  }
  throw new Error(`Could not download ${url}: ${lastError}`)
}

function githubPages(base: string, publicNames: string[]): Plugin {
  const escaped = publicNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  // Matches a quote immediately followed by "/<top-level public entry>" and then
  // "/" or a closing quote, e.g. "/assets/hero.webp" or '/chantan-reveal.js'.
  //   group 1 = the opening quote, kept as-is
  //   group 2 = the public entry name (assets, chantan-reveal.js, ...)
  const publicUrl = escaped.length ? new RegExp(`(["'\`])/(${escaped.join("|")})(?=[/"'\`])`, "g") : null
  let routerPatched = false

  return {
    name: "github-pages-base",
    enforce: "pre",
    apply: "build",

    async buildStart() {
      // Fetch Chantan CDN images into public/ before Vite copies public/ to dist/.
      const manifest = await readAssetManifest()
      for (const [rel, url] of Object.entries(manifest)) {
        const dest = path.join(root, rel)
        if (existsSync(dest)) continue
        this.info(`downloading ${rel}`)
        await download(url, dest)
      }
    },

    transform(code, id) {
      if (id.includes("node_modules") || !/\.[jt]sx?$/.test(id.split("?")[0])) return null
      let out = code
      if (publicUrl) out = out.replace(publicUrl, (_m, quote, name) => `${quote}${base}${name}`)
      if (out.includes("<BrowserRouter>")) {
        out = out.replace(/<BrowserRouter>/g, `<BrowserRouter basename=${JSON.stringify(base)}>`)
        routerPatched = true
      }
      return out === code ? null : { code: out, map: null }
    },

    buildEnd(error) {
      // Fail loud: if Chantan restructures App.tsx, a "successful" deploy that
      // only shows the 404 page is worse than a red CI run.
      if (!error && base !== "/" && !routerPatched) {
        this.error("github-pages-base: no <BrowserRouter> found to patch with basename — update vite.config.pages.ts")
      }
    },

    async closeBundle() {
      const outDir = path.join(root, "dist")
      if (existsSync(path.join(outDir, "index.html"))) {
        await copyFile(path.join(outDir, "index.html"), path.join(outDir, "404.html"))
      }
    },
  }
}

export default defineConfig(async (env) => {
  const base = normalizeBase(process.env.PAGES_BASE)
  const manifest = await readAssetManifest()
  const publicNames = new Set<string>(existsSync(publicDir) ? await readdir(publicDir) : [])
  // Entries that will exist once buildStart downloads them (e.g. "assets").
  for (const rel of Object.keys(manifest)) {
    const parts = rel.split("/")
    if (parts[0] === "public" && parts[1]) publicNames.add(parts[1])
  }

  const inherited = typeof baseConfig === "function" ? await baseConfig(env) : baseConfig
  return mergeConfig(inherited as UserConfig, {
    base,
    plugins: [githubPages(base, [...publicNames])],
  })
})
