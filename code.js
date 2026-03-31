figma.showUI(__html__, { width: 440, height: 600, themeColors: false });

// Send saved recents to UI on startup
figma.clientStorage.getAsync("arena-recents").then((recents) => {
  figma.ui.postMessage({ type: "recents-loaded", recents: recents || [] });
});

figma.ui.onmessage = async (msg) => {

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

  // ── Place image on canvas ─────────────────────────────────
  if (msg.type === "place-image") {
    try {
      const response = await fetch(msg.url);
      const buffer   = await response.arrayBuffer();
      const imageHash = figma.createImage(new Uint8Array(buffer)).hash;

      const node = figma.createRectangle();
      const aspectRatio   = msg.width / msg.height;
      const displayWidth  = Math.min(msg.width, 800);
      const displayHeight = displayWidth / aspectRatio;

      node.resize(displayWidth, displayHeight);
      node.name = msg.title || "Are.na image";

      const center = figma.viewport.center;
      node.x = center.x - displayWidth / 2;
      node.y = center.y - displayHeight / 2;

      node.fills = [{ type: "IMAGE", imageHash, scaleMode: "FILL" }];
      figma.currentPage.appendChild(node);
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);

      figma.ui.postMessage({ type: "place-success", id: msg.id });
    } catch (err) {
      figma.ui.postMessage({ type: "place-error", id: msg.id, error: err.message });
    }
  }

};
