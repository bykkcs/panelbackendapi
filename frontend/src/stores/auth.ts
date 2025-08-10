import { create } from 'zustand'
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000' })

type User = { id: string, name: string, phone: string, role: 'ADMIN'|'CALL_CENTER'|'MASTER'|'ACCOUNTING' }
type State = {
  token: string | null
  user: User | null
  login: (phone: string, password: string)=>Promise<void>
  logout: ()=>void
  api: typeof api
}

export const useAuthStore = create<State>((set, get) => ({
  token: localStorage.getItem('token'),
  user: null,
  api,
  async login(phone, password) {
    const res = await api.post('/auth/login', { phone, password })
    const { token, user } = res.data
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    localStorage.setItem('token', token)
    set({ token, user })
  },
  logout() {
    localStorage.removeItem('token')
    set({ token: null, user: null })
  }
}))
