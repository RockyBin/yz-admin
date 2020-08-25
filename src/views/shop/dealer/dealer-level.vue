<template>
  <div class="dealer-level">
    <Tabs v-if="['dealerLevelStandard','dealerLevelHidden'].indexOf($route.name)>-1 && hasLicensePerm('ENABLE_DEALER_HIDE_LEVEL')" :value="$route.path" @on-click="$router.replace($event)">
      <TabPane v-for="item in tabs" :label="item.label" :name="item.target" :key="item.target"></TabPane>
    </Tabs>
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  data() {
    return {
      tabs: [
        {
          label: "经销商等级",
          target: "/dealer/level/standard"
        },
        {
          label: "隐藏等级",
          target: "/dealer/level/hidden"
        }
      ]
    }
  }
}
</script>
<style lang="less" scoped>
  
</style>