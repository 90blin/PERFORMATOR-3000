import React, { useRef } from "react";
import PropTypes from "prop-types";
import { applyBackgroundFile, setBoardBackground } from "../utils/background";

/**
 SidebarButtons
 - Agrupa botões da sidebar (Configurações, Trocar fundo, Alternar tema, etc.)
 - Comunicação com app via localStorage + CustomEvents:
    * 'app:toggle-settings' -> toggle painel de configurações (se existir um listener)
    * 'app:bg-changed' -> payload: { dataUrl }
    * 'app:theme-changed' -> payload: { theme }
 - Também aceita callbacks opcionais via props.
*/
export default function SidebarButtons({ onToggleSettings, onBgChange, onThemeChange }) {
  const fileRef = useRef(null);

  const openFile = () => fileRef.current && fileRef.current.click();

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      try { localStorage.setItem("app.bgImage", dataUrl); } catch {}
      document.documentElement.style.setProperty("--custom-bg", `url("${dataUrl}")`);
      document.body.classList.add("has-custom-bg");
      window.dispatchEvent(new CustomEvent("app:bg-changed", { detail: { dataUrl } }));
      onBgChange && onBgChange(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    applyBackgroundFile(file).catch(() => {
      // fallback: not critical, apenas limpar input ou mostrar erro leve
      console.error("Falha ao aplicar background");
    });
    e.target.value = "";
  };

  const openSettings = () => {
    // dispatch a CustomEvent so SidebarSettings can open AND optionally open the bg picker
    window.dispatchEvent(new CustomEvent("app:toggle-settings", { detail: { openBgPicker: true } }));
    onToggleSettings && onToggleSettings();
  };

  const toggleTheme = () => {
    const cur = localStorage.getItem("app.theme") === "light" ? "light" : "dark";
    const next = cur === "light" ? "dark" : "light";
    localStorage.setItem("app.theme", next);
    document.body.classList.toggle("theme-light", next === "light");
    window.dispatchEvent(new CustomEvent("app:theme-changed", { detail: { theme: next } }));
    onThemeChange && onThemeChange(next);
  };

  const clearBackground = () => {
    setBoardBackground(null);
  };

  return (
    <div className="sidebar-buttons">
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />

      <div className="icon-grid" role="toolbar" aria-label="sidebar actions">
        <button className="icon-btn" title="Configurações" onClick={openSettings} aria-label="Configurações">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
            <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7zm7.43-2.3l1.77-1.09-1.77-3.06-2.06.6a7.92 7.92 0 0 0-1.68-.98L15.7 2h-3.4l-.99 3.67c-.6.26-1.16.6-1.68.98l-2.06-.6L4.8 12l1.77 1.09c-.08.33-.13.67-.13 1.02s.05.69.13 1.02L4.8 17l1.77 3.06 2.06-.6c.5.38 1.08.72 1.68.98L12.3 22h3.4l.99-3.67c.6-.26 1.16-.6 1.68-.98l2.06.6L20.2 17l-1.77-1.09c.08-.33.13-.67.13-1.02s-.05-.69-.13-1.02z"/>
          </svg>
        </button>

        <button className="icon-btn" title="Alterar fundo da board" onClick={openFile} aria-label="Alterar fundo da board">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
            <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14h18zM7 8.5A1.5 1.5 0 1 1 7 5.5 1.5 1.5 0 0 1 7 8.5zM6 18l3.5-4.5 2.5 3L15.5 11 22 18H6z" />
          </svg>
        </button>

        <button className="icon-btn" title="Alternar tema" onClick={toggleTheme} aria-label="Alternar tema">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
            <path d="M12 3a1 1 0 0 1 1 1v1.06a7 7 0 1 0 8 8V13a1 1 0 0 1 0 2h-1.06a7 7 0 1 0-8-8V4a1 1 0 0 1 1-1z"/>
          </svg>
        </button>

        <button className="icon-btn" title="Limpar fundo" onClick={clearBackground} aria-label="Limpar fundo">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
            <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm1 15h-2v-2h2v2zm1.07-7.75l-.9.92A1.49 1.49 0 0 0 12.5 12H11v-1h1.5c.28 0 .5-.22.5-.5 0-.13-.05-.26-.15-.36l-1.2-1.18A2 2 0 1 1 13.07 9.25z"/>
          </svg>
        </button>

        {/* placeholder extra button, adicione mais conforme necessário */}
        <button className="icon-btn" title="Ajuda" aria-label="Ajuda" onClick={() => window.alert("Ajuda")}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
            <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm1 15h-2v-2h2v2zm1.07-7.75l-.9.92A1.49 1.49 0 0 0 12.5 12H11v-1h1.5c.28 0 .5-.22.5-.5 0-.13-.05-.26-.15-.36l-1.2-1.18A2 2 0 1 1 13.07 9.25z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

SidebarButtons.propTypes = {
  onToggleSettings: PropTypes.func,
  onBgChange: PropTypes.func,
  onThemeChange: PropTypes.func,
};