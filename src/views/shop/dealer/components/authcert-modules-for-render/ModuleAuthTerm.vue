<template>
  <div class="text-container" :style="getStyle()">
    授权期限：{{term}}
  </div>
</template>
<script type="text/ecmascript-6">
export default {
  components: {},
  props: ["module","currentEditingModule"],
  data() {
    return {};
  },
  computed: {
	term(){
		return "2019年01月01日-2020年01月01日";
	}
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