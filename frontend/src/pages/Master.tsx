import React, { useEffect, useState } from 'react'
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000', headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }})

export function Master() {
  const [orders, setOrders] = useState<any[]>([])
  const [selected, setSelected] = useState<any|null>(null)
  const [complete, setComplete] = useState({ amount: '', paymentMethod: 'CASH', comments: '' })

  async function load() {
    const res = await api.get('/orders')
    setOrders(res.data)
  }
  async function openOrder(id: string) {
    const res = await api.get('/orders/'+id)
    setSelected(res.data)
  }
  useEffect(()=>{ load() }, [])

  async function start(id: string) {
    await api.post(`/orders/${id}/start`)
    await openOrder(id)
  }
  async function finish(id: string) {
    const payload = { amount: Number(complete.amount||0), paymentMethod: complete.paymentMethod, comments: complete.comments||undefined }
    await api.post(`/orders/${id}/complete`, payload)
    await openOrder(id)
  }

  async function uploadFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selected || !e.target.files?.length) return
    const fd = new FormData()
    fd.append('orderId', selected.id)
    for (const f of Array.from(e.target.files)) fd.append('file', f)
    await api.post('/attachments', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    await openOrder(selected.id)
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="font-bold mb-2">Мои заявки</h2>
        <ul className="space-y-2">
          {orders.map(o => (
            <li key={o.id} className="border rounded p-2 flex justify-between">
              <div>
                <div className="font-mono">{o.code}</div>
                <div className="text-sm">{o.client?.name} — {o.address}</div>
              </div>
              <button className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700 transition" onClick={()=>openOrder(o.id)}>Открыть</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow">
        {selected ? (
          <div className="space-y-2">
            <div className="font-bold text-lg">{selected.code}</div>
            <div className="text-sm">{selected.client?.name} ({selected.client?.phone})</div>
            <div className="text-sm">{selected.address}</div>
            <div className="text-sm">Проблема: {selected.problem}</div>
            <div className="text-sm">Статус: {selected.status}</div>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition" onClick={()=>start(selected.id)}>Старт</button>
            </div>
            <div className="border-t pt-2">
              <div className="font-semibold">Завершить заявку</div>
              <div className="grid grid-cols-2 gap-2">
                <input className="border p-2 rounded" placeholder="Сумма" value={complete.amount} onChange={e=>setComplete({...complete, amount:e.target.value})}/>
                <select className="border p-2 rounded" value={complete.paymentMethod} onChange={e=>setComplete({...complete, paymentMethod:e.target.value})}>
                  <option value="CASH">Наличные</option>
                  <option value="CARD">Карта</option>
                  <option value="TRANSFER">Перевод</option>
                </select>
                <input className="border p-2 rounded col-span-2" placeholder="Комментарий" value={complete.comments} onChange={e=>setComplete({...complete, comments:e.target.value})}/>
                <button className="bg-green-600 text-white px-3 py-1 rounded col-span-2" onClick={()=>finish(selected.id)}>Завершить</button>
              </div>
            </div>
            <div className="border-t pt-2 space-y-2">
              <div className="font-semibold">Файлы</div>
              <input type="file" multiple onChange={uploadFiles}/>
              <ul className="text-sm list-disc pl-5">
                {selected.attachments?.map((a:any)=>(
                  <li key={a.id}><a className="text-blue-700 underline" href={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/attachments/${a.id}/download`} target="_blank">{a.filename}</a></li>
                ))}
              </ul>
            </div>
          </div>
        ) : <div className="text-gray-500">Выберите заявку</div>}
      </div>
    </div>
  )
}
