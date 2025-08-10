import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import { Login } from './pages/Login'
import { Shell } from './pages/Shell'
import { CallCenter } from './pages/CallCenter'
import { Master } from './pages/Master'
import { Accounting } from './pages/Accounting'
import { useAuthStore } from './stores/auth'

const router = createBrowserRouter([
  { path: '/', element: <Login/> },
  {
    path: '/app',
    element: <Shell/>,
    children: [
      { path: 'call', element: <CallCenter/> },
      { path: 'master', element: <Master/> },
      { path: 'acc', element: <Accounting/> }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
