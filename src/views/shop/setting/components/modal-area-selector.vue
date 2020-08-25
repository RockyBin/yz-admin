<template>
  <Modal
    v-model="isShow"
    title="选择地区"
    :width="678"
    class="modal-wrap"
    @on-ok="onHandleSubmit"
  >
    <areaSelector
      @getAreas="getAreas"
      :editData="editData"
      :addOrEditStates="addOrEditStates"
      :disableCodes="disableCodes"
    />
  </Modal>
</template>
<script type="text/ecmascript-6">
import areaSelector from "COMPONENTS/selector/area-select-transfer";
export default {
  components: { areaSelector },
  props: ["value", "editData", "addOrEditStates", "disableCodes"],
  data() {
    return {
      isShow: false
    };
  },
  watch: {
    value: function(now) {
      this.isShow = now;
    },
    isShow: function(now) {
      if (now === false) {
        // 如果关闭弹窗了就让状态☞空
        this.$emit("reSetAddOrEditStates", "");
        this.$emit("reSetDisableCodes", "");
      }
      this.$emit("input", now);
    }
  },
  methods: {
    getAreas(areas) {
      this.areas = areas;
    },
    onHandleSubmit() {
      if (this.areas){
          if (this.editData.index >= 0) {
              this.$emit("submit", this.areas, this.editData.index);
          } else {
              this.$emit("submit", this.areas);
          }
      }
    }
  }
};
</script>
<style lang="less" scoped>

.modal-wrap {
  /deep/.ivu-modal-body {
    overflow-y: hidden !important;
    padding: 24px;
    height: 440px;
  }
}
</style>
