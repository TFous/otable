<template>
  <div>
    <div :ref="'cell'+item_index">
      {{item_index}}
      <!--<template v-if="columns[item_index].type === 'index'">{{item_index + 1}}</template>-->
      <!--<template v-if="columns[item_index].type === 'selection'">-->
      <!--</template>-->
      <template v-if="columns[item_index].type === 'normal'">
          <span v-html="item"></span>
        <!--{{columns[3].render === undefined}}-->
        <!--<template v-if="columns[item_index].render !== undefined">-->
          <!--{{compile}}-->
        <!--</template>-->
        <!--<template v-else>-->
          <!--<span v-html="item"></span>-->
        <!--</template>-->
      </template>
    </div>
  </div>
</template>
<script>
  let isFirst = true
  import o from 'o.js'
  //  import clone from 'clone'
  import * as fn from '../common'
  import urlAppend from 'url-append'
  import Vue from 'vue';

  export default {
    name: 'xtable',
    data() {
      return {
        columnd: null,
        renderData: [],
        isRealRender: false
      }
    },
    props: {
      row: Object,
      item_index: {
        type: [String, Number]
      },
      row_index: {
        type: [String, Number]
      },
      item: {
        type: [Boolean, String, Number, Function]
      }
    },
    destroyed() {
    },
    watch: {
      'states.tableData': {
        handler: function (val, oldVal) {
          if (oldVal !== undefined) {
          }
        },
        deep: true
      }
    },
    computed: {
      columns() {
        let column = this.$parent.setColumns()
        return column
      },
      compile2() {
        if (this.column.render) {
          const component = new Vue({
            functional: true,
            render: (h) => {
              return this.column.render(h, {
                row: this.row,
                column: this.column,
                index: this.item_index
              });
            }
          });
          component.$mount(this.$refs.cell0);
//          console.log(this.pa$refs.tableRow)
//          console.log(this.$refs.cell)
//          const Cell = component.$mount(this.$refs[`cell${this.item_index}`]);
//          this.$refs[`cell${this.item_index}`].appendChild(Cell.$el);
        }
      },
    },
    mounted() {
      this.columnd = this.$parent.setColumns()
//      this.$nextTick(() => {
//        console.log(1111)
//        this.compile();
//      });
//      this.compile()
    },
    updated() {

    },
    methods: {
      compile(arr,string) {
        console.log(33333)
        let component
        let _this = this
        let column = this.columnd
        let length = column.length
        let i = 0
        for(;i<length;i++){
          if(!column[i].render) {
            return;
          }else {
            component = new Vue({
              functional: true,
              render: (h) => {
                return column[i].render(h, {
                  row: _this.row,
                  column: _this.column,
                  index: _this.item_index
                });
              }
            });
            component.$mount(_this.$refs[`cell${i}`]);
            component = null
          }
        }
//
//        render()
//        function render() {
//          if (i >= length || !column[i].render) {
//            return
//          }else{
//
//          }
//          component = new Vue({
//            functional: true,
//            render: (h) => {
//              return column[i].render(h, {
//                row: _this.row,
//                column: _this.column,
//                index: _this.item_index
//              });
//            }
//          });
//          component.$mount(_this.$refs[`cell${i}`]);
//          component = null
////          console.log(11111)
//          console.log(i)
//          i++
//          render()
//        }
      },
      renderCell () {
//        let baseNum = 50
//        let length = this.columnd.length
      },
      toggleSelect() {
        this.$parent.$parent.toggleSelect(this.index);
      }
    },
    filters: {}
  }
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss"></style>
