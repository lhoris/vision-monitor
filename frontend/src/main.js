import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Application Entry Point
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
