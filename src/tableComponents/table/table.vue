<template>
  <div class="otable">
    <slot>
      <el-table
        :data="getState.tableData"
        border
        :stripe="false"
        @selection-change="selectCheckbox"
        @filter-change="filterChangeFn"
        @sort-change="sortChangeFn"
        style="width: 100%">
        <el-table-column
          v-if="getState.isSelection"
          type="selection"
          width="35">
        </el-table-column>
        <template v-for="(item, index) in getState.table" v-if="item.column==='show'">
          <template v-if="!item.render">
            <template v-if="item.filter === true">
              <el-table-column
                :fixed="item.fixed"
                :prop="item.key"
                :column-key="item.key"
                :label="item.title"
                sortable
                :filters="item.filters"
                filter-placement="bottom-end"
                :width="item.width">
              </el-table-column>
            </template>
            <template v-else>
              <el-table-column
                :fixed="item.fixed"
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
                    plain>
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
  import * as common from '../common'
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
          if (oldVal !== val && oldVal !== undefined) {
            this.getList()
          }
        },
        deep: true
      },
      /**
       *  获取tableData 后处完相关数据塞进tableData，
       *  前台展示结果
       */
//      'getState.tableData': {
//        handler: function (val, oldVal) {
//          if (oldVal !== undefined) {
//            this.tableData = val
//          }
//        },
//        deep: true
//      },
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
      /**
       *   刷新按钮
       */
      'getState.refresh': {
        handler: function (val, oldVal) {
          if (oldVal !== undefined) {
            this.refreshFn()
          }
        },
        deep: true
      },
      /**
       *  每页展示数量变化
       */
      'getState.pager_Size': {
        handler: function (val, oldVal) {
          if (oldVal !== undefined && oldVal !== val) {
            this.$store.dispatch(this.options.gridKey + 'setData', {pager_CurrentPage: 1})
            this.getList(val)
          }
        },
        deep: true
      },
      /**
       *  页数变化
       */
      'getState.pager_CurrentPage': {
        handler: function (val, oldVal) {
          this.$store.dispatch(this.options.gridKey + 'setData', {pager_CurrentPage: val})
          if (oldVal !== undefined && oldVal !== val) {
            this.getList()
          }
        },
        deep: true
      }
    },
    computed: {
      getState() {
        return this.$store.state[this.options.gridKey]
      }
    },
    updated() {

    },
    methods: {
      selectCheckbox(selection) {
        let select = clone(selection)
        this.$store.dispatch(this.options.gridKey + 'setData', {selection: select})
      },
      /**
       *  基本思路：创建一个urlObj,每个属性是一个关键词的集合，条件关键词无非就是filter/order等，
       *  存放之前先判断对象中是否有这个关键词，如果没有直接塞进去，有则在已存在那里继续拼接
       *  定义 filterUrl，sortUrl，expandUrl
       */
      searchFn() {
        let _this = this
        let url = this.getState.url
        let urlObj = {}
        /**
         *  条件筛选
         *
         */
        let filterUrl = ``
        let filtersBOx = _this.getState.filterBox
        if (Object.keys(filtersBOx).length !== 0) {
          for (let filters in filtersBOx) {
            let filtersHtmls = ``
            filtersBOx[filters].forEach(function (key) {
              filtersHtmls += `${key}or`
            })
            filterUrl += `(${filtersHtmls.slice(0, -2)})and`
          }
          if (filterUrl !== '') {
            let initFilter = _this.getState.urlParameter.$filter
            if (initFilter !== '') {
              let url = `$filter=(${initFilter} and ${filterUrl.slice(0, -3)})`
              urlObj['filterUrl'] = _this.isHasKey(urlObj['filterUrl'], url, '$filter=')
            } else {
//              urlObj['filterUrl'] = `$filter=(${filterUrl.slice(0, -3)})`
              let url = `$filter=(${filterUrl.slice(0, -3)})`
              urlObj['filterUrl'] = _this.isHasKey(urlObj['filterUrl'], url, '$filter=')
            }
          }
        }
        /**
         *  关键词搜索
         *
         */
        let isSeniorSearch = _this.getState.isSeniorSearch
        if (isSeniorSearch === false) {
          _this.keyWordSearch(urlObj)
        } else {
          _this.seniorSearchFn(urlObj)
        }
        /**
         *  排序条件
         *  目前只支持单列排序
         *  多列功能后面组建支持，功能上基本没问题
         *
         *  如果执行排序，则用排序，不然用初始排序
         */
        let sortUrl = ``
        let sortBox = _this.getState.sortBox
        if (Object.keys(sortBox).length !== 0) {
          sortUrl = `$orderby=${sortBox.prop} ${sortBox.order}`
        }
        let initSort = _this.getState.urlParameter.$orderby
        if (sortUrl !== '') {
          urlObj['sortUrl'] = sortUrl
        } else if (initSort !== '') {
          urlObj['sortUrl'] = `$orderby=${initSort}`
        }
        /**
         *  $expand 扩展
         *  目前只支持初加载 vuex => options => urlParameter  => $expand
         *
         */
        let initExpand = _this.getState.urlParameter.$expand
        let expandUrl = initExpand !== '' ? initExpand : ''
        if (expandUrl !== '') {
          urlObj['expandUrl'] = `$expand=${expandUrl}`
        }
        /**
         *  url 拼接
         */
        let urlValues = Object.values(urlObj)
        urlValues.forEach(function (item, index) {
          if (index === 0) {
            url += `?${item}`
          } else {
            url += `&${item}`
          }
        })
        _this.$store.dispatch(_this.options.gridKey + 'setData', {requestUrl: urlAppend(url, {r: Math.random()})})
      },
//     高级搜索
      seniorSearchFn(urlObj) {
        let _this = this
        let seniorObj = _this.getState.seniorSearchBox
        let otherSeniorSearchOpt = _this.getState.otherSeniorSearchOpt
        let seniorSearchType = this.getState.seniorSearchType
        let typeKey, sliceLength
        if (seniorSearchType === false) {
          typeKey = 'or'
          sliceLength = -2
        } else {
          typeKey = 'and'
          sliceLength = -3
        }
        let valUrl = ``
        for (let item in seniorObj) {
          if (typeof seniorObj[item] === 'number') {
            valUrl += `(${item} eq ${Number(seniorObj[item])})${typeKey}`
          } else if (typeof seniorObj[item] === 'string') {
            valUrl += `(contains(${item},'${seniorObj[item]}'))${typeKey}`
          } else if (seniorObj[item] instanceof Array === true) {
            let startTime = common.setStarTime(seniorObj[item][0])
            let endTime = common.endTime(seniorObj[item][1])
            valUrl += `(${item} ge ${startTime} and ${item} le ${endTime})${typeKey}`
          }
        }
//        手动添加的搜索条件
        for (let item in otherSeniorSearchOpt) {
          if (otherSeniorSearchOpt[item] instanceof Array === true) {
            let length = otherSeniorSearchOpt[item].length
            let i = 0
            for (; i < length; i++) {
              // 最后一个是and
              if (i === (length - 1)) {
                if (typeof otherSeniorSearchOpt[item][i] === 'number') {
                  valUrl += `(${item} eq ${otherSeniorSearchOpt[item][i]})${typeKey}`
                } else if (typeof otherSeniorSearchOpt[item][i] === 'string') {
                  valUrl += `(${item} eq '${otherSeniorSearchOpt[item][i]}')${typeKey}`
                }
              } else {
                if (typeof otherSeniorSearchOpt[item][i] === 'number') {
                  valUrl += `(${item} eq ${otherSeniorSearchOpt[item][i]})or`
                } else if (typeof otherSeniorSearchOpt[item][i] === 'string') {
                  valUrl += `(${item} eq '${otherSeniorSearchOpt[item][i]}')or`
                }
              }
            }
          } else {
            if (typeof otherSeniorSearchOpt[item] === 'number') {
              valUrl += `(${item} eq ${otherSeniorSearchOpt[item]})${typeKey}`
            } else if (typeof otherSeniorSearchOpt[item][i] === 'string') {
              valUrl += `(${item} eq '${otherSeniorSearchOpt[item]}')${typeKey}`
            }
          }
        }
        if (valUrl !== '') {
          let url = `$filter=(${valUrl.slice(0, sliceLength)})`
          urlObj['filterUrl'] = _this.isHasKey(urlObj['filterUrl'], url, '$filter=')
//          urlObj['keyWorkUrl'] = `$filter=(${valUrl.slice(0, sliceLength)})`
        }
      },
//      关键词搜索
      keyWordSearch(urlObj) {
        let _this = this
        let searchKey = _this.getState.searchKeys
        let searchVal = _this.getState.searchVal
        if (searchVal !== '') {  // 如果搜索有值
          let valUrl = ``
          if (searchKey === 'searchAll') {
            for (let item of _this.getState.table) {
              if ((item.type === '' || item.type === 'textarea' || item.type === 'string') && item.searchKey !== 1) {
                valUrl += `(contains(${item.key},'${searchVal}'))or`
              } else if (item.type === 'number' && Number.isNaN(Number(searchVal)) !== true) {
                valUrl += `(${item.key} eq ${Number(searchVal)})or`
              }
            }
          } else {
            for (let item of _this.getState.table) {
              if (item.key === searchKey) {
                if (item.type === '' || item.type === 'textarea' || item.type === 'string') {
                  valUrl += `(contains(${item.key},'${searchVal}'))or`
                } else if (item.type === 'number') {
                  if (Number.isNaN(Number(searchVal)) !== true) {
                    valUrl += `(${item.key} eq ${Number(searchVal)})or`
                  } else {
                    _this.$message({
                      showClose: true,
                      message: '参数必须为数字',
                      type: 'warning'
                    })
                    return false
                  }
                }
              }
            }
          }
          if (valUrl !== '') {
            let url = `$filter=(${valUrl.slice(0, -2)})`
            urlObj['filterUrl'] = _this.isHasKey(urlObj['filterUrl'], url, '$filter=')
//            urlObj['keyWorkUrl'] = `$filter=(${valUrl.slice(0, -2)})`
          }
        }
      },
      /**
       * 字符串中中是否含有置顶字段
       * @param oldString 需要检测的string
       * @param newString 需要新加的sting
       * @param key
       */
      isHasKey(oldString, newString, key) {
        let string
        if (oldString === undefined) {
          string = newString
        } else {
          string = `${oldString} and ${newString.split(key)[1]}`
        }
        return string
      },
      filterChangeFn(filters) {
        this.$store.dispatch(this.options.gridKey + '_set_filterbox', filters)
        let searchBtn = this.getState.searchBtn
        this.$store.dispatch(this.options.gridKey + 'setData', {searchBtn: !searchBtn})
      },
      sortChangeFn(column, prop, order) {
        let orderKey = column.order === 'descending' ? 'desc' : 'asc'
        let orderObj = {
          order: orderKey,
          prop: column.prop
        }
        this.$store.dispatch(this.options.gridKey + '_set_sortbox', orderObj)
        let searchBtn = this.getState.searchBtn
        this.$store.dispatch(this.options.gridKey + 'setData', {searchBtn: !searchBtn})
      },
//     初始化url,获取数据字典数据
      loadingFn() {
        this.getDicMsg()
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
      getList(size) {
        let $requestUrl = clone(this.getState.requestUrl)
        let $countUrl
        let splitUrl = $requestUrl.split('?$')
        if (splitUrl.length === 2) {
          $countUrl = `${splitUrl[0]}/$count?$${splitUrl[1]}`
        } else {
          console.error('获取总条数count URL失败！')
        }
        /**
         *  requestCountHeader 获取总条数，不含分页信息
         *
         */
        let requestCountHeader = Vue.prototype.$api.request($countUrl)
        let _this = this
        fetch(requestCountHeader).then(resp => {
          return resp.text()
        }).then(count => {
          if (Number(count) === 0) {
            _this.ready = true
            _this.$store.dispatch(_this.options.gridKey + 'setData', {tableData: []})
            _this.$store.dispatch(_this.options.gridKey + 'setData', {pager_Total: 0})
            _this.$store.dispatch(_this.options.gridKey + 'setData', {pager_CurrentPage: 1})
            _this.$message('无符合要求数据')
            return false
          }
          /**
           *  当获取总条数不位0的时候，在拉取数据
           */
          _this.$store.dispatch(_this.options.gridKey + 'setData', {pager_Total: Number(count)})

          let pageSize, pageSkip
          if (size) {
            pageSize = size
            pageSkip = 0
          } else {
            let pagerCurrentPage = _this.getState.pager_CurrentPage
            pageSize = _this.getState.pager_Size
            pageSkip = _this.getState.pager_Size * (pagerCurrentPage - 1)
          }
          // requestDataHeader 获取分页 的data
          $requestUrl += `&$top=${pageSize}&$skip=${pageSkip}`
          let requestDataHeader = Vue.prototype.$api.request($requestUrl)
          fetch(requestDataHeader).then(resp => {
            return resp.json()
          }).then(data => {
            _this.$store.dispatch(_this.options.gridKey + 'setData', {initTableData: data.value})
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

        let _this = this
        let myRequests = []
//        避免数据字典重复请求
        urlsKey.forEach(function (key, index) {
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
//              注册数据字典
            let gridKey = _this.urlsKey[index]
            let initState = {
              data: data
            }
            _this.registerModule(initState, gridKey)
          })
        })
      },
//    刷新
      refreshFn() {
        this.reset()
        this.getList()
      },
      reset () {
        this.$store.dispatch(this.getState.gridKey + 'setData', {selection: []})
        this.$store.dispatch(this.getState.gridKey + 'setData', {searchVal: ''})
        this.$store.dispatch(this.getState.gridKey + 'setData', {filterBox: {}})
        this.$store.dispatch(this.getState.gridKey + 'setData', {sortBox: {}})
      }
    },
    filters: {}
  }
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

</style>
