import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AppRoutes from './routes';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App>
      <AppRoutes />
    </App>
  </React.StrictMode>
);
