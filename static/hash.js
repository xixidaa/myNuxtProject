// 引入spark-md5
self.importScripts('spark-md5.min.js')

self.onmessage = (e) => {
  // 子线程接收主线程传递的数据
  const { chunks } = e.data // 主线程传过来的分片数组
  const spark = new self.SparkMD5.ArrayBuffer() // 创建spark实例

  //   创建进度
  let progress = 0
  //   已上传个数
  let count = 0

  const loadNext = (index) => {
    const reader = new FileReader()
    reader.readAsArrayBuffer(chunks[index].file)
    reader.onload = (e) => {
      count++
      //   读文件后追加计算md5(增量计算MD5的过程)
      spark.append(e.target.result)

      if (count === chunks.length) {
        //   计算完成返回hash和进度 子线程向主线程传递数据
        self.postMessage({
          progress: 100,
          hash: spark.end()
        })
      } else {
        //   没计算完返回进度
        progress += 100 / chunks.length
        self.postMessage({
          progress
        })
        // 再进行下一个分片的hash计算
        loadNext(count)
      }
    }
  }
  //   启动计算第一块的hash
  loadNext(0)
}
