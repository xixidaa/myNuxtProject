<template>
  <div>
    <h1>用户中心</h1>
    <br>
    <p>欢迎您 {{ userName }}</p>
    <br>
    <div id="drag" ref="drag">
      <input type="file" name="file" @change="handleFileChange">
    </div>
    <div>
      <el-progress :text-inside="true" :percentage="uploadProgress" :stroke-width="20" />
    </div>
    <br>
    <div style="textAlign:center">
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
      file: null,
      uploadProgress: 0 // 上传进度
    }
  },
  mounted () {
    this.getUserInfo()
    this.bindEvent()
  },
  methods: {
    bindEvent () {
      const drag = this.$refs.drag
      // 监听拖拽进
      drag.addEventListener('dragover', (e) => {
        drag.style.borderColor = 'lightcoral'
        e.preventDefault()
      })
      // 监听拖拽出
      drag.addEventListener('dragleave', (e) => {
        drag.style.borderColor = '#ccc'
        e.preventDefault()
      })
      // 监听拖拽放下
      drag.addEventListener('drop', (e) => {
        e.preventDefault()
        const fileList = e.dataTransfer.files
        drag.style.borderColor = '#ccc'
        this.file = fileList[0]
      })
    },
    uploadFile () {
      const formData = new FormData()
      formData.append('name', 'file')
      formData.append('file', this.file)
      this.$http.post('/uploadFile', formData, {
        onUploadProgress: (progress) => {
          // axios处理文件上传进度
          this.uploadProgress = Number(((progress.loaded / progress.total) * 100).toFixed(2))
        }
      })
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

<style lang="less" scoped>
  #drag {
    height: 100px;
    line-height: 100px;
    // width: 300px;
    border: 2px dashed #ccc;
    text-align: center;
    vertical-align: middle;
    // &:hover {
    //   border-color: lightcoral;
    // }
  }
</style>
