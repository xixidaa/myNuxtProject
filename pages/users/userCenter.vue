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
    // 解析文件头信息
    blobToString (blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = function () {
          console.log(reader.result)
          const ret = reader.result.split('')
            .map(v => v.charCodeAt()) // 先转成asc码
            .map(v => v.toString(16).toUpperCase()) // 将十进制的asc码转化成二进制
            .map(v => v.padStart(2, '0')) // 生成1位的情况补0
          console.log(ret)

          resolve(ret.join(' '))
        }

        reader.readAsBinaryString(blob)
      })
    },

    // 判断gif
    async isGif (file) {
      // 判断gif格式: GIF89a GIF87a
      // gif的前6个16进制为: '47 49 46 38 39 61' 或 '47 49 46 38 37 61'
      // file splice()一下就变成了blob文件
      const res = await this.blobToString(file.slice(0, 6))

      const isGif = (res.toString() === '47 49 46 38 39 61') || (res.toString() === '47 49 46 38 37 61')
      return isGif
    },

    // 判断png
    async isPng (file) {
      // 判断png格式: 前8位16进制数
      const res = await this.blobToString(file.slice(0, 8))

      const isPng = res.toString() === '89 50 4E 47 0D 0A 1A 0A'
      return isPng
    },

    // 判断jpg
    async isJpg (file) {
      const length = file.size
      const start = await this.blobToString(file.slice(0, 2))
      const tail = await this.blobToString(file.slice(-2, length))

      const isJpg = (start === 'FF D8') && (tail === 'FF D9')
      return isJpg
    },

    // 判断文件是否为图片
    async isImage (file) {
      return await this.isGif(file) || await this.isPng(file) || await this.isJpg(file) // 文件读取是异步过程
    },

    async uploadFile () {
      // 上传之前校验格式
      if (!await this.isImage(this.file)) {
        this.$message.error('文件格式错误')
      } else {
        const formData = new FormData()
        formData.append('name', 'file')
        formData.append('file', this.file)
        try {
          const res = await this.$http.post('/uploadFile', formData, {
            onUploadProgress: (progress) => {
              // axios处理文件上传进度
              this.uploadProgress = Number(((progress.loaded / progress.total) * 100).toFixed(2))
            }
          })

          if (res.code === 0) {
            this.$message.success('上传成功')
          }
        } catch (error) {
          throw new Error(error)
        }
      }
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
