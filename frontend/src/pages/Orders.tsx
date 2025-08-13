import React, { useEffect, useState } from 'react'
import { request, ApiFieldError } from '../utils/api'
import { validateOrder, OrderForm } from '../utils/orderValidators'
import { FieldError } from '../components/FieldError'

export function Orders() {
  const [orders, setOrders] = useState<any[]>([])
  const [masters, setMasters] = useState<any[]>([])
  const [form, setForm] = useState<OrderForm>({
    client: { name: '', phone: '', address: '', metro: '', howToGet: '' },
    applianceType: '',
    applianceAge: '',
    problem: '',
    scheduledAt: ''
  })
  const [errors, setErrors] = useState<Record<string, ApiFieldError>>({})
  const [banner, setBanner] = useState('')
  const [search, setSearch] = useState('')

  async function load() {
    try {
      const res = await request({ url: '/orders', params: { search } })
      setOrders(res)
      const m = await request({ url: '/orders/masters/list' })
      setMasters(m)
      setBanner('')
    } catch (err: any) {
      setBanner(err.message || 'Ошибка при загрузке данных')
    }
  }
  useEffect(() => { load() }, [])

  async function createOrder(e: React.FormEvent) {
    e.preventDefault()
    const validation = await validateOrder(form)
    if (Object.keys(validation).length) {
      const mapped: Record<string, ApiFieldError> = {}
      for (const [k, v] of Object.entries(validation)) mapped[k] = { message: v }
      setErrors(mapped)
      return
    }
    try {
      await request({ method: 'post', url: '/orders', data: form })
      setForm({
        client: { name: '', phone: '', address: '', metro: '', howToGet: '' },
        applianceType: '',
        applianceAge: '',
        problem: '',
        scheduledAt: ''
      })
      setErrors({})
      setBanner('')
      await load()
    } catch (err: any) {
      if (err.fieldErrors) {
        setErrors(err.fieldErrors)
      } else {
        setBanner(err.message || 'Ошибка при отправке данных')
      }
    }
  }

  async function assign(id: string, masterId: string) {
    if (!masterId) return
    try {
      await request({ method: 'post', url: `/orders/${id}/assign`, data: { masterId } })
      setBanner('')
      await load()
    } catch (err: any) {
      setBanner(err.message || 'Ошибка при назначении мастера')
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={createOrder} className="bg-white p-4 rounded-2xl shadow space-y-3">
        <h2 className="font-bold text-lg">Новая заявка</h2>
        {banner && <div className="bg-red-100 text-red-700 p-2 rounded">{banner}</div>}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              className={`border p-2 rounded w-full ${errors['client.name'] ? 'border-red-500' : ''}`}
              placeholder="ФИО"
              value={form.client.name}
              onChange={e => setForm({ ...form, client: { ...form.client, name: e.target.value } })}
            />
            <FieldError error={errors['client.name']} />
          </div>
          <div>
            <input
              className={`border p-2 rounded w-full ${errors['client.phone'] ? 'border-red-500' : ''}`}
              placeholder="Телефон"
              value={form.client.phone}
              onChange={e => setForm({ ...form, client: { ...form.client, phone: e.target.value } })}
            />
            <FieldError error={errors['client.phone']} />
          </div>
          <div className="col-span-2">
            <input
              className={`border p-2 rounded w-full ${errors['client.address'] ? 'border-red-500' : ''}`}
              placeholder="Адрес"
              value={form.client.address}
              onChange={e => setForm({ ...form, client: { ...form.client, address: e.target.value } })}
            />
            <FieldError error={errors['client.address']} />
          </div>
          <div>
            <input
              className={`border p-2 rounded w-full ${errors['client.metro'] ? 'border-red-500' : ''}`}
              placeholder="Метро"
              value={form.client.metro}
              onChange={e => setForm({ ...form, client: { ...form.client, metro: e.target.value } })}
            />
            <FieldError error={errors['client.metro']} />
          </div>
          <div>
            <input
              className={`border p-2 rounded w-full ${errors['client.howToGet'] ? 'border-red-500' : ''}`}
              placeholder="Как добраться"
              value={form.client.howToGet}
              onChange={e => setForm({ ...form, client: { ...form.client, howToGet: e.target.value } })}
            />
            <FieldError error={errors['client.howToGet']} />
          </div>
          <div>
            <input
              className={`border p-2 rounded w-full ${errors['applianceType'] ? 'border-red-500' : ''}`}
              placeholder="Вид техники"
              value={form.applianceType}
              onChange={e => setForm({ ...form, applianceType: e.target.value })}
            />
            <FieldError error={errors['applianceType']} />
          </div>
          <div>
            <input
              className={`border p-2 rounded w-full ${errors['applianceAge'] ? 'border-red-500' : ''}`}
              placeholder="Возраст техники"
              value={form.applianceAge}
              onChange={e => setForm({ ...form, applianceAge: e.target.value })}
            />
            <FieldError error={errors['applianceAge']} />
          </div>
          <div className="col-span-2">
            <input
              className={`border p-2 rounded w-full ${errors['problem'] ? 'border-red-500' : ''}`}
              placeholder="Описание проблемы"
              value={form.problem}
              onChange={e => setForm({ ...form, problem: e.target.value })}
            />
            <FieldError error={errors['problem']} />
          </div>
          <div>
            <input
              type="datetime-local"
              className={`border p-2 rounded w-full ${errors['scheduledAt'] ? 'border-red-500' : ''}`}
              value={form.scheduledAt}
              onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
            />
            <FieldError error={errors['scheduledAt']} />
          </div>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Создать
        </button>
      </form>

      <div className="space-y-3">
        <div className="bg-white p-3 rounded-2xl shadow flex gap-2">
          <input
            className="border p-2 rounded w-full"
            placeholder="Поиск по коду, адресу, имени..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            onClick={load}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Искать
          </button>
        </div>
        <div className="bg-white p-2 rounded-2xl shadow">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">Код</th>
                <th className="p-2">Клиент</th>
                <th className="p-2">Адрес</th>
                <th className="p-2">Статус</th>
                <th className="p-2">Мастер</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t">
                  <td className="p-2">{o.code}</td>
                  <td className="p-2">
                    {o.client?.name} ({o.client?.phone})
                  </td>
                  <td className="p-2">{o.address}</td>
                  <td className="p-2">{o.status}</td>
                  <td className="p-2">
                    <select
                      className="border p-1 rounded"
                      defaultValue={o.assignedTo?.id || ''}
                      onChange={e => assign(o.id, e.target.value)}
                    >
                      <option value="">—</option>
                      {masters.map((m: any) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
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
