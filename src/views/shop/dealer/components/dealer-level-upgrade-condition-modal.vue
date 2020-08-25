<template>
  <Modal
    v-model="modalStatus"
    title="升级条件"
    :loading="loading"
    @on-ok="onLevelUpgradeComfirmClick"
    :width="600"
    class="distribute-level-select-modal"
  >
    <CheckboxGroup v-model="selectIDCopy">
    <table cellspacing="0" cellpadding="0" border="0">
      <thead>
        <tr>
          <th v-for="(item,index) in levelUpgradeConditionColumn" :style="index === 0 ? 'border-right: none;' : ''" :key="index">{{item.title}}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in levelUpgradeConditionData" :key="index">
          <td v-if="item.conditionType" :rowspan="item.rowSpan">{{item.conditionType || ''}}</td>
          <td @click="onColumnClick(item.id)" :style="selectID.includes(item.id) && 'cursor: not-allowed'">
            <Checkbox @click.stop="() => {}" :label="item.id" :disabled="selectID.includes(item.id)" />
            <span style="vertical-align: middle;line-height: 13px;height: 13px;display: inline-block;">{{item.conditionName}}</span>
            <span v-if="item.explain" style="color:#9EA7B4;vertical-align: middle;line-height: 13px;height: 13px;display: inline-block;">（只对【经销商】升级有效）</span>
            <more-message style="position: absolute;top: 8px;right: 14px;height: 24px;cursor: default;" :text="item.tip" @click.native.stop="() => {}"></more-message>
          </td>
        </tr>
      </tbody>
    </table>
    </CheckboxGroup>
  </Modal>
</template>

<script>
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import {
  DealerLevelUpgradeCondition_TeamDealerNum as TeamDealerNum,
  DealerLevelUpgradeCondition_DirectlyDealerNum as DirectlyDealerNum,
  DealerLevelUpgradeCondition_IndirectDealerNum as IndirectDealerNum,
  DealerLevelUpgradeCondition_SelfBuyMoney as SelfBuyMoney,
  DealerLevelUpgradeCondition_TotalRechargeMoney as TotalRechargeMoney,
  DealerLevelUpgradeCondition_OnceRechargeMoney as OnceRechargeMoney,
  DealerLevelUpgradeCondition_SelfBuyProduct as SelfBuyProduct
} from "./dealer-level-upgrade-all-condition.js"
const conditionData = [
  {
    id: TeamDealerNum,
    conditionType: "人数",
    rowSpan: 3,
    tip: "团队内，XX等级的经销商的总人数，不包括自己",
    explain:true,
    conditionName: "团队经销商人数",
  },
  {
    id: DirectlyDealerNum,
    tip: "所有直推的XX等级经销商人数，不包括自己",
    conditionName: "直推经销商人数",
  },
  {
    id: IndirectDealerNum,
    tip: "所有间推的XX等级经销商人数，不包括自己",
    explain:true,
    conditionName: "间推经销商人数",
  },
  {
    id: SelfBuyMoney,
    conditionType: "订单",
    rowSpan: 1,
    tip: "自购的云仓进货订单总金额",
    explain:true,
    conditionName: "自购云仓订单金额",
  },
  {
    id: TotalRechargeMoney,
    conditionType: "充值",
    rowSpan: 2,
    tip:
      "累计充值到余额账户的总金额，包括充值和转现，不包括提现到余额和充值赠送的金额",
    conditionName: "累计充值金额"
  },
  {
    id: OnceRechargeMoney,
    tip:
      "一次性充值到余额账户的金额，包括充值和转现，不包括提现到余额和充值赠送的金额",
    conditionName: "一次性充值金额"
  },
  {
    id: SelfBuyProduct,
    conditionType: "商品",
    rowSpan: 1,
    tip: "自购的云仓进货商品的总数量",
    explain:true,
    conditionName: "自购云仓商品",
  },
]
const defalutSelectID = [];
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    selectID: {
      type: Array,
      default: defalutSelectID
    }
  },
  components: {
    moreMessage
  },
  data() {
    return {
      modalStatus: false,
      loading: true,
      selectIDCopy: defalutSelectID,
      levelUpgradeConditionColumn: [
        {
          title: "模块"
        },
        {
          title: "条件"
        }
      ],
      levelUpgradeConditionData: conditionData
    };
  },
  watch: {
    // 弹窗显示
    value(val) {
      if (val !== this.modalStatus) {
        this.modalStatus = val;
        // 弹窗再次显示还原原来的选择
        if (val) {
          this.selectIDCopy = this.selectID.concat();
        }
      }
    },
    modalStatus(val) {
      if (val !== this.value) {
        this.$emit("input", val);
      }
    },
    selectID(val) {
      this.selectIDCopy = val.concat();
    }
  },
  methods: {
    onColumnClick(id) {
      if (!this.selectID.includes(id)) {
        let index = this.selectIDCopy.findIndex(n => n === id);
        if (index > -1) {
          this.selectIDCopy.splice(index, 1);
        } else {
          this.selectIDCopy.push(id);
        }
      }
    },
    onLevelUpgradeComfirmClick() {
      if (this.selectIDCopy.length) {
        this.$emit("getSelectID", this.selectIDCopy);
        this.modalStatus = false;
        return;
      }
      this.$Message.error("请选择至少一个条件");
      this.loading = false;
      this.$nextTick(() => {
        this.loading = true;
      })
    }
  }
};
</script>

<style lang="less" scoped>
.distribute-level-select-modal {
  /deep/.ivu-modal-footer {
    button span {
      vertical-align: initial;
    }
  }
  table {
    width: 100%;
    border: 1px solid #dcdee2;
    border-right: none;
    border-bottom: none;
    text-align: center;
    font-size: 12px;
    color: #464C5B;
    th {
      font-size: 13px;
      background-color: #f8f8f9;
    }

    td,
    th {
      height: 40px;
      border-right: 1px solid #e8eaec;
      border-bottom: 1px solid #e8eaec;

      &:last-child {
        width: 426px;
        padding: 0 14px;
        cursor: pointer;
        /deep/i {
          font-size: 16px;
        }
      }
    }

    tr td {
      position: relative;
      &:last-child {
        text-align: left;
        color: #657180;
        /deep/.ivu-checkbox-wrapper {
          font-size: 0 !important;
          vertical-align: middle;
          .ivu-checkbox + span {
            display: none;
          }
        }
      }
      &:hover {
        &:last-child {
          background-color: #ebf7ff;
        }

        button {
          display: block;
        }
      }

      button {
        display: none;
        position: absolute;
        right: 13px;
        top: 8px;
        height: 24px;
        padding: 0;
        width: 50px;
        &.distribute-level-upgrade-select {
          display: block;
        }

        /deep/span {
          display: block;
          line-height: 22px;
        }
      }
    }
  }
}
</style>
