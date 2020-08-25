<template>
  <div class="common-tabs">
    <Tabs :animated="true" :value="$route.path" @on-click="$router.push($event)">
        <TabPane v-for="tab in tabs" :label="tab.label" :name="tab.target" :key="tab.target"></TabPane>
    </Tabs>
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  data(){
    return{
      tabs:[]
    }
  },
  created(){
    if(window.hasPerm("poster.view")){
      this.tabs.push({
        label:"海报列表",
        target:"/store/store-poster-manage/store-poster-list"
      })
    }
    if(window.hasPerm("poster.config.view")){
      this.tabs.push( {
        label:"设置入口",
        target:"/store/store-poster-manage/store-poster-setting-entry"
      })
    }
  }
}
</script>
<style lang="less" scoped>
.common-tabs{
  /deep/.ivu-tabs-bar{
    padding-left:24px;
    margin-bottom:0;
  }
}
</style>
