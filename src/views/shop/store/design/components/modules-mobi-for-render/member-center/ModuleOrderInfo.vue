<template>
  <!-- 我的订单部分 -->
  <div class="member-center-order" v-if="memberInfo.retail_status">
    <div class="member-center-order-head">
      <div>我的订单</div>
      <div @click="routerLink('')">全部</div>
    </div>
    <div class="member-center-order-line"></div>
    <div class="member-center-order-content">
      <div class="member-center-order-list" @click="routerLink('0')">
        <div class="member-center-order-icon">
          <i class="iconfont iconfont1 icon-icon_obligation"></i>
        </div>
        <div
          class="member-center-order-num theme-bg-color"
          v-if="memberInfo.order_count.no_pay"
        >{{memberInfo.order_count.no_pay}}</div>
        <div>待付款</div>
      </div>
      <div class="member-center-order-list" @click="routerLink('1')">
        <div class="member-center-order-icon">
          <i class="iconfont iconfont1 icon-icon_send"></i>
        </div>
        <div
          class="member-center-order-num theme-bg-color"
          v-if="memberInfo.order_count.pay"
        >{{memberInfo.order_count.pay}}</div>
        <div>待发货</div>
      </div>
      <div class="member-center-order-list" @click="routerLink('2')">
        <div class="member-center-order-icon">
          <i class="iconfont iconfont1 icon-icon_delivery"></i>
        </div>
        <div
          class="member-center-order-num theme-bg-color"
          v-if="memberInfo.order_count.send"
        >{{memberInfo.order_count.send}}</div>
        <div>待收货</div>
      </div>
      <div
        class="member-center-order-list"
        @click="routerLink('3')"
        v-show="memberInfo.product_comment_status"
      >
        <div class="member-center-order-icon">
          <i class="iconfont iconfont1 icon-icon_evaluation"></i>
        </div>
        <div
          class="member-center-order-num theme-bg-color"
          v-if="memberInfo.order_count.wait_comment"
        >{{memberInfo.order_count.wait_comment}}</div>
        <div>待评价</div>
      </div>
      <div
        class="member-center-order-list"
        @click="routerLink('4, 5')"
        v-show="!memberInfo.product_comment_status"
      >
        <div class="member-center-order-icon">
          <i class="iconfont iconfont1 icon-icon_complete"></i>
        </div>
        <div>已完成</div>
      </div>
      <div
        class="member-center-order-list"
        v-if="memberInfo.aftersale_isopen==1"
        @click="$router.push({name:'memberAfterList',query: {status: '6'}})"
      >
        <div class="member-center-order-icon">
          <i class="iconfont iconfont1 icon-icon_after-sales"></i>
        </div>
        <div>售后</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["memberInfo"],
  data() {
    return {};
  },
  methods: {
    // 路由跳转
    routerLink(str) {
      this.$router.push({ name: "memberOrder", query: { status: str } });
    }
  },
};
</script>
<style lang="less" scoped>
// 订单
.member-center-order {
  width: calc(100% - 20px);
  margin: 10px;
  border-radius: 5px;
  background-color: #fff;
  color: #333;
  box-shadow: 2px 2px 5px #33333312;
  .member-center-order-head {
    line-height: 40px;
    height: 40px;
    display: flex;
    color: #666;
    justify-content: space-between;
    & > div {
      padding: 0 15px;
      &:nth-child(1) {
        font-size: 14px;
        font-weight: bold;
      }
    }
  }
  .member-center-order-line {
    border-bottom: 1px solid #f7f7f7;
    width: calc(100% - 32px);
    margin: 0 16px;
  }
  .member-center-order-content {
    padding: 6px 0 10px;
    display: flex;
    justify-content: space-around;
    .member-center-order-list {
      flex: 1;
      position: relative;
      // width: 20%;
      color: #333;
      text-align: center;
      padding: 10px 0 0;
      height: 68px;
      box-sizing: border-box;
      .member-center-order-icon {
        height: 30px;
        line-height: 30px;
        width: 30px;
        margin: 0 auto 5px;
        text-align: center;
        i {
          font-size: 28px;
          vertical-align: middle;
        }
      }
      .member-center-order-num {
        position: absolute;
        top: 0px;
        left: calc((100% - 30px) / 2 + 30px - 21px);
        padding: 0 6px;
        min-width: 28px;
        height: 28px;
        line-height: 26px;
        border-radius: 15px;
        color: #fff;
        background: #fff;
        background-color: #ff5907;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        font-size: 20px;
        transform: scale(0.5);
      }
      &:nth-child(1) {
        .member-center-order-icon i {
          vertical-align: text-bottom;
        }
      }
    }
  }
}
</style>