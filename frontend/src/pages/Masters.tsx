import React, { useEffect, useState } from 'react'
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000', headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }})

export function Masters() {
  const [masters, setMasters] = useState<any[]>([])

  async function load() {
    const res = await api.get('/orders/masters/list')
    setMasters(res.data)
  }
  useEffect(()=>{ load() }, [])

  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <h2 className="font-bold mb-2">Мастера</h2>
      <table className="w-full text-sm">
        <thead><tr className="text-left"><th className="p-2">Имя</th><th className="p-2">Телефон</th></tr></thead>
        <tbody>
          {masters.map(m => (
            <tr key={m.id} className="border-t">
              <td className="p-2">{m.name}</td>
              <td className="p-2">{m.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
