<template>
  <div class="text-container" :style="getStyle()">
    {{this.module.text}}
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
        'text-align': this.module.textAlign ? this.module.textAlign : "left",
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
  }
</style>