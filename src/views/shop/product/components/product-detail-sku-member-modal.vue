<template>
  <Modal
    class="product-detail-sku-member-modal"
    :class="{'product-detail-sku-member-modal-setting': status}"
    v-model="modalShow"
    :width="(status ? 630: 445) - (skuData !== null ? 0 : 134)"
    :loading="modalLoading"
    :title="modalTitle"
    @on-ok="onMemberModalComfirmClick"
  >
    <div>
      <div v-if="skuData !== null" class="product-detail-sku-member-modal-sku">规格：{{skuData}}</div>
      <member-table
        v-model="selectType"
        :tableData="tableData"
        :columnSystemShow="skuData !== null"
        ref="memberTable"
        :price="sellPrice"
        :hasSetting="status"
      ></member-table>
    </div>
  </Modal>
</template>
<script>
import memberTable from "./product-detail-sku-member-table";
export default {
  components: {
    memberTable
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    memberLevelList: {
      type: Array,
      default() {
        return [];
      }
    },
    sellPrice: {
      type: Number,
      default: null
    },
    member_level_info: {
      type: Object,
      default() {
        return null;
      }
    },
    memberPriceType: {
      type: Number,
      default: 0
    },
    skuData: {
      type: String,
      default: ""
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
      tableData: []
    };
  },
  computed: {
    modalTitle() {
      if (this.skuData !== null) {
        if (this.memberPriceType === 1) {
          return "设置会员价";
        }
        return "系统会员价";
      }
      return "批量设置会员价";
    }
  },
  watch: {
    value(val) {
      this.modalShow = val;
      if (val) {
        this.setTableShowData();
        this.$nextTick(() => {
          this.$el.querySelector(".ivu-modal-body").scrollTo(0, 0);
        });
      } else {
        this.$refs["memberTable"].headerValue = null;
      }
    },
    modalShow(val) {
      this.$emit("input", val);
    }
  },
  methods: {
    setTableShowData() {
      this.selectType =
        (this.member_level_info && this.member_level_info.amountType) || 0;
      let member_rule =
        (this.member_level_info &&
          this.member_level_info.rule &&
          this.member_level_info.rule) ||
        {};
      this.tableData = this.memberLevelList.map(item => {
        let showItem = Object.assign({}, item);
        let discount = member_rule[item.id] && member_rule[item.id].discount;
        showItem.member_discount = discount === undefined || discount === null ? null : Number(discount);

        return showItem;
      });
    },
    onMemberModalComfirmClick() {
      if (this.status) {
        let status = this.$refs["memberTable"].checkData();
        if (status) {
          this.$emit("onComfirm", this.selectType, this.tableData);
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
.product-detail-sku-member-modal {
  /deep/.ivu-modal-body {
    max-height: 491px;
    overflow-y: auto;
    padding: 28px 23px;
    .product-detail-sku-member-modal-sku {
      margin-top: -4px;
      margin-bottom: 10px;
    }
  }
  &:not(.product-detail-sku-member-modal-setting) /deep/.ivu-modal-footer {
    button:first-child {
      display: none;
    }
  }
}
</style>
