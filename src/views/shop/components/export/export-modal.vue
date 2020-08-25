<template>
  <Modal
    v-model="modalStatus"
    title="导出"
    @on-ok="onExportTableComfirm"
    @on-cancel="onExportTableCancel"
    :width="430"
  >
    <RadioGroup v-model="exportTableStatus" vertical>
      <Radio :label="0" style="height: 32px;line-height: 32px;">导出当前页面所有内容</Radio>
      <Radio :label="1" style="height: 32px;line-height: 32px;">导出全部页面所有内容</Radio>
    </RadioGroup>
  </Modal>
</template>

<script>
export default {
  props: ["tableListExportStatus"],
  data() {
    return {
      exportTableStatus: 0,
      modalStatus: false
    };
  },
  watch: {
    tableListExportStatus(val) {
      this.modalStatus = val;
    }
  },
  methods: {
    onExportTableComfirm() {
      this.$emit("exportList", this.exportTableStatus);
    },
    onExportTableCancel() {
      this.$emit("cancelExportList", false);
    }
  }
};
</script>

<style>
</style>
