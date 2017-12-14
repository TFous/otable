function createMutations(state, gridKey) {
  return {
    [gridKey + '_SET_DATA'](state, data) {
      Object.assign(state, data)
    },
    [gridKey + '_FILTER_BOX_DATA'](state, data) {
      // reset
      if (data === null) {
        state.filterBox = {}
        return
      }
      for (let item in data) {
        if (data[item].length === 0) {
          delete state.filterBox[item]
          return
        }
      }
      state.filterBox = Object.assign({}, state.filterBox, data)
    },
    [gridKey + '_SORT_BOX_DATA'](state, data) {
      if (data.prop === null) {
        state.sortBox = {}
      } else {
        state.sortBox = data
      }
    },
    /**
     * // 下面都是老的
     * @param state
     * @param val
     */
    [gridKey + '_ADD_WINDOW_VISIBLE'](state, val) {
      state.add_Window_Visible = !state.add_Window_Visible
    },
    [gridKey + '_DETAILS_WINDOW_VISIBLE'](state, val) {
      state.details_Window_Visible = !state.details_Window_Visible
    },
    [gridKey + '_EDIT_WINDOW_DATA'](state, data) {
      state.edit_Window_Data = data
    },
    [gridKey + '_DETAILS_WINDOW_DATA'](state, data) {
      state.details_Window_Data = data
    },
    [gridKey + '_DEL_DATA'](state, data) {
      state.delData = data
    },
    [gridKey + '_TABLE_DATA'](state, data) {
      state.tableData = data
    },
    [gridKey + '_REFRESH'](state, data) {
      state.refresh = !state.refresh
    },
    [gridKey + '_STATE_DATA'](state, data) {
      Object.assign(state, data)
    },
    [gridKey + '_PAGER_DATA'](state, data) {
      Object.assign(state.pager, data)
    },
    ['ADD_NUM'](state, data) {
      state.num = state.num + data
    },
    [gridKey + '_EDIT_WINDOW_VISIBLE'](state, val) {
      state.edit_Window_Visible = !state.edit_Window_Visible
    }
  }
}

function initOpt(_this, opt) {
  let table = opt.table
  let newTable = []
  table.forEach(function (item) {
    let newColunm = Object.assign({
      addLayer: 'show',
      editLayer: 'show',
      searchKey: 'show',
      column: 'show',
      width: 'auto',
      type: 'string'
    }, item)
    // if(newColunm.type==='select'){
    //   let filters = getSelect(_this, newColunm.key)
    //   newColunm.filters = filters
    // }
    newTable.push(newColunm)
  })
  opt.table = newTable
  return opt;
}

function getSelect(_this, key) {
  let newArr = []
  let aa = _this.$store.state[key]
  try {
    _this.$store.state[key].forEach(function (item) {
      let obj = {}
      obj.text = item.Code
      obj.value = item.Value
      newArr.push(obj)
    })
  } catch (e) {
  }
  return newArr
}

export function registerModule(_this, state, gridKey) {
  if (!_this.$store) {
    console.error('未找到vuex store实例')
    return
  }
  // 为data-grid创建一个动态模块，并将其注册到vuex store中
  if (!gridKey) {
    console.error('props参数gridKey必须传入')
    return
  }
  // 模块已存在则返回
  if (_this.$store.state[gridKey]) {
    return
  }
  let initState = initOpt(_this, state)
  var mutations = createMutations(initState, gridKey)
  _this.$store.registerModule(gridKey, {
    state: initState,
    mutations,
    actions: {
      [gridKey + 'setData']({dispatch, commit}, obj) {
        _this.$store.commit(gridKey + '_SET_DATA', obj)
      },
      [gridKey + '_set_filterbox']({dispatch, commit}, val) {
        _this.$store.commit(gridKey + '_FILTER_BOX_DATA', val)
      },
      [gridKey + '_set_sortbox']({dispatch, commit}, val) {
        _this.$store.commit(gridKey + '_SORT_BOX_DATA', val)
      },
      /**
       * // 下面都是老的
       * @param state
       * @param val
       */
      addNum({dispatch, commit}, val) {
        _this.$store.commit('ADD_NUM', val)
      },
      [gridKey + '_add_Window_Visible']({dispatch, commit}, val) {
        _this.$store.commit(gridKey + '_ADD_WINDOW_VISIBLE', val)
      },
      [gridKey + '_details_Window_Visible']({dispatch, commit}, data) {
        _this.$store.commit(gridKey + '_DETAILS_WINDOW_VISIBLE')
        if (data) {
          _this.$store.commit(gridKey + '_DETAILS_WINDOW_DATA', data)
        }
      },
      [gridKey + '_set_details_data']({dispatch, commit}, data) {
        _this.$store.commit(gridKey + '_DETAILS_WINDOW_DATA', data)
      },
      [gridKey + '_set_table_data']({dispatch, commit}, val) {
        _this.$store.commit(gridKey + '_TABLE_DATA', val)
      },
      [gridKey + '_set_del_data']({dispatch, commit}, val) {
        _this.$store.commit(gridKey + '_DEL_DATA', val)
      },
      [gridKey + '_set_pager_data']({dispatch, commit}, obj) {
        _this.$store.commit(gridKey + '_PAGER_DATA', obj)
      },
      [gridKey + '_set_state_data']({dispatch, commit}, obj) {
        _this.$store.commit(gridKey + '_STATE_DATA', obj)
      },
      [gridKey + '_set_refresh']({dispatch, commit}, obj) {
        _this.$store.commit(gridKey + '_REFRESH', obj)
      },
      [gridKey + '_edit_Window_Visible']({dispatch, commit}, data) {
        _this.$store.commit(gridKey + '_EDIT_WINDOW_VISIBLE')
        if (data) {
          _this.$store.commit(gridKey + '_EDIT_WINDOW_DATA', data)
        }
      }
    }
  })
}

export const options = {
  requestUrl: '', // 最终请求的url
  sortBox: {}, // 存储排序信息  // 理论可以实现多列排序，目前组建展示效果不支持，功能保留
  filterBox: {}, // 存储筛选信息
  // advancedSearchBox: {}, // 存储高级搜索信息
  seniorSearchBox: {}, // 存储高级搜索信息
  seniorSearchType: false, // 高级搜索方式是and 还是 or
  isSeniorSearch: false, // 是否为高级搜索
  timeSearch: true,  // 是否显示时间搜索
  refresh: false,  // 提供一个变量watch 是否需要刷新页面
  delData: [],  // 存储批量删除的对象
  searchKeys: ['searchAll'], // 存储search对象
  searchVal: '', // 存储search对象
  searchBtn: false, // 存储search对象
  arrCopy: [], // 存储arr原始对象
  startTime: '', // 存储搜索开始时间
  endTime: '', // 存储搜索结束时间
  timeSelectKey: '', // 存储搜索key
  defaultSearch: '',  // 默认 搜索选项
  disabledSearch: false, // 是否禁用搜索下拉 true：禁用
  pager_size_opts: [5, 10, 15],  // 每页展示数量
  pager_Size: 5,   //  默认显示每页数量，和opts第一个一样
  pager_CurrentPage: 1, // 当前第几页
  pager_Total: 0,   // 总页数
  tableData: [],  // 所有的增删改拆后的数据覆盖存储
  initTableData: [],  // 没有经过数据字典转化的数据
  add_Window_Visible: false,   // 新增弹窗显示状态
  addSucess: null,   // 新增成功后返回的对象
  edit_Window_Visible: false,  // 修改弹窗显示状态
  details_Window_Visible: false,  // 详情页弹窗显示状态
  edit_Window_Data: '',  // 弹窗显示信息
  details_Window_Data: ''  // 详情显示信息
}
