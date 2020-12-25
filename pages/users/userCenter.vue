<template>
  <div>
    <h1>用户中心</h1>
    <br>
    <p>欢迎您 {{ userName }}</p>
    <br>
    <div>
      <input type="file" name="file" @change="handleFileChange">
    </div>
    <br>
    <div>
      <el-button type="primary" @click="uploadFile">
        上传
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      userName: '',
      file: null
    }
  },
  mounted () {
    this.getUserInfo()
  },
  methods: {
    uploadFile () {
      const formData = new FormData()
      formData.append('name', 'file')
      formData.append('file', this.file)
      this.$http.post('uploadFile', formData)
    },
    handleFileChange (e) {
      const [file] = e.target.files
      if (!file) { return }
      this.file = file
    },
    async getUserInfo () {
      const res = await this.$http.get('/user/info')
      if (res.code === 0) {
        this.userName = res.data.nickname
        // this.$message.success('查询成功')
      } else {
        // this.$ .error('查询失败')
      }
    }
  }
}
</script>

<style>

</style>
