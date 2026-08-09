/**
 * Application Entry Point
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import i18n from './i18n'

// 디버깅용으로 window에 노출
window.i18n = i18n
window.changeLanguage = (lang: string) => i18n.changeLanguage(lang)
console.log('i18n initialized:', i18n.language)

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
