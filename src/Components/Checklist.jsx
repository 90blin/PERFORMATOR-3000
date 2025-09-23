import React, { useCallback } from "react";
import PropTypes from "prop-types";

/*
 Props:
  - items: [{id,text,completed}]
  - onAdd(), onToggle(index), onChangeText(index, text), onRemove(index)
*/
export default function Checklist({ items = [], onAdd, onToggle, onChangeText, onRemove }) {
  return (
    <div className="checklist">
      {items.map((it, i) => (
        <div key={it.id || i} className="checklist-row slim">
          <input type="checkbox" checked={!!it.completed} onChange={() => onToggle(i)} aria-label={`toggle-${i}`} />
          <input className="checklist-text slim" value={it.text} onChange={(e) => onChangeText(i, e.target.value)} placeholder="Checklist item" />
          <button className="checklist-remove" onClick={() => onRemove(i)} aria-label={`remove-${i}`}>✕</button>
        </div>
      ))}
      <button className="checklist-add slim" onClick={onAdd}>+ Add item</button>
    </div>
  );
}

Checklist.propTypes = {
  items: PropTypes.array,
  onAdd: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  onChangeText: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};