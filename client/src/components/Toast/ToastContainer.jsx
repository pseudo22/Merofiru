import React, { useState, useImperativeHandle, forwardRef } from 'react';
import Toast from './Toast';

const ToastContainer = forwardRef((props, ref) => {
  const [toasts, setToasts] = useState([]);

  useImperativeHandle(ref, () => ({
    addToast(message, type = 'info') {
      setToasts((prev) => [
        ...prev,
        { id: Date.now(), message, type },
      ]);
    },
  }));

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-80 z-50 space-y-4">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>

  );
});

export default ToastContainer;
