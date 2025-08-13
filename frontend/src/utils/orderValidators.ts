import { runValidators, required, isoDate, numberRange } from './validators'
import { api, ensureApiAvailable } from './api'

export interface OrderForm {
  client: { name: string; phone: string; address: string; metro: string; howToGet: string }
  applianceType: string
  applianceAge: string
  problem: string
  scheduledAt: string
}

export type OrderErrors = Record<string, string>

async function uniquePhone(phone: string): Promise<string | null> {
  if (!phone) return null
  try {
    await ensureApiAvailable()
    const res = await api.get('/clients/check-phone', { params: { phone } })
    if (res.data && res.data.exists) return 'Телефон уже используется'
  } catch {
    // ignore connectivity/endpoint errors
  }
  return null
}

export async function validateOrder(form: OrderForm): Promise<OrderErrors> {
  const errors: OrderErrors = {}

  const nameErr = await runValidators(form.client.name, [required()])
  if (nameErr) errors['client.name'] = nameErr

  const phoneErr = await runValidators(form.client.phone, [required(), uniquePhone])
  if (phoneErr) errors['client.phone'] = phoneErr

  const addressErr = await runValidators(form.client.address, [required()])
  if (addressErr) errors['client.address'] = addressErr

  const metroErr = await runValidators(form.client.metro, [required()])
  if (metroErr) errors['client.metro'] = metroErr

  const howErr = await runValidators(form.client.howToGet, [required()])
  if (howErr) errors['client.howToGet'] = howErr

  const typeErr = await runValidators(form.applianceType, [required()])
  if (typeErr) errors['applianceType'] = typeErr

  const ageErr = await runValidators(form.applianceAge, [required(), numberRange(0, 100)])
  if (ageErr) errors['applianceAge'] = ageErr

  const problemErr = await runValidators(form.problem, [required()])
  if (problemErr) errors['problem'] = problemErr

  const dateErr = await runValidators(form.scheduledAt, [required(), isoDate()])
  if (dateErr) errors['scheduledAt'] = dateErr

  return errors
}
