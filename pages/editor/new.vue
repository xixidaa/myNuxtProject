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
import _ from 'lodash'
export default {
  data () {
    return {
      content: ''
    }
  },
  computed: {
    compileMarkdown () {
      return marked(this.content)
    }
  },
  mounted () {
    // this.timer = null
  },
  methods: {
    submit () { },
    // update (e) {
    //   if (this.timer) {
    //     clearTimeout(this.timer, { sanitize: true })
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
</style>
