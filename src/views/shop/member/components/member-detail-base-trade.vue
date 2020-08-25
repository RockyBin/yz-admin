<template>
  <div class="member-detail-base-trade">
    <div class="member-detail-base-trade-item">
      <div class="member-detail-base-trade-title">
        <titlebar title="自购交易情况"></titlebar>
      </div>
      <div class="member-detail-base-trade-left">
        <div>
          <div>{{value.trade_time || "0"}}</div>
          <div>交易次数</div>
        </div>
        <div>
          <div>￥{{value.trade_money || "0.00"}}</div>
          <div>交易金额</div>
        </div>
      </div>
    </div>
    <div class="member-detail-base-trade-item">
      <div class="member-detail-base-trade-title">
        <titlebar title="自购订单情况"></titlebar>
      </div>
      <div class="member-detail-base-trade-right">
        <div>
          <div @click="onOrderShopClick({})">全部订单（{{value.order_total || "0"}}）</div>
          <div
            @click="$router.push({name: 'orderAfterSele', query: {keyword: value.mobile, search_type: '1'}})"
          >售后订单（{{value.order_sale_after || "0"}}）</div>
        </div>
        <div>
          <div @click="onOrderShopClick({tab: 0})">待付款（{{value.order_nopay || "0"}}）</div>
          <div @click="onOrderShopClick({tab: 1})">待发货（{{value.order_pay || "0"}}）</div>
          <div @click="onOrderShopClick({tab: 2})">待收货（{{value.order_send || "0"}}）</div>
          <div @click="onOrderShopClick({tab: '4,5'})">已完成（{{value.order_finished || "0"}}）</div>
        </div>
        <div>
          <div @click="onOrderShopClick({tab: 8})">取消订单（{{value.order_cancel || "0"}}）</div>
          <div @click="onOrderShopClick({tab: 6})">交易关闭（{{value.order_closed || "0"}}）</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import titlebar from "@/views/shop/components/titlebar/vertical-line-titlebar";
export default {
  components: {
    titlebar
  },
  props: {
    value: {
      type: Object,
      default() {
        return null;
      }
    }
  },
  data() {
    return {};
  },
  methods: {
    onOrderShopClick(val) {
      this.$router.push({
        name: "orderShop",
        query: Object.assign({ keyword: this.value.mobile, keyword_type: '1' }, val)
      });
    }
  }
};
</script>
<style lang="less" scoped>
.member-detail-base-trade {
  color: #657180;
  display: flex;
  padding-top: 24px;
  .member-detail-base-trade-item {
    border: 1px solid #e9eaf2;
    border-radius: 5px;
    width: 430px;
    height: 215px;
    padding: 8px 16px;
    box-sizing: border-box;
    & + .member-detail-base-trade-item {
      margin-left: 20px;
    }
    &:last-child {
      width: calc(100% - 450px);
    }
    .member-detail-base-trade-title {
      margin-bottom: 15px;
      color: #464c5b;
    }
  }
  .member-detail-base-trade-left {
    position: relative;
    display: flex;
    padding-left: 15px;
    &:after {
      content: "";
      display: block;
      position: absolute;
      left: 188px;
      width: 1px;
      height: 100%;
      border-left: 1px dashed #e9eaf2;
    }
    & > div {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 160px;
      height: 90px;
      text-align: center;
      background-color: #f8f9fd;
      border-radius: 5px;
      &:last-child {
        margin-left: 29px;
        width: 180px;
      }
      & > div {
        &:first-child {
          font-size: 18px;
          margin-bottom: 5px;
          color: #464c5b;
        }
        &:last-child {
          font-weight: bold;
        }
      }
    }
  }
  .member-detail-base-trade-right {
    padding-left: 15px;
    & > div {
      display: flex;
      margin-bottom: 8px;
      div {
        width: 120px;
        height: 40px;
        line-height: 40px;
        border-radius: 5px;
        margin-right: 5px;
        text-align: center;
        cursor: pointer;
      }
      &:nth-child(1) {
        & > div {
          &:nth-child(1) {
            border: 1px solid #e9eaf2;
          }
          &:nth-child(2) {
            background-color: #fed2bf;
          }
        }
      }
      &:nth-child(n + 2) {
        & > div {
          background-color: #b2ddf9;
        }
      }
    }
  }
}
</style>
