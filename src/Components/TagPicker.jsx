import React, { useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import TagPresets from "./TagPresets";

/*
 Props:
  - globalTags: [{name,color}]
  - setGlobalTags: fn
  - value: local tag list [{name,color}]
  - onAddTag(tag)
  - onRemoveTag(name)
*/
export default function TagPicker({ globalTags, setGlobalTags, value = [], onAddTag, onRemoveTag }) {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(globalTags[0]?.color || "#7c3aed");
  const [selectValue, setSelectValue] = useState("");

  const normalizedGlobal = useMemo(
    () => (Array.isArray(globalTags) ? globalTags : []),
    [globalTags]
  );

  const createTag = useCallback(() => {
    const name = String(newName || "").trim();
    if (!name) return;
    const exists = normalizedGlobal.find((t) => t.name.toLowerCase() === name.toLowerCase());
    const tagObj = { name, color: newColor };
    if (!exists) {
      setGlobalTags((prev = []) => {
        const found = (prev || []).some((t) => t.name.toLowerCase() === name.toLowerCase());
        if (found) return prev;
        const next = [...(prev || []), tagObj];
        try { localStorage.setItem("kanban.tags", JSON.stringify(next)); } catch {}
        return next;
      });
    }
    onAddTag(tagObj);
    setNewName("");
  }, [newName, newColor, normalizedGlobal, setGlobalTags, onAddTag]);

  const addExisting = useCallback(
    (name) => {
      if (!name) return;
      const tag = normalizedGlobal.find((t) => t.name === name);
      if (tag) onAddTag({ ...tag });
    },
    [normalizedGlobal, onAddTag]
  );

  return (
    <div className="tag-picker">
      <div className="existing-tags">
        {value.map((t) => (
          <span key={t.name} className="tag-chip" style={{ background: t.color }}>
            <span className="tag-name">{t.name}</span>
            <button className="tag-remove" onClick={() => onRemoveTag(t.name)} aria-label={`remove ${t.name}`}>×</button>
          </span>
        ))}
      </div>

      <div className="tag-controls">
        <select
          value={selectValue}
          onChange={(e) => {
            const v = e.target.value;
            setSelectValue("");
            addExisting(v);
          }}
          aria-label="choose existing tag"
        >
          <option value="">— choose existing tag —</option>
          {normalizedGlobal.map((g) => (
            <option key={g.name} value={g.name}>
              {g.name}
            </option>
          ))}
        </select>

        <div className="tag-create-row">
          <input placeholder="New tag" value={newName} onChange={(e) => setNewName(e.target.value)} className="tag-input" />
          <TagPresets onSelect={(c) => setNewColor(c)} />
          <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="tag-color" />
          <button className="tag-add" onClick={createTag}>Create</button>
        </div>
      </div>
    </div>
  );
}

TagPicker.propTypes = {
  globalTags: PropTypes.array.isRequired,
  setGlobalTags: PropTypes.func.isRequired,
  value: PropTypes.array,
  onAddTag: PropTypes.func.isRequired,
  onRemoveTag: PropTypes.func.isRequired,
};