<template>
  <div style="min-height: 100vh; background: #f5f7fa;">
    <!-- 顶部导航 -->
    <el-header style="background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: space-between; padding: 0 30px; position: sticky; top: 0; z-index: 100;">
      <h2 style="color: #409EFF;">📝 留言板</h2>
      <div>
        <el-tag type="success" size="large" style="margin-right: 15px;">
          欢迎 {{ username }}
        </el-tag>
        <el-tag v-if="isAdmin" type="danger" size="large" style="margin-right: 15px;">
          🔑 管理员
        </el-tag>
        <el-button type="danger" @click="logout" plain>退出登录</el-button>
      </div>
    </el-header>

    <el-main style="max-width: 800px; margin: 0 auto; padding: 30px 20px;">
      <!-- 发布留言 -->
      <el-card style="margin-bottom: 30px;">
        <h3 style="margin-top: 0;">✏️ 发布留言</h3>
        <el-input v-model="newTitle" placeholder="请输入标题" style="margin-bottom: 15px;" />
        <el-input v-model="newContent" type="textarea" :rows="4" placeholder="请输入内容" style="margin-bottom: 15px;" />
        <el-button type="primary" @click="addMessage" :loading="submitting">发布留言</el-button>
      </el-card>

      <!-- 留言列表 -->
      <div v-for="msg in messages" :key="msg.id" style="background: white; padding: 15px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="flex: 1;">
            <h3 style="margin: 0 0 8px 0;">
              <span v-if="msg.is_pinned" style="color: #e6a23c; margin-right: 8px;">📌</span>
              {{ msg.title }}
            </h3>
            <p style="margin: 0 0 10px 0; color: #666;">{{ msg.content }}</p>
            <div style="font-size: 13px; color: #999;">
              作者：{{ msg.author_username || '匿名' }}
              <span v-if="msg.is_pinned" style="margin-left: 12px; color: #e6a23c;">置顶</span>
            </div>
          </div>
          <div style="display: flex; gap: 8px; flex-shrink: 0;">
            <el-button
              v-if="msg.author_id === currentUserId"
              type="warning"
              size="small"
              @click="editMessage(msg.id)"
              plain>
              编辑
            </el-button>
            <el-button
              v-if="msg.author_id === currentUserId || isAdmin"
              type="danger"
              size="small"
              @click="deleteMessage(msg.id)"
              plain>
              删除
            </el-button>
            <el-button
              v-if="isAdmin"
              :type="msg.is_pinned ? 'success' : 'primary'"
              size="small"
              @click="togglePin(msg.id)"
              plain>
              {{ msg.is_pinned ? '取消置顶' : '置顶' }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="messages.length === 0" style="text-align: center; padding: 50px 0; color: #999;">
        🗂️ 还没有留言，快来发布第一条吧！
      </div>
    </el-main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api'

const router = useRouter()
const username = ref('')
const isAdmin = ref(false)
const currentUserId = ref(0)
const messages = ref([])
const newTitle = ref('')
const newContent = ref('')
const submitting = ref(false)

// 获取留言列表
const fetchMessages = async () => {
  try {
    const res = await api.get('/', {
      headers: { 'Accept': 'application/json' }
    })
    messages.value = res.data.messages || []
  } catch (err) {
    if (err.response?.status === 401) {
      router.push('/login')
    }
  }
}

// 发布留言
const addMessage = async () => {
  if (!newTitle.value || !newContent.value) {
    ElMessage.warning('标题和内容不能为空')
    return
  }
  submitting.value = true
  try {
    await api.post('/add', {
      title: newTitle.value,
      content: newContent.value
    })
    ElMessage.success('留言发布成功！')
    newTitle.value = ''
    newContent.value = ''
    await fetchMessages()
  } catch (err) {
    ElMessage.error(err.response?.data?.error || '发布失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 删除留言
const deleteMessage = async (id) => {
  console.log('准备删除留言 ID:', id)
  try {
    await ElMessageBox.confirm('确定要删除这条留言吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    console.log('用户确认删除，正在发送请求...')
    const res = await api.get(`/delete/${id}`, {
      headers: { 'Accept': 'application/json' }
    })
    console.log('删除响应：', res)
    ElMessage.success('删除成功')
    await fetchMessages()
  } catch (err) {
    console.error('删除出错：', err)
    if (err === 'cancel') {
      console.log('用户取消删除')
    } else if (err.response) {
      ElMessage.error(err.response?.data?.error || '删除失败，请重试')
    } else {
      ElMessage.error('删除请求失败，请检查网络')
    }
  }
}

// 编辑留言（跳转）
const editMessage = (id) => {
  router.push(`/edit/${id}`)
}

// 切换置顶状态
const togglePin = async (id) => {
  try {
    const res = await api.post(`/pin/${id}`, {}, {
      headers: { 'Accept': 'application/json' }
    })
    ElMessage.success(res.data.message)
    await fetchMessages()
  } catch (err) {
    ElMessage.error(err.response?.data?.error || '操作失败，请重试')
  }
}

// 退出登录
const logout = async () => {
  await api.get('/auth/logout')
  localStorage.removeItem('isAdmin')
  localStorage.removeItem('username')
  localStorage.removeItem('userId')
  router.push('/login')
}

onMounted(() => {
  // 从 localStorage 读取用户信息
  username.value = localStorage.getItem('username') || ''
  isAdmin.value = localStorage.getItem('isAdmin') === 'true'
  currentUserId.value = parseInt(localStorage.getItem('userId') || '0')
  fetchMessages()
})
</script>