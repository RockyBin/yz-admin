<template>
  <div class="member-center-subscription">
    <div class="member-center-bg" :style="`background-image: url(${require('./images/subscription.png')});`">
      <div class="content">
        <div class="title">订阅公众号，享专属会员服务</div>
        <div class="item">随时掌握订单进度、活动优惠、邀请好友通知</div>
        <div class="button theme-gr-bg-color">立即订阅</div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: ["memberInfo", "module"],
    data() {
      return {};
    },
  }
</script>

<style lang="less" scoped>
.member-center-subscription{
  width: calc(100% - 20px);
  margin: 10px;
  border-radius: 5px;
  background-color: #fff;
  color: #333;
  box-shadow: 2px 2px 5px #33333312;
  .member-center-bg{
    box-sizing: border-box;
    background-repeat: no-repeat;
    background-size: auto 100%;
    padding: 15px 0;
    .content{
      margin-left: 113px;
      .title{
        font-size: 13px;
        color: #333333;
      }
      .item{
        font-size: 22px;
        color: #999999;
        -webkit-transform-origin-x: 0;
        width: 200%;
        -webkit-transform: scale(0.5);
        margin-top: -6px;
        line-height: initial;
      }
      .button{
        font-size: 22px;
        color: #FFFFFF;
        height: 38px;
        padding: 0 16px;
        border-radius: 10px;
        box-sizing: border-box;
        display: inline-block;
        -webkit-transform-origin-x: 0;
        -webkit-transform: scale(0.5);
        margin-top: -6px;
        margin-bottom: -10px;
      }
    }
  }
}
</style>