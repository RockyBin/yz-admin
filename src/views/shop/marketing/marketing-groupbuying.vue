<template>
  <div class="common-tabs">
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
          label: "拼团活动",
          target: "/marketing/groupbuying/list"
        },
        {
          label: "活动数据",
          target: "/marketing/groupbuying/data"
        }
      ]
    };
  }
};
</script>
<style lang="less" scoped>
.common-tabs {
  /deep/.ivu-tabs-bar {
    padding-left: 24px;
    margin-bottom: 0;
  }
}
</style>
