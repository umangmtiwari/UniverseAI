// Modal.js
import React from 'react';

function Modal({ message, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <p>{message}</p>
        <button className="close-button" onClick={onClose}>
          ✖
        </button>
      </div>
    </div>
  );
}

export default Modal;
