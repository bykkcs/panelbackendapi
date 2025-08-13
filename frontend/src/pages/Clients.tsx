import React, { useEffect, useState } from 'react'
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000', headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }})

export function Clients() {
  const [clients, setClients] = useState<any[]>([])
  const [q, setQ] = useState('')

  async function load() {
    const res = await api.get('/clients', { params: { q } })
    setClients(res.data)
  }
  useEffect(() => { load() }, [])

  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <div className="flex gap-2 mb-3">
        <input className="border p-2 rounded w-full" placeholder="Поиск клиента..." value={q} onChange={e=>setQ(e.target.value)} />
        <button onClick={load} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Искать</button>
      </div>
      <table className="w-full text-sm">
        <thead><tr className="text-left"><th className="p-2">Имя</th><th className="p-2">Телефон</th><th className="p-2">Адрес</th></tr></thead>
        <tbody>
          {clients.map(c => (
            <tr key={c.id} className="border-t">
              <td className="p-2">{c.name}</td>
              <td className="p-2">{c.phone}</td>
              <td className="p-2">{c.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
