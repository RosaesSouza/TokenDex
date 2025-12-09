import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { WalletProvider } from "./context/WalletContext";



const root = createRoot(document.getElementById('root'))
root.render(<App />)
root.render(
  <WalletProvider>
    <App />
  </WalletProvider>
);