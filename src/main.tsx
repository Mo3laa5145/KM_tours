import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { I18nProvider } from './lib/i18n'
import { CatalogProvider } from './lib/catalogContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <CatalogProvider>
        <App />
      </CatalogProvider>
    </I18nProvider>
  </React.StrictMode>,
)
