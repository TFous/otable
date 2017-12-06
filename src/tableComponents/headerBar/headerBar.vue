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
        <el-col :span="6">
          <el-row class="searchWrap">
            <el-col :span="11">
              <el-select
                class="searchSelect"
                v-model="paramsSelect"
                multiple
                filterable
                allow-create
                placeholder="请选择关键词">
                <el-option
                  v-for="(item, key, val) in paramsOption"
                  :key="key"
                  :label="item"
                  :value="key">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="13">
              <el-input
                class="searchInput"
                icon="search"
                @keyup.enter.native="searchFn"
                v-model="paramsValue"
                placeholder="请输入..."
                :on-icon-click="searchFn">
              </el-input>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="8" v-if="options.timeSearch && timeSearchShow">
          <el-row>
            <el-col :span="6">
              <div style="margin-right: 4px;">
                <el-select v-model="timeSelectKey" placeholder="请选择">
                  <el-option
                    v-for="item in SelectOpints"
                    :value="item.value"
                    :label="item.label"
                    :key="item.value"
                  ></el-option>
                </el-select>
              </div>
            </el-col>
            <el-col :span="10">
              <el-date-picker
                class="dataSelect"
                :editable="false"
                v-model="searchTime"
                type="daterange"
                @change="searchTimeChange"
                placeholder="选择日期"
              >
              </el-date-picker>
            </el-col>
            <el-col :span="3">
              <el-button @click="searchFn" style="margin-left: 4px;">
                <Icon type="plus"></Icon>
              </el-button>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
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
        arr: [],
        advancedSearchBox: {}, // 高级搜索选项
        advancedSearch: false, // 高级搜索是否显示
        formItem: {}, // 存储高级搜索的值
        timeSearchShow: true,
        SelectOpints: [],
        timeSelectKey: '',
        searchTime: '',
        paramsOption: {},
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
    mounted: function () {
//      this.checkList = JSON.parse(localStorage.getItem('newColumn')) || []
//      设置 checkList
      let dropList = []
      this.getOptions.table.forEach(function (item) {
        dropList.push(item.title)
      })
//      console.log(dropList)
      this.dropList = dropList

      try {
        let arrFn = this.headerFn()
        common.bindFn(this, arrFn)
      } catch (e) {
      }
      this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {searchVal: ''})
      this.paramsOption = this.setOptions(this.options.table)
      this.advancedSearchBox = this.setAdSearchOptions(this.options.table)
      this.arr = clone(this.options.table)
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
      getOptions() {
        return this.$store.state[this.options.gridKey]
      }
    },
    watch: {
      'getOptions.adSearchBoolean': {
        handler: function (val, oldVal) {
          if (oldVal !== undefined) {
            this.advancedSearch = val
          }
        },
        deep: true
      }
    },
    methods: {
      column() {
        let newColumn = this.checkList
//        let newTable = []
//        let newOpt = clone(_this.getOptions)
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
      advancedSearchBtn() {
        for (let item in this.formItem) {
          this.formItem[item] = common.trim(this.formItem[item])
        }  // 去除空格
        this.$store.dispatch(this.options.gridKey + '_set_state_data', {advancedSearchBox: this.formItem})
        this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {searchBtn: !this.getOptions.searchBtn})
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
        let delObjs = _self.getOptions.delData
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
      searchTimeChange(val) {
        let startTime = val[0]
        let endTime = val[1]
        console.log(val)
        this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {endTime: endTime})
        this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {startTime: startTime})
      },
      endTimeFn(val) {
      },
      searchFn() {
        this.paramsValue = common.trim(this.paramsValue)
        this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {timeSelectKey: this.timeSelectKey})
        this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {searchBtn: !this.getOptions.searchBtn})
        this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {searchVal: this.paramsValue})
        this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {searchKeys: this.paramsSelect})
      },
      setOptions(data) {
        let o = {}
//        o['searchAll'] = '全部'
        for (let item of data) {
          if (item.search_hide !== 1 && item.type !== 'select' && item.type !== 'date') {
            o[item.key] = item.title
          }
        }
        return o
      },
      setAdSearchOptions(data) {
        let o = {}
        for (let item of data) {
          if (item.search_hide !== 1 && item.type !== 'select') {
            o[item.key] = item.title
          }
        }
        return o
      }
    }
  }
</script>
<style>
  .searchWrap {
    border: 1px solid #bfcbd9;
    border-radius: 4px;
    background: #fff;
  }

  .searchWrap input {
    border: 0px none !important;
    border-radius: 0px !important;
    background: transparent;
  }

  .searchWrap .el-select__tags {
    height: 30px;
    overflow: hidden;
    max-width: none !important;
  }

  .searchWrap:hover {
    border-color: #8391a5;
  }

  /*.searchSelect input{*/
  /*border: 0px none!important;*/
  /*border-radius: 0px!important;*/
  /*}*/
  /*.searchInput input{*/
  /*border: 0px none!important;*/
  /*border-radius: 0px!important;*/
  /*}*/
  .advancedSearchFoot {
    padding: 0px 63px 15px 63px;
    margin-bottom: 12px;
    border-bottom: 1px solid #dddee1;
  }

  .pagerHead3 {
    border-left: 6px solid red;
    padding-left: 12px;
    font-size: 18px;
  }

  .pagerHead {
    padding: 12px 0px;
  }

  .advancedSearch {
    margin-top: 20px;
  }

  .cellCol {
    display: inline-block;
    width: 24%;
  }
</style>
