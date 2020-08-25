<template>
  <div class="member-center-bind-mobile">
    <div class="content">
      <span>绑定手机号，可同步其他渠道的数据和推荐会员</span>
      <button>去绑定</button>
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
.member-center-bind-mobile{
  width: calc(100% - 20px);
  margin: 10px;
  border-radius: 5px;
  background-color: #fff;
  color: #333;
  box-shadow: 2px 2px 5px #33333312;
  .content{
    line-height: 44px;
    height: 44px;
    font-size: 12px;
    padding: 0 15px ;
    color: #FF3225;
    button {
      color: white;
      height: 25px;
      line-height: 25px;
      padding: 0 10px;
      border-radius: 5px;
      border: 0;
      margin-left: 8px;
      background-image: linear-gradient(#FF305C,#FF3225);
    }
  }
}
</style>