import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Snowfall from 'react-snowfall'
import { CHRISTMAS } from './const.js'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {CHRISTMAS && <Snowfall
      color='rgba(255, 255, 255, 0.6)'
    />}
    <App />
  </React.StrictMode>,
)
