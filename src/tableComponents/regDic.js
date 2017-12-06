import o from 'o.js'
import urlAppend from 'url-append'

function createMutations(gridKey) {
  return {

  }
}

export function regDic(_this, dicName, url) {
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
    // console.log('已注册' + gridKey + '----vuexState')
    return
  }
  var mutations = createMutations(dicName)
  o(urlAppend(url, {r: Math.random()})).get().then(function (data) {
    let datas = data.data
    _this.$store.registerModule(dicName, {
      state: datas,
      mutations,
      actions: {
      }
    })
  })


}
