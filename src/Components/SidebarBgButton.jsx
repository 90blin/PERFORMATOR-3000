import React, { useRef } from "react";

export default function SidebarBgButton() {
  const inputRef = useRef(null);

  const openPicker = () => {
    inputRef.current && inputRef.current.click();
  };

  const onPickFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result.toString();
      try { localStorage.setItem("app.bgImage", dataUrl); } catch {}
      document.documentElement.style.setProperty("--custom-bg", `url("${dataUrl}")`);
      document.body.classList.add("has-custom-bg");
    };
    reader.readAsDataURL(file);
    // reset input so same file can be picked again if needed
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onPickFile}
      />
      <button
        className="icon-btn sidebar-bg-btn"
        title="Alterar fundo da board"
        onClick={openPicker}
        aria-label="Alterar fundo da board"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14h18zM7 8.5A1.5 1.5 0 1 1 7 5.5 1.5 1.5 0 0 1 7 8.5zM6 18l3.5-4.5 2.5 3L15.5 11 22 18H6z" />
        </svg>
      </button>
    </>
  );
}