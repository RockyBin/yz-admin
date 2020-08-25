<template>
  <div class="agent-setting" v-show="!$store.state.COMMON_loading">
    <thirdMenu :list="thirdMenu"/>
    <router-view></router-view>
  </div>
</template>
<script>
  import thirdMenu from "@/views/shop/menu/third-menu.vue";
  export default {
    components: {
      thirdMenu
    },
    data() {
      return {
        thirdMenu:this.getThirdMenu()
      };
    },
    methods:{
      getThirdMenu() {
        let thirdMenuList = [];
        if (window.hasPerm('area.agent.config.view')) {
          thirdMenuList.push({
            title: "基础设置",
            target: "/areaagent/base/setting"
          })
        }
        if (window.hasPerm('area.agent.config.view')) {
          thirdMenuList.push({
            title: "加盟设置",
            target: "/areaagent/setting/joining"
          })
        }
        return thirdMenuList;
      }
    }
  };
</script>
<style lang="less" scoped>
  .agent-setting {
    /deep/.ivu-checkbox-wrapper,
    /deep/.ivu-radio-wrapper {
      margin-right: 20px;
    }
    /deep/.class-tree-select {
      .ivu-checkbox-wrapper,
      .ivu-radio-wrapper {
        margin-right: 8px;
      }
    }
  }
</style>
