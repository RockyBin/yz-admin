<template>
  <Modal
    class="product-detail-modal-regional"
    :class="{ 'product-detail-modal-regional-setting': status }"
    v-model="modalShow"
    :width="status ? 970 : 466"
    :loading="modalLoading"
    :title="modalTitle"
    :mask-closable="false"
    @on-ok="onModalComfirmClick"
  >
    <div>
      <div v-if="skuData !== null" class="product-detail-modal-regional-sku">
        规格：{{ skuData }}
      </div>
      <regional-table
        :price="priceDiff"
        :sku="sku"
        :config="config"
        ref="commissionTable"
        :resizeStatus="false"
        :hasSetting="status"
      />
    </div>
  </Modal>
</template>
<script>
import regionalTable from "./product-detail-table-regional";
export default {
  components: {
    regionalTable
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    // 售价和成本价的价格差
    priceDiff: {
      type: Number,
      default: 0
    },
    skuData: {
      type: [String, null],
      default: ""
    },
    sku: {
      type: Object,
      default() {
        return {}
      }
    },
    config: {
      type: Object
    },
    status: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modalShow: false,
      modalLoading: true
    };
  },
  computed: {
    modalTitle() {
      if (this.skuData !== null) {
        if (this.status) {
          return "设置区域返佣";
        }
        return "系统区域返佣";
      }
      return "批量设置区域返佣";
    }
  },
  watch: {
    value(val) {
      this.modalShow = val;
      if (val) {
        this.$refs["commissionTable"].tableError = {};
        this.$nextTick(() => {
          this.$el.querySelector(".ivu-modal-body").scrollTo(0, 0);
        });
      }
    },
    modalShow(val) {
      this.$emit("input", val);
    }
  },
  methods: {
    onModalComfirmClick() {
      if (this.status) {
        let status = this.$refs["commissionTable"].checkData();
        if (status) {
          this.$emit("onComfirm");
          this.modalShow = false;
        } else {
          this.$Message.error("保存失败");
        }
      } else {
        this.modalShow = false;
      }

      this.modalLoading = false;
      this.$nextTick(() => {
        this.modalLoading = true;
      });
    }
  }
};
</script>
<style lang="less" scoped>
.product-detail-modal-regional {
  /deep/.ivu-modal-body {
    max-height: 491px;
    overflow-y: auto;
    padding: 28px 24px;
    .product-detail-modal-regional-sku {
      margin-top: -4px;
      margin-bottom: 10px;
    }
  }
  &:not(.product-detail-modal-regional-setting) /deep/.ivu-modal-footer {
    button:first-child {
      display: none;
    }
  }
}
</style>
