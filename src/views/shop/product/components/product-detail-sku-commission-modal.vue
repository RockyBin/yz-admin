<template>
  <Modal
    class="product-detail-sku-commission-modal"
    :class="{'product-detail-sku-commission-modal-setting': status}"
    v-model="modalShow"
    :width="(status ? 970 : 466) - (skuData !== null ? 0 : 186)"
    :loading="modalLoading"
    :title="modalTitle"
    :mask-closable="false"
    @on-ok="onCommissionModalComfirmClick"
  >
    <div>
      <div v-if="skuData !== null" class="product-detail-sku-commission-modal-sku">规格：{{skuData}}</div>
      <div v-if="skuData !== null" class="product-detail-sku-commission-modal-commission">
        最多可分佣
        <span>{{Math.floor(maxTotalCommission * 100) / 100}}</span> 元
        <span
          style="color:#F73610;margin-left: 16px;"
          v-show="tableSetting.exceedTotalNum"
        >(一二三级佣金比例之和不能大于100%)</span>
      </div>
      <div
        v-else
        class="product-detail-sku-commission-modal-commission"
        v-show="tableSetting.exceedTotalNum"
      >
        <span style="color:#F73610;">一二三级佣金比例之和不能大于100%</span>
      </div>
      <commission-table
        :price="priceDiff"
        ref="commissionTable"
        v-model="selectType"
        :setting="tableSetting"
        :columnSystemShow="skuData !== null"
        :listData="listData"
        :tableFixed="''"
        :distributorLevel="distributorLevel"
        :resizeStatus="false"
        :hasSetting="status"
        @onMaxCommissionChange="onMaxCommissionChange"
      />
    </div>
  </Modal>
</template>
<script>
import commissionTable from "./product-detail-sku-commission-table";
export default {
  components: {
    commissionTable
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    distributionLevelList: {
      type: Array,
      default() {
        return [];
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
          return "设置分销佣金";
        }
        return "系统分销佣金";
      }
      return "批量设置分销佣金";
    },
    maxTotalCommission() {
      if (this.status) {
        if (this.selectType === 0) {
          return (this.priceDiff * 100 * this.customCommission) / 10000;
        } else {
          return this.customCommission;
        }
      } else {
        return (this.systemCommission * this.priceDiff * 10000) / 1000000;
      }
    }
  },
  watch: {
    value(val) {
      this.modalShow = val;
      if (val) {
        this.setTableShowData();
        this.$refs["commissionTable"].tableError = {};
        this.$nextTick(() => {
          this.$el.querySelector(".ivu-modal-body").scrollTo(0, 0);
        });
      } else {
        this.$refs["commissionTable"].headerValue1 = null;
        this.$refs["commissionTable"].headerValue2 = null;
        this.$refs["commissionTable"].headerValue3 = null;
      }
    },
    modalShow(val) {
      this.$emit("input", val);
    }
  },
  methods: {
    onMaxCommissionChange(val) {
      this.customCommission = val;
    },
    setTableShowData() {
      this.selectType =
        (this.commission_info && this.commission_info.amountType) || 0;
      let commission_rule =
        (this.commission_info &&
          this.commission_info.rule &&
          this.commission_info.rule) ||
        {};
      this.listData = this.distributionLevelList.map(item => {
        let showItem = Object.assign({}, item);
        let commission_custom =
          (commission_rule[item.id] &&
            commission_rule[item.id].commission_rate) ||
          {};
        showItem.commission_custom = commission_custom
          ? Object.assign({}, commission_custom)
          : commission_custom;

        return showItem;
      });
    },
    onCommissionModalComfirmClick() {
      if (this.status) {
        let status = this.$refs["commissionTable"].checkData();
        if (status) {
          this.$emit("onComfirm", this.selectType, this.listData);
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
.product-detail-sku-commission-modal {
  /deep/.ivu-modal-body {
    max-height: 491px;
    overflow-y: auto;
    padding: 28px 24px;
    .product-detail-sku-commission-modal-sku {
      margin-top: -4px;
      margin-bottom: 10px;
    }
    .product-detail-sku-commission-modal-commission {
      margin-top: -4px;
      margin-bottom: 25px;
      span {
        color: #f73610;
      }
    }
  }
  &:not(.product-detail-sku-commission-modal-setting) /deep/.ivu-modal-footer {
    button:first-child {
      display: none;
    }
  }
}
</style>
