// components/common/SearchBox.jsx
import React from "react";
import { FaSearch } from "react-icons/fa";

const SearchBox = ({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  className = "",
}) => {
  return (
    <div className={`card border-0 rounded-4 shadow-sm ${className}`}>
      <div className="card-body p-3">
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0 rounded-start-3">
            <FaSearch className="text-muted" size={12} />
          </span>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="form-control border-start-0 rounded-end-3 bg-light"
            style={{ fontSize: 13 }}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchBox;