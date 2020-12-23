<template>
  <div>
    <!-- <div>导航</div> -->
    <nuxt />
    <!-- <div>底部信息</div> -->
  </div>
</template>

<script>
export default {

}
</script>

<style lang="less">
.login-container {
  width: 100%;
  height: 100%;
  .login-form {
    width: 520px;
    // padding: 160px 0;
    // margin: 0 auto;
    overflow: hidden;
  }
  .title-container {
    text-align: center;
    margin-bottom: 20px;
    svg {
      width: 200px;
    }
  }
  .captcha-container {
    width: 340px;
    line-height: 1em;
    position: relative;
    vertical-align: bottom;
    .el-button {
      width: 120px;
      padding: 0;
      line-height: 40px;
    }
    .captcha {
      display: inline-block;
      position: absolute;
      right: -140px;
      img {
        width: 90px;
        // height: 50px;
        cursor: pointer;
      }
    }
  }
}
</style>
