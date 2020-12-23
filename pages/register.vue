<template>
  <div class="login-container">
    <el-form
      ref="registerRef"
      class="login-form"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <div class="title-container">
        <Logo />
      </div>
      <el-form-item prop="email" label="邮箱">
        <span>
          <i class="el-icon-mobile" />
        </span>
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item prop="nickname" label="昵称">
        <span>
          <i class="el-icon-mobile" />
        </span>
        <el-input v-model="form.nickname" placeholder="请输入昵称" />
      </el-form-item>

      <el-form-item prop="passwd" label="密码">
        <span>
          <i class="el-icon-lock" />
        </span>
        <el-input v-model="form.passwd" placeholder="请输入密码" type="password" />
      </el-form-item>
      <el-form-item prop="repasswd" label="确认密码">
        <span>
          <i class="el-icon-lock" />
        </span>
        <el-input v-model="form.repasswd" placeholder="请再次输入密码" type="password" />
      </el-form-item>

      <el-form-item prop="captcha" label="验证码" class="captcha-container">
        <el-input v-model="form.captcha" placeholder="请输入验证码" />
        <div class="captcha">
          <img :src="captchaUrl" alt="" @click="updateCaptcha">
        </div>
      </el-form-item>

      <!-- <div :contenteditable="editable" @click="editable = true">
        编辑
      </div> -->

      <el-form-item>
        <el-button type="primary" @click.native.prevent="handleRegister">
          注册
        </el-button>
        <!-- <el-button type="primary" @click.native.prevent="onPop">
          点击
        </el-button> -->
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import md5 from 'md5'
import { throttle } from '../utils/debounce_throttle'
export default {
  layout: 'login',
  data () {
    return {
      handleRegister: null, // 存放防抖函数
      editable: false,
      rules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式' }
        ],
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'blur' }
        ],
        passwd: [
          { required: true, pattern: /^[\w_-]{6,12}$/g, message: '请输入6-12位密码', trigger: 'blur' }
        ],
        repasswd: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.form.passwd) {
                callback(new Error('两次密码不一致'))
              } else {
                callback()
              }
            }
          }
        ],
        captcha: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ]
      },
      form: {
        email: '575583692@qq.com',
        nickname: '嘻嘻哒啊',
        passwd: '123123123',
        repasswd: '123123123',
        captcha: '1231'
      },
      captchaUrl: '/api/captcha?_t=' + new Date().getTime()
    }
  },
  created () {
    this.handleRegister = throttle(this.register, 3000)
  },
  methods: {
    onPop () {
      window.open('http://119.254.217.194/questionnaire/start?channel=1&questionnaireId=1', '', 'top=100,left=100,width=414,height=736')
    },
    updateCaptcha () {
      this.captchaUrl = '/api/captcha?_t=' + new Date().getTime()
    },
    register () {
      this.$refs.registerRef.validate(async (valid) => {
        if (valid) {
          const obj = {
            email: this.form.email,
            passwd: md5(this.form.passwd),
            nickname: this.form.nickname,
            captcha: this.form.captcha
          }
          const res = await this.$http.post('/user/register', obj)
          if (res.code === 0) {
            // this.$alert('注册成功', '成功', {
            //   confirmButtonText: '去登录',
            //   callback: () => {
            //     this.$router.push('/login')
            //   }
            // })
            this.$message({
              type: 'success',
              message: '注册成功'
            })
          } else {
            this.$message.error(res.message)
          }
        }
      })
    }
  }
}
</script>

<style lang='less'>
.login-form {
  width: 800px;
  margin: 60px auto;
}
</style>
