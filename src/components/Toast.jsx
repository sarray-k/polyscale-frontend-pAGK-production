import React, { useContext } from 'react';
import { ToastContext } from '../context/ToastContext.jsx';

export function ToastView() {
  const context = useContext(ToastContext);
  if (!context) return null;
  return null;
}
