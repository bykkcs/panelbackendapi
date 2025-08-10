import React, { useEffect, useState } from 'react'
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000', headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }})

export function CallCenter() {
  const [orders, setOrders] = useState<any[]>([])
  const [masters, setMasters] = useState<any[]>([])
  const [form, setForm] = useState({
    client: { name: '', phone: '', address: '', metro: '', howToGet: '' },
    applianceType: '',
    applianceAge: '',
    problem: '',
    scheduledAt: ''
  } as any)
  const [search, setSearch] = useState('')

  async function load() {
    const res = await api.get('/orders', { params: { search } })
    setOrders(res.data)
    const m = await api.get('/orders/masters/list')
    setMasters(m.data)
  }
  useEffect(()=>{ load() }, [])

  async function createOrder(e: React.FormEvent) {
    e.preventDefault()
    await api.post('/orders', form)
    setForm({ client: { name: '', phone: '', address: '', metro: '', howToGet: '' }, applianceType:'', applianceAge:'', problem:'', scheduledAt:'' })
    await load()
  }

  async function assign(id: string, masterId: string) {
    if (!masterId) return
    await api.post(`/orders/${id}/assign`, { masterId })
    await load()
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={createOrder} className="bg-white p-4 rounded-2xl shadow space-y-3">
        <h2 className="font-bold text-lg">Новая заявка</h2>
        <div className="grid grid-cols-2 gap-2">
          <input className="border p-2 rounded" placeholder="ФИО" value={form.client.name} onChange={e=>setForm({...form, client:{...form.client, name:e.target.value}})} />
          <input className="border p-2 rounded" placeholder="Телефон" value={form.client.phone} onChange={e=>setForm({...form, client:{...form.client, phone:e.target.value}})} />
          <input className="border p-2 rounded col-span-2" placeholder="Адрес" value={form.client.address} onChange={e=>setForm({...form, client:{...form.client, address:e.target.value}})} />
          <input className="border p-2 rounded" placeholder="Метро" value={form.client.metro} onChange={e=>setForm({...form, client:{...form.client, metro:e.target.value}})} />
          <input className="border p-2 rounded" placeholder="Как добраться" value={form.client.howToGet} onChange={e=>setForm({...form, client:{...form.client, howToGet:e.target.value}})} />
          <input className="border p-2 rounded" placeholder="Вид техники" value={form.applianceType} onChange={e=>setForm({...form, applianceType:e.target.value})} />
          <input className="border p-2 rounded" placeholder="Возраст техники" value={form.applianceAge} onChange={e=>setForm({...form, applianceAge:e.target.value})} />
          <input className="border p-2 rounded col-span-2" placeholder="Описание проблемы" value={form.problem} onChange={e=>setForm({...form, problem:e.target.value})} />
          <input type="datetime-local" className="border p-2 rounded" value={form.scheduledAt} onChange={e=>setForm({...form, scheduledAt:e.target.value})} />
        </div>
        <button className="bg-black text-white px-4 py-2 rounded">Создать</button>
      </form>

      <div className="space-y-3">
        <div className="bg-white p-3 rounded-2xl shadow flex gap-2">
          <input className="border p-2 rounded w-full" placeholder="Поиск по коду, адресу, имени..." value={search} onChange={e=>setSearch(e.target.value)} />
          <button onClick={load} className="bg-gray-800 text-white px-4 py-2 rounded">Искать</button>
        </div>
        <div className="bg-white p-2 rounded-2xl shadow">
          <table className="w-full text-sm">
            <thead><tr className="text-left"><th className="p-2">Код</th><th className="p-2">Клиент</th><th className="p-2">Адрес</th><th className="p-2">Статус</th><th className="p-2">Мастер</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t">
                  <td className="p-2">{o.code}</td>
                  <td className="p-2">{o.client?.name} ({o.client?.phone})</td>
                  <td className="p-2">{o.address}</td>
                  <td className="p-2">{o.status}</td>
                  <td className="p-2">
                    <select className="border p-1 rounded" defaultValue={o.assignedTo?.id||''} onChange={e=>assign(o.id, e.target.value)}>
                      <option value="">—</option>
                      {masters.map((m:any)=><option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
