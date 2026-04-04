import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import RootLayout from './components/root.layout.tsx'

import './index.css'

const App = React.lazy(() => import('@/App.tsx'))


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootLayout>
      <App />
    </RootLayout>
  </StrictMode>,
)
