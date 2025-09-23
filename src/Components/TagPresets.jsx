import React from "react";
import PropTypes from "prop-types";
import { PRESETS } from "../utils/colors";

export default function TagPresets({ onSelect }) {
  return (
    <div className="tag-presets" aria-hidden={false}>
      {PRESETS.map((p) => (
        <button
          key={p.base}
          type="button"
          title={p.base}
          className="tag-preset-btn"
          onClick={() => onSelect(p.base)}
          style={{ background: p.base }}
        />
      ))}
    </div>
  );
}

TagPresets.propTypes = {
  onSelect: PropTypes.func.isRequired,
};