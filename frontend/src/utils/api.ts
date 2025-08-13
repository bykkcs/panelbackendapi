import axios, { AxiosError } from 'axios';

export type ApiFieldError = { message: string };

const baseURL =
  import.meta.env.VITE_API_URL /* docker-compose env */ ||
  '/api'; // dev-прокси

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const t = localStorage.getItem('token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

function toFieldMap(err: any): Record<string, ApiFieldError> | undefined {
  // бэк отдает массив zod-ошибок? мапим path -> message
  if (Array.isArray(err)) {
    const map: Record<string, ApiFieldError> = {};
    for (const e of err) {
      const key = Array.isArray(e.path) ? e.path.join('.') : String(e.path ?? 'form');
      map[key] = { message: e.message || 'Invalid' };
    }
    return map;
  }
}

export async function request<T = any>(cfg: {
  method?: 'get'|'post'|'put'|'patch'|'delete';
  url: string;
  params?: any;
  data?: any;
}): Promise<T> {
  try {
    const { data } = await api.request<T>(cfg);
    return data;
  } catch (e) {
    const ax = e as AxiosError<any>;
    const payload = ax.response?.data;
    const fieldErrors = toFieldMap(payload);
    const message =
      (typeof payload?.message === 'string' && payload.message) ||
      (Array.isArray(payload) ? 'Данные не прошли проверку' : ax.message || 'Ошибка запроса');
    throw Object.assign(new Error(message), { fieldErrors });
  }
}
