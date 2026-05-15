![Asterism](assets/hero.png)

# Asterism

An Are.na image browser for Figma. Search any public channel, browse its images, and place them directly onto your canvas — or generate a moodboard in one click.

---

### Features

- Search Are.na channels by keyword or paste a channel URL
- Browse images in a grid with infinite scroll
- Click any image to place it on the Figma canvas at its correct aspect ratio
- **Recent** — channels you browse are saved automatically
- **Saved** — pin channels by URL or slug; persists across sessions
- **Surprise me** — generates a 4×4 moodboard by randomly sampling your saved channels
- **Find similar ★** — hover any image for a co-occurrence moodboard from channels it appears in across Are.na
- **Multi-select** — shift+click images then hit Drop to place them as a grid on canvas
- **Resizable window** — drag the bottom-right corner; size persists across sessions
- **Grid density** — cycle 1–5 columns from the toolbar (or scroll-wheel the icon); preference persists

---

### Install

1. **[Download ZIP](https://github.com/jakedugard/asterism/archive/refs/heads/main.zip)** and unzip
2. Open the **Figma desktop app**
3. Go to **Plugins → Development → Import plugin from manifest...**
4. Select `manifest.json` from the unzipped folder

> Local plugins only work in the Figma desktop app, not the browser.

---

### Release Notes

**v1.3 — Resizable window + grid density (2026-05-15)**
- Drag the bottom-right corner to resize the plugin window; size persists across sessions
- Grid density toggle in the toolbar — cycle 1 / 2 / 3 / 4 / 5 columns, or scroll-wheel the icon to step

**v1.2 — Multi-select + random frame names (2026-04-08)**
- Shift+click images to select, Drop button places them as an auto layout grid
- All moodboard frames get a random adjective+noun name (e.g. *amber drift*, *pale archive*)

**v1.1 — Saved channels + Surprise me**
- Saved tab — save any channel by URL or slug, persists across sessions
- Surprise me — 4×4 moodboard from a random sample of your saved channels
- Find similar — co-occurrence moodboard from any image in a channel
- Moodboard frames use auto layout with hugged height

**v1.0 — Initial release**
- Search and browse public Are.na channels
- Place images onto the Figma canvas
- Recent channels panel with clear history

---

Built by **Jake Dugard** · [jakedugard.com](https://jakedugard.com)
