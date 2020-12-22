import Vue from 'vue'
import axios from 'axios'

const service = axios.create({
  baseURL: '/api'
})

// 请求拦截

// 相应拦截
service.interceptors.response.use((res) => {
  const { data } = res
  return data
})

Vue.prototype.$http = service

export const http = service
