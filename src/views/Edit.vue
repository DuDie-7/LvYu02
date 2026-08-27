<template>
  <div style="min-height: 100vh; display: flex; justify-content: center; align-items: center; background: #f5f7fa;">
    <el-card style="width: 600px; padding: 20px;">
      <h2 style="text-align: center; margin-bottom: 20px;">✏️ 编辑留言</h2>

      <div v-if="loading" style="text-align: center; padding: 40px 0;">
        <p>加载中...</p>
      </div>

      <el-form v-else @submit.prevent="handleEdit">
        <el-form-item>
          <el-input v-model="title" placeholder="标题" size="large" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="content" type="textarea" :rows="6" placeholder="内容" size="large" />
        </el-form-item>

        <el-form-item style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
          <el-button type="primary" size="large" @click="handleEdit" :loading="saving">保存修改</el-button>
          <el-button size="large" @click="goBack">返回</el-button>
        </el-form-item>

        <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon style="margin-top: 10px;" />
        <el-alert v-if="success" :title="success" type="success" :closable="false" show-icon style="margin-top: 10px;" />
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
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')

// 加载留言数据
const fetchMessage = async () => {
  try {
    loading.value = true
    const res = await api.get(`/detail/${msgId}`, {
      headers: { 'Accept': 'application/json' }
    })
    title.value = res.data.title || ''
    content.value = res.data.content || ''
    error.value = ''
  } catch (err) {
    console.error('加载留言失败：', err)
    if (err.response?.status === 404) {
      error.value = '留言不存在'
    } else {
      error.value = '加载留言失败，请重试'
    }
  } finally {
    loading.value = false
  }
}

// 保存修改
const handleEdit = async () => {
  if (!title.value || !content.value) {
    ElMessage.warning('标题和内容不能为空')
    return
  }

  saving.value = true
  error.value = ''
  success.value = ''
  try {
    const res = await api.post(`/edit/${msgId}`, {
      title: title.value,
      content: content.value
    })
    success.value = '留言修改成功！'
    ElMessage.success('留言修改成功！')
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (err) {
    console.error('保存失败：', err)
    if (err.response?.status === 403) {
      error.value = '无权编辑此留言（只有作者可以编辑）'
    } else {
      error.value = err.response?.data?.error || '保存失败，请重试'
    }
  } finally {
    saving.value = false
  }
}

// 返回首页
const goBack = () => {
  router.push('/')
}

onMounted(() => {
  fetchMessage()
})
</script>