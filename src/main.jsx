import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import AmbassadorPortal from './components/AmbassadorPortal.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

const refParam = new URLSearchParams(window.location.search).get('ref');
if (refParam && /^[A-Za-z0-9]{4,16}$/.test(refParam)) localStorage.setItem('ps_ref', refParam.toUpperCase());

const portalMatch = window.location.pathname.match(/^\/ambassador\/([A-Za-z0-9]{4,32})\/?$/);

ReactDOM.createRoot(document.getElementById('root')).render(portalMatch ? (
  <React.StrictMode><AmbassadorPortal code={portalMatch[1]} /></React.StrictMode>
) : (
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
));
