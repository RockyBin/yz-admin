<template>
  <div class="text-container" :style="getStyle()">
    昵称
  </div>
</template>
<script type="text/ecmascript-6">
export default {
  components: {},
  props: ["module","currentEditingModule"],
  data() {
    return {};
  },
  methods: {
    getStyle(){
      return {
        color: this.module.color,
        'text-align': this.module.textAlign ? this.module.textAlign : alignText.left,
        'font-weight': this.module.bold ? "bold":"normal",
        'font-size': this.module.fontSize + "px",
      }
    }
  }
};
</script>
<style lang="less" scoped>
  .text-container {
    flex: 1;
    white-space: nowrap;
  }
</style>