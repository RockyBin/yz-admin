<template>
  <Modal
    class="product-detail-modal-cloudstock"
    :class="{'product-detail-modal-cloudstock-setting': status}"
    v-model="modalShow"
    :width="status ? 608 : 458"
    :loading="modalLoading"
    :title="modalTitle"
    :mask-closable="false"
    @on-ok="onCommissionModalComfirmClick"
  >
    <div>
      <div v-if="skuData !== null" class="product-detail-modal-cloudstock-sku">规格：{{skuData}}</div>
      <table-cloudstock
        ref="commissionTable"
        :hasSetting="status"
        :dealerConfig="dealerConfig"
        :price="priceDiff"
        :sku="sku"
      />
    </div>
  </Modal>
</template>
<script>
import tableCloudstock from "./product-detail-table-cloudstock";
export default {
  components: {
    tableCloudstock
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    dealerConfig: {
      type: Object,
      default() {
        return {}
      }
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
    systemCommission: {
      type: Number,
      default: 0
    },
    distributorLevel: {
      type: Number,
      default: 0
    },
    commission_info: {
      type: Object,
      default() {
        return null;
      }
    },
    status: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modalShow: false,
      modalLoading: true,
      selectType: 0,
      customCommission: 0,
      listData: []
    };
  },
  computed: {
    modalTitle() {
      if (this.skuData !== null) {
        if (this.status) {
          return "设置云仓价格";
        }
        return "系统云仓价格";
      }
      return "批量设置";
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
      } else {
        this.$refs["commissionTable"].headerValue = null;
      }
    },
    modalShow(val) {
      this.$emit("input", val);
    }
  },
  methods: {
    onCommissionModalComfirmClick() {
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
.product-detail-modal-cloudstock {
  /deep/.ivu-modal-body {
    max-height: 491px;
    overflow-y: auto;
    padding: 24px;
    .product-detail-modal-cloudstock-sku {
      margin: 6px 0 28px;
    }
    .product-detail-modal-cloudstock-commission {
      margin-top: -4px;
      margin-bottom: 25px;
      span {
        color: #f73610;
      }
    }
  }
  &:not(.product-detail-modal-cloudstock-setting) /deep/.ivu-modal-footer {
    button:first-child {
      display: none;
    }
  }
}
</style>
