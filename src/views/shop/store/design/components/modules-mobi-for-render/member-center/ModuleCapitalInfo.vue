<template>
  <!-- 头部余额、积分和优惠券tab -->
  <div class="member-center-cash" :class="{'member-center-cash-margin': !memberInfo.invite_code}">
    <div class="member-center-cash-money" @click="$router.push({name:'balanceHome'})" v-if="module.my_balance_is_show">
      <div class="member-center-cash-icon">
        <span class="special" v-if="memberInfo.balance">¥</span>
        <span>{{memberInfo.balance || '0'}}</span>
      </div>
      <div>{{lang ? lang("shop-front.diy_word.my_balance") : "我的余额"}}</div>
    </div>
    <div class="member-center-cash-money" @click="$router.push({name:'memberIntegral'})" v-if="module.my_point_is_show">
      <div class="member-center-cash-icon">
        <span>{{memberInfo.point || '0'}}</span>
      </div>
      <div>{{lang ? lang("shop-front.diy_word.my_point") : "我的积分"}}</div>
    </div>
    <div class="member-center-cash-money" v-if="memberInfo.retail_status && module.my_coupon_is_show"  @click="$router.push({name:'memberCoupon'})">
      <div class="member-center-cash-icon">
        <span>{{memberInfo.coupon_able || '0'}}</span>
      </div>
      <div>{{lang ? lang("shop-front.diy_word.coupon") : "优惠券"}}</div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["memberInfo", "module"],
  data() {
    return {
      lang: this.$t || null
    }
  }
}
</script>
<style lang="less" scoped>
  .member-center-cash {
    position: relative;
    display: flex;
    width: calc(100% - 20px);
    height: 70px;
    text-align: center;
    margin: 10px;
    box-shadow: 2px 2px 5px #33333312;
    border-radius: 5px;
    background-color: #fff;
    color: #333;
    &.member-center-cash-margin {
      margin-top: -32px;
    }
    .member-center-cash-money {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      height: 100%;
      box-sizing: border-box;
      padding: 10px;
      color: #666;
      .member-center-cash-icon {
        position: relative;
        font-size: 16px;
        color: #333;
        margin-bottom: 4px;
      }

      .special {
        font-size: 14px;
      }
    }
  }
</style>