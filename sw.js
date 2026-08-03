# Fellowship Examination SCQ App (FEx SCQ) — phone app (PWA)

**App build: SCQ v7 (rebrand, exam timer, disclaimer page) · `CACHE_VERSION = fex-scq-v7`**

Everything here is static. Upload the folder to any HTTPS host and the app
installs to a phone home screen, opens full screen, and runs with no signal.

```
index.html        your app, patched (was SCQ_v7.html)
manifest.json     name, icons, theme colour, home-screen shortcuts
sw.js             service worker — precaches the app for offline use
icons/            app mark at 192/512, maskable, and iOS 180
```

## Updating an existing deployment

Replace **three** files — `index.html`, `sw.js` and `manifest.json`.
`icons/` is unchanged; leave it.

`manifest.json` must go up this time. The app was renamed from *QEII ED
Fellowship SCQ Question Bank* to *Fellowship Examination SCQ App*, and the
manifest is what supplies the name under the home-screen icon. Skip it and
installed phones keep showing the old name indefinitely, because the manifest
is only re-read on install.

`sw.js` matters as much as `index.html`. Its `CACHE_VERSION` is now
`fex-scq-v7` — that change is what tells already-installed phones to discard
their cached copy and pull the new build. Upload `index.html` alone and nothing
updates.

### The icon name may not refresh

Renaming an installed PWA is unreliable across platforms. Android usually picks
up the new name on the next launch; iOS frequently keeps the old label until the
icon is deleted and re-added. If the name matters to you, tell users to remove
the old icon and reinstall — and to **export a backup first**, since deleting an
iOS home-screen app can clear its storage.

## Deploy

Keep the folder structure exactly as-is; all paths are relative, so it works at
a domain root or in a subfolder.

**GitHub Pages** — drop these files in the repo root, Settings → Pages → deploy
from `main` / root.

**Netlify Drop** — drag the folder onto app.netlify.com/drop.

Two requirements, both non-negotiable for service workers:

- **HTTPS.** `localhost` also works for testing. `file://` does not — opening
  `index.html` by double-clicking still runs the app, but skips offline caching
  and install.
- **`sw.js` must sit next to `index.html`.** A service worker can only control
  pages at or below its own path.

## Install on a phone

- **Android / Chrome** — an "Install" card appears on the dashboard, or use
  ⋮ → Install app.
- **iPhone / Safari** — Share → Add to Home Screen. Must be Safari; Chrome on
  iOS cannot install PWAs.

## Publishing the next update

1. Replace `index.html` with the new export.
2. Bump `CACHE_VERSION` in `sw.js` — `fex-scq-v7` → `fex-scq-v8`.
3. Re-upload both.

Skipping step 2 is the single most common reason a PWA update "doesn't work".

## What the wrapper adds to index.html

Four additions, nothing removed:

- **Head** — manifest link, theme colour that tracks light/dark, Apple
  home-screen icon and title, `viewport-fit=cover` for notched screens.
- **`<style id="pwa-shell">`** — safe-area padding for the top bar, quiz footer
  and the confirm modal; a tap-to-close backdrop behind the nav drawer; single
  column category grid and stacked modal buttons on phones; 44px touch targets.
- **Back up and restore** card in Review — export reuses the app's own
  `exportProgress()`, so one file is both the stats report and a restorable
  backup. Import reads it back.
- **`<script>` tail** — service worker registration, install prompt, drawer
  backdrop, `?view=` shortcut handling, and an IndexedDB mirror of your data.

The drawer's Escape handler defers to the exam confirm modal while it is open,
so Escape closes the dialog rather than the navigation behind it.

### On storage

Bookmarks and progress still write to `localStorage` as before. Every save is
also mirrored to IndexedDB, and if `localStorage` is cleared — iOS reclaims it
under storage pressure — the app restores from that mirror on next launch. It
also calls `navigator.storage.persist()` to ask the OS not to evict it.

Neither store survives deleting the app, so the export file is the real backup.

Note that flags are now session-only by design in v7, so they are not part of
any backup.
