import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'

export function Login() {
  const nav = useNavigate()
  const login = useAuthStore(s=>s.login)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string|null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    try {
      await login(phone, password)
      const user = (await (await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/auth/me', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      })).json()).user
      if (user?.role === 'CALL_CENTER' || user?.role === 'ADMIN') nav('/app/orders')
      else if (user?.role === 'MASTER') nav('/app/master')
      else nav('/app/accounting')
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen grid place-items-center">
      <form onSubmit={onSubmit} className="bg-white shadow rounded-2xl p-8 w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Appliance CRM</h1>
        <input className="w-full border rounded-xl p-3" placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)}/>
        <input className="w-full border rounded-xl p-3" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button className="w-full bg-blue-600 text-white rounded-xl p-3 hover:bg-blue-700 transition">Login</button>
      </form>
    </div>
  )
}
