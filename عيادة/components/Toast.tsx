
import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-primary';

  return (
    <div className={`fixed bottom-8 right-8 ${bgColor} text-white px-6 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-bounce-in`}>
      <span className="material-symbols-outlined">
        {type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
      </span>
      <span className="font-bold">{message}</span>
    </div>
  );
};

export default Toast;
