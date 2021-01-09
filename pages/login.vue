<template>
  <div class="login-container">
    <el-form
      ref="loginForm"
      class="login-form"
      :rules="rules"
      :model="form"
    >
      <div class="title-container">
        <Logo />
      </div>
      <el-form-item
        prop="email"
        label="邮箱"
      >
        <span>
          <i class="el-icon-mobile" />
        </span>
        <el-input
          v-model="form.email"
          placeholder="请输入邮箱"
        />
      </el-form-item>

      <el-form-item
        prop="captcha"
        label="验证码"
        class="captcha-container"
      >
        <el-input
          v-model="form.captcha"
          placeholder="请输入验证码"
        />
        <div class="captcha">
          <img
            :src="captchaUrl"
            alt=""
            @click="updateCaptcha"
          >
        </div>
      </el-form-item>

      <el-form-item
        prop="emailcode"
        label="邮箱验证码"
        class="captcha-container"
      >
        <el-input
          v-model="form.emailcode"
          placeholder="请输入邮箱验证码"
        />
        <div class="captcha">
          <el-button
            type="primary"
            :disabled="send.timer > 0"
            @click="sendEmailCode"
          >
            {{ sendText }}
          </el-button>
        </div>
      </el-form-item>

      <el-form-item
        prop="passwd"
        label="密码"
      >
        <span>
          <i class="el-icon-lock" />
        </span>
        <el-input
          v-model="form.passwd"
          placeholder="请输入密码"
          type="password"
          @keyup.enter.native="handleLogin"
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          @click.native.prevent="handleLogin"
        >
          登录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import md5 from 'md5'
// import _ from 'lodash'
import { throttle } from '../utils/debounce_throttle'

export default {
  layout: 'login',
  data () {
    return {
      timer: null,
      send: {
        timer: 0
      },
      form: {
        email: '575583692@qq.com',
        passwd: '123456',
        captcha: '',
        emailcode: ''
      },
      rules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式' }
        ],
        passwd: [
          { required: true, pattern: /^[\w_-]{6,12}$/g, message: '请输入6-12位密码', trigger: 'blur' }
        ],
        captcha: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ],
        emailcode: [
          { required: true, message: '请输入邮箱验证码', trigger: 'blur' }
        ]
      },
      captchaUrl: '/api/captcha?_t=' + new Date().getTime()
    }
  },
  computed: {
    sendText () {
      if (this.send.timer <= 0) {
        return '发送'
      } else {
        return `${this.send.timer}s后重新发送`
      }
    }
  },
  methods: {
    handleLogin: throttle(function () {
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          try {
            const obj = {
              email: this.form.email,
              passwd: md5(this.form.passwd),
              emailcode: this.form.emailcode,
              captcha: this.form.captcha
            }
            const res = await this.$http.post('/user/login', obj)
            if (res.code === 0) {
              this.$message.success('登录成功')
              localStorage.setItem('token', res.data.token)
              setTimeout(() => {
                this.$router.push('/')
              }, 500)
            } else {
              this.$message.error(res.message)
            }
          } catch (error) {
            throw new Error(error)
          }
        }
      })
    }, 500),
    updateCaptcha () {
      this.captchaUrl = '/api/captcha?_t=' + new Date().getTime()
    },
    // 发送邮箱验证码
    async sendEmailCode () {
      // @todo
      this.send.timer = 10
      this.timer = setInterval(() => {
        this.send.timer -= 1
        if (this.send.timer === 0) {
          clearInterval(this.timer)
        }
      }, 1000)
      await this.$http.get('/sendCode?email=' + this.form.email)
    }
  }
}
</script>

<style lang='less'>
.login-form {
  width: 800px;
  margin: 50px auto;
}
</style>
