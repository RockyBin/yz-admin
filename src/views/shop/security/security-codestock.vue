<template>
  <div class="security-codestock">
    <Tabs
        :animated="true"
        :value="$route.path"
        @on-click="$route.path !== $event && $router.push($event)"
    >
      <TabPane
          v-for="tab in tabs"
          :label="tab.label"
          :name="tab.target"
          :key="tab.target"
      ></TabPane>
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
            label:"批次列表",
            target:"/marketing/batch"
          },
          {
            label:"防伪码列表",
            target:"/marketing/code"
          }
        ]
      }
    }
  }
</script>
<style lang="less" scoped>

</style>