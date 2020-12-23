<template>
  <div>
    <h1>用户中心</h1>
  </div>
</template>

<script>
export default {
  name: 'UserCenter',
  mounted () {
    this.getUserInfo()
  },
  methods: {
    async getUserInfo () {
      const res = await this.$http.get('/user/info')
      if (res.code === 0) {
        this.$message.success('查询成功')
      } else {
        // this.$message.error('查询失败')
      }
    }
  }
}
</script>

<style>

</style>
