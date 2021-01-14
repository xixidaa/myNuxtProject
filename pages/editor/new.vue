/* eslint-disable no-unused-vars */
/* eslint-disable vue/no-v-html */
<template>
  <div>
    <div class="write_btn">
      <el-button
        type="primary"
        @click="submit"
      >
        提交
      </el-button>
    </div>
    <el-row>
      <el-col :span="12">
        <textarea
          ref="editor"
          class="md_editor"
          :value="content"
          cols="30"
          rows="10"
          @input="handleUpdate"
        />
      </el-col>
      <el-col :span="12">
        <div
          class="md_containner"
          v-html="compileMarkdown"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import marked from 'marked'
import highlight from 'highlight.js'
// eslint-disable-next-line no-unused-vars
import javascript from 'highlight.js/lib/languages/javascript'
import 'highlight.js/styles/monokai-sublime.css'
import _ from 'lodash'
export default {

  data () {
    return {
      content: '',
      timer: null
    }
  },

  computed: {
    compileMarkdown () {
      return marked(this.content, { sanitize: false })
    }
  },

  created () {
  },
  mounted () {
    this.bindEvents()
    // 配置markdown
    marked.setOptions({
      rendered: new marked.Renderer(),
      highlight (code) {
        return highlight.highlightAuto(code).value
      }
    })
    // this.timer = null
  },
  destroyed () {
    clearTimeout(this.timer)
  },
  methods: {

    bindEvents () {
      // 监听粘贴事件
      this.$refs.editor.addEventListener('paste', function (e) {
        const file = e.clipboardData.files[0]
        console.log(file)
        // 上传逻辑
      })
      // 监听拖拽事件
      this.$refs.editor.addEventListener('drop', function (e) {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        console.log(file)
      })

      // 监听页面保存事件
      window.addEventListener('keydown', function (e) {
        if ((e.key === 's' || e.key === 'S') && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
          e.preventDefault()
          console.log('监听保存')
        }
      })
    },
    async submit () {
      if (this.content === '') {
        return this.$message.error('您没有编写任何东西')
      }
      const res = await this.$http.post('/article/create', {
        content: this.content, // 用户编写md存入数据库,selected:false
        compileMarkdown: this.compileMarkdown // 默认显示转译好的文本
      })
      if (res.code === 0) {
        this.$message.success('文章创建成功')
        this.timer = setTimeout(() => {
          this.$router.push('/')
        }, 500)
      }
    },
    // update (e) {
    //   if (this.timer) {
    //     clearTimeout(this.timer)
    //   }
    //   this.timer = setTimeout(() => {
    //     this.content = e.target.value
    //   }, 350)
    // },
    handleUpdate: _.debounce(function (e) {
      this.content = e.target.value
    }, 350)
  }
}
</script>

<style scoped>
.md_editor {
  width: 100%;
  height: 100vh;
  outline: none;
}
.write_btn {
  position: fixed;
  z-index: 100;
  right: 30px;
  top: 10px;
}
.md_containner >>> code {
  color: #f66;
}
</style>
