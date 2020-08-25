<template>
<div class="distributor-verify-container">
  <Tabs v-model="verifyStatus" :animated="false">
    <!-- iscurrent标识是否显示当前页面，用于处理table在tab切换回来时显示宽度不对 -->
    <TabPane label="待审核" name="verify-waiting">
      <distributor-verify-waiting :iscurrent="verifyStatus === 'verify-waiting'" ref="verify-waiting"></distributor-verify-waiting>
    </TabPane>
    <TabPane label="通过记录" name="verify-passed">
      <distributor-verify-passed :iscurrent="verifyStatus === 'verify-passed'" ref="verify-passed"></distributor-verify-passed>
    </TabPane>
    <TabPane label="拒绝记录" name="verfy-rejected">
      <distributor-verify-rejected :iscurrent="verifyStatus === 'verfy-rejected'" ref="verfy-rejected"></distributor-verify-rejected>
    </TabPane>
  </Tabs>
</div>
</template>
<script>
import distributorVerifyWaiting from "./distributor-verify-waiting"
import distributorVerifyPassed from "./distributor-verify-passed"
import distributorVerifyRejected from "./distributor-verify-rejected"
const verifyTabArray = ["verify-waiting", "verify-passed", "verfy-rejected"];
export default {
  components:{
    distributorVerifyWaiting,
    distributorVerifyPassed,
    distributorVerifyRejected
  },
  data(){
    return {
      verifyTabArray,
      verifyStatus: verifyTabArray[this.$route.query.tab || 0]
    }
  },
  watch:{
    verifyStatus(value){
      this.$router.replace({
        name: "distributorVerify",
        query: {
          id: this.$route.query.id,
          tab: this.tabIndex
        }
      });
      this.$refs[value].loadPageData();
    }
  },
  computed: {
    tabIndex() {
      return verifyTabArray.findIndex(n => n === this.verifyStatus)
    }
  },
  mounted(){
    this.$refs[this.verifyStatus].loadPageData();
  }
}
</script>
<style lang="less" scoped>
.distributor-verify-container{
  /deep/.ivu-tabs-bar{
    margin-bottom:0;
  }
  /deep/.ivu-tabs-nav-scroll{
    padding-left:0px;
  }
}
</style>
