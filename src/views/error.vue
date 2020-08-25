<template>
  <div class="error">
    <div>
      <img src="images/404.png" alt="">
      <p>很抱歉，您访问的页面不存在~~</p>
    </div>
  </div>
</template>
<style lang="less" scoped>
  .error{
    display:flex;
    // align-items:center;
    justify-content:center;
    height:calc(100vh - 84px);
    img{
      margin-top:93%;
    }
    p{
      font-size:16px;
      color:#464C5B;
      margin-top:30px;
      text-align:center;
    }
  }
</style>
