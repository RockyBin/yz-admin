<template>
  <Modal
    class="product-detail-modal-dealer-sale"
    :class="{ 'product-detail-modal-dealer-sale-setting': status }"
    v-model="modalShow"
    :width="status ? 965 : 965 - 158"
    :title="modalTitle"
    :mask-closable="false"
    @on-ok="onCommissionModalComfirmClick"
  >
    <div>
      <div v-if="skuData !== null" class="product-detail-modal-dealer-sale-sku">
        规格：{{ skuData }}
      </div>
      <table-dealer-sale
        ref="commissionTable"
        :hasSetting="status"
        :showError="showError"
        :dealerConfig="dealerConfig"
        :price="priceDiff"
        :sku="sku"
      />
    </div>
  </Modal>
</template>
<script>
import tableDealerSale from "./product-detail-table-dealer-sale";
export default {
  components: {
    tableDealerSale
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    showError: {
      type: Boolean,
      default: false
    },
    dealerConfig: {
      type: Object,
      default() {
        return {};
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
        return {};
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
      selectType: 0,
      customCommission: 0,
      listData: []
    };
  },
  computed: {
    modalTitle() {
      if (this.skuData !== null) {
        if (this.status) {
          return "设置销售奖";
        }
        return "系统销售奖";
      }
      return "批量设置";
    }
  },
  watch: {
    value(val) {
      this.modalShow = val;
      if (val) {
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
        this.$emit("onComfirm");
        this.modalShow = false;
      } else {
        this.modalShow = false;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.product-detail-modal-dealer-sale {
  /deep/.ivu-modal-body {
    max-height: 491px;
    overflow-y: auto;
    padding: 24px;
    .product-detail-modal-dealer-sale-sku {
      margin: 6px 0 28px;
    }
    .product-detail-modal-dealer-sale-commission {
      margin-top: -4px;
      margin-bottom: 25px;
      span {
        color: #f73610;
      }
    }
  }
  &:not(.product-detail-modal-dealer-sale-setting) /deep/.ivu-modal-footer {
    button:first-child {
      display: none;
    }
  }
}
</style>
