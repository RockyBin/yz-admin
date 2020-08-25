<template>
  <div class="supplier-setting">
    <thirdMenu :list="thirdMenu"/>
    <router-view></router-view>
  </div>
</template>
<script>
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import thirdMenuData from "./components/third_menu-for-setting-supplier";
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
.supplier-setting {
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
