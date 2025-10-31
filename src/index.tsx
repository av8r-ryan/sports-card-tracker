import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

console.log('CardFlex™ initializing...');

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

console.log('Root element found, rendering app...');

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('App rendered successfully!');

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
