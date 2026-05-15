const DEFAULT_WIDTH  = 440;
const DEFAULT_HEIGHT = 600;
const MIN_WIDTH      = 320;
const MIN_HEIGHT     = 400;

figma.showUI(__html__, { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT, themeColors: false });

(async () => {
  const [recents, channels, density] = await Promise.all([
    figma.clientStorage.getAsync("arena-recents"),
    figma.clientStorage.getAsync("arena-saved-channels"),
    figma.clientStorage.getAsync("arena-density"),
  ]);
  figma.ui.postMessage({ type: "recents-loaded", recents: recents || [] });
  figma.ui.postMessage({ type: "saved-loaded",   channels: channels || [] });
  figma.ui.postMessage({ type: "density-loaded", density: density || "3" });
})();

figma.ui.onmessage = async (msg) => {

  // ── Window resize (transient — not persisted) ─────────────
  if (msg.type === "resize") {
    figma.ui.resize(
      Math.max(MIN_WIDTH,  Math.round(msg.width)),
      Math.max(MIN_HEIGHT, Math.round(msg.height))
    );
    return;
  }

  // ── Density preference ────────────────────────────────────
  if (msg.type === "save-density") {
    await figma.clientStorage.setAsync("arena-density", msg.density);
    return;
  }

  // ── Recents ───────────────────────────────────────────────
  if (msg.type === "save-recent") {
    const existing = (await figma.clientStorage.getAsync("arena-recents")) || [];
    const updated = [
      { slug: msg.slug, title: msg.title, owner: msg.owner, imageCount: msg.imageCount },
      ...existing.filter((r) => r.slug !== msg.slug),
    ].slice(0, 20);
    await figma.clientStorage.setAsync("arena-recents", updated);
    figma.ui.postMessage({ type: "recent-saved", recents: updated });
  }

  if (msg.type === "clear-recents") {
    await figma.clientStorage.setAsync("arena-recents", []);
  }

  // ── Saved channels ────────────────────────────────────────
  if (msg.type === "save-channel-list") {
    await figma.clientStorage.setAsync("arena-saved-channels", msg.channels);
  }

  // ── Place single image ────────────────────────────────────
  if (msg.type === "place-image") {
    try {
      const response  = await fetch(msg.url);
      const buffer    = await response.arrayBuffer();
      const imageHash = figma.createImage(new Uint8Array(buffer)).hash;

      const node        = figma.createRectangle();
      const aspectRatio = msg.width / msg.height;
      const displayW    = Math.min(msg.width, 800);
      const displayH    = displayW / aspectRatio;

      node.resize(displayW, displayH);
      node.name = msg.title || "Are.na image";

      const center = figma.viewport.center;
      node.x = center.x - displayW / 2;
      node.y = center.y - displayH / 2;

      node.fills = [{ type: "IMAGE", imageHash, scaleMode: "FILL" }];
      figma.currentPage.appendChild(node);
      figma.currentPage.selection = [node];

      figma.ui.postMessage({ type: "place-success", id: msg.id });
    } catch (err) {
      figma.ui.postMessage({ type: "place-error", id: msg.id, error: err.message });
    }
  }

  // ── Generate moodboard ────────────────────────────────────
  if (msg.type === "generate-moodboard") {
    const COLS  = 4;
    const COL_W = 400;
    const GAP   = 16;

    try {
      const results = await Promise.all(
        msg.images.map(async (img) => {
          try {
            const res    = await fetch(img.url);
            const buffer = await res.arrayBuffer();
            const hash   = figma.createImage(new Uint8Array(buffer)).hash;
            return { hash, width: img.width, height: img.height, title: img.title };
          } catch (_) { return null; }
        })
      );

      const valid = results.filter(Boolean);
      if (!valid.length) throw new Error("No images could be loaded.");

      const frameW = COLS * COL_W + (COLS - 1) * GAP + GAP * 2;
      const frame  = figma.createFrame();
      frame.name   = msg.title || "asterism";
      frame.fills  = [];
      frame.clipsContent            = false;
      frame.layoutMode              = "HORIZONTAL";
      frame.layoutWrap              = "WRAP";
      frame.itemSpacing             = GAP;
      frame.counterAxisSpacing      = GAP;
      frame.paddingTop              = GAP;
      frame.paddingBottom           = GAP;
      frame.paddingLeft             = GAP;
      frame.paddingRight            = GAP;
      frame.primaryAxisSizingMode   = "FIXED";
      frame.counterAxisSizingMode   = "AUTO";
      frame.primaryAxisAlignItems   = "MIN";
      frame.counterAxisAlignItems   = "MIN";
      frame.resize(frameW, 100);

      for (const img of valid) {
        const aspect = (img.width && img.height) ? img.width / img.height : 1;
        const rect   = figma.createRectangle();
        rect.resize(COL_W, Math.max(Math.round(COL_W / aspect), 40));
        rect.name   = img.title || "Image";
        rect.fills  = [{ type: "IMAGE", imageHash: img.hash, scaleMode: "FIT" }];
        rect.layoutSizingHorizontal = "FIXED";
        rect.layoutSizingVertical   = "FIXED";
        frame.appendChild(rect);
      }

      const center = figma.viewport.center;
      frame.x = center.x - frameW / 2;
      frame.y = center.y - frame.height / 2;

      figma.currentPage.appendChild(frame);
      figma.currentPage.selection = [frame];

      figma.ui.postMessage({ type: "moodboard-success" });
    } catch (err) {
      figma.ui.postMessage({ type: "moodboard-error", error: err.message });
    }
  }

};
