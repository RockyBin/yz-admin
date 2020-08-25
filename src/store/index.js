import Vue from "vue";
import Vuex from "vuex";
import state from "./state";
import getters from "./getters";
import mutations from "./mutations";
import action from "./action";
Vue.use(Vuex);
var initialState = JSON.parse(window.sessionStorage.getItem("yz-shop-admin"));
const store = new Vuex.Store({
  state: Object.assign(initialState || state, {
    // 这个一定要false，防止一些没有loading的页面出错
    COMMON_loading: false
  }),
  mutations,
  getters,
  action
});
store.subscribe((mutation, state) => {
  window.sessionStorage.setItem("yz-shop-admin", JSON.stringify(state))
});
export default store;
