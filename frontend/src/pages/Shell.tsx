import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { Sidebar } from '../components/Sidebar'

export function Shell() {
  const nav = useNavigate()
  const logout = useAuthStore(s=>s.logout)

  function out() {
    logout()
    nav('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar/>
      <div className="md:ml-64 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm p-4 flex justify-end">
          <button onClick={out} className="text-sm px-3 py-1 rounded bg-red-600 text-white">Logout</button>
        </header>
        <main className="p-4 flex-1">
          <Outlet/>
        </main>
      </div>
    </div>
  )
}
