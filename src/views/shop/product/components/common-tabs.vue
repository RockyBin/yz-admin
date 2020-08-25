<template>
  <div class="common-tabs">
    <Tabs :animated="false" :value="$route.path" @on-click="$router.push($event)">
        <TabPane v-for="tab in tabs" :label="tab.label" :name="tab.target" :key="tab.target"></TabPane>
    </Tabs>
  </div>
</template>
<script>
export default {
  data(){
    return{
      // currentRoute:this.$route.path,
      tabs:[]
    }
  },
  created(){
    if(window.hasPerm("product.class.view")){
      this.tabs.push({
        label:"商品分类",
        target:"/product/setting/class"
      })
    }
    if(window.hasPerm("product.param.view")){
      this.tabs.push( {
        label:"商品参数",
        target:"/product/setting/params"
      })
    }
    if(window.hasPerm("product.comment.view")){
      this.tabs.push({
        label:"商品评价",
        target:"/product/setting/comments"
      })
    }
  }
  // watch:{
  //   currentRoute(value){
  //     console.log(1111,value)
  //     this.$router.push(value);
  //   }
  // }
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
