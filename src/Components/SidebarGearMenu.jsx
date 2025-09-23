import React, { useState, useRef, useEffect } from "react";

export default function SidebarGearMenu() {
  const [open, setOpen] = useState(false);
  const [bg, setBg] = useState(() => localStorage.getItem("app.bgImage") || "");
  const inputRef = useRef(null);

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
    // notify app
    window.dispatchEvent(new CustomEvent("app:bg-changed", { detail: { dataUrl: bg || null } }));
  }, [bg]);

  const onPickFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBg(String(reader.result));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeBg = () => setBg("");

  return (
    <div className="sidebar-gear" aria-live="polite">
      <button
        className="icon-btn gear-btn"
        title="Configurações"
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        aria-controls="gear-menu"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
          <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7zm7.43-2.3l1.77-1.09-1.77-3.06-2.06.6a7.92 7.92 0 0 0-1.68-.98L15.7 2h-3.4l-.99 3.67c-.6.26-1.16.6-1.68.98l-2.06-.6L4.8 12l1.77 1.09c-.08.33-.13.67-.13 1.02s.05.69.13 1.02L4.8 17l1.77 3.06 2.06-.6c.5.38 1.08.72 1.68.98L12.3 22h3.4l.99-3.67c.6-.26 1.16-.6 1.68-.98l2.06.6L20.2 17l-1.77-1.09c.08-.33.13-.67.13-1.02s-.05-.69-.13-1.02z"/>
        </svg>
      </button>

      {open && (
        <div id="gear-menu" className="gear-menu" role="menu" aria-label="Configurações rápidas">
          <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPickFile} />
          <div className="gear-row">
            <button className="btn" onClick={() => inputRef.current && inputRef.current.click()}>Subir imagem de plano de fundo</button>
            {bg && <button className="btn destructive" onClick={removeBg}>Remover</button>}
          </div>
          {bg && (
            <div className="bg-preview" aria-hidden>
              <img src={bg} alt="preview do plano de fundo" />
            </div>
          )}
          <div className="gear-note">A imagem altera o fundo da página (exceto sidebar e colunas).</div>
        </div>
      )}
    </div>
  );
}