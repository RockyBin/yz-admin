<template>
  <div ref="text" v-if="module.module_type == 'ModuleText'"  class="text"></div>
</template>
<script type="text/ecmascript-6">
export default {
  components: {},
  props: ["module"],
  data() {
    return {
      style:{}
    };
  },
  mounted(){
	$(this.$refs.text).html(this.module.text); //为什么要用JQ来添加内容：因为如果模块的数据有JS代码，直接用 v-html 绑定时，JS是不会运行的
  }
};
</script>
<style lang="less" scoped>
.text {
  word-wrap: break-word;
  /deep/img {
    max-width: 100% !important;
  }
}
</style>
