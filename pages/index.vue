<template>
  <div class="kkb-container">
    <VirtualList :list-data="articles" />
  </div>
</template>

<script>
import VirtualList from '@/components/VirtualList.vue'
export default {
  components: {
    VirtualList
  },
  data () {
    return {
      articles: [],
      articleItem: { views: 1, like: 0, dislike: 0, _id: '5ff6c0b9bc4f6b4f84804a90', title: '穿越火线 枪战王者', article_html: '<h1 id="穿越火线-枪战王者">穿越火线 枪战王者</h1>\n<p>cf</p>\n', author: { avatar: '', _id: '5fe2da28066ca53ba0cd845f', email: '575583692@qq.com', nickname: '嘻嘻哒啊', createdAt: '2020-12-23T05:48:24.620Z', updatedAt: '2020-12-23T05:48:24.620Z' }, createdAt: '2021-01-07T08:05:13.394Z', updatedAt: '2021-01-07T08:05:13.394Z', __v: 0 }
    }
  },

  // asyncData ({ redirect }) {
  //   redirect('/login')
  // }
  mounted () {
    this.getList()
  },
  methods: {
    async getList () {
      const ret = await this.$http.get('/article')
      if (ret.code === 0) {
        this.articles = ret.data.list
        // this.articles = new Array(10000).fill(this.articleItem)
      }
    }
  }
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
html {
  height: 100%;
}
body {
  height: 100%;
  margin: 0;
}
</style>
