<template>
  <div class="surveyContainer">
    创建问卷
    <div
      v-for="(item,index) in list"
      :key="index"
      class="card_style"
    >
      <div style="text-align: left ">
        <p>No.{{ index }}</p>
        <div
          style="padding: 0 10px"
          contenteditable="currentIndex === i"
        >
          {{ item.name }}
        </div>
      </div>
      <br>
      <div>
        题型
        <el-select
          v-model="item.type"
          size="mini"
        >
          <el-option
            v-for="option in selectOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>
      <!-- 单选多选题 -->
      <div v-if="item.type !== 'star'">
        <div
          v-for="(option,j) in item.options"
          :key="j"
          class="option_list"
        >
          <div>
            <div
              class="option_style"
              contenteditable="currentIndex === j"
              @blur="handleBlur(option,$event)"
              @click="handleClickOptions(item,option)"
            >
              {{ option.name }}
            </div>
            <span v-show="j === item.options.length - 1">
              <i
                class="el-icon-circle-plus-outline"
                @click="handleAddOption(item,option)"
              />
              <i
                class="el-icon-remove-outline"
                @click="handleDelete(item,option)"
              />
            </span>
          </div>
        </div>
      </div>

      <!-- 量表题 -->
      <div v-if="item.type === 'star'">
        <el-rate
          v-model="item.starVal"
          show-text
          :texts="texts"
        />
      </div>
    </div>
    <el-button @click="handleClick">
      点击新增题目
    </el-button>
    <el-button @click="handleCreate">
      创建
    </el-button>
  </div>
</template>

<script>
export default {
  data () {
    return {
      list: [
        {
          name: '第一题',
          type: 'radio',
          options: [
            {
              index: 1,
              name: '选项A'
            },
            {
              index: 2,
              name: '选项B'
            },
            {
              index: 3,
              name: '选项C'
            },
            {
              index: 4,
              name: '选项D'
            }
          ],
          starVal: 3
        },
        {
          name: '第二题',
          type: 'multiple',
          options: [
            {
              index: 1,
              name: '选项A'
            },
            {
              index: 2,
              name: '选项B'
            },
            {
              index: 3,
              name: '选项C'
            },
            {
              index: 4,
              name: '选项D'
            }
          ],
          starVal: 3
        },
        {
          name: '第三题',
          type: 'multiple',
          options: [
            {
              index: 1,
              name: '选项A'
            },
            {
              index: 2,
              name: '选项B'
            },
            {
              index: 3,
              name: '选项C'
            },
            {
              index: 4,
              name: '选项D'
            }
          ],
          starVal: 3
        }
        // { name: '第三题' },
        // { name: '第四题' },
        // { name: '第五题' }
      ],
      currentIndex: null,
      demo: {
        name: '未命名',
        options: [
          {
            name: '选项A',
            index: 0
          },
          {
            name: '选项B',
            index: 1
          }
        ]
      },
      selectOptions: [
        {
          label: '单选题',
          value: 'radio'
        },
        {
          label: '多选题',
          value: 'multiple'
        },
        {
          label: '量表题',
          value: 'star'
        }
      ],
      optionItem: {
        name: '选项',
        index: null
      },
      texts: ['极其不满意', '较不满意', '一般', '较满意', '极其满意']
    }
  },
  methods: {
    handleClickOptions (item) {
      this.currentIndex = item.index
    },
    handleClick () {
      // console.log(this.list)
      this.list.push(this.demo)
    },
    handleBlur (option, e) {
      // eslint-disable-next-line unicorn/prefer-text-content
      option.name = e.target.innerText
      //   console.log(e.target.textContent)
    },
    handleDelete (item, option) {
      if (item.options.length === 1) {
        return this.$message.error('至少设置一个选项')
      }
      item.options = item.options.filter(v => v.index !== option.index)
    },
    handleAddOption (item, option) {
      const optionCopy = JSON.parse(JSON.stringify(this.optionItem))
      optionCopy.index = option.index + 1
      item.options.push(optionCopy)
    },
    handleCreate () {
      console.log(this.list)
    }
  }
}
</script>

<style>
.surveyContainer {
  padding: 10px;
  width: 500px;
  min-height: 900px;
  border: 1px solid #ccc;
  margin: 100px auto;
}
.card_style {
  margin: 10px 0;
  padding: 18px 16px;
  border-radius: 6px;
  box-shadow: -3px 4px 5px 2px #ccc;
}
.option_style {
  text-align: left;
  display: inline-block;
  width: 300px;
  margin: 10px 0;
  height: 30px;
  line-height: 30px;
}
.option_style:hover {
  border: 1px dashed #ccc;
}
.option_style:focus {
  border: 1px solid #f4f4f4;
  background: #f4f4f4;
  outline: none;
}
.option_list {
  text-align: left;
}
</style>
