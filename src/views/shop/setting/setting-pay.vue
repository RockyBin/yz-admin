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
  data() {
    return {
      tabs: []
    };
  },
  created() {
    if (window.hasPerm("pay.config.view")) {
      this.tabs.push({
        label: "微信支付",
        target: "/setting/mall/pay/setting-pay-weixin"
      });
    }
    if (window.hasPerm("pay.config.view")) {
      this.tabs.push({
        label: "支付宝",
        target: "/setting/mall/pay/setting-pay-alipay"
      });
    }
    if (window.hasPerm("pay.config.view")) {
      this.tabs.push({
        label: "银行账户",
        target: "/setting/mall/pay/setting-pay-bankpay"
      });
    }
    if (window.hasPerm("pay.config.view")) {
      this.tabs.push({
        label: "通联支付",
        target: "/setting/mall/pay/setting-pay-tlpay"
      });
    }
  }
};
</script>
<style lang="less" scoped>
.common-tabs {
  padding-bottom: 50px !important;
  /deep/.ivu-tabs-bar {
    padding-left: 24px;
    margin-bottom: 0;
  }
  /deep/.form-full-wrapper {
    padding-bottom: 4px;
  }
}
</style>
