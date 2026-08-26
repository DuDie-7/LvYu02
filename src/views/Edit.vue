<template>
  <div style="min-height: 100vh; display: flex; justify-content: center; align-items: center; background: #f5f7fa;">
    <el-card style="width: 600px; padding: 20px;">
      <h2 style="text-align: center; margin-bottom: 20px;">✏️ 编辑留言</h2>
      <el-form @submit.prevent="handleEdit">
        <el-form-item>
          <el-input v-model="title" placeholder="标题" size="large" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="content" type="textarea" :rows="6" placeholder="内容" size="large" />
        </el-form-item>
        <el-form-item style="display: flex; gap: 10px; justify-content: center;">
          <el-button type="primary" size="large" @click="handleEdit" :loading="loading">保存修改</el-button>
          <el-button size="large" @click="goBack">返回</el-button>
        </el-form-item>
        <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon />
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api'

const router = useRouter()
const route = useRoute()
const msgId = route.params.id

const title = ref('')
const content = ref('')
const loading = ref(false)
const error = ref('')

// 加载留言数据
const fetchMessage = async () => {
  try {
    const res = await api.get(`/detail/${msgId}`)
    // 注意：后端可能返回 HTML 或 JSON，这里用 JSON 方式
    // 但 /detail 路由目前返回的是 HTML，我们需要改为支持 JSON
    // 目前暂时跳过，直接让用户自己填写
    // 更好的做法：修改后端 detail 支持 JSON
  } catch (err) {
    ElMessage.error('加载留言失败')
  }
}

const handleEdit = async () => {
  if (!title.value || !content.value) {
    ElMessage.warning('标题和内容不能为空')
    return
  }
  loading.value = true
  error.value = ''
  try {
    await api.post(`/edit/${msgId}`, {
      title: title.value,
      content: content.value
    })
    ElMessage.success('修改成功！')
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.error || '修改失败，请重试'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  fetchMessage()
})
</script>