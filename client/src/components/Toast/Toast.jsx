import React, { useEffect } from 'react';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`flex items-center font-medium justify-between p-4 mb-2 rounded-md text-black shadow-md`}>
      <p>{message}</p>
      <button onClick={onClose} className="ml-4 text-xl focus:outline-none">&times;</button>
    </div>
  );
};

export default Toast;
