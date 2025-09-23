import React, { useState, useRef, useEffect } from "react";

const ICONS = [
  { id: "dashboard", label: "Dashboard", svg: (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zM13 21h8v-10h-8v10zm0-18v6h8V3h-8z"/></svg>) },
  { id: "kanban", label: "Kanban", svg: (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zM13 3h8v5h-8V3zm0 7h8v8h-8v-8z"/></svg>) },
  { id: "pomodoro", label: "Pomodoro Timer", svg: (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 8a4 4 0 100 8 4 4 0 000-8zm7-3h-2.18A7.002 7.002 0 005.18 5H3v2h18V5zM11 12h5v2h-7V7h2v5z"/></svg>) },
  { id: "settings", label: "Settings", svg: (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M19.14 12.936a7.964 7.964 0 000-1.872l2.036-1.58a.5.5 0 00.12-.64l-1.93-3.34a.5.5 0 00-.6-.22l-2.49 1a8.12 8.12 0 00-1.7-.98l-.38-2.65A.5.5 0 00 13.5 2h-3a.5.5 0 00-.5.42l-.38 2.65c-.6.24-1.17.55-1.7.98l-2.49-1a.5.5 0 00-.6.22l-2 3.46a.5.5 0 00.12.64L4.57 11c-.05.32-.07.65-.07.98s.03.66.07.98L2.46 14.6a.5.5 0 00-.12.64l2 3.46c.14.25.43.36.69.26l2.49-1c.53.43 1.1.74 1.7.98l.38 2.65a.5.5 0 00.5.42h3c.25 0 .47-.18.5-.42l.38-2.65c.6-.24 1.17-.55 1.7-.98l2.49 1c.26.1.55 0 .69-.26l2-3.46a.5.5 0 00-.12-.64l-2.04-1.58zM12 15.5A3.5 3.5 0 1112 8.5a3.5 3.5 0 010 7z"/></svg>) },
  { id: "stats", label: "Stats", svg: (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M3 3h3v18H3V3zm7 6h3v12h-3V9zm7-6h3v18h-3V3z"/></svg>) },
  { id: "about", label: "About", svg: (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M11 17h2v-6h-2v6zm0-8h2V7h-2v2z"/><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>) },
  { id: "help", label: "Help", svg: (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm1.07-7.75c-.9.92-1.07 1.25-1.07 2.25h-2v-.5c0-1.1.45-1.99 1.17-2.71.78-.78 1.83-1.04 1.83-1.99 0-1.1-.9-2-2-2s-2 .9-2 2H9c0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.54-.76 2.28-1.93 3.25z"/></svg>) },
  { id: "logout", label: "Sign out", svg: (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M16 13v-2H7V8l-5 4 5 4v-3z"/><path d="M20 3h-8v2h8v14h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>) },
];

const DEFAULT_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect fill="%23091226" width="100%" height="100%"/><text x="50%" y="54%" font-size="160" fill="%23e6f0fb" text-anchor="middle" font-family="system-ui,Arial,Helvetica,sans-serif">P</text></svg>';

export default function Sidebar({ collapsed, onToggle }) {
  const [hoverLabel, setHoverLabel] = useState("");
  const [profile, setProfile] = useState(DEFAULT_AVATAR);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("profile.dataUrl");
      if (stored) setProfile(stored);
    } catch {}
  }, []);

  // Pomodoro simple logic
  const P_DEFAULT = 25 * 60;
  const S_DEFAULT = 5 * 60;
  const [seconds, setSeconds] = useState(P_DEFAULT);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState("work"); // work or short

  useEffect(() => {
    let id;
    if (running) {
      id = setInterval(() => setSeconds((s) => {
        if (s <= 1) {
          // switch mode
          const nextMode = mode === "work" ? "short" : "work";
          setMode(nextMode);
          return nextMode === "work" ? P_DEFAULT : S_DEFAULT;
        }
        return s - 1;
      }), 1000);
    }
    return () => clearInterval(id);
  }, [running, mode]);

  const format = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const openFile = () => fileRef.current?.click();
  const onFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f || !f.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setProfile(dataUrl);
      localStorage.setItem("profile.dataUrl", dataUrl);
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`} aria-hidden={false}>
      <div className="sidebar-top">
        <div className="portrait-wrap" aria-hidden={collapsed}>
          <div className="portrait" onMouseLeave={() => {}}>
            <img src={profile || DEFAULT_AVATAR} alt="Profile" className="portrait-img" />
            <button
              type="button"
              className="portrait-gear"
              aria-label="Upload profile"
              onClick={(e) => { e.stopPropagation(); openFile(); }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm7-3h-2.18A7.002 7.002 0 005.18 5H3v2h18V5zM11 12h5v2h-7V7h2v5z"/>
              </svg>
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: "none" }} />
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="icon-grid" onMouseLeave={() => setHoverLabel("")}>
          {ICONS.map((it) => (
            <button
              key={it.id}
              className="icon-btn"
              aria-label={it.label}
              onMouseEnter={() => setHoverLabel(it.label)}
              onFocus={() => setHoverLabel(it.label)}
              onBlur={() => setHoverLabel("")}
              onClick={() => {
                if (it.id === "pomodoro") {
                  setPomodoroOpen((s) => !s);
                } else {
                  setPomodoroOpen(false);
                }
              }}
            >
              <span className="icon-svg" aria-hidden>{it.svg}</span>
            </button>
          ))}
        </div>

        {/* tray: shows hover label OR pomodoro tray when open */}
        <div className={`icon-tray ${hoverLabel || pomodoroOpen ? "active" : ""}`} aria-hidden={!(hoverLabel || pomodoroOpen)}>
          {!pomodoroOpen && hoverLabel && (
            <div className="icon-tray-inner">{hoverLabel}</div>
          )}

          {pomodoroOpen && (
            <div className="pomodoro-tray">
              <div className="pomodoro-display">
                <div className="pomodoro-time">{format(seconds)}</div>
                <div className="pomodoro-mode">{mode === "work" ? "Work" : "Break"}</div>
              </div>
              <div className="pomodoro-controls">
                <button onClick={() => setRunning((r) => !r)} className="pom-btn">{running ? "Pause" : "Start"}</button>
                <button onClick={() => { setRunning(false); setSeconds(P_DEFAULT); setMode("work"); }} className="pom-btn">Reset</button>
                <button onClick={() => { setRunning(false); setSeconds(S_DEFAULT); setMode("short"); }} className="pom-btn">Short</button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="sidebar-footer" style={{ marginTop: "auto" }}>
        <button className="collapse-btn" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? "☰" : "✕"}
        </button>
      </div>
    </aside>
  );
}