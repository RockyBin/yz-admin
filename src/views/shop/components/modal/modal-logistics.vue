<template>
  <Modal :value="logisticsValue" title="查看物流" class="check-logistics" @on-cancel="onCancel">
    <iframe :src="iframeSrc" frameborder="0" width="100%" scrolling="yes" style="height:540px"></iframe>
    <div slot="footer" style="display: none"></div>
  </Modal>
</template>
<script>
export default {
  props: ["logisticsValue", "iframeSrc"],
  methods: {
    onCancel() {
      this.$emit("onCancel");
    }
  }
};
</script>

<style lang="less" scoped>
.check-logistics {
  /deep/.ivu-modal-footer {
    border-top: none;
  }
}
</style>
