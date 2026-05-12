// components/maintenance/Lightbox.jsx
import React, { useState, useEffect } from "react";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { imgURL } from "../../api/config";

const NavBtn = ({ onClick, className, children }) => (
  <button
    onClick={onClick}
    className={`btn border-0 rounded-circle d-flex align-items-center justify-content-center text-white ${className}`}
    style={{ width: 44, height: 44, background: "rgba(255,255,255,.15)" }}
  >
    {children}
  </button>
);

const Lightbox = ({ images, startIndex, onClose }) => {
  const [idx, setIdx] = useState(startIndex);
  const src = (img) => `${imgURL}/api/maintenance/images/${img.imageName}`;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setIdx((i) => Math.min(images.length - 1, i + 1));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, onClose]);

  return (
    <div
      onClick={onClose}
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(0,0,0,.92)", zIndex: 9999 }}
    >
      <NavBtn onClick={onClose} className="position-absolute top-0 end-0 m-3">
        <FaTimes size={16} />
      </NavBtn>

      {idx > 0 && (
        <NavBtn
          onClick={(e) => {
            e.stopPropagation();
            setIdx(idx - 1);
          }}
          className="position-absolute start-0 ms-3"
        >
          <FaChevronLeft size={18} />
        </NavBtn>
      )}

      <img
        src={src(images[idx])}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="rounded-3 shadow-lg"
        style={{ maxWidth: "88vw", maxHeight: "80vh", objectFit: "contain" }}
      />

      {idx < images.length - 1 && (
        <NavBtn
          onClick={(e) => {
            e.stopPropagation();
            setIdx(idx + 1);
          }}
          className="position-absolute end-0 me-3"
        >
          <FaChevronRight size={18} />
        </NavBtn>
      )}

      <div
        className="position-absolute bottom-0 mb-4 d-flex flex-column align-items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <small className="text-white-50">
          {idx + 1} / {images.length}
        </small>
        <div className="d-flex gap-2">
          {images.map((img, i) => (
            <img
              key={img.imageId}
              src={src(img)}
              alt=""
              onClick={() => setIdx(i)}
              className={`rounded-2 ${i === idx ? "opacity-100 border border-2 border-white" : "opacity-50"}`}
              style={{
                width: 48,
                height: 48,
                objectFit: "cover",
                cursor: "pointer",
                transition: "all .15s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Lightbox;