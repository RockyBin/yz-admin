<template>
  <div class="property-container">
    <div class="title-bar">
      <div class="hline"></div>
      <div class="text">头像模块</div>
    </div>
    <div class="form">
      <div class="info">
        <div><i class="iconfont icon-ios-information-circ1"></i>可以通过鼠标拖动改变组件大小和位置</div>
		    <div class="tips">头像是拉取会员的头像</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {};
</script>
<style lang="less" scoped>
.info {
	.tips {
    color: #9EA4B1;
    font-size: 13px;
    margin-top: 10px;
    &:before {
      content: '*';
      display: inline-block;
      margin-right: 4px;
      line-height: 1;
      // font-family: SimSun;
      font-size: 13px;
      // color: #ed4014;
    }
  }
}
</style>