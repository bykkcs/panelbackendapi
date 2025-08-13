export type OrderForm = {
  client: { name: string; phone: string; address: string; metro: string; howToGet: string };
  applianceType: string;
  applianceAge: string;
  problem: string;
  scheduledAt: string; // from <input type="datetime-local">
};

export async function validateOrder(form: OrderForm) {
  const errors: Record<string, string> = {};
  if (!form.client.name.trim()) errors['client.name'] = 'Укажите ФИО';
  if (!/^\+?\d{7,}$/.test(form.client.phone)) errors['client.phone'] = 'Телефон в международном формате';
  if (!form.client.address.trim()) errors['client.address'] = 'Адрес обязателен';
  if (!form.applianceType.trim()) errors['applianceType'] = 'Укажите вид техники';
  if (!form.problem.trim()) errors['problem'] = 'Опишите проблему';
  if (!form.scheduledAt) errors['scheduledAt'] = 'Укажите дату/время';

  return errors;
}

/** конвертирует значение из <input type="datetime-local"> в ISO 8601 */
export function toIsoDatetime(localValue: string | null | undefined) {
  if (!localValue) return null;
  // "YYYY-MM-DDTHH:mm" -> ISO в локальной TZ, затем в UTC
  const d = new Date(localValue);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}
