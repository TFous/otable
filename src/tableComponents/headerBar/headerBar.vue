<template>
  <div>
    <div class="pagerHead">
      <el-row :gutter="20">
        <el-col :span="7" align="right" style="float: right;">
          <slot></slot>
          <template v-if="refreshShow">
            <slot name="refreshBtn">
              <el-tooltip effect="dark" content="刷新页面，显示全部结果" placement="top-end">
                <el-button @click="refreshFn">
                  <i class="iconfont icon-refresh"></i>
                </el-button>
              </el-tooltip>
            </slot>
          </template>
          <slot name="refreshAfter"></slot>
          <template v-if="addShow">
            <slot name="addBtn">
              <el-tooltip content="新增" placement="top-end">
                <el-button type="primary" @click="setAddVisible">
                  <Icon type="plus"></Icon>
                </el-button>
              </el-tooltip>
            </slot>
          </template>
          <slot name="addAfter"></slot>
          <template v-if="delShow">
            <slot name="batchBtn">
              <el-tooltip content="批量删除" placement="top-end">
                <el-button type="error" @click="batchDel">
                  <Icon type="trash-a"></Icon>
                </el-button>
              </el-tooltip>
            </slot>
          </template>
          <slot name="delAfter"></slot>
          <el-dropdown :hide-on-click="false">
            <el-button type="primary">
              <i class="el-icon-caret-bottom el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown" class="hx-drapMenu">
              <el-checkbox-group v-model="checkList">
                <template v-for="item in dropList">
                  <el-dropdown-item>
                    <el-checkbox :label="item"></el-checkbox>
                  </el-dropdown-item>
                </template>
              </el-checkbox-group>
              <el-dropdown-item divided>
                <el-button type="primary" @click="column">确定</el-button>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
        <el-col :span="8">
          <div class="searchWrap">
            <el-input :clearable="true" placeholder="请输入内容" :disabled="isSeniorSearch" @keyup.enter.native="searchFn"
                      v-model="paramsValue"
                      class="input-with-select">
              <el-select v-model="paramsSelect" slot="prepend" placeholder="请选择" style="width:130px;">
                <el-option v-for="(item, key) in paramsOption"
                           :key="item.value"
                           :label="item.label"
                           :value="item.value"></el-option>
              </el-select>
              <el-button :disabled="isSeniorSearch" slot="append" @click="searchFn"
                         icon="el-icon-search"></el-button>
            </el-input>
          </div>
          <div class="seniorSearchBtn">
            <el-switch
              v-model="isSeniorSearch"
              @change="swichChangeFn"
              :active-text="seniorText">
            </el-switch>
          </div>
          <!--<el-button type="primary" icon="el-icon-search">高级</el-button>-->
        </el-col>
      </el-row>
      <!--高级搜索内容-->
      <div class="seniorWrap" v-show="isSeniorSearch">
        <el-row :gutter="20">
          <el-form ref="form" :model="formItem" label-width="120px">
            <template v-for="tableItem in optTables">
              <template v-for="seniorItem in seniorSearchOptions">
                <template v-if="tableItem.key===seniorItem.key">
                  <el-col :span="6">
                    <template v-if="seniorItem.type==='date'">
                      <el-form-item :label="seniorItem.title">
                        <el-date-picker
                          v-model="formItem[seniorItem.key]"
                          type="daterange"
                          range-separator="至"
                          start-placeholder="开始日期"
                          end-placeholder="结束日期">
                        </el-date-picker>
                      </el-form-item>
                    </template>
                    <template v-else-if="seniorItem.type==='number'">
                      <el-form-item :label="seniorItem.title">
                        <el-input v-model="formItem[seniorItem.key]"
                                  :clearable="true"
                                  @change="setNumber(seniorItem.key,seniorItem.title)"></el-input>
                      </el-form-item>
                    </template>
                    <template v-else>
                      <el-form-item :label="seniorItem.title">
                        <el-input @change="isEmptyKey(seniorItem.key)" v-model="formItem[seniorItem.key]"
                                  :clearable="true"></el-input>
                      </el-form-item>
                    </template>
                  </el-col>
                </template>
              </template>
            </template>
            <slot name="seniorSearch"></slot>
            <div style="text-align: right">
              <el-button type="primary" @click="seniorSearchFn">搜索</el-button>
              <el-tooltip :content="'当前搜索方式: ' + seniorSearchTip" placement="top">
                <el-switch
                  @change="seniorSearchTypeToggleFn"
                  v-model="seniorSearchType">
                </el-switch>
              </el-tooltip>
            </div>
          </el-form>
        </el-row>
      </div>
    </div>
  </div>
</template>
<script>
  import o from 'o.js'
  import Vue from 'vue'
  import urlAppend from 'url-append'
  import clone from 'clone'
  import * as common from '../common.js'

  export default {
    data() {
      return {
        seniorSearchType: false, // 高级搜索方式
        seniorSearchTip: '列表展示满足任意一个搜索条件的数据', // 高级搜索提示 当seniorSearchType ：false 的文字
        dropList: [],
        checkList: JSON.parse(localStorage.getItem('newColumn')) || [],
//        checkList: [],
        options5: [{
          value: 'HTML',
          label: 'HTML'
        }, {
          value: 'CSS',
          label: 'CSS'
        }, {
          value: 'JavaScript',
          label: 'JavaScript'
        }],
        value10: [],
        optTables: [],
        advancedSearchBox: {}, // 高级搜索选项
        advancedSearch: false, // 高级搜索是否显示
        isSeniorSearch: false, // 高级搜索是否显示
        seniorSearchOptions: [], // 高级搜索选项
        formItem: {}, // 存储高级搜索的值
        timeSearchShow: true,
        SelectOpints: [],
        timeSelectKey: '',
        searchTime: '',
        paramsOption: [],
        paramsValue: '',
        paramsSelect: 'searchAll' // 默认搜索
      }
    },
    props: {
      headerFn: Function,
      options: Object,
      searchShow: {
        type: [Boolean, String],
        default: true
      },
      refreshShow: {
        type: [Boolean, String],
        default: true
      },
      dorpStyle: {
        type: [Boolean, String],
        default: 'width:130px'
      },
      addShow: {
        type: [Boolean, String],
        default: true
      },
      adSearchShow: {
        type: [Boolean, String],
        default: true
      },
      delShow: {
        type: [Boolean, String],
        default: true
      }
    },
    beforeMount() {
    },
    mounted: function () {
      this.$xvuex.registerModule(this, this.options, this.options.gridKey)

//      this.checkList = JSON.parse(localStorage.getItem('newColumn')) || []
//      设置 checkList
      let dropList = []
      this.getState.table.forEach(function (item) {
        dropList.push(item.title)
      })
      this.dropList = dropList

      try {
        let arrFn = this.headerFn()
        common.bindFn(this, arrFn)
      } catch (e) {
      }
      this.$store.dispatch(this.getState.gridKey + 'setData', {searchVal: ''})
      this.paramsOption = this.setOptions(this.options.table)
      // 设置高级搜索键值
      this.setSeniorSearchOptions()
      this.optTables = clone(this.getState.table)
      this.SelectOpints = this.setSelectOpints(this.options.table)
      /**
       *   时间搜索是否显示：如果没有date属性则自动隐藏
       */
      if (this.SelectOpints.length === 0) {
        this.timeSearchShow = false
      }
      try {
        this.timeSelectKey = this.SelectOpints[0].value
      } catch (e) {

      }
      /**
       *  设置默认搜索
       */
      if (this.options.defaultSearch) {
        this.paramsSelect = this.options.defaultSearch
      }
    },
    computed: {
      getState() {
        return this.$store.state[this.options.gridKey]
      },
      seniorText() {
        let text
        if (this.isSeniorSearch === false) {
          text = '高级搜索关'
        } else {
          text = '高级搜索开'
        }
        return text
      }
    },
    watch: {
      'getState.adSearchBoolean': {
        handler: function (val, oldVal) {
          if (oldVal !== undefined) {
            this.advancedSearch = val
          }
        },
        deep: true
      }
    },
    methods: {
      seniorSearchTypeToggleFn(val) {
        if (val === true) {
          this.seniorSearchTip = '列表展示满足所有条件的数据'
        } else {
          this.seniorSearchTip = '列表展示满足任意一个搜索条件的数据'
        }
        this.$store.dispatch(this.options.gridKey + 'setData', {seniorSearchType: val})
      },
      isEmptyKey(key) {
        if (this.formItem[key] === '') {
          delete this.formItem[key]
        }
      },
      setNumber(key, title) {
        if (this.formItem[key] === '') {
          delete this.formItem[key]
          return
        }
        let val = Number(this.formItem[key])
        let isNumber = !Number.isNaN(val)
        if (isNumber === true) {
          this.formItem[key] = val
        } else {
          this.formItem[key] = ''
          this.$message({
            showClose: true,
            message: `${title} -- 必须为填写数字！`,
            type: 'warning'
          })
        }
      },
//     高级搜索
      seniorSearchFn() {
        for (let item in this.formItem) {
          this.formItem[item] = common.trim(this.formItem[item])
        }  // 去除空格
        let seniorSearchBox = clone(this.formItem)
        this.$store.dispatch(this.options.gridKey + 'setData', {seniorSearchBox: seniorSearchBox})
        this.$store.dispatch(this.options.gridKey + 'setData', {searchBtn: !this.getState.searchBtn})
        this.$store.dispatch(this.options.gridKey + 'setData', {isSeniorSearch: this.isSeniorSearch})
      },
//      设置高级搜索键值
      setSeniorSearchOptions() {
        let tableOptions = this.getState.table
        let _this = this
        tableOptions.forEach(function (item) {
          if (item.search_hide !== 1 && item.type !== 'select') {
            _this.seniorSearchOptions.push(item)
          }
        })
      },
      swichChangeFn(val) {
        console.log(val)
      },
      column() {
        let newColumn = this.checkList
//        let newTable = []
//        let newOpt = clone(_this.getState)
//        newOpt.table.forEach(function (item) {
//          newColumn.forEach(function (column) {
//            if (column === item.title) {
//              newTable.push(item)
//            }
//          })
//        })
//        newOpt.table = newTable
//        localStorage.setItem('newOpt', JSON.stringify(newOpt))
        localStorage.setItem('newColumn', JSON.stringify(newColumn))
//        location.reload()
        // DOM updated
//          _this.$store.dispatch(_this.options.gridKey + '_set_state_data', {table: newTable})
//        this.$store.dispatch(this.options.gridKey + '_set_refresh')
        this.$router.replace(`/app?r=${Math.random()}`)
      },
      switchChange(val) {
        this.$store.dispatch(this.options.gridKey + '_set_state_data', {adSearchBoolean: val})
      },
      refreshFn() {
        this.searchTime = null
        this.paramsValue = null
        this.$store.dispatch(this.options.gridKey + '_set_refresh')
      },
      setAddVisible() {
        this.$store.dispatch(this.options.gridKey + '_add_Window_Visible')
      },
      batchDel() { // 批量删除
        let _self = this
        let delObjs = _self.getState.delData
        let $length = delObjs.length
        if ($length === 0) {
          this.$Message.warning('请先选中需要删除的项目。')
          return
        }
        let nowNumber = 0
        _self.$Modal.confirm({
          title: '批量删除确认',
          content: '此操作将删除选中项, 是否继续?',
          onOk: function () {
            let url = _self.options.api.split('?$filter')[0]
            delObjs.forEach(function (Item) {
              o(urlAppend(url, {r: Math.random()})).find(Item.Id).remove().save().then(function (data) {
                nowNumber += 1
                if (nowNumber === $length) {
                  _self.$Message.info('删除成功')
                  _self.$store.dispatch(_self.options.gridKey + '_set_refresh')
                }
              })
            })
            //            删除最后一页 bug
            let states = _self.$store.state[_self.options.gridKey]
            let pagerCurrentPage = states.pager_CurrentPage
            let pageSize = states.pager_Size
            let pagerTotal = states.pager_Total
//            console.log(pager_Total % pageSize + '---------' + $length)
            if (pagerCurrentPage > 1 && pagerTotal % pageSize === $length) {
              _self.$store.dispatch(_self.options.gridKey + '_set_state_data', {pager_CurrentPage: pagerCurrentPage - 1})
            }
            _self.$store.dispatch(_self.options.gridKey + '_set_state_data', {delData: []})
          }
        })
      },
      setSelectOpints(data) {
        let arr = data
        let newArr = []
        arr.filter(function (e) {
          let o = {}
          if (e.type === 'date') {
            o['value'] = e.key
            o['label'] = e.title
            newArr.push(o)
          }
        })
        return newArr
      },
      searchFn() {
        this.paramsValue = common.trim(this.paramsValue)
        this.$store.dispatch(this.getState.gridKey + 'setData', {searchBtn: !this.getState.searchBtn})
        this.$store.dispatch(this.getState.gridKey + 'setData', {searchVal: this.paramsValue})
        this.$store.dispatch(this.getState.gridKey + 'setData', {searchKeys: this.paramsSelect})
      },
      setOptions(data) {
        let paramsOption = [{
          label: '全部',
          value: 'searchAll'
        }]
        for (let item of data) {
          if (item.search_hide !== 1 && item.type !== 'select' && item.type !== 'date') {
            let o = {}
            o.label = item.title
            o.value = item.key
            paramsOption.push(o)
          }
        }
        return paramsOption
      },
      setAdSearchOptions(data) {
        let o = {}
        for (let item of data) {
          if (item.search_hide !== 1 && item.type !== 'select') {
            o.label = item.title
            o.value = item.key
          }
        }
        return o
      }
    }
  }
</script>
<style>
  .pagerHead {
    overflow: hidden;
    padding: 0px 0px 12px 0px;
  }

  .seniorSearchBtn {
    display: inline-block;
  }

  .searchWrap {
    /*padding:20px 0px;*/
    margin-right: 20px;
    display: inline-block;
  }

  .searchWrap .el-input__inner {
    text-align: center;
  }
</style>
