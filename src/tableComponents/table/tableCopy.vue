<template>
  <div>
    <div class="tabletemplate" v-show="ready" ref="test">
      <slot>
        <el-table
          :data="tableData"
          border
          @filter-change="filterFn"
          style="width: 100%">
          <template v-for="(item, index) in getOpt.table">
            <el-table-column
              v-if="item.column==='show' && !item.render"
              :prop="item.key"
              :column-key="item.key"
              :label="item.title"
              sortable
              :filters="item.filters"
              :filter-method="filterFn"
              filter-placement="bottom-end"
              :width="item.width">
            </el-table-column>
            <el-table-column
              v-if="item.column==='show' && item.render"
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
        </el-table>
      </slot>
    </div>
    <div style="padding:80px;margin:80px;position: relative;" v-show="!ready">
      <Spin fix>
        <Icon type="load-c" size=40 class="icon-load"></Icon>
        <div>Loading</div>
      </Spin>
    </div>
    <div ></div>
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
    data () {
      return {
        ready: false,
        states: {},
        filters:{},
        allStates: {},
        tableData: [],
        getOpt: {},
        columns: []
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
    beforeMount () {
      this.$xvuex.registerModule(this, this.options, this.options.gridKey)
    },
    mounted() {
      this.$xvuex.registerModule(this, this.options, this.options.gridKey)
      localStorage.setItem('registerModule', this.options.gridKey)
      this.states = this.$store.state[this.options.gridKey]
      // 来自父组建的事件集合
      this.getOptions();
      try {
        let arrFn = this.tableFn()
        fn.bindFn(this, arrFn)
      } catch (e) {
      }
      if (isFirst) {
        this.getList()
        isFirst = false
      }
//      console.log(this.states)
    },
    destroyed () {
      if (this.isUnregisterModule) {
        try {
          this.$store.unregisterModule(this.options.gridKey)
        } catch (e) {
        }
      }
      isFirst = true
    },
    watch: {
      'states.tableData': {
        handler: function (val, oldVal) {
          if (oldVal !== undefined) {
            let newArr = []
            val.forEach(function (e) {
              let obj = Object.assign({}, e)
              newArr.push(obj)
            })
            this.tableData = newArr
          }
        },
        deep: true
      },
      'states.refresh': {
        handler: function (val, oldVal) {
          if (oldVal !== undefined) {
            this.refreshFn()
          }
//          this.$store.dispatch(this.options.gridKey + '_set_state_data', {pager_CurrentPage: 1})
        },
        deep: true
      },
      'states.searchBtn': {
        handler: function (val, oldVal) {
          if (oldVal !== undefined) {
            let adSearchBoolean = this.$store.state[this.options.gridKey].adSearchBoolean
            if (adSearchBoolean) { // 高级搜索
              this.advancedSearchUrl()
            } else {  // 普通搜索
              this.searchUrl(this.states.searchVal)
            }
          }
//          oldVal !== undefined ? this.searchUrl(this.states.searchVal) : null
          this.$store.dispatch(this.options.gridKey + '_set_state_data', {pager_CurrentPage: 1})
        },
        deep: true
      },
      'states.pager_Size': {
        handler: function (val, oldVal) {
          if (oldVal !== undefined) {
            this.$store.dispatch(this.options.gridKey + '_set_state_data', {pager_CurrentPage: 1})
            this.getList(val)
          }
        },
        deep: true
      },
      'states.table': {
        handler: function (val, oldVal) {
          this.setColumns()
        },
        deep: true
      },
      'states.url': {   //todo   搜索也会执行,待优化
        handler: function (val, oldVal) {
          if (oldVal !== undefined && (val !== null || val !== '')) {
            this.getList()
          } else {
            this.ready = true // 空的时候释放ready
          }
        },
        deep: true
      },
      'states.pager_CurrentPage': {
        handler: function (val, oldVal) {
          this.$store.dispatch(this.options.gridKey + '_set_state_data', {pager_CurrentPage: val})
          if (oldVal !== undefined ) {
            this.getList()
          }
        },
        deep: true
      }
    },
    computed: {
      getOp() {
        return this.$store.state[this.options.gridKey]
      }
    },
    updated () {
      // 设置宽度
//      let wrapWidth = $('.ivu-table-wrapper').width()
//      let tableWidth = $('.ivu-table-header table').width()
//      if (tableWidth < wrapWidth) {
//        $('.ivu-table-wrapper').width(tableWidth)
//      }
    },
    methods: {
      getOptions () {
//        let localTable = JSON.parse(localStorage.getItem('newOpt'))
        let newColumn = JSON.parse(localStorage.getItem('newColumn'))
        if(newColumn){
          let newTable = []
          let newOpt = clone(this.getOp)
//          debugger
          newOpt.table.forEach(function (item) {
            newColumn.forEach(function (column) {
              if (column === item.title) {
                newTable.push(item)
              }
            })
          })
          newOpt.table = newTable
          this.getOpt = newOpt
        }else {
          let vuexTable = this.$store.state[this.options.gridKey]
          this.getOpt = vuexTable
        }
      },
      compile () {
      },
      filterFn (filters) {
        let _this = this
        let searchBtn = _this.$store.state[_this.options.gridKey].searchBtn
        _this.$store.dispatch(_this.options.gridKey + '_set_filterbox', filters)
        _this.$store.dispatch(_this.options.gridKey + '_set_state_data', {searchBtn: !searchBtn})
//        for(let key in filters){
//          if(filters[key].length !==0){
//            _this.$store.dispatch(_this.options.gridKey + '_set_filterbox', filters)
//          }
//        }else{
//
//        }
      },
      /**
       *   column：当前列数据
       key：排序依据的指标
       order：排序的顺序，值为 asc 或 desc
       *
       */
      sortFn (column) {
        let key = column.key
        let order = column.order
        let orderUrl = `${key}%20${order}`
        let adSearchBoolean = this.$store.state[this.options.gridKey].adSearchBoolean
        if (adSearchBoolean) { // 高级搜索
          if (order === 'normal') {
            this.advancedSearchUrl('')
          } else {
            this.advancedSearchUrl(orderUrl)
          }
        } else {  // 普通搜索
          if (order === 'normal') {
            this.searchUrl(this.states.searchVal, '')
          } else {
            this.searchUrl(this.states.searchVal, orderUrl)
          }
        }
      },
      /**
       *
       * @param val   搜索值
       * @param order  排序方法
       * @param _this  默认参数，不要动，不然外部传的方法有问题
       */
      searchUrl (val, order = '', _this = this) {
        let _self = _this
//        if (_self.states.searchKeys[0] === 'searchAll') {
//          _self.$store.dispatch(_self.states.gridKey + '_set_state_data', {searchKeys: fn.getAllKeys(_self.options.table)})
//        }
        let Keys = _self.states.searchKeys  // 搜索 键
        let opts = _self.states.table  // 匹配类型
        let sUrl = _self.states.api  // url
        let oldUrl = _self.states.url
        let urlObj = {}
        /**
         *  时间搜索
         *
         */
        let startTime
        let endTime
        let timeSelectKey
        if (_self.states.startTime && _self.states.endTime) {
          startTime = fn.toLocaleString(_self.states.startTime)
          endTime = fn.endTime(_self.states.endTime)
          timeSelectKey = _self.states.timeSelectKey
          if (startTime && endTime) {
            let timeUrl = `${timeSelectKey} ge ${startTime}Z and ${timeSelectKey} le ${endTime}Z`
            urlObj['timeUrl'] = `(${timeUrl})`
          }
        }
        /**
         *  条件筛选
         */
        let filterUrl = ``
        for (let filters in _self.states.filterBox) {
          let filtersHtmls = ``
          _self.states.filterBox[filters].forEach(function (key) {
            filtersHtmls += `${key} or`
          })
          filterUrl += `(${filtersHtmls.slice(0, -2)})and`
        }
        if (filterUrl !== '') {
          urlObj['filterUrl'] = `(${filterUrl.slice(0, -3)})`
        }
        /**
         *  关键词搜索
         */
        if (val) {  // 如果搜索有值
          let valUrl = ``
          Keys.forEach(function (key) {
            for (let item of opts) {
              if (key === item['key']) {
                if (item.type === '' || item.type === 'textarea') {
                  valUrl += `(contains(${key},'${val}'))or`
                } else if (item.type === 'number'){
                  valUrl += `(${key} eq ${val})or`
                }
              }
            }
          })

          if (valUrl !== '') {
            urlObj['keyWorkUrl'] = `(${valUrl.slice(0, -2)})`
          }
        }
        /**
         *  url 拼接
         */
        let searchUrlString = ``
        let lastUrl = ``  // 是否有搜索筛选
        for (let key in urlObj) {
          lastUrl += `${urlObj[key]}and`
        }
        if (lastUrl !== '') {
          // 判断是不是条件url
          if (sUrl.indexOf('?$filter=') > -1) {
            searchUrlString = (sUrl + ` and ` + `${lastUrl.slice(0, -3)}&`)
          } else {
            searchUrlString = (sUrl + `?$filter=` + `${lastUrl.slice(0, -3)}&`)
          }
          if (order !== '') {
            _self.$store.dispatch(_self.states.gridKey + '_set_state_data', {url: urlAppend(`${searchUrlString}&$orderby=${order}`, {r: Math.random()})})
          } else {
            if (oldUrl.indexOf('$orderby') > -1) {
              let oldOrder = oldUrl.split('$orderby')[1]
              searchUrlString += `$orderby${oldOrder}`
            } // 判断原先url是否带有order
            _self.$store.dispatch(_self.states.gridKey + '_set_state_data', {url: urlAppend(searchUrlString, {r: Math.random()})})
          }
        } else {
          // 判断是不是条件url
          if (sUrl.indexOf('?$filter=') > -1) {  // 有filter 无 筛选
            searchUrlString = (sUrl + `&`)
          } else {
            searchUrlString = (sUrl + `?`)
          }
          if (order !== '') {
            _self.$store.dispatch(_self.states.gridKey + '_set_state_data', {url: urlAppend(`${searchUrlString}$orderby=${order}`, {r: Math.random()})})
          } else {
            _self.$store.dispatch(_self.states.gridKey + '_set_state_data', {url: urlAppend(searchUrlString, {r: Math.random()})})
          }
        }
      },
      // 高级搜索
      advancedSearchUrl (order = '', _this = this) {
        let _self = _this
        debugger
        let advancedSearchObj = _self.states.advancedSearchBox  // 高级搜索
        let opts = _self.states.table  // 匹配类型
        let sUrl = _self.states.api  // url
        let urlObj = {}
        let oldUrl = _self.states.url
        let isEmptyObject = this.$f.isEmptyObject(advancedSearchObj)
        /**
         *  时间搜索
         *
         */
        if (isEmptyObject !== true) {
          let valUrl = ``
          for (let key in advancedSearchObj) {
            for (let item of opts) {
              if (key === item['key']) {
                if (item.type === 'date') {
                  if (advancedSearchObj[key][0] !== '' && advancedSearchObj[key][0] !== null) {
//                    let eTime = fn.toLocaleString(advancedSearchObj[key][1]).split('T')[0].split('-')
//                    let startTime = _self.$f.toLocaleString(advancedSearchObj[key][0])
//                    let endTime = `${eTime[0]}-${eTime[1]}-${eTime[2]}T08:00:00`
                    let startTime = fn.toLocaleString(advancedSearchObj[key][0])
                    let endTime = fn.endTime(advancedSearchObj[key][1])
                    valUrl += `(${key} ge ${startTime}Z and ${key} le ${endTime}Z)and`
                  }
                }
              }
            }
          }
          if (valUrl !== '') {
            urlObj['timeUrl'] = `(${valUrl.slice(0, -3)})`
          }
        }
        /**
         *  条件筛选
         */
        let filterUrl = ``
        for (let filters in _self.states.filterBox) {
          let filtersHtmls = ``
          _self.states.filterBox[filters].forEach(function (key) {
            filtersHtmls += `${key}or`
          })
          filterUrl += `(${filtersHtmls.slice(0, -2)})and`
        }
        if (filterUrl !== '') {
          urlObj['filterUrl'] = `(${filterUrl.slice(0, -3)})`
        }
        /**
         *  高级搜索
         */
        let advancedSearchUrl = ``
        if (isEmptyObject !== true) {
          let valUrl = ``
          for (let key in advancedSearchObj) {
            for (let item of opts) {
              if (key === item['key']) {
                if (item.type === 'number') {
                  if (isNaN(Number(advancedSearchObj[key]))) {
//                    _this.$Notice.error({
//                      title: '搜索信息',
//                      desc: `${item.title} -- 输入值不能为字符串，自动略过该条件！`
//                    })
                  } else {
                    if (advancedSearchObj[key] !== '') {
                      valUrl += `(${key} eq ${Number(advancedSearchObj[key])})and`
                    }
                  }
                }
                if (item.type === '' || item.type === 'textarea') {
                  if (advancedSearchObj[key] !== '') {
                    valUrl += `(contains(${key},'${advancedSearchObj[key]}'))and`
                  }
                }
              }
            }
          }
          if (valUrl !== '') {
            urlObj['advancedSearchUrl'] = `(${valUrl.slice(0, -3)})`
          }
        }
        /**
         *  url 拼接
         */
        let searchUrlString = ``
        let lastUrl = ``
        for (let key in urlObj) {
          lastUrl += `${urlObj[key]}and`
        }
        if (lastUrl !== '') {
          // 判断是不是条件url
          if (sUrl.indexOf('?$filter=') > -1) {
            searchUrlString = (sUrl + ` and ` + `${lastUrl.slice(0, -3)}&`)
          } else {
            searchUrlString = (sUrl + `?$filter=` + `${lastUrl.slice(0, -3)}&`)
          }
          if (order !== '') {
            _self.$store.dispatch(_self.states.gridKey + '_set_state_data', {url: urlAppend(`${searchUrlString}&$orderby=${order}`, {r: Math.random()})})
          } else {
            if (oldUrl.indexOf('$orderby') > -1) {
              let oldOrder = oldUrl.split('$orderby')[1]
              searchUrlString += `$orderby${oldOrder}`
            } // 判断原先url是否带有order
            _self.$store.dispatch(_self.states.gridKey + '_set_state_data', {url: urlAppend(searchUrlString, {r: Math.random()})})
          }
        } else {
          // 判断是不是条件url
          if (sUrl.indexOf('?$filter=') > -1) {  // 有filter 无 筛选
            searchUrlString = (sUrl + `&`)
          } else {
            searchUrlString = (sUrl + `?`)
          }
          if (order !== '') {
            _self.$store.dispatch(_self.states.gridKey + '_set_state_data', {url: urlAppend(`${searchUrlString}$orderby=${order}`, {r: Math.random()})})
          } else {
            _self.$store.dispatch(_self.states.gridKey + '_set_state_data', {url: urlAppend(searchUrlString, {r: Math.random()})})
          }
        }
      },
//      重置 刷新
      reset () {
        this.$store.dispatch(this.getOpt.gridKey + '_set_state_data', {delData: []})
        this.$store.dispatch(this.getOpt.gridKey + '_set_state_data', {endTime: ''})
        this.$store.dispatch(this.getOpt.gridKey + '_set_state_data', {startTime: ''})
        this.$store.dispatch(this.getOpt.gridKey + '_set_state_data', {searchVal: ''})
        this.$store.dispatch(this.getOpt.gridKey + '_set_state_data', {filterBox: {}})
      },
      //        获取表格数据
      getList (size, _this = this) {
        let _self = _this
        if (!_self.states.url) {
          _self.ready = true
          return
        }
        _self.ready = false
        let sUrl = _self.states.url  // url
        let splitUrl = sUrl.split('?$filter=')
        if (sUrl.indexOf('?$filter=') > -1) {
          sUrl = splitUrl[0] + '/$count?$filter=' + splitUrl[1]
        } else { // 上面加了个？
          sUrl = splitUrl[0].split('?')[0] + '/$count'
        }
        o(sUrl).get(function (data) {
          let lengths = data
          if (lengths === 0) {
            _self.ready = true
            _self.$store.dispatch(_self.options.gridKey + '_set_table_data', [])
            _self.$store.dispatch(_self.options.gridKey + '_set_state_data', {pager_Total: 0})
            _self.$store.dispatch(_self.options.gridKey + '_set_state_data', {pager_CurrentPage: 1})
//            _self.tableData = []
            _self.$Message.warning('无符合要求数据')
            return
          }
          _self.$store.dispatch(_self.options.gridKey + '_set_state_data', {pager_Total: lengths})
          let pageSize, pageSkip
          if (size) {
            pageSize = size
            pageSkip = 0
          } else {
            let pagerCurrentPage = _self.states.pager_CurrentPage
            pageSize = _self.states.pager_Size
            pageSkip = _self.states.pager_Size * (pagerCurrentPage - 1)
          }

          o(_self.states.url).take(pageSize).skip(pageSkip).get(function (data) {
            let arr = []
            let obj =  {
              "BusinessBatchNo": "CNWR201708250003",
              "RBSWRNo": "A2017082500004_N",
              "ContractNo": 1,
              "RBSContractNo": 1,
              "Variety": "A",
              "WarehousingCompany": 1,
              "Warehouse": 3,
              "Rank": 1,
              "Weight": 10.0,
              "BatchNo": 1,
              "GetCargoPropertyDate": 1,
              "QCDate": 1,
              "QCExcpireDate": 1,
              "WRExpireDate": 1,
              "RentStartDate": 1,
              "RentEndDate": 1,
              "RentSettlementDate": 1,
              "StdWRStatus": 'KY',
              "CargoStatus": '1',
              "WRSource": 'CS',
              "FromClient": 1,
              "WRHoldStatus": "CY",
              "OperCode": "123",
              "IsDelete": false,
              "Id": '123123',
              "CreateTime": "2017-08-25T13:53:48.233+08:00"
            }
            for(let i=0;i<50;i++){
              arr.push(obj)
            }
            let newData = _self.setDicData(data)
            _self.$store.dispatch(_self.options.gridKey + '_set_table_data', newData)
            _self.ready = true
          })
        })
      },
      refreshFn () {
        this.reset()
        this.searchUrl()
        this.getOptions()
      },
      setDicData (data) {
        let nowData = data
        let _this = this
        let i = 0;
        let length = nowData.length;
        let columns = []
        _this.states.table.forEach(function (item) {
          if(item.type === 'select'){
            columns.push(item.key)
          }
        })
        for(;i<length;i++){
          columns.forEach(function (item) {
            try {
//              console.log(nowData[i])
              _this.getOpt[item].forEach(function (dicItem) {
                if (dicItem.value === nowData[i][item]) {
                  nowData[i][item] = dicItem.text
                }
              })
            } catch (e) {
            }
          })
        }
        return nowData
      },
      showDetails (val) { // 详情页
        this.$store.dispatch(this.options.gridKey + '_details_Window_Visible', val)
      },
      selectionFn (selection) {
        this.$store.dispatch(this.options.gridKey + '_set_del_data', selection)
      },
      setData (data) { // 设置修改弹窗数据
        if (data) {
          for (let item of this.getOpt.table) {
            if (item.type === 'select') {
              this.getOpt[item.key].filter(function (e) {
                if (e.label === data[item.key]) {
                  data[item.key] = e.values
                }
              })
            }
          }
          this.$store.dispatch(this.options.gridKey + '_edit_Window_Visible', data)
        }
      },
      setColumns () {  // 设置列表属性
        this.columns = this.getOpt.table.filter(function (item) {
          if (item.table_hide !== 1) {
            return item
          }
        })
      },
      //        删除数据()
      delData (row, column) {
        let newROw = Object.assign({}, row, {IsDelete: '1'})
        delete newROw['_index']  // 莫名多出了个——index 删了
        let _self = this
        _self.$Modal.confirm({
          title: '删除确认',
          content: '此操作将删除该项, 是否继续?',
          onOk: function () {
            o(_self.options.api).find(row['Id']).remove().save().then(function (data) {
              let msg = row.Name ? row.Name + '删除成功' : '删除成功'
              _self.$Message.info(msg)
              _self.$store.dispatch(_self.options.gridKey + '_set_refresh')
              //            删除最后一页 bug
              let states = _self.$store.state[_self.options.gridKey]
              let pager_CurrentPage = states.pager_CurrentPage
              let pager_Total = states.pager_Total
              let pageSize = states.pager_Size
              if (pager_CurrentPage > 1 && pager_Total % pageSize === 1) {
                _self.$store.dispatch(_self.options.gridKey + '_set_state_data', {pager_CurrentPage: pager_CurrentPage - 1})
              }
            })
          }
        })
      }
    },
    filters: {}
  }
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
  .tablePager {
    padding: 12px 0px;
    overflow: hidden;
    width: 100%;
    padding-bottom: 168px;
    .ivu-page {
      float: right;
      margin-right: 20px;
    }
  }

  .ivu-table .warning-row {
    color: red;
    display: table-cell;
  }

  .ivu-table .warning-row:before {
    /*content: "\F100";*/
    /*color: red;*/
    /*float: left;*/
    /*position: absolute;*/
    /*margin-left:5px;*/
  }

  .ivu-table .warning-row td {
    background-color: #ff6600;
    color: #fff;
  }
</style>
