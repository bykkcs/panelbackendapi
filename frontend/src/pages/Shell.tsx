import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'

export function Shell() {
  const nav = useNavigate()
  const logout = useAuthStore(s=>s.logout)

  function out() {
    logout()
    nav('/')
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm p-4 flex gap-4 items-center">
        <div className="font-bold">Appliance CRM</div>
        <nav className="flex gap-3">
          <Link to="/app/call" className="text-sm px-3 py-1 rounded bg-gray-100">Call-center</Link>
          <Link to="/app/master" className="text-sm px-3 py-1 rounded bg-gray-100">Master</Link>
          <Link to="/app/acc" className="text-sm px-3 py-1 rounded bg-gray-100">Accounting</Link>
        </nav>
        <div className="ml-auto">
          <button onClick={out} className="text-sm px-3 py-1 rounded bg-red-600 text-white">Logout</button>
        </div>
      </header>
      <main className="p-4">
        <Outlet/>
      </main>
    </div>
  )
}
