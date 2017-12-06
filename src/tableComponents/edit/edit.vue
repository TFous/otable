<template>
  <div>
    <el-dialog
      :title="'编辑 - '+ title"
      class="formDialog"
      :close-on-click-modal="false"
      :visible.sync="show"
      >
      <slot name="main">
        <el-form :label-position="labelPosition" label-width="150px" :model="eidtData" class="pl100">
          <template v-for="(item, key, index) in getOptions.table" v-if="item.addLayer!=='hide'">
            <div class="xtable-left">
              <template v-if="item.type ==='date'">
                <el-form-item
                  :prop="item.key"
                  :label="item.title"
                  :rules="item.rules"
                >
                  <div class="block">
                    <el-date-picker
                      :editable="false"
                      v-model="eidtData[item.key]"
                      type="date"
                      placeholder="选择日期"
                    >
                    </el-date-picker>
                  </div>
                </el-form-item>
              </template>
              <template v-else-if="item.type ==='select'">
                <el-form-item
                  :prop="item.key"
                  :label="item.title"
                  :rules="item.rules"
                >
                  <el-select v-model="eidtData[item.key]" placeholder="请选择">
                    <el-option
                      v-for="a in getOptions[item.key]"
                      :key="a.value"
                      :label="a.text"
                      :value="a.value"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
              </template>
              <template v-else-if="item.type ==='number'">
                <el-form-item
                  :prop="item.key"
                  :label="item.title"
                  :rules="item.rules"
                >
                  <el-input-number
                    :controls="false"
                    v-model="eidtData[item.key]"></el-input-number>
                </el-form-item>
              </template>
              <template v-else-if="item.type ==='textarea'">
                <el-form-item
                  :prop="item.key"
                  :label="item.title"
                  :rules="item.rules"
                >
                  <el-input
                    type="textarea"
                    v-model="eidtData[item.key]"
                    placeholder="请输入内容"
                  ></el-input>
                </el-form-item>
              </template>
              <template v-else>
                <el-form-item
                  :prop="item.key"
                  :label="item.title"
                  :rules="item.rules"
                >
                  <el-input
                    v-model="eidtData[item.key]"
                    placeholder="请输入内容"
                  ></el-input>
                </el-form-item>
              </template>
            </div>
          </template>
        </el-form>
      </slot>
      <span slot="footer" class="dialog-footer">
        <el-button @click="show = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit('addForm')">提 交</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import o from 'o.js'
  import * as common from '../common.js'
  import * as xVuex from '../xVuex.js'
  export default {
    data () {
      return {
        labelPosition: 'right', // label 对齐方式
        show: false,
        eidtData: {},
        bntShow: true,
        title: ''
      }
    },
    props: {
      editClass: {
        type: String,
        default: 'hxLayer'
      },
      // api接口
      editFn: Function,
      options: Object
    },
    beforeMount () {
    },
    mounted: function () {
      this.$forceUpdate()
      try {
        let arrFn = this.editFn()
        common.bindFn(this, arrFn)
      } catch (e) {
      }
      this.title = this.getOptions.edit_Window_Data.Name || this.options.title
    },
    computed: {
      getOptions () {
        return this.$store.state[this.options.gridKey]
      }
    },
    watch: {
      'getOptions.edit_Window_Visible': {
        handler: function (val, oldVal) {
          this.show = !this.show
          try {
            this.otherFn()
          } catch (e) {
          }
          if (val === true) {
            /**
             * 编辑对象，从this.getOptions.arr 筛选出必须的传给后台，过滤调其他方法新加的一些属性
             * @type {{}}
             */
            let o = {}
            for (let attr in this.getOptions.edit_Window_Data) {
              for (let item of this.getOptions.table) {
                if (item.key) {
                  if (item.key === attr) {
                    o[item.key] = this.getOptions.edit_Window_Data[item.key]
                  }
                }
              }
            }
            this.eidtData = Object.assign({}, o)
          } else {
            this.eidtData = {}
          }
        },
        deep: false
      }
    },
    methods: {
//      otherFn () {
//
//      },
      setVisible () {
        this.$store.dispatch(this.options.gridKey + '_edit_Window_Visible')
        this.handleReset('editForm')
      },
      handleSubmit (formName) {
//        this.bntShow = false
        let _self = this
        this.$refs[formName].validate((valid) => {
          if (valid) {
            for(let item in _self.eidtData) {
              _self.eidtData[item] = common.trim(_self.eidtData[item])
            }  // 去除空格
            let url = _self.options.api.split('?$filter')[0]
            o(url).find(_self.eidtData.Id).patch(_self.eidtData).save().then(function (data) {
              _self.$Message.success('修改成功')
              _self.$store.dispatch(_self.options.gridKey + '_set_refresh')
              _self.setVisible() // 关闭弹窗
//              _self.bntShow = true
            })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
      handleReset (name) {
        this.$refs[name].resetFields()
      }
    }
  }
</script>
<style scoped>

</style>
