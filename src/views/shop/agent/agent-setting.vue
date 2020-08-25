<template>
  <div class="agent-setting" v-show="!$store.state.COMMON_loading">
    <thirdMenu :list="thirdMenu"/>
    <router-view></router-view>
  </div>
</template>
<script>
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import thirdMenuData from "./components/third-menu-for-setting-agent";
export default {
  components: {
    thirdMenu
  },
  data() {
    return {
      thirdMenu:thirdMenuData.getThirdMenu()
    };
  },
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
