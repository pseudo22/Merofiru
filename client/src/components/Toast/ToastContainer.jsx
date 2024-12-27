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
    <div className="fixed top-0 right-0 mt-4 mr-4 z-50">
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
