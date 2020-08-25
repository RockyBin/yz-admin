<template>
<div class="distributor-setting" v-show="!$store.state.COMMON_loading">
    <thirdMenu :list="thirdMenu"/>
    <router-view></router-view>
  </div>
</template>
<script>
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import thirdMenuData from "./components/third-menu-for-setting-distributor";
export default {
  components: {
    thirdMenu
  },
  data() {
    return {
      thirdMenu:thirdMenuData.getThirdMenu()
    };
  }
}
</script>
<style lang="less" scoped>
  
</style>