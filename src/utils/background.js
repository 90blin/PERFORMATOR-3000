/**
 * Utilities to manage the board background image.
 * - persists to localStorage key "app.bgImage"
 * - toggles body.has-custom-bg and sets CSS var --custom-bg
 * - emits "app:bg-changed" custom event with detail: { dataUrl }
 */

export function setBoardBackground(dataUrl) {
  if (dataUrl) {
    document.documentElement.style.setProperty("--custom-bg", `url("${dataUrl}")`);
    document.body.classList.add("has-custom-bg");
    try { localStorage.setItem("app.bgImage", dataUrl); } catch {}
  } else {
    document.documentElement.style.removeProperty("--custom-bg");
    document.body.classList.remove("has-custom-bg");
    try { localStorage.removeItem("app.bgImage"); } catch {}
  }
  window.dispatchEvent(new CustomEvent("app:bg-changed", { detail: { dataUrl: dataUrl || null } }));
  return dataUrl;
}

export function loadBoardBackgroundFromStorage() {
  try {
    const dataUrl = localStorage.getItem("app.bgImage");
    if (dataUrl) setBoardBackground(dataUrl);
    return dataUrl || null;
  } catch {
    return null;
  }
}

export function applyBackgroundFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("no-file"));
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setBoardBackground(dataUrl);
      resolve(dataUrl);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}