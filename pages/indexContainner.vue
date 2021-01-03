<template>
  <el-container
    class="main_containner"
    style="border: 1px solid #eee"
  >
    <el-header style="text-align: right; font-size: 12px">
      <el-dropdown>
        <i
          class="el-icon-setting"
          style="margin-right: 15px"
        />
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>查看</el-dropdown-item>
          <el-dropdown-item>新增</el-dropdown-item>
          <el-dropdown-item>删除</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <span>王小虎</span>
    </el-header>

    <el-container direction="horizontal">
      <el-aside
        width="200px"
        style="background-color: rgb(238, 241, 246)"
      >
        <el-menu :router="true">
          <el-menu-item index="/users/userCenter">
            <i class="el-icon-setting" />
            <span slot="title">用户中心</span>
          </el-menu-item>

          <el-menu-item index="/editor/new">
            <i class="el-icon-setting" />
            <span slot="title">写文章</span>
          </el-menu-item>

          <el-submenu index="2">
            <template slot="title">
              <i class="el-icon-menu" />导航二
            </template>
            <el-menu-item-group>
              <template slot="title">
                分组一
              </template>
              <el-menu-item index="2-1">
                选项1
              </el-menu-item>
              <el-menu-item index="2-2">
                选项2
              </el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="分组2">
              <el-menu-item index="2-3">
                选项3
              </el-menu-item>
            </el-menu-item-group>
            <el-submenu index="2-4">
              <template slot="title">
                选项4
              </template>
              <el-menu-item index="2-4-1">
                选项4-1
              </el-menu-item>
            </el-submenu>
          </el-submenu>
          <el-submenu index="3">
            <template slot="title">
              <i class="el-icon-setting" />导航三
            </template>
            <el-menu-item-group>
              <template slot="title">
                分组一
              </template>
              <el-menu-item index="3-1">
                选项1
              </el-menu-item>
              <el-menu-item index="3-2">
                选项2
              </el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="分组2">
              <el-menu-item index="3-3">
                选项3
              </el-menu-item>
            </el-menu-item-group>
            <el-submenu index="3-4">
              <template slot="title">
                选项4
              </template>
              <el-menu-item index="3-4-1">
                选项4-1
              </el-menu-item>
            </el-submenu>
          </el-submenu>
        </el-menu>
      </el-aside>

      <el-main>
        <el-table :data="tableData">
          <el-table-column
            prop="date"
            label="日期"
            width="140"
          />
          <el-table-column
            prop="name"
            label="姓名"
            width="120"
          />
          <el-table-column
            prop="address"
            label="地址"
          />
        </el-table>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    const item = {
      date: '2016-05-02',
      name: '王小虎',
      address: '上海市普陀区金沙江路 1518 弄'
    }
    return {
      tableData: Array(10).fill(item)
    }
  }
}
</script>

<style>
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
}

.el-aside {
  color: #333;
}
.main_containner {
  width: 100%;
  height: 100%;
  position: fixed;
  min-width: 1000px;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
</style>
