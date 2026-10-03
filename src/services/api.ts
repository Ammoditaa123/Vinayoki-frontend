import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://vinayoki-backend.onrender.com',
  timeout: 15000,
})

export default api