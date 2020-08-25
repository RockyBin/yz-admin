<template>
  <Modal
    v-model="modalStatus"
    @on-ok="onComfirmClick"
    class="modal-error"
    :class="{
      'modal-error-hide-cancel': hideCancel
    }"
    :width="width"
    :loading="loading"
  >
    <div>
      <div class="title" style="margin:10px 0;">
        <Icon type="ios-help-circle" size="34" color="#ED4014"/>提示
      </div>
      <slot></slot>
    </div>
  </Modal>
</template>
<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: true
    },
    hideCancel: {
      type: Boolean,
      default: true
    },
    width: {
      type: Number,
      default: 480
    }
  },
  watch: {
    modalStatus(val) {
      this.$emit("input", val);
    },
    value(val) {
      this.modalStatus = val;
    }
  },
  data() {
    return {
      modalStatus: false
    };
  },
  methods: {
    onComfirmClick() {
      this.$emit("on-ok");
    }
  }
};
</script>
<style lang="less" scoped>
.modal-error {
  /deep/.ivu-modal-content {
    .ivu-modal-close {
      display: none;
    }
    .ivu-modal-body {
      padding: 24px 24px 0px 70px;
      .title {
        position: relative;
        font-size: 16px;
        font-weight: bold;
        line-height: 1;
        .ivu-icon-ios-help-circle {
          position: absolute;
          top: -8px;
          left: -46px;
        }
      }
    }
    .ivu-modal-footer {
      border-top: none;
    }
  }
  &.modal-error-hide-cancel {
    /deep/.ivu-modal-content {
      .ivu-modal-footer {
        button:first-child {
          display: none;
        }
      }
    }
  }
}
</style>