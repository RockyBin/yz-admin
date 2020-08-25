<template>
  <!-- 左边带竖线的title栏  启锋 -->
  <div class="vertical-line-titlebar-wrapper">
    <span class="bg-vert-line"></span>
    <div class="title">
      <label v-if="title" v-text="title || ''"></label>
      <slot v-else></slot>
    </div>
      <slot name="areaTitle"></slot>
  </div>
</template>
<script>
export default {
  props: ["title","height"]
};
</script>
<style lang="less" scoped>
@import "../../css/_color-val";
.vertical-line-titlebar-wrapper {
  height: 32px;
  line-height: 32px;
  text-align: left;
  label {
    font-weight: bold;
  }
  .bg-vert-line {
    height: 18px;
    width: 4px;
    display: inline-block;
    border-radius: 20px;
    background-color: @primary-color;
    vertical-align: middle;
    margin-right: 10px;
  }
  .title {
    display: inline-block;
    vertical-align: middle;
  }
}
</style>
