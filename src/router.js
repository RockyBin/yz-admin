import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

// 路由在APP.vue里面动态注册
const router = new Router({
  routes: [
    {
      name: "login",
      path: "/login",
      isHide: true,
      meta: {
        title: "登录"
      },
      component: () => import("@/views/login.vue")
    }
  ]
});
// 有redir的路由 跳转到redir
router.beforeEach((to, from, next) => {
  /*if (store.state.COMMON_loading) {
    store.state.COMMON_loading = false
  }*/
  if (to.meta.redir) {
    next(to.meta.redir);
  } else {
    next();
  }
});

/*
router.afterEach((to, from) => {
  // 页面名称
  if (typeof to.meta.title !== 'undefined') {
    document.title = to.meta.title;
  }
  // group用来把一级菜单分组
  if (to.meta.group) {
    store.state.MenusShow.group = to.meta.group;
  } else {
    store.state.MenusShow.group = '';
  }
  // 把parent解析 放到vuex的MenusShow中 用来匹配菜单的打开状态
  let parent = [];
  if (to.meta.parent) {
    parent = to.meta.parent.split('/');
  }
  parent.push(to.name);
  // 匹配一级菜单的name
  store.state.MenusShow.first = parent[0];
  // 匹配二级菜单的name
  store.state.MenusShow.second = parent[1] ? parent[1] : '';
  // 匹配三级菜单的name 当前页面
  store.state.MenusShow.third = parent[2] ? parent[2] : '';
})*/

export default router;
