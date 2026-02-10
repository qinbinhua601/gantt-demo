import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css';
import './styles.css';
import App from './App.jsx';
import { initializeNonce } from './nonce.js';

// Initialize CSP nonce
initializeNonce().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
  );
});

