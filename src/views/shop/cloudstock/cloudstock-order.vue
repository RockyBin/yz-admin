<template>
<div class="cloudstock-order">
  <Tabs v-if="['cloudstockOrderListBuy','cloudstockOrderListGet'].indexOf($route.name) > -1" :value="$route.path" @on-click="$router.replace($event)">
    <TabPane v-for="item in tabs" :label="item.label" :name="item.target" :key="item.target"></TabPane>
  </Tabs>
  <router-view></router-view>
</div>
</template>
<script>
export default {
  data() {
    return {
      tabs: []
    }
  },
  created(){
    if(window.hasPerm("cloudstock.order.view")){
      this.tabs.push({
        label:"云仓进货单",
        target:"/dealer/order-list/buy"
      })
    }
    if(window.hasPerm("cloudstock.order.view")){
      this.tabs.push( {
        label:"云仓提货单",
        target:"/dealer/order-list/get"
      })
    }
  }
}
</script>
<style lang="less" scoped>
  
</style>