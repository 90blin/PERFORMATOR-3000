import React from "react";
import PropTypes from "prop-types";

export default function DescriptionPanel({ value = "", onChange }) {
  return (
    <div className="desc-panel">
      <textarea className="desc-textarea" value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="Describe the task..." />
    </div>
  );
}

DescriptionPanel.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};