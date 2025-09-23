import React, { useState, useEffect, useRef } from "react";

export default function SidebarSettings() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("app.theme") || "dark");
  const [bg, setBg] = useState(() => localStorage.getItem("app.bgImage") || "");
  const inputRef = useRef(null);

  useEffect(() => {
    // apply theme as class on body
    document.body.classList.toggle("theme-light", theme === "light");
    localStorage.setItem("app.theme", theme);
  }, [theme]);

  useEffect(() => {
    if (bg) {
      document.documentElement.style.setProperty("--custom-bg", `url("${bg}")`);
      document.body.classList.add("has-custom-bg");
      localStorage.setItem("app.bgImage", bg);
    } else {
      document.documentElement.style.removeProperty("--custom-bg");
      document.body.classList.remove("has-custom-bg");
      localStorage.removeItem("app.bgImage");
    }
  }, [bg]);

  // Listen for the app:toggle-settings event; if detail.openBgPicker === true open tray and trigger file input
  useEffect(() => {
    const handler = (e) => {
      const wantPicker = !!(e && e.detail && e.detail.openBgPicker);
      setOpen((prev) => {
        const nextOpen = wantPicker ? true : !prev;
        return nextOpen;
      });
      if (wantPicker) {
        // delay click so the tray renders (small timeout)
        setTimeout(() => {
          if (inputRef.current) inputRef.current.click();
        }, 160);
      }
    };
    window.addEventListener("app:toggle-settings", handler);
    return () => window.removeEventListener("app:toggle-settings", handler);
  }, []);

  const onPickFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBg(reader.result.toString());
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeBg = () => setBg("");

  return (
    <div className="sidebar-settings">
      <button
        className="icon-btn portrait-gear settings-gear"
        title="Configurações"
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
          {/* svg path */}
        </svg>
      </button>

      <input ref={inputRef} type="file" accept="image/*" onChange={onPickFile} style={{ display: "none" }} />

      {open && (
        <div className="settings-tray" role="dialog" aria-label="Configurações">
          <div className="settings-row">
            <label>Tema</label>
            <div className="settings-controls">
              <button className={`btn-toggle ${theme === "dark" ? "active" : ""}`} onClick={() => setTheme("dark")}>Noturno</button>
              <button className={`btn-toggle ${theme === "light" ? "active" : ""}`} onClick={() => setTheme("light")}>Diurno</button>
            </div>
          </div>

          <div className="settings-row">
            <label>Plano de fundo</label>
            <div className="settings-controls">
              <button className="btn" onClick={() => inputRef.current && inputRef.current.click()}>Escolher imagem</button>
              {bg && <button className="btn destructive" onClick={removeBg}>Remover</button>}
            </div>
            {bg && <div className="bg-preview"><img src={bg} alt="preview" /></div>}
            <p className="settings-note">A imagem altera o fundo da mesa (board). A barra lateral e colunas mantêm seus estilos.</p>
          </div>
        </div>
      )}
    </div>
  );
}