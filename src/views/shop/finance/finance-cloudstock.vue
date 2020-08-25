<template>
<div class="cloudstock-order">
  <Tabs v-if="['financeCloudstockStock','financePerformanceStock','financeRecommendStock','financeDealerSalesAward','financeGoodsRecurrentceAward','financeGoodsRecurrentceAward'].indexOf($route.name) > -1" :value="$route.path" @on-click="$router.replace($event)">
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
    if(window.hasPerm("cloudstock.settle.view")){
      this.tabs.push({
        label:"云仓进货单结算",
        target:"/finance/cloudstock/stock"
      })
    }
    if(window.hasPerm("cloudstock.settle.view")){
        this.tabs.push({
            label:"业绩奖结算",
            target:"/finance/performance/stock"
        })
    }
    if(window.hasPerm("cloudstock.settle.view")){
        this.tabs.push({
            label:"推荐奖结算",
            target:"/finance/recommend/stock"
        })
    }
    if(window.hasPerm("cloudstock.settle.view")){
      this.tabs.push( {
        label:"销售奖结算",
        target:"/finance/dealer/sales-award"
      })
    }
    // this.tabs.push( {
    //     label:"订货返现奖结算",
    //     target:"/finance/goods/recurrentce-award"
    // })
  }
}
</script>
<style lang="less" scoped>
  
</style>