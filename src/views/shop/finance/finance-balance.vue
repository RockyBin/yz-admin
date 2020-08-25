<template>
  <div class="finance-balance">
    <Tabs v-model="tab">
      <TabPane label="余额列表" name="list"></TabPane>
      <TabPane :label="renderLabel" name="verify"></TabPane>
    </Tabs>
    <balance-list v-if="tab=='list'"></balance-list>
    <balance-verify v-show="tab=='verify'" @show-dot="showDot"></balance-verify>
  </div>
</template>
<script>
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import balanceList from "./components/finance-balance-list.vue";
import balanceVerify from "./components/finance-balance-verify.vue";
export default {
  components: {
    balanceList,
    balanceVerify
  },
  data() {
    return {
      tab: this.$route.query.tab || "list",
      isShowDot: false
    }
  },
  watch: {
    tab: {
      handler(value) {
        this.$router.push({
          name: "financeBalance",
          query: {
            tab: value
          }
        })
      },
      immediate: true
    }
  },
  methods: {
    showDot(isShowDot) {
      this.isShowDot = isShowDot;
    },
    renderLabel(h) {
      return h("div",
      {
        class: {
          "custom-label": true,
          "show-dot": this.isShowDot
        }
      },
      [
        h("span", "余额审核"),
        h(moreMessage, {
          style: {
            position: "absolute",
            right: "-23px",
            top: "-2px"
          },
          props: {
            text: "只有通过线下支付方式充值到公司余额账户，才需要公司进行财务审核"
          }
        })
      ])
    }
  }
}
</script>
<style lang='less' scoped>
.finance-balance {
  /deep/.custom-label {
    position: relative;
  }
  /deep/.show-dot {
    &::after {
      content: "";
      position: absolute;
      right: -32px;
      top: -3px;
      width: 9px;
      height: 9px;
      border-radius: 9px;
      background: #F9752A;
    }
  }
}
</style>