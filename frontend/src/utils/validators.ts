export type ValidatorFn = (value: any) => string | null | Promise<string | null>

export async function runValidators(value: any, validators: ValidatorFn[]): Promise<string | null> {
  for (const v of validators) {
    const res = await v(value)
    if (res) return res
  }
  return null
}

export const required = (message = 'Поле обязательно'): ValidatorFn => value => {
  if (value === undefined || value === null || value === '') return message
  return null
}

export const isoDate = (message = 'Введите дату в формате ДД.ММ.ГГГГ ЧЧ:ММ'): ValidatorFn => value => {
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) return message
  return null
}

export const numberRange = (min: number, max: number, message?: string): ValidatorFn => value => {
  const num = Number(value)
  if (isNaN(num) || num < min || num > max) return message || `Число должно быть от ${min} до ${max}`
  return null
}
