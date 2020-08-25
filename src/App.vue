<template>
  <div id="app">
    <login v-if="$route.name && $route.name === 'login'" />
    <home-main
      v-if="$route.name && $route.name !== 'login' && dataPreparation"
    ></home-main>
    <Modal v-model="showPermModal" :width="416" :footer-hide="true">
      <Icon size="34" color="#ed4014" type="ios-help-circle"></Icon>
      <span
        style="font-size:16px;font-weight:bold;margin-left:12px;vertical-align:middle"
        >提示</span
      >
      <div style="font-size:13px;padding-left:46px;margin-top:4px;">
        您暂时没有此操作权限，请联系超级管理员！
      </div>
      <div style="overflow:hidden;margin-top:25px;">
        <Button
          type="primary"
          style="width:56px;height:34px;padding:0 0 3px 0;float:right"
          @click="showPermModal = false"
          >知道了</Button
        >
      </div>
    </Modal>
  </div>
</template>
<script>
import axios from "axios";
import login from "@/views/login.vue";
import homeMain from "@/views/shop/home/home-main.vue";
export default {
  data() {
    return {
      showPermModal: false,
      dataPreparation: false, // 数据准备完成标识
      isIE: !!window.isIE, // 该变量定义在public目录下的ie/ie-html-js.js文件
    };
  },
  components: {
    login,
    homeMain,
  },
  created() {
    // ie浏览器停止加载数据
    if (this.isIE) {
      return;
    }
    this.getWebData();
  },
  methods: {
    getWebData() {
      this.getWebInfo().then(() => {
        this.initRouters();
        this.dataPreparation = true;
      });
    },
    getWebInfo() {
      return new Promise((resolve) => {
        this.$httpGet("/shop/admin/site/info", null, (res) => {
          if (res.code === 200) {
            this.$store.state.siteComdataPath = res.data.siteComdataPath;
            this.$store.state.hasHomePage = res.data.hasHomePage;
            this.$store.state.LicensePerm = res.data.LicensePerm;
            this.$store.state.wsConfig = res.data.wsConfig;
            // this.$store.state.LicensePerm = ["BASE","ENABLE_DISTRIBUTION","ENABLE_AGENT","ENABLE_CLOUDSTOCK","ENABLE_GRATITUDE_AWARD"]
            this.$store.commit("saveUserInfo", res.data.siteAdmin);
            resolve();
          } else if (res.code !== 403) {
            this.$Message.error(res.msg);
          }
        });
      });
    },
    // 检查menu是否有管理权限
    menuHasPerm(item) {
      let hasPerm = true;
      // 检查用户权限
      if (item.meta.AdminPerm) {
        hasPerm = this.hasPerm(item.meta.AdminPerm);
      }
      return hasPerm;
    },

    // 检查menu是否有版本权限
    menuHasLicensePerm(item) {
      let hasLicensePerm = true;
      if (item.meta.LicensePerm) {
        hasLicensePerm = this.hasLicensePerm(item.meta.LicensePerm);
      }

      // 导出版本没有的功能 在这里取消
      if (item.meta.needPlatformVersion === true && this.isExportSite()) {
        hasLicensePerm = false;
      }
      return hasLicensePerm;
    },

    // 处理menu数据
    handleMenuItem(item, params) {
      // 修正parent的书写错误，写法比较恶心，后面优化吧
      if (item.meta.parent) {
        item.meta.parent = this.parseParent(item.meta.parent);
      }

      // 根据 parent 判定菜单层级
      item.meta.menuLevel = 0;
      if (item.meta.parent) {
        let thisRouter = item.meta.parent.split("/");
        item.meta.menuLevel = thisRouter.length;
      }

      // 权限判断
      item.meta.checkPerm = false;
      if (params.hasPerm && params.hasLicensePerm) {
        item.meta.checkPerm = true;
      }

      // 基础数据
      item.meta.parentName = params.parentName;
      if (!item.type) {
        if (item.component) {
          item.type = "page"; // 页面菜单
        } else if (item.meta.jumpUrl) {
          item.type = "link"; // 跳转链接
        } else {
          item.type = "menu"; // 非页面菜单
        }
      }
    },

    // 如果是非页面菜单且下级菜单都不显示或没有下级菜单，则隐藏该菜单
    hideMenuForNoSub(config, per, menuLevel) {
      for (let configIndex in config) {
        for (let menuIndex in config[configIndex]) {
          let item = config[configIndex][menuIndex];
          if (item.meta.menuLevel !== menuLevel) {
            break;
          }
          if (item.isHide || (item.type && item.type !== "menu")) {
            continue;
          }

          // 检查子菜单情况
          let hasSubMenuShow = false;
          if (per[item.name] && per[item.name].length > 0) {
            for (let perIndex in per[item.name]) {
              if (!per[item.name][perIndex].isHide) {
                hasSubMenuShow = true;
                break;
              }
            }
          }
          if (hasSubMenuShow === false) {
            item.isHide = true;
            // 同时处理per的数据
            if (item.meta.parentName && per[item.meta.parentName]) {
              for (let perIndex in per[item.meta.parentName]) {
                if (per[item.meta.parentName][perIndex].name === item.name) {
                  per[item.meta.parentName][perIndex].isHide = true;
                  break;
                }
              }
            }
          }
        }
      }
    },

    // 检查非页面菜单的转发设置（redir）
    setMenuRedir(config, per) {
      for (let configIndex in config) {
        for (let menuIndex in config[configIndex]) {
          let item = config[configIndex][menuIndex];
          // 过滤
          if (item.isHide || (item.type && item.type !== "menu")) {
            continue;
          }

          // 检查指定的 redir 是否有效
          let redirCheck = this.parseParent(item.meta.redir);
          let parentParams = redirCheck.split("/");
          let redirCheckResult = false;
          if (parentParams.length > 1) {
            let perKey = parentParams[parentParams.length - 2];
            let perName = parentParams[parentParams.length - 1];
            if (per[perKey]) {
              for (let perIndex in per[perKey]) {
                if (per[perKey][perIndex].name === perName) {
                  if (!per[perKey][perIndex].isHide) {
                    redirCheckResult = true;
                  }
                  break;
                }
              }
            }
          }
          if (redirCheckResult === false) {
            item.meta.redir = "";
          }

          // 若redir为空，把第一个子菜单的Path作为菜单的redir
          if (!item.component && !item.meta.redir) {
            if (per[item.name] && per[item.name].length > 0) {
              for (let perIndex in per[item.name]) {
                let perItem = per[item.name][perIndex];
                if (perItem.isHide !== true) {
                  item.meta.redir = perItem.path;
                  break;
                }
              }
            }
          }

          // 如果匹配失败，影藏菜单
          if (!item.meta.redir) {
            item.isHide = true;
          }
        }
      }
    },

    // 把 parent 的写法变为 path/path/path（前后不带/）
    parseParent(parentStr) {
      if (!parentStr) return "";
      // 去掉头部“/”
      if (parentStr[0] === "/") {
        if (parentStr.length > 1) {
          parentStr = parentStr.substr(1);
        } else {
          parentStr = "";
        }
      }
      // 去掉尾部“/”
      if (parentStr && parentStr[parentStr.length - 1] === "/") {
        if (parentStr.length > 1) {
          parentStr = parentStr.substr(0, parentStr.length - 1);
        } else {
          parentStr = "";
        }
      }
      return parentStr;
    },

    //初始化路由
    initRouters: function() {
      let _this = this;
      let appName = "shop";
      let routers = require("@/routers/" + appName + ".js").default;
      let router = []; // 路由列表
      let menusConfig = {}; // 菜单列表
      let per = {}; // 有权限的上下级关系数据
      // 处理数据，把有权限显示的数据放进路由列表
      for (let index in routers) {
        menusConfig[index] = [];
        per[index] = [];
        routers[index].forEach((item) => {
          // 管理员权限判断
          let hasPerm = _this.menuHasPerm(item);
          // 版本权限判断
          let hasLicensePerm = _this.menuHasLicensePerm(item);
          // 分析处理数据
          _this.handleMenuItem(item, {
            parentName: index,
            hasPerm: hasPerm,
            hasLicensePerm: hasLicensePerm,
          });

          if (item.meta.checkPerm) {
            per[index].push(item);
          }
        });
      }

      // 处理二级菜单，若子菜单都隐藏，菜单隐藏
      _this.hideMenuForNoSub(routers, per, 1);
      // 处理一级菜单，若子菜单都隐藏，菜单隐藏
      _this.hideMenuForNoSub(routers, per, 0);
      // 处理非页面菜单的跳转
      _this.setMenuRedir(routers, per);

      // 把数据压进 路由列表 和 菜单里列表
      for (let index in routers) {
        routers[index].forEach((item) => {
          if (item.meta.checkPerm) {
            //处理商品设置,代理设置和海报管理的嵌套路由
            if (item.meta.hasChildren) {
              item.children = [];
              routers[item.name].forEach((child) => {
                if (child.meta.checkPerm && child.meta.isChildren) {
                  item.children.push(child);
                }
              });
              if (item.children.length) {
                item.redirect = item.children[0].path;
              }
            }
            // 嵌套的子路由不需要注册，分组名称不用注册路由
            if (!item.meta.isChildren && item.type !== "group") {
              router.push(item);
            }
            // 显示的菜单才放进菜单列表
            if (item.isHide !== true) {
              menusConfig[index].push(item);
            }
          }
        });
      }

      // 错误页面
      router.push({
        name: "error",
        path: "*",
        meta: {
          title: "出错了",
        },
        component: () => import("@/views/error"),
      });
      // 动态注册路由
      _this.$router.addRoutes(router);
      // 用来渲染菜单
      menusConfig.root.forEach((n) => {
        if (["home", "marketing"].includes(n.name)) {
          n.type = "menu";
        }
      });

      _this.$store.state.Menus = menusConfig;
      _this.loadCustom();
    },
    // 加载定制路由信息
    async loadCustom() {
      let _this = this;
      if (
        _this.getCookie("is_custom") == "1" ||
        _this.getCookie("CustomSiteID") ||
        _this.getCookie("CustomDir")
      ) {
        var siteId = _this.getCookie("InitSiteID");
        if (_this.getCookie("CustomSiteID")) {
          siteId = _this.getCookie("CustomSiteID");
        }
        console.log(siteId + " is custom");
        var customDir = "site" + siteId;
        if (_this.getCookie("CustomDir")) {
          customDir = _this.getCookie("CustomDir");
        }
        var extendUrl = "/scripts/custom/" + customDir + "/extend.json";
        if (process.env.NODE_ENV === "development") {
          extendUrl =
            document.location.protocol +
            "//" +
            location.hostname +
            ":" +
            location.port +
            extendUrl;
        } else {
          extendUrl = "/shop/admin" + extendUrl;
        }
        var res = await axios.get(extendUrl);
        if (res) {
          // Vue-Router 自定义
          var vueRouterExtend = res.vueRouter;
          if (vueRouterExtend) {
            var extendRoutes = vueRouterExtend.routes;
            var extendRouteRules = vueRouterExtend.rules;
            if (extendRoutes) {
              // 加到路由规则里
              var routeList = [];
              for (var i = 0; i < extendRoutes.length; i++) {
                let routeData = extendRoutes[i];
                if (
                  !routeData.AdminPerm ||
                  (routeData.AdminPerm && _this.hasPerm(routeData.AdminPerm))
                ) {
                  routeList.push({
                    name: routeData.name,
                    path: routeData.path,
                    component(resolve) {
                      require([
                        "@/custom/" +
                          customDir +
                          "/views/" +
                          routeData.component,
                      ], resolve);
                    },
                  });
                }
              }
              _this.$router.addRoutes(routeList);
              // 全局守卫
              if (extendRouteRules && routeList.length > 0) {
                _this.$router.beforeResolve((to, from, next) => {
                  var nextInfo = null;
                  for (var i = 0; i < extendRouteRules.length; i++) {
                    var ruleData = extendRouteRules[i];
                    if (ruleData.from == to.name) {
                      nextInfo = {
                        replace: true,
                        name: ruleData.to,
                        query: to.query,
                        params: to.params,
                      };
                      break;
                    }
                  }
                  if (nextInfo) {
                    next(nextInfo);
                  } else {
                    next();
                  }
                });
              }
            }
          }
          // 自定义菜单
          if (res.menu && res.menu.remove) {
            res.menu.remove.forEach((name) => {
              if (_this.$store.state.Menus[name]) {
                delete _this.$store.state.Menus[name]; //处理一级菜单
              } else {
                //处理一级菜单
                for (let group in _this.$store.state.Menus) {
                  _this.$store.state.Menus[group] = _this.$store.state.Menus[
                    group
                  ].filter((n) => {
                    return n.name != name;
                  });
                }
              }
            });
          }
          if (res.menu && res.menu.add) {
            res.menu.add.forEach((item) => {
              if (
                !item.meta.AdminPerm ||
                (item.meta.AdminPerm && _this.hasPerm(item.meta.AdminPerm))
              ) {
                _this.$store.state.Menus[item.meta.parent].push(item);
              }
            });
          }
        }
        // this.$httpGet(
        //   extendUrl,
        //   null,
        //   (res) => {
        //     if (res) {
        //       // Vue-Router 自定义
        //       var vueRouterExtend = res.vueRouter;
        //       if (vueRouterExtend) {
        //         var extendRoutes = vueRouterExtend.routes;
        //         var extendRouteRules = vueRouterExtend.rules;
        //         if (extendRoutes) {
        //           // 加到路由规则里
        //           var routeList = [];
        //           for (var i = 0; i < extendRoutes.length; i++) {
        //             let routeData = extendRoutes[i];
        //             if (!routeData.AdminPerm || (routeData.AdminPerm &&_this.hasPerm(routeData.AdminPerm))) {
        //               routeList.push({
        //                 name: routeData.name,
        //                 path: routeData.path,
        //                 component(resolve) {
        //                   require([
        //                     "@/custom/" +
        //                       customDir +
        //                       "/views/" +
        //                       routeData.component
        //                   ], resolve);
        //                 }
        //               });
        //             }
        //           }
        //           _this.$router.addRoutes(routeList);
        //           // 全局守卫
        //           if (extendRouteRules && routeList.length > 0) {
        //             _this.$router.beforeResolve((to, from, next) => {
        //               var nextInfo = null;
        //               for (var i = 0; i < extendRouteRules.length; i++) {
        //                 var ruleData = extendRouteRules[i];
        //                 if (ruleData.from == to.name) {
        //                   nextInfo = {
        //                     replace: true,
        //                     name: ruleData.to,
        //                     query: to.query,
        //                     params: to.params
        //                   };
        //                   break;
        //                 }
        //               }
        //               if (nextInfo) {
        //                 next(nextInfo);
        //               } else {
        //                 next();
        //               }
        //             });
        //           }
        //         }
        //       }
        //       // 自定义菜单
        //       if (res.menu && res.menu.remove) {
        //         res.menu.remove.forEach(name => {
        //           if (_this.$store.state.Menus[name]) {
        //             delete _this.$store.state.Menus[name]; //处理一级菜单
        //           } else {
        //             //处理一级菜单
        //             for (let group in _this.$store.state.Menus) {
        //               _this.$store.state.Menus[group] = _this.$store.state.Menus[group].filter(n => {
        //                 return n.name != name;
        //               });
        //             }
        //           }
        //         });
        //       }
        //       if (res.menu && res.menu.add) {
        //         res.menu.add.forEach(item => {
        //           if (!item.meta.AdminPerm || (item.meta.AdminPerm && _this.hasPerm(item.meta.AdminPerm))) {
        //             _this.$store.state.Menus[item.meta.parent].push(item);
        //           }
        //         });
        //       }
        //     }
        //   },
        //   (error) => {
        //     console.log("custom config error", error);
        //   }
        // );
      }
    },
  },
};
</script>
<style lang="less">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #f2f4fd;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
