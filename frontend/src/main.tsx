import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import { Login } from './pages/Login'
import { Shell } from './pages/Shell'
import { Orders } from './pages/Orders'
import { Clients } from './pages/Clients'
import { Masters } from './pages/Masters'
import { Accounting } from './pages/Accounting'
import { Reports } from './pages/Reports'
import { Settings } from './pages/Settings'
import { Master } from './pages/Master'
import { useAuthStore } from './stores/auth'

const router = createBrowserRouter([
  { path: '/', element: <Login/> },
  {
    path: '/app',
    element: <Shell/>,
    children: [
      { path: 'orders', element: <Orders/> },
      { path: 'clients', element: <Clients/> },
      { path: 'masters', element: <Masters/> },
      { path: 'accounting', element: <Accounting/> },
      { path: 'reports', element: <Reports/> },
      { path: 'settings', element: <Settings/> },
      { path: 'master', element: <Master/> }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
