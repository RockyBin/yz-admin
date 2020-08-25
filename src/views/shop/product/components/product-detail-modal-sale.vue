<template>
  <Modal
    class="product-detail-modal-sale"
    :class="{'product-detail-modal-sale-setting': status}"
    v-model="modalShow"
    :width="status ? 471 : 321"
    :loading="modalLoading"
    :title="modalTitle"
    :mask-closable="false"
    @on-ok="onCommissionModalComfirmClick"
  >
    <div>
      <div v-if="skuData !== null" class="product-detail-modal-sale-sku">规格：{{skuData}}</div>
      <div v-if="skuData !== null" class="product-detail-modal-sale-commission">
        <span
          style="color:#F73610;margin-left: 16px;"
          v-show="tableSetting.exceedTotalNum"
        >(一二三级佣金比例之和不能大于100%)</span>
      </div>
      <div
        v-else
        class="product-detail-modal-sale-commission"
        v-show="tableSetting.exceedTotalNum"
      >
        <span style="color:#F73610;">一二三级佣金比例之和不能大于100%</span>
      </div>
      <table-sale
        ref="commissionTable"
        :hasSetting="status"
        :agentConfig="agentConfig"
        :price="priceDiff"
        :sku="sku"
      />
    </div>
  </Modal>
</template>
<script>
import tableSale from "./product-detail-table-sale";
export default {
  components: {
    tableSale
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    agentConfig: {
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
      tableSetting: {
        exceedTotalNum: 0
      },
      listData: []
    };
  },
  computed: {
    modalTitle() {
      if (this.skuData !== null) {
        if (this.status) {
          return "设置订单销售奖";
        }
        return "系统订单销售奖";
      }
      return "批量设置订单销售奖";
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
.product-detail-modal-sale {
  /deep/.ivu-modal-body {
    max-height: 491px;
    overflow-y: auto;
    padding: 28px 23px;
    .product-detail-modal-sale-sku {
      margin-top: -4px;
      margin-bottom: 10px;
    }
    .product-detail-modal-sale-commission {
      margin-top: -4px;
      margin-bottom: 25px;
      span {
        color: #f73610;
      }
    }
  }
  &:not(.product-detail-modal-sale-setting) /deep/.ivu-modal-footer {
    button:first-child {
      display: none;
    }
  }
}
</style>
