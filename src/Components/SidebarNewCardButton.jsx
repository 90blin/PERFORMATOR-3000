import React from "react";
import SidebarNewCardButton from "../components/SidebarNewCardButton";

/*
  SidebarNewCardButton
  - dispara event 'app:new-card' quando clicado.
  - seu App/Sidebar deve escutar window.addEventListener('app:new-card', ...) para abrir o modal.
*/
export default function SidebarNewCardButton() {
  const onClick = () => {
    window.dispatchEvent(new CustomEvent("app:new-card"));
  };

  return (
    <button
      className="icon-btn sidebar-new-card"
      title="Novo cartão"
      aria-label="Novo cartão"
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
        <path d="M11 11V6h2v5h5v2h-5v5h-2v-5H6v-2z" />
      </svg>
    </button>
  );
}

<div className="icon-grid">
  {/* outros botões */}
  <SidebarNewCardButton />
  {/* outros botões */}
</div>