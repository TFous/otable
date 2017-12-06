<template>
  <div>
    <el-dialog
      :title="'新增 - '+options.title"
      class="formDialog"
      :close-on-click-modal="false"
      :visible.sync="show"
      :style="addStyle">
      <slot name="main">
        <el-form :label-position="labelPosition" label-width="150px" :model="dataMsg">
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
                      v-model="dataMsg[item.key]"
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
                  <el-select v-model="dataMsg[item.key]" placeholder="请选择">
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
                  <el-input
                    v-model="dataMsg[item.key]"
                    placeholder="请输入内容"
                    @change="setNumber(item.key)"
                  ></el-input>
                  <!--<el-input-number-->
                    <!--:controls="false"-->
                    <!--v-model="dataMsg[item.key]"></el-input-number>-->
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
                    v-model="dataMsg[item.key]"
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
                    v-model="dataMsg[item.key]"
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
  import urlAppend from 'url-append'
  import * as xVuex from '../xVuex.js'
  import * as common from '../common.js'
  import o from 'o.js'
  export default {
    data () {
      return {
        labelPosition: 'right', // label 对齐方式
        show: false,
        bntShow: true,
        dataMsg: Object
      }
    },
    props: {
      // api接口
      addFn: Function,
      options: Object,
      addStyle: String,
      addClass: {
        type: String,
        default: 'hxLayer',
      }
    },
    updated () {
    },
    mounted: function () {
      let _this = this
      let filterData = common.filterData(_this.getOptions.table)
      _this.dataMsg = Object.assign({}, filterData)

      try {
        let arrFn = _this.addFn()
        common.bindFn(_this, arrFn)
      } catch (e) {
      }
    },
    computed: {
      getOptions () {
        return this.$store.state[this.options.gridKey]
      }
    },
    watch: {
      'getOptions.add_Window_Visible': {
        handler: function (val, oldVal) {
          this.show = val
        },
        deep: true
      }
    },
    updated () {
    },
    methods: {
      setNumber (val) {
        this.dataMsg[val] = Number(this.dataMsg[val])
      },
//      筛选方法
      remoteMethod (val) {
      },
      setAddVisible (val) {
        this.$store.dispatch(this.options.gridKey + '_add_Window_Visible')
        this.handleReset('addForm')
      },
      handleSubmit (formName) {
        let _self = this
        let newData = Object.assign({}, _self.dataMsg)
        console.log(newData)
//        this.$refs[formName].validate((valid) => {
//          if (valid) {
//            _self.bntShow = false
//            setTimeout(function () {
//              _self.bntShow = true
//            }, 2000)
//            let newData = Object.assign({}, _self.dataMsg)
//            为date 设置null
//            for (let item in newData) {
//              if (newData[item] === '') {
//                newData[item] = null
//              }
//              newData[item] = common.trim(newData[item])  // 去除空格
//            }
//            let url = _self.options.api.split('?$filter')[0]
//            o(url).post(newData).save().then(function (data) {
//              _self.$Message.success('新增成功')
//              _self.$store.dispatch(_self.options.gridKey + '_set_refresh')
//              _self.$store.dispatch(_self.options.gridKey + '_set_state_data', {addSucess: data.data})
//              _self.setAddVisible() // 关闭弹窗
//            })
//          } else {
//            console.log('error submit!!')
//            return false
//          }
//        })
      },
      handleReset (name) {
        this.$refs[name].resetFields()
      }
    }
  }
</script>
<style scoped>

</style>
