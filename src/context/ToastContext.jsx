import React, { createContext, useContext, useState, useMemo } from 'react';

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div style={{ position: 'fixed', top: 20, right: 20, display: 'grid', gap: 8, zIndex: 1000 }}>
          {toasts.map((toast) => (
            <div key={toast.id} style={{
              background: toast.type === 'error' ? '#ef4444' : toast.type === 'success' ? '#22c55e' : '#3b82f6',
              color: '#fff',
              padding: '10px 14px',
              borderRadius: 8,
              minWidth: 200,
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)'
            }}>
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

export function ToastView() {
  return null;
}
