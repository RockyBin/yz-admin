<template>
  <div class="design-message-box">
    <triangle
      :style="{left:arrowLeft}"
      :width="16"
      :height="8"
      :border-width="1"
    />
    <div class="design-message-box-content">
      <slot></slot>
    </div>
  </div>
</template>
<script>
import triangle from "./../../../triangle"
export default {
  props: {
    arrowLeft: {
      type: String,
      default: "20px"
    }
  },
  components: {
    triangle
  },
  data() {
    return {}
  }
}
</script>
<style lang="less" scoped>
.design-message-box {
  margin-top: 10px;
  .design-message-box-content {
    margin-top: -1px;
    padding: 10px;
    background-color: #f9fbfd;
    border: solid 1px #e5e5e5;
  }
}
</style>