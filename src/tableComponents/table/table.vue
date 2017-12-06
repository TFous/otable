<template>
  <div>
    <slot>
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        @filter-change="filterFn"
        style="width: 100%">
        <template v-for="(item, index) in getState.table">
          <el-table-column
            v-if="item.column==='show' && !item.render"
            :prop="item.key"
            :column-key="item.key"
            :label="item.title"
            sortable
            :filters="item.filters"
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
        loading: false,
        states: {},
        filters: {},
        allStates: {},
        tableData: [],
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
    beforeMount() {
      this.$xvuex.registerModule(this, this.options, this.options.gridKey)
    },
    mounted() {
      this.states = this.$store.state[this.options.gridKey]
      this.loadingFn()
    },
    destroyed() {
      if (this.isUnregisterModule) {
        try {
          this.$store.unregisterModule(this.options.gridKey)
        } catch (e) {
        }
      }
      isFirst = true
    },
    watch: {
      'getState.requestUrl': {   //todo   搜索也会执行,待优化
        handler: function (val, oldVal) {
          console.log(1231232)
          this.getList()
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
      logMsg1() {
        let url1 = `http://rbs.cefcfco.com:6789/api/manage/odata/InterestRateTypeDict(1)`
        let url2 = `http://rbs.cefcfco.com:6789/api/manage/odata/StdWarehouseReceiptDetails?$expand=
      WarehouseDetails($select=WarehouseName),WarehousingCompanyDetails($select=WarehousingCompany)&filter=WarehousingCompany eq 1`
        var myRequest2 = Vue.prototype.$api.request(url2)
        let myRequests = [myRequest1, myRequest2]
        Promise.all(myRequests.map(myRequest =>
          fetch(myRequest).then(resp => resp.json())
        )).then(texts => {
          console.log(texts)
        })
        fetch(myRequest1).then(function (response) {
          console.log(response)
          return response.text()
        }).then(function (myBlob) {
          console.log(myBlob)
        })
      },
      filterFn(filters) {
        let _this = this
        let searchBtn = _this.$store.state[_this.options.gridKey].searchBtn
        _this.$store.dispatch(_this.options.gridKey + '_set_filterbox', filters)
        _this.$store.dispatch(_this.options.gridKey + '_set_state_data', {searchBtn: !searchBtn})
      },
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
      //        获取表格数据
      getList(size) {
        let url = this.getState.requestUrl
        let _this = this
        var myRequest = Vue.prototype.$api.request(url)
        fetch(myRequest).then(function (response) {
//          console.log(response)
          return response.json()
        }).then(function (data) {
//          console.log(data.value)
          _this.tableData = data.value
          console.log(_this.tableData)
        })
      },
      refreshFn() {

      }
    },
    filters: {}
  }
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

</style>
