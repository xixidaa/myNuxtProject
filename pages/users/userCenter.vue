<template>
  <div>
    <h1>用户中心</h1>
    <br>
    <p>欢迎您 {{ userName }}</p>
    <br>
    <!-- 解决上传字体加载过慢的问题 -->
    <i class="el-icon-upload" />
    <div
      id="drag"
      ref="drag"
    >
      <input
        type="file"
        name="file"
        @change="handleFileChange"
      >
    </div>
    <div>
      <el-progress
        :text-inside="true"
        :percentage="uploadProgress"
        :stroke-width="20"
      />
    </div>
    <br>
    <div style="textalign: center">
      <el-button
        type="primary"
        @click="uploadFile"
      >
        上传
      </el-button>
    </div>
    <br>
    <div>
      <p>计算hash进度</p>
      <el-progress
        :text-inside="true"
        :percentage="hashProgress"
        :stroke-width="20"
      />
    </div>

    <div>
      <!-- 每个chunk的progress
      <0 上传失败 红色  === 100 上传成功 绿色
       -->
      <div
        class="cubeContainer"
        :style="{ width: cubeWidth + 'px' }"
      >
        <div
          v-for="chunk in chunks"
          :key="chunk.chunkName"
          class="cube"
        >
          <div
            :class="{
              progress: chunk.progress > 0 && chunk.progress < 100,
              success: chunk.progress === 100,
              failed: chunk.progress < 0,
            }"
            :style="{ height: chunk.progress + '%' }"
          >
            <i
              v-if="chunk.progress > 1 && chunk.progress < 100"
              class="el-icon-loading"
              style="color: #f56c6c"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import SparkMD5 from 'spark-md5'
// const CHUNK_SIZE = 1 * 1024 * 1024 // 全局文件分片大小(webworker)
const CHUNK_SIZE_IDLE = 1 * 1024 * 1024 // 全局文件分片大小(requestIdleCallback)
export default {
  data () {
    return {
      userName: '',
      file: null,
      // uploadProgress: 0, // 上传进度
      chunks: [], // 文件分片
      hashProgress: 0,
      worker: null,
      hash: null // 文件hash
    }
  },
  computed: {
    cubeWidth () {
      // 对文件的长度开方算出每行个数 * 16px
      return Math.ceil(Math.sqrt(this.chunks.length)) * 16
    },
    uploadProgress () {
      if (!this.file || this.chunks.length) {
        return 0
      }
      const loaded = this.chunks.map((item) => {
        // 每个分片上传的大小 * 每个分片上传的进度 = 每个分片上传的部分
        return item.chunk.size * item.progress
      }).reduce((acc, cur) => acc + cur, 0)
      return parseInt(((loaded * 100) / this.file.size).toFixed(2))
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
    // 文件上传
    async uploadFile () {
      if (!this.file) {
        this.$message.error('请添加文件后上传')
        return
      }
      this.hashProgress = 0
      // this.uploadProgress = 0
      // webwork方式计算hash
      // const hash = await this.calculateHashWorker()
      // // 时间切片的方式计算hash
      // const hash1 = await this.calculateHashIdle()
      // 抽样hash计算
      this.hash = await this.calculateHashSample()

      // 在文件上传之前去查询该文件是否存在于后端
      const res = await this.$http.post('/checkFile', {
        hash: this.hash,
        ext: this.file.name.split('.').pop()
      })
      const { uploaded, uploadedList } = res.data

      if (uploaded) {
        this.$message.success('文件秒传成功!')
      } else {
        // 对文件进行切片
        this.chunks = this.createFileChunks(this.file)
        // 对文件进行预处理
        this.chunks = this.chunks.map((chunk, chunkIndex) => {
          // 切片的名称 hash + index
          const chunkName = this.hash + '-' + chunkIndex
          return {
            hash: this.hash,
            chunkName,
            chunkIndex,
            progress: uploadedList.includes(chunkName) ? 100 : 0, // 文件切片已存在进度条显示
            chunk: chunk.file
          }
        })
        // 处理分块上传
        await this.uploadChunks(uploadedList)
      }
    },
    // 处理分片上传
    async uploadChunks (uploadedList) {
      // 分片上传前过滤已上传分片
      //  处理文件传参,转成formdata
      const request = this.chunks
        .filter((chunk) => {
          return !uploadedList.includes(chunk.chunkName)
        })
        .map((chunk, index) => {
          const form = new FormData()
          form.append('chunkName', chunk.chunkName)
          form.append('hash', chunk.hash)
          form.append('chunk', chunk.chunk)
          // 解决断点续传上传进度条显示问题
          return { form, index: chunk.chunkIndex, error: 0 }
        })
      // 尝试申请的tcp链接过多,会导致浏览器卡顿
      // await Promise.all(request)
      // 异步的并发控制
      await this.sendRequest(request)
      // 上传完成后发送合并切片请求
      await this.mergeRequest()
    },
    sendRequest (request, limit = 4) {
      // limit 控制异步并发的请求数
      return new Promise((resolve, reject) => {
        const len = request.length
        let counter = 0
        let isStop = false // 是否终止文件上传标志位

        const start = async () => {
          const task = request.shift()
          if (isStop) {
            return
          }
          if (task) {
            const { form, index } = task
            try {
              await this.$http.post('/uploadFile', form, {
                onUploadProgress: (progress) => {
                  this.chunks[index].progress = Number(((progress.loaded * 100) / progress.total).toFixed(2))
                }
              })

              if (counter === len - 1) {
                // 最后一个任务
                resolve()
              } else {
                counter++
                // 启动下一个任务
                start()
              }
            } catch (err) {
              // 出现报错 进行重试 三次重试失败 终止上传
              this.chunks[index].progress = -1
              if (task.error < 3) {
                task.error++
                // 将需要重传的文件放到第一位
                request.unshift(task)
                start()
              } else {
                isStop = true
                reject(err)
              }
            }
          }
        }

        while (limit > 0) {
          // 启动limit个并发任务
          start()
          limit -= 1
        }
      })
    },
    // 合并分片请求
    mergeRequest () {
      this.$http.post('/requestMerge', {
        ext: this.file.name.split('.').pop(),
        hash: this.hash,
        size: CHUNK_SIZE_IDLE // 每个区块的大小 用于后端文件切片进行合并
      })
    },
    handleFileChange (e) {
      this.hashProgress = 0
      // this.uploadProgress = 0
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
.cubeContainer {
  .cube {
    width: 14px;
    height: 14px;
    line-height: 12px;
    border: 1px solid black;
    // background-color: #eee;
    float: left;
  }
}
.progress {
  background: #409eff;
}
.success {
  background: #67c23a;
}
.failed {
  background: #f56c6c;
}
</style>
