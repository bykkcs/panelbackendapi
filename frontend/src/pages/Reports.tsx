import React, { useState } from 'react'

export function Reports() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000'
  const link = `${base}/reports/completed.csv` + (from || to ? `?from=${from||''}&to=${to||''}` : '')

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
        <a className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition" href={link} target="_blank" rel="noreferrer">Экспорт CSV</a>
      </div>
      <p className="text-sm text-gray-600">Экспортирует все завершенные заказы за выбранный период.</p>
    </div>
  )
}
