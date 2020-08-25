<template>
<div>
  <div class="item"><div class="key">申请分销商时间：</div><div class="value">{{info.created_at?info.created_at:"--"}}</div></div>
  <div class="item"><div class="key">申请条件：</div><div class="value">累计{{info.calc_apply_valid_condition?'维权期后':'付款后'}}交易金额满 ¥ {{info.buy_money}}</div></div>
  <div class="item"><div class="key">实际情况：</div><div class="value"><div>目前累计付款后交易金额为 ¥ {{info.member_info.buy_money}}</div><div>目前累计成交后交易金额为  ¥ {{info.member_info.deal_money}}</div></div></div>
</div>
</template>
<script>
export default {
  props:["info"]
}
</script>
<style lang="less" scoped>
  .item{
    display:flex;
    .key{
      flex-shrink:0;
    }
    .value>div:not(:last-child){
      margin-bottom:5px;
    }
    &:not(:last-child){
      margin-bottom:15px;
    }
  }
</style>