import axios, { AxiosError, AxiosRequestConfig } from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
})

export interface ApiFieldError {
  message: string
  code?: string
  validation?: string
  path?: string[]
}

export function mapApiErrors(data: any[]): Record<string, ApiFieldError> {
  const result: Record<string, ApiFieldError> = {}
  if (Array.isArray(data)) {
    for (const err of data) {
      if (err.path && err.path.length) {
        result[err.path.join('.')] = {
          message: err.message,
          code: err.code,
          validation: err.validation,
          path: err.path
        }
      }
    }
  }
  return result
}

export async function ensureApiAvailable(): Promise<void> {
  const baseURL = api.defaults.baseURL || ''
  try {
    const url = new URL(baseURL)
    if (url.protocol !== window.location.protocol) {
      throw new Error('Неверный адрес API — протокол не соответствует')
    }
    if (url.hostname === 'localhost' && window.location.hostname !== 'localhost') {
      throw new Error('Неверный адрес API — локальный сервер недоступен')
    }
  } catch {
    throw new Error('Неверный адрес API — локальный сервер недоступен')
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 3000)
  try {
    await fetch(baseURL, { method: 'HEAD', signal: controller.signal })
  } catch (e) {
    throw new Error('Не удалось соединиться с API')
  } finally {
    clearTimeout(timer)
  }
}

export async function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  await ensureApiAvailable()
  try {
    const res = await api.request<T>(config)
    return res.data
  } catch (err) {
    const e = err as AxiosError<any>
    if (e.response) {
      if (e.response.status >= 500) {
        throw { message: 'Внутренняя ошибка сервера' }
      }
      const mapped = mapApiErrors(e.response.data)
      if (Object.keys(mapped).length) {
        throw { fieldErrors: mapped }
      }
      throw { message: 'Ошибка при отправке данных' }
    }
    throw { message: 'Ошибка при отправке данных' }
  }
}
