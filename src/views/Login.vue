<template>
  <div style="max-width: 400px; margin: 100px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
    <h1 style="text-align: center;">登录</h1>
    <form @submit.prevent="handleLogin">
      <div style="margin-bottom: 15px;">
        <label>用户名：</label>
        <input v-model="username" placeholder="请输入用户名" style="width: 100%; padding: 8px; margin-top: 5px;" />
      </div>
      <div style="margin-bottom: 15px;">
        <label>密码：</label>
        <input v-model="password" type="password" placeholder="请输入密码" style="width: 100%; padding: 8px; margin-top: 5px;" />
      </div>
      <button type="submit" style="width: 100%; padding: 10px; background: #42b883; color: white; border: none; border-radius: 4px; cursor: pointer;">登录</button>
    </form>
    <p v-if="error" style="color: red; text-align: center;">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const username = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }
  try {
    const response = await api.post('/auth/login', {
      username: username.value,
      password: password.value
    })
    // 存储用户信息到 localStorage
    localStorage.setItem('username', response.data.username || '')
    localStorage.setItem('userId', response.data.user_id || 0)
    localStorage.setItem('isAdmin', response.data.is_admin || false)
    // 登录成功，跳转到首页
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.error || '登录失败，请重试'
  }
}
</script>