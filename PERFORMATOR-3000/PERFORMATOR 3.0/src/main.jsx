import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

const rootEl = document.getElementById('root')

if (!rootEl) {
  console.error("Elemento '#root' não encontrado. Verifique se index.html contém <div id=\"root\"></div>.")
} else {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}