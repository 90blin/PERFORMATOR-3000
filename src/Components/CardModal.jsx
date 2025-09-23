import React, { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import TagPicker from "./TagPicker";
import Checklist from "./Checklist";
import DescriptionPanel from "./DescriptionPanel";
import { PRESET_BASES } from "../utils/colors";

/*
 CardModal responsibilities:
  - left: description (DescriptionPanel)
  - right: TagPicker + Checklist
  - deep-clone plain data on save to avoid retaining ref to modal state
*/

export default function CardModal({ open, onClose, task, onSave, onDelete, globalTags = [], setGlobalTags = () => {} }) {
  const [local, setLocal] = useState({
    id: "",
    title: "",
    description: "",
    tags: [],
    checklist_items: [],
  });

  useEffect(() => {
    if (task) {
      const tags = Array.isArray(task.tags) ? task.tags.map((t) => (typeof t === "string" ? { name: t, color: PRESET_BASES[6] } : { name: t.name, color: t.color || PRESET_BASES[6] })) : [];
      setLocal({
        id: task.id || "",
        title: task.title || "",
        description: task.description || "",
        tags,
        checklist_items: Array.isArray(task.checklist_items) ? JSON.parse(JSON.stringify(task.checklist_items)) : [],
      });
    } else {
      setLocal({ id: "", title: "", description: "", tags: [], checklist_items: [] });
    }
  }, [task, open]);

  const addTagToLocal = useCallback((tag) => {
    if (!tag || !tag.name) return;
    if (local.tags.some((t) => t.name.toLowerCase() === tag.name.toLowerCase())) return;
    setLocal((s) => ({ ...s, tags: [...s.tags, { name: String(tag.name), color: String(tag.color || PRESET_BASES[6]) }] }));
  }, [local.tags]);

  const removeTagLocal = useCallback((name) => {
    setLocal((s) => ({ ...s, tags: s.tags.filter((t) => t.name !== name) }));
  }, []);

  const toggleChecklist = useCallback((idx) => {
    setLocal((s) => {
      const items = s.checklist_items ? [...s.checklist_items] : [];
      items[idx] = { ...items[idx], completed: !items[idx].completed };
      return { ...s, checklist_items: items };
    });
  }, []);

  const addChecklist = useCallback(() => {
    setLocal((s) => ({ ...s, checklist_items: [...(s.checklist_items || []), { id: Date.now().toString(), text: "", completed: false }] }));
  }, []);

  const updateChecklistText = useCallback((idx, value) => {
    setLocal((s) => {
      const items = [...(s.checklist_items || [])];
      items[idx] = { ...items[idx], text: value };
      return { ...s, checklist_items: items };
    });
  }, []);

  const removeChecklist = useCallback((idx) => {
    setLocal((s) => {
      const items = [...(s.checklist_items || [])];
      items.splice(idx, 1);
      return { ...s, checklist_items: items };
    });
  }, []);

  const onSaveClick = useCallback(() => {
    // deep-clone plain data
    const plain = {
      id: String(local.id || Date.now().toString()),
      title: String(local.title || ""),
      description: String(local.description || ""),
      tags: (local.tags || []).map((t) => ({ name: String(t.name), color: String(t.color || PRESET_BASES[6]) })),
      checklist_items: (local.checklist_items || []).map((it) => ({ id: String(it.id || Date.now().toString()), text: String(it.text || ""), completed: !!it.completed })),
    };
    onSave && onSave(plain);
    onClose && onClose();
  }, [local, onSave, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <input className="modal-title" value={local.title} onChange={(e) => setLocal((s) => ({ ...s, title: e.target.value }))} placeholder="Card title" />
          <div className="modal-actions">
            <button className="btn-danger" onClick={() => { onDelete && onDelete(local.id); onClose && onClose(); }}>Delete</button>
            <button className="btn-primary" onClick={onSaveClick}>Save</button>
          </div>
        </header>

        <div className="modal-body">
          <aside className="modal-left">
            <label className="modal-label">Description</label>
            <DescriptionPanel value={local.description} onChange={(v) => setLocal((s) => ({ ...s, description: v }))} />
          </aside>

          <section className="modal-right">
            <div className="modal-section slim">
              <label className="modal-label">Tags</label>
              <TagPicker
                globalTags={globalTags}
                setGlobalTags={setGlobalTags}
                value={local.tags}
                onAddTag={addTagToLocal}
                onRemoveTag={removeTagLocal}
              />
            </div>

            <div className="modal-section slim">
              <label className="modal-label">Checklist</label>
              <Checklist
                items={local.checklist_items}
                onAdd={addChecklist}
                onToggle={toggleChecklist}
                onChangeText={updateChecklistText}
                onRemove={removeChecklist}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

CardModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  task: PropTypes.object,
  onSave: PropTypes.func,
  onDelete: PropTypes.func,
  globalTags: PropTypes.array,
  setGlobalTags: PropTypes.func,
};
