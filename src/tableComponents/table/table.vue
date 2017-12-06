<template>
  <div>
    <slot>
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        @filter-change="filterChangeFn"
        style="width: 100%">
        <template v-for="(item, index) in getState.table" v-if="item.column==='show'">
          <template v-if="!item.render">
            <template v-if="item.filter === true">
              <el-table-column
                :prop="item.key"
                :column-key="item.key"
                :label="item.title"
                sortable
                :filter-method="filterFn"
                :filters="item.filters"
                filter-placement="bottom-end"
                :width="item.width">
              </el-table-column>
            </template>
            <template v-else>
              <el-table-column
                :prop="item.key"
                :column-key="item.key"
                :label="item.title"
                sortable
                :width="item.width">
              </el-table-column>
            </template>
          </template>
          <template v-else-if="item.render">
            <el-table-column
              :fixed="item.fixed"
              :label="item.title"
              :width="item.width">
              <template slot-scope="scope">
                <template v-for="renderItem in item.render">
                  <el-button
                    v-if="renderItem.tag==='button'"
                    @click.native.prevent="renderItem.fn(scope)"
                    :type="renderItem.type"
                    size="small">
                    {{renderItem.text}}
                  </el-button>
                  <a
                    v-else-if="renderItem.tag==='a'"
                    :href="renderItem.href"
                  >
                    {{scope.row[item.key]}}
                  </a>
                </template>
              </template>
            </el-table-column>
          </template>
        </template>
      </el-table>
    </slot>
  </div>
</template>
<script>
  import Vue from 'vue'

  let isFirst = true
  import o from 'o.js'
  //  import clone from 'clone'
  import * as fn from '../common'
  import urlAppend from 'url-append'
  import clone from 'clone'

  export default {
    name: 'xtable',
    data() {
      return {
        loading: false, // 表格是否加载OK
        tableData: [], // 表格数据
        urlsKey: [],  // 数据字典名称
        urlsValues: []  // 数据字典url
      }
    },
    props: {
      // api接口
      tableHeight: {
        type: String,
        default: 'auto',
      },
      isUnregisterModule: {
        type: Boolean,
        default: true,
      },
      tableFn: Function,
      options: Object
    },
    beforeMount() {
      this.$xvuex.registerModule(this, this.options, this.options.gridKey)
    },
    mounted() {
      this.getDicMsg()
      this.loadingFn()
    },
    destroyed() {
      if (this.isUnregisterModule === true) {
        try {
          this.$store.unregisterModule(this.options.gridKey)
        } catch (e) {
        }
      }
      isFirst = true
    },
    watch: {
      /**
       * 监听requestUrl,获取table data,
       * 统一获取table data 的途径
       */
      'getState.requestUrl': {
        handler: function (val, oldVal) {
          if (oldVal !== val) {
            this.getList()
          }
        },
        deep: true
      },
      /**
       *  获取tableData 后处完相关数据塞进tableData，
       *  前台展示结果
       */
      'getState.tableData': {
        handler: function (val, oldVal) {
          if (oldVal !== undefined) {
            this.tableData = val
          }
        },
        deep: true
      },
      /**
       *  搜索筛选排序
       */
      'getState.searchBtn': {
        handler: function (val, oldVal) {
          if (oldVal !== val && oldVal !== undefined) {
            this.searchFn()
          }
        },
        deep: true
      },
    },
    computed: {
      getState() {
        return this.$store.state[this.options.gridKey]
      }
    },
    updated() {

    },
    methods: {
      searchFn() {
        let _this = this
        let url = this.getState.url
        let urlObj = {}
        /**
         *  条件筛选
         */
        let filterUrl = ``
        for (let filters in _this.getState.filterBox) {
          let filtersHtmls = ``
          _this.getState.filterBox[filters].forEach(function (key) {
            filtersHtmls += `${key}or`
          })
          filterUrl += `(${filtersHtmls.slice(0, -2)})and`
        }
        if (filterUrl !== '') {
          console.log(filterUrl)
          let initFilter = _this.getState.urlParameter.$filter
          if (initFilter !== '') {
            urlObj['filterUrl'] = `(${initFilter} and ${filterUrl.slice(0, -3)})`
          } else {
            urlObj['filterUrl'] = `(${filterUrl.slice(0, -3)})`
          }
        }

        /**
         *  url 拼接
         */
        let searchUrlString = ``
        let lastUrl = ``
        for (let key in urlObj) {
          if (key === 'filterUrl') {
            if (urlObj[key] !== '') {
              lastUrl += `&$filter=${urlObj[key]}and`
            }
          }
        }
        url += lastUrl
        console.log(url)
      },
      filterChangeFn(filters) {
        let searchBtn = this.getState.searchBtn
        this.$store.dispatch(this.options.gridKey + '_set_filterbox', filters)
        this.$store.dispatch(this.options.gridKey + 'setData', {searchBtn: !searchBtn})
      },
      filterFn(value, row) {
//        console.log(value, row)
      },
//     初始化url
      loadingFn() {
        let url = this.getState.url
        let urlParameter = this.getState.urlParameter
        let isFirst = false
        for (let item in urlParameter) {
          if (urlParameter[item] !== '') {
            if (isFirst === false) {
              isFirst = true
              url += `?${item}=${urlParameter[item]}`
            } else {
              url += `&${item}=${urlParameter[item]}`
            }
          }
        }
        this.$store.dispatch(this.options.gridKey + 'setData', {requestUrl: url})
      },
      //        获取表格和数据字典数据
      getList() {
        console.log(2333)
        let tableUrl = this.getState.requestUrl
        let _this = this
        let myRequests = [Vue.prototype.$api.request(tableUrl)]
//        避免数据字典重复请求
        let urlsValues = this.urlsValues
        this.urlsKey.forEach(function (key, index) {
          // 模块已存在则返回
          if (_this.$store.state[key]) {
            return
          }
          myRequests.push(Vue.prototype.$api.request(urlsValues[index]))
        })
        Promise.all(myRequests.map(myRequest =>
          fetch(myRequest).then(resp => {
            return resp.json()
          })
        )).then(datas => {
          datas.forEach(function (data, index) {
            if (index === 0) { // 第一个是table
              _this.$store.dispatch(_this.options.gridKey + 'setData', {initTableData: data.value})
            } else {
//              注册数据字典
              let gridKey = _this.urlsKey[index - 1]
              let initState = {
                data: data
              }
              _this.registerModule(initState, gridKey)
            }
          })
        })
      },
//      注册模块
      registerModule(initState, gridKey) {
        if (!this.$store) {
          console.error('未找到vuex store实例')
          return
        }
        // 为data-grid创建一个动态模块，并将其注册到vuex store中
        if (!gridKey) {
          console.error('props参数gridKey必须传入')
          return
        }
        // 模块已存在则返回
        if (this.$store.state[gridKey]) {
          return
        }
        this.$store.registerModule(gridKey, {
          state: initState
        })
      },
//      获取数据字典信息
      getDicMsg() {
        let urls = this.getState.dicUrls
        let urlsKey = Object.keys(urls)
        let urlsValues = Object.values(urls)
        this.urlsKey = urlsKey
        this.urlsValues = urlsValues
      },
      refreshFn() {

      }
    },
    filters: {}
  }
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

</style>
