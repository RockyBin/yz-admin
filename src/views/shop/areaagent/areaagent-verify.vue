<template>
  <div class="areagent-verify-container">
    <Tabs v-model="verifyStatus" :animated="false">
      <!-- iscurrent标识是否显示当前页面，用于处理table在tab切换回来时显示宽度不对 -->
      <TabPane label="待审核" name="verify-waiting">
        <areagent-verify-waiting :iscurrent="verifyStatus === 'verify-waiting'" ref="verify-waiting"></areagent-verify-waiting>
      </TabPane>
      <TabPane label="通过记录" name="verify-passed">
        <areagent-verify-passed :iscurrent="verifyStatus === 'verify-passed'" ref="verify-passed"></areagent-verify-passed>
      </TabPane>
      <TabPane label="拒绝记录" name="verfy-rejected">
        <areagent-verify-rejected :iscurrent="verifyStatus === 'verfy-rejected'" ref="verfy-rejected"></areagent-verify-rejected>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
  import areagentVerifyWaiting from "./areaagent-verify-waiting"
  import areagentVerifyPassed from "./areaagent-verify-passed"
  import areagentVerifyRejected from "./areaagent-verify-rejected"
  const verifyTabArray = ["verify-waiting", "verify-passed", "verfy-rejected"];
  export default {
    components:{
      areagentVerifyWaiting,
      areagentVerifyPassed,
      areagentVerifyRejected
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
          name: "areaagentVerify",
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
  .areagent-verify-container{
    /deep/.ivu-tabs-bar{
      margin-bottom:0;
    }
    /deep/.ivu-tabs-nav-scroll{
      padding-left:0px;
    }
  }
</style>
