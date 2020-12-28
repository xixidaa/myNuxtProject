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
    <br>
    <div>
      <p>计算hash进度</p>
      <el-progress :text-inside="true" :percentage="hashProgress" :stroke-width="20" />
    </div>
  </div>
</template>

<script>

import SparkMD5 from 'spark-md5'
// const CHUNK_SIZE = 1 * 1024 * 1024 // 全局文件分片大小(webworker)
const CHUNK_SIZE_IDLE = 0.1 * 1024 * 1024 // 全局文件分片大小(requestIdleCallback)
export default {
  data () {
    return {
      userName: '',
      file: null,
      uploadProgress: 0, // 上传进度
      chunks: [], // 文件分片
      hashProgress: 0,
      worker: null
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
          const ret = reader.result.split('')
            .map(v => v.charCodeAt()) // 先转成asc码
            .map(v => v.toString(16).toUpperCase()) // 将十进制的asc码转化成二进制
            .map(v => v.padStart(2, '0')) // 生成1位的情况补0

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

    // 将文件分片
    createFileChunks (file, chunkSize = CHUNK_SIZE_IDLE) {
      // 将文件根据预设的分片大小进行切分
      const chunks = []
      let curr = 0
      const fileSize = file.size
      while (curr < fileSize) {
        chunks.push({
          index: curr,
          file: file.slice(curr, curr + chunkSize)
        })
        curr += chunkSize
      }
      return chunks
    },

    // webWorker计算hash值
    calculateHashWorker () {
      return new Promise((resolve) => {
        // 创建影分身
        this.worker = new Worker('/hash.js')
        // 主线程向子线程传递数据
        this.worker.postMessage({ chunks: this.chunks })
        // 主线程接收来自子线程的数据
        this.worker.onmessage = (e) => {
          const { progress, hash } = e.data
          this.hashProgress = Number(progress.toFixed(2))
          if (hash) {
            resolve(hash)
          }
        }
      })
    },

    /* window.requestIdleCallback()方法将在浏览器的空闲时段内调用的函数排队。这使开发者能够在主事件循环上执行后台和低优先级工作，而不会影响延迟关键事件，如动画和输入响应。函数一般会按先进先调用的顺序执行，然而，如果回调函数指定了执行超时时间timeout，则有可能为了在超时前执行函数而打乱执行顺序。 */

    // 利用requestIdleCallback方式计算hash
    calculateHashIdle () {
      const chunks = this.chunks
      return new Promise((resolve) => {
        const spark = new SparkMD5.ArrayBuffer()
        // 利用每一个空闲时间去计算hash
        let count = 0

        // 追加函数
        const appendToSpark = (file) => {
          return new Promise((resolve) => {
            const reader = new FileReader()
            reader.readAsArrayBuffer(file) // 以数组的形式将文件读进来
            reader.onload = (e) => {
              // 追加计算MD5值
              spark.append(e.target.result)
              resolve()
            }
          })
        }

        const workLoop = async (deadline) => {
          while (count < chunks.length && deadline.timeRemaining() > 1) {
            // 有空闲时间且存在任务
            await appendToSpark(chunks[count].file)
            count++

            if (count < chunks.length) {
              // 没有计算完
              this.hashProgress = Number(((100 * count) / chunks.length).toFixed(2))
            } else {
              // 计算完毕
              this.hashProgress = 100
              resolve(spark.end())
            }
          }
          // 没有空闲时间排队执行
          window.requestIdleCallback(workLoop)
        }
        // 第一次调用
        window.requestIdleCallback(workLoop)
      })
    },

    // 抽样hash值计算
    calculateHashSample () {
      // 采用布隆过滤器思想,通过牺牲精度已达到更高效的计算文件的hash值
      // 取出文件的前2m数据和最后一块的数据 中间各个区块取出2个字节的数据
      return new Promise((resolve) => {
        const file = this.file
        const size = file.size
        const offset = 2 * 1024 * 1024
        const reader = new FileReader()
        const spark = new SparkMD5.ArrayBuffer()
        let curr = 0

        // 生成抽样文件
        // 第一个区块
        const chunks = [file.slice(0, offset)]
        curr = offset // 初始值从第二个区块开始
        while (curr < size) {
          if (curr + offset >= size) {
            // 最后一个区块
            chunks.push(file.slice(curr, curr + offset))
          } else {
            // 中间区块取出前中后2个字节
            const mid = (curr + offset) / 2
            const end = curr + offset

            chunks.push(file.slice(curr, curr + 2))
            chunks.push(file.slice(mid, mid + 2))
            chunks.push(file.slice(end - 2, end))
          }
          curr += offset
        }
        // 计算抽样文件hash
        reader.readAsArrayBuffer(new Blob(chunks))
        reader.onload = (e) => {
          spark.append(e.target.result)
          this.hashProgress = 100
          resolve(spark.end())
        }
      })
    },

    async uploadFile () {
      this.hashProgress = 0
      this.uploadProgress = 0
      this.chunks = this.createFileChunks(this.file)
      // webwork方式计算hash
      // const hash = await this.calculateHashWorker()
      // // 时间切片的方式计算hash
      // const hash1 = await this.calculateHashIdle()
      // console.log(hash)
      // console.log(hash1)
      // 抽样hash计算
      const hash2 = await this.calculateHashSample()
      console.log(hash2)
      // // 上传之前校验格式
      // if (!await this.isImage(this.file)) {
      //   this.$message.error('文件格式错误')
      // } else {
      //   const formData = new FormData()
      //   formData.append('name', 'file')
      //   formData.append('file', this.file)
      //   try {
      //     const res = await this.$http.post('/uploadFile', formData, {
      //       onUploadProgress: (progress) => {
      //         // axios处理文件上传进度
      //         this.uploadProgress = Number(((progress.loaded / progress.total) * 100).toFixed(2))
      //       }
      //     })

      //     if (res.code === 0) {
      //       this.$message.success('上传成功')
      //     }
      //   } catch (error) {
      //     throw new Error(error)
      //   }
      // }
    },
    handleFileChange (e) {
      this.hashProgress = 0
      this.uploadProgress = 0
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
