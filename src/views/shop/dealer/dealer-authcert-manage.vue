<template>
  <div class="common-tabs">
    <Tabs :animated="true" v-model="tab">
      <TabPane label="证书列表" name="0"></TabPane>
      <TabPane label="证书应用" name="1"></TabPane>
    </Tabs>
    <dealer-authcert-list v-if="tab=='0'"></dealer-authcert-list>
    <dealer-authcert-apply v-if="tab=='1'"></dealer-authcert-apply>
  </div>
</template>
<script>
import dealerAuthcertList from  "@/views/shop/dealer/dealer-authcert-list.vue"
import dealerAuthcertApply from "@/views/shop/dealer/dealer-authcert-apply.vue"
export default {
  components: {
    dealerAuthcertList,
    dealerAuthcertApply
  },
  data() {
    return {
      tab: '0',
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
