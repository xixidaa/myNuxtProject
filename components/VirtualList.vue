<template>
  <div
    ref="list"
    class="kkb-list-container"
    @scroll="scrollEvent($event)"
  >
    <div
      class="kkb-list-phantom"
      :style="{height: dynamicListHeight + 'px'}"
    />
    <!-- 展示列表的盒子 -->
    <div
      class="kkb-list"
      :style="{transform: getTop}"
    >
      <ArticleItem
        v-for="(item,index) in visibleData"
        :key="index"
        :article="item"
        :style="{height: size+'px'}"
        class="kkb-list-item"
      />
    </div>
  </div>
</template>

<script>
import ArticleItem from './ArticleItem'
export default {
  components: {
    ArticleItem
  },
  props: {
    listData: {
      type: Array,
      default: () => []
    },
    size: {
      type: Number,
      default: 200
    }
  },
  data () {
    return {
      screenHeight: 800,
      startOffset: 0, // 开始的偏移量
      start: 0,
      end: 4
      //   screenHeight: 1000,
      //   startOffset: 0, // 开始的偏移量
      //   start: 0, // 开始的索引
      //   end: 4 // 结束的索引
    }
  },
  computed: {
    dynamicListHeight () {
      return this.listData.length * this.size
    },
    getTop () {
      return `translate3d(0,${this.startOffset}px, 0)`
    },
    // 可视区域的列表项个数
    visibleCount () {
      return Math.ceil(this.screenHeight / this.size)
    },
    // 可视区域的数据
    visibleData () {
      return this.listData.slice(this.start, Math.min(this.end, this.listData.length))
    }
    // //   列表的总高度
    // dynamicListHeight () {
    //   return this.listData.length * this.size
    // },
    // // 列表向下偏移量
    // getTop () {
    //   return `translate3d(0,${this.startOffset}px,0)`
    // },
    // // 可视区域展示的个数
    // visibleCount () {
    //   return Math.ceil(this.screenHeight / this.size)
    // },
    // // 可以展示的列表项
    // visibleData () {
    //   // Math.min(this.end, this.listData.length) 避免越界情况的发生
    //   return this.listData.slice(this.start, Math.min(this.end, this.listData.length))
    // }
  },
  mounted () {
    this.end = this.start + this.visibleCount
  },
  methods: {
    scrollEvent (e) {
      //   console.log(e.target.scrollTop)
      //   const scrollTop = this.$refs.list.scrollTop
      const scrollTop = e.target.scrollTop
      this.start = Math.floor(scrollTop / this.size)
      this.end = this.start + this.visibleCount
      this.startOffset = scrollTop - (scrollTop % this.size)
    }
    // scrollEvent (e) {
    //   const scrollTop = this.$refs.list.scrollTop
    //   this.start = Math.floor(scrollTop / this.size)
    //   this.end = this.start + this.visibleCount
    //   this.startOffset = scrollTop - (scrollTop % this.size)
    // }
  }
}
</script>

<style scoped>
.kkb-list-container {
  height: 100%;
  overflow: auto;
  position: relative;
}
.kkb-list-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}
.kkb-list {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
}
.kkb-list-item {
  padding: 10px;
  color: #555;
  border-bottom: 1px solid #999;
}
</style>
