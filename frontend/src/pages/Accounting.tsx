import React, { useEffect, useState } from 'react'
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000', headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }})

export function Accounting() {
  const [orders, setOrders] = useState<any[]>([])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  async function load() {
    const res = await api.get('/orders', { params: { status: 'COMPLETED' } })
    setOrders(res.data)
  }
  useEffect(()=>{ load() }, [])

  const exportUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/reports/completed.csv` + (from||to ? `?from=${from||''}&to=${to||''}` : '')

  return (
    <div className="bg-white p-4 rounded-2xl shadow space-y-3">
      <div className="flex gap-2 items-end">
        <div>
          <label className="text-xs block">С</label>
          <input type="date" className="border p-2 rounded" value={from} onChange={e=>setFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-xs block">По</label>
          <input type="date" className="border p-2 rounded" value={to} onChange={e=>setTo(e.target.value)} />
        </div>
        <a className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition" href={exportUrl} target="_blank">Экспорт CSV</a>
      </div>
      <table className="w-full text-sm">
        <thead><tr className="text-left"><th className="p-2">Код</th><th className="p-2">Клиент</th><th className="p-2">Адрес</th><th className="p-2">Описание</th><th className="p-2">Сумма</th><th className="p-2">Оплата</th></tr></thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id} className="border-t">
              <td className="p-2">{o.code}</td>
              <td className="p-2">{o.client?.name} ({o.client?.phone})</td>
              <td className="p-2">{o.address}</td>
              <td className="p-2">{o.problem}</td>
              <td className="p-2">{o.totalAmount}</td>
              <td className="p-2">{o.paymentMethod}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
