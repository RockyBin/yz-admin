<template>
  <div>
    <div
      class="order-news"
      :class="{'is-height':detailsList.status === 3 && detailsList.receive_status === 1}"
    >
      <div class="order-news-head">订单信息
        <span v-if="detailsList.supplier_member_id" style="color: #FF9900; font-weight: normal;">(供应商订单)</span>
        <span v-else style="color: #FF9900; font-weight: normal;">(自营订单)</span>
      </div>
      <div class="order-news-container">
        <div>
          <label>总订单号：</label>
          <label>{{detailsList.order_id}}</label>
          <label v-if="detailsList.order_type==1" style="margin-left: 12px;" class="table-back">多人拼团</label>
        </div>
        <div>
          <label>订单状态：</label>
          <label>{{detailsList.order_type==1&&detailsList.order_type_status==100?'待成团':commonFunction.matchName(detailsList.order_status, constants.orderStatus)}}</label>
        </div>
        <div>
          <label>买家昵称：</label>
          <label>{{detailsList.nickname}}</label>
        </div>
        <div>
          <label>手机号：</label>
          <label>{{detailsList.mobile}}</label>
        </div>
        <div>
          <label>姓名：</label>
          <label>{{detailsList.name ||'--'}}</label>
        </div>       
        <div>
          <label>下单时间：</label>
          <label>{{detailsList.order_created_at}}</label>
        </div>
        <div>
          <label>支付时间：</label>
          <label>{{detailsList.pay_created_at}}</label>
        </div>
        <div>
          <label>结算方式：</label>
          <label>{{commonFunction.matchName(detailsList.pay_type, constants.payChannel)}}</label>
        </div>
        <div>
          <label>支付流水号：</label>
          <label>{{detailsList.tradeno}}</label>
        </div>
        <div>
          <label>终端来源：</label>
          <label>{{commonFunction.matchName(detailsList.order_terminal_type, constants.terminalTypes)}}</label>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import constants from "@/views/shop/components/constants.js";
import commonFunction from "@/views/shop/components/common-function.js";
export default {
  props: {
    detailsList: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      constants,
      commonFunction
    };
  }
};
</script>
<style lang="less" scoped>
.order-news {
  display: inline-block;
  width: 384px;
  height: 100%;
  border: 1px solid #dddee1;
  border-radius: 6px;
  overflow: hidden;
  .order-news-head {
    width: 100%;
    height: 50px;
    line-height: 50px;
    background: #f8f9fd;
    font-size: 14px;
    font-weight: bold;
    text-align: center;
  }
  .order-news-container {
    width: 100%;
    font-size: 12px;
    color: #657180;
    margin-left: 24px;
    div {
      margin-top: 15px;
    }
    div:last-child {
      margin-bottom: 25px;
    }
  }
}
.is-height {
  // height: 402px;
}
</style>
