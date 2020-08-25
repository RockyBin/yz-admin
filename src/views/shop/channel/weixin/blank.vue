<template>
<div class="blank-wrapper">
  <div class="blank">
    <img src="images/channel/weixin.png" alt>
    <p>{{msg}}</p>
    <Button
      class="btn"
      type="primary"
      shape="circle"
      @click="$router.push('/channel/weixin/public-management')"
    >前往绑定微信公众号</Button>
  </div>
</div>
</template>
<script>
export default {
  props:["msg"]
};
</script>
<style lang="less" scoped>
.blank-wrapper {
  width: 100%;
  height: calc(100vh - 70px);
  background: #fff;
  .blank {
    display: flex;
    flex-direction: column;
    height: 100%;
    align-items: center;
    justify-content: center;
    p {
      font-size: 14px;
      color: #333;
      margin: 30px 0;
    }
    .btn {
      width: 200px;
      height: 40px;
    }
  }
}
</style>
