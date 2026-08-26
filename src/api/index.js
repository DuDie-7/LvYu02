import axios from 'axios'

// 生产环境直接指向 Railway 后端
// 如果后期需要区分开发/生产，可以用 import.meta.env 控制，但这里直接用固定地址
const api = axios.create({
  baseURL: 'https://lvyu01-production.up.railway.app',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default api