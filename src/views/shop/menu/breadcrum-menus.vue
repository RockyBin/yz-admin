<template>
  <div class="thrid-menu">
    <div class="left-nav">
      <Breadcrumb>
        <template v-if="$route.name !== 'home' && $route.name !== 'error'">
          <BreadcrumbItem
            v-for="(item, index) in selectMenu"
            :to="getBreadcrumPath(index, item)"
            :key="item.path"
            >{{ getBreadcrumName(index, item) }}</BreadcrumbItem
          >
        </template>
        <!-- <BreadcrumbItem
          v-if="$route.query.extraTitle"
        >{{$route.query.extraTitle}}</BreadcrumbItem> -->
        <BreadcrumbItem v-if="$route.name == 'home' || $route.name == 'error'"
          >{{ period }}好! {{ $store.state.storeInfo.name }}</BreadcrumbItem
        >
      </Breadcrumb>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  data() {
    return {};
  },
  computed: {
    /**
     * 计算出当前选中的菜单路径
     */
    period() {
      var hour = new Date().getHours();
      if (hour >= 5 && hour <= 8) {
        return "早上";
      } else if (hour >= 9 && hour <= 10) {
        return "上午";
      } else if (hour >= 11 && hour <= 13) {
        return "中午";
      } else if (hour >= 14 && hour <= 18) {
        return "下午";
      } else {
        return "晚上";
      }
    },
    selectMenu() {
      let selectMenuArr = [];
      for (let menuItem of this.menuList) {
        // 如果是一级菜单
        if (menuItem.path === this.$route.path) {
          if (menuItem.component) {
            selectMenuArr.push(menuItem);
          }
          break;
        }
        // 如果是二级菜单
        if (menuItem.secondMenu) {
          for (let menuItem2 of menuItem.secondMenu) {
            if (menuItem2.path === this.$route.path) {
              if (menuItem.component) {
                selectMenuArr.push(menuItem);
              }
              selectMenuArr.push(menuItem2);
              break;
            } else {
              // 如果是三级菜单
              if (menuItem2.threeMenu) {
                for (let menuItem3 of menuItem2.threeMenu) {
                  if (menuItem3.path === this.$route.path) {
                    if (menuItem.component) {
                      selectMenuArr.push(menuItem);
                    }
                    selectMenuArr.push(menuItem2);
                    selectMenuArr.push(menuItem3);
                    break;
                  }else{
                    if(menuItem3.fourthMenu){
                      for(let menuItem4 of menuItem3.fourthMenu){
                        if(menuItem4.path === this.$route.path){
                          if (menuItem.component) {
                            selectMenuArr.push(menuItem);
                          }
                          selectMenuArr.push(menuItem2);
                          selectMenuArr.push(menuItem3);
                          selectMenuArr.push(menuItem4);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      //有标签页的路由不显示二级面包屑
      var last = selectMenuArr[selectMenuArr.length - 1];
      if(last && last.meta && last.meta.hideBreadCrum) {
        selectMenuArr.pop()
      }
      return selectMenuArr;
    },
    ...mapGetters(["menuList"])
  },
  watch: {
    $route(newVal,oldVal){
      if(oldVal.query.parentQuery && oldVal.query.parentPath == newVal.path) {
        this.$router.replace({
          path: newVal.path,
          query: JSON.parse(oldVal.query.parentQuery)
        })
      }
    }
  },
  methods: {
    // 获取面包屑导航的链接
    getBreadcrumPath(index, item) {
      // 如果有extraTitle的时候 会多一层导航 当前的导航应该链接到父级去
      // if (this.$route.query.extraTitle && item.meta.parentName) {
      //   return {name: item.meta.parentName};
      // }
      if (index < this.selectMenu.length - 1) {
        return item.path;
      }
      return "";
    },
    getBreadcrumName(index, item){
      if(index == (this.selectMenu.length - 1) && this.$route.query.extraTitle){
        return this.$route.query.extraTitle
      } else {
        return item.meta.title
      }
    }
  }
};
</script>
<style lang="less" scoped>
.thrid-menu {
  float: left;
  .left-nav {
    padding-left: 13px;
    text-align: left;
    /deep/.ivu-breadcrumb {
      color: #515A6E;
      span:last-child {
        font-size: 15px;
        color: #515A6E;
        font-weight: bold;
      }
      a {
        font-size: 15px;
      }
    }
  }
}
</style>
