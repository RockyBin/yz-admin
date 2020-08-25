<template>
  <div class="product-detail-table-multi-distribution" :style="'width:' + tableWidth + 'px'">
    <table
      class="table-wrapper"
      cellspacing="0"
      cellpadding="0"
      border="0"
      :style="'width: ' + tableWidth + 'px'"
    >
      <thead>
        <tr>
          <th
            class="title-th"
            v-for="(item, index) in specificationsShowList"
            :key="index"
          >{{item.name}}</th>
          <th class="title-th">商品编码</th>
          <th class="title-th">销售价(元)</th>
          <th class="title-th">成本价(元)</th>
          <th class="title-th" v-show="commissionType !== -1">
            <span><label class="product-detail-specifications-required"></label>分销佣金</span>
            <div>
              <a
                href="javacript:;"
                v-show="this.commissionType && value.skuArray.length"
                @click="onBatchSettingCommisionClick"
                style="font-weight: initial;color: #9EA4B1;font-size: 12px;"
              >批量设置</a>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- 规格数据循环 -->
        <tr v-for="(item,index) in value.skuArray" :key="index">
          <template v-for="(item1,index1) in specificationsShowList">
            <!-- index / tableLengthArray[index1] 为当前合并项是第几个合并项（竖着数第几个），value.skuArray.length / tableLengthArray[index1]为总个数（也是竖着数总共有几个），最后得出最后一个是哪个（即索引=总个数-1） -->
            <td
              v-if="index % tableLengthArray[index1] == 0"
              :key="index1"
              style="word-break: break-all;"
              :style="index / tableLengthArray[index1] === value.skuArray.length / tableLengthArray[index1] - 1 ? 'border-bottom: none;' : ''"
              :rowspan="tableLengthArray[index1]"
            >{{item1.values[(index / tableLengthArray[index1]) % item1.values.length].value}}</td>
          </template>
          <td>{{item.serial_number || "--"}}</td>
          <td>{{item.price || "--"}}</td>
          <td>{{item.supply_price || "--"}}</td>
          <td
            style="text-decoration:underline;cursor:pointer;"
            :class="{'product-detail-table-multi-distribution-error' : commissionType === 1  && setArray[item.sku_code + 'commission_error']}"
            v-show="commissionType !== -1"
            @click="onViewAndSetCommissionClick(item)"
          >{{commissionType === 0 ? '点击查看' : item.commission_info && Object.values(item.commission_info.rule).filter(n => Object.values(n.commission_rate).filter(n => n !== null).length).length ? '修改设置' : '去设置'}}</td>
        </tr>
        <tr v-if="!value.skuArray.length">
          <td :colspan="specificationsShowList.length + 5">暂无数据</td>
        </tr>
      </tbody>
    </table>
    <commission-modal
      ref="commissionModal"
      v-model="commissionStatus"
      :skuData="memberSkuString"
      :systemCommission="systemCommission"
      :distributionLevelList="value.distributionLevelList"
      :priceDiff="priceDiff"
      :distributorLevel="value.distributionLevel"
      :commission_info="commission_info"
      :status="commissionTableStatus"
      @onComfirm="onCommissionModalComfirm"
    ></commission-modal>
  </div>
</template>
<script>
import commissionModal from "./product-detail-sku-commission-modal";
export default {
  props: {
    value: {
      type: Object,
      default() {
        return {};
      }
    },
    systemCommission: {
      type: Number,
      default: 0
    },
    commissionType: {
      type: Number,
      default: 0
    },
    setArray: {
      required: true
    }
  },
  components: { commissionModal },
  data() {
    return {
      width: 0,
      commissionStatus: false,
      memberSkuString: "", // 用于显示弹窗的sku组合
      commission_info: null, // 弹窗的分佣情况
      selectSkuDataItem: {}, // 用于设置item的属性
      member_level_info: null, // 弹窗的会员价情况
      sellPrice: 0,
      priceDiff: 0,
      commissionTableStatus: false,
      specificationsShowList: [],
      skuValueData: {},
      tableLengthArray: [],
      serialNumber: ""
    };
  },
  watch: {
    /**
     * 获取用于显示的规格列表
     */
    value: {
      handler(val) {
        let tableLength = 1;
        let tableLengthArray = [];
        let showList = [];

        // 获取需要显示的规格列表
        showList = val.specificationsData.filter(el => {
          if (el.values.length) {
            tableLength *= el.values.length;
          }
          return el.values.length > 0;
        });

        // 获取规格名称占用的table高度
        showList.forEach(el => {
          let length =
            (tableLengthArray.length
              ? tableLengthArray[tableLengthArray.length - 1]
              : tableLength) / el.values.length;
          tableLengthArray.push(length);
          // 保存每个value用于查找数据
          el.values.forEach(item => {
            this.skuValueData[item.id] = item;
          });
        });

        this.tableLengthArray = tableLengthArray;
        this.specificationsShowList = showList;
      },
      deep: true
    }
  },
  computed: {
    tableWidth() {
      return 480 + 120 * this.specificationsShowList.length;
    }
  },
  methods: {
    checkData(flag = true) {
      let status = true;
      if (this.commissionType === 1) {
        status =
          this.value.skuArray.filter(item => {
            let status1 = false;
            if (this.commissionType === 1) {
              if (item.commission_info) {
                let values = Object.values(item.commission_info.rule);
                status1 =
                  values.filter(item => {
                    return (
                      Object.keys(item.commission_rate).length !== 3 ||
                      Object.values(item.commission_rate).includes(null)
                    );
                  }).length > 0;
              } else {
                status1 = true;
              }
              
            }
            if (flag) {
              if (status1) {
                this.$set(
                  this.setArray,
                  item.sku_code + "commission_error",
                  true
                );
              }
            }
            // 为true则是不合格
            return status1;
          }).length === 0;
      }
      return status;
    },
    getSkuDistributorLevelData() {
      return {
        rule: Object.assign(
          {},
          ...this.value.distributionLevelList.map(item => {
            return {
              [item.id]: {
                commission_rate: {},
                weight: item.weight
              }
            };
          })
        ),
        amountType: 0,
        type: 0
      };
    },
    /**
     * 批量修改
     */
    onBatchSettingCommisionClick() {
      if (!this.commissionType) {
        return;
      }
      // 规格值组合
      this.memberSkuString = null;
      this.priceDiff = null;
      this.commission_info = this.getSkuDistributorLevelData();
      this.commissionStatus = true;
      this.commissionTableStatus = true;
    },
    /**
     * 修改或查看单个
     */
    onViewAndSetCommissionClick(item) {
      // 规格值组合
      this.memberSkuString = item.sku_code
        .split(",")
        .map(item => this.skuValueData[item].value)
        .join(",");
      this.priceDiff =
        typeof item.price === "number" && typeof item.supply_price === "number"
          ? item.price - item.supply_price > 0
            ? item.price - item.supply_price
            : 0
          : null;
      item.commission_info = item.commission_info
        ? item.commission_info
        : this.getSkuDistributorLevelData();
      this.commission_info = item.commission_info;
      this.selectSkuDataItem = item;
      this.commissionStatus = true;
      // 是否需要设置
      if (this.commissionType === 0) {
        this.commissionTableStatus = false;
      } else {
        this.commissionTableStatus = true;
      }
    },
    /**
     * 保存
     */
    onCommissionModalComfirm(amountType, listData) {
      if (this.memberSkuString === null) {
        // 批量设置
        this.value.skuArray.forEach(item => {
          delete this.setArray[item.sku_code + "commission_error"];
          item.commission_info = {
            amountType,
            rule: {},
            type: 0
          }
          listData.forEach(item1 => {
            item.commission_info.rule[item1.id] = {
              commission_rate: Object.assign(
                {},
                item1.commission_custom
              ),
              weight: item1.weight
            }
          });
          this.$set(
            item,
            "maxCustomCommission",
            this.$refs["commissionModal"].$refs[
              "commissionTable"
            ].getMaxDiscount()
          );
        });
      } else {
        this.commission_info.rule = {};
        listData.forEach(item => {
          this.commission_info.rule[item.id] = {
              commission_rate: Object.assign(
                {},
                item.commission_custom
              ),
              weight: item.weight
            }
          });
        this.commission_info.amountType = amountType;
        delete this.setArray[
          this.selectSkuDataItem.sku_code + "commission_error"
        ];
        this.$set(
          this.selectSkuDataItem,
          "maxCustomCommission",
          this.$refs["commissionModal"].$refs["commissionTable"].getMaxDiscount()
        );
      }
    }
  }
};
</script>
<style lang="less" scoped>
@borderLeft: 1px solid #e8eaec;
.product-detail-table-multi-distribution {
  overflow-x: auto;
  box-shadow: 0 0 0 1px #e8eaec;
  th,
  td:not(.ivu-form-item-error) {
    /deep/.ivu-input,
    /deep/.ivu-input-number {
      border-color: #dcdee2;
    }
    /deep/.ivu-input:focus,
    /deep/.ivu-input-number:hover,
    /deep/.ivu-input-number.ivu-input-number-focused {
      border-color: #6e88f7;
      box-shadow: 0 0 0 2px rgba(74, 106, 245, 0.2);
    }
  }
  table.table-wrapper {
    text-align: center;
    .product-detail-specifications-required:before {
      content: "*";
      display: inline-block;
      margin-right: 4px;
      line-height: 1;
      font-family: SimSun;
      font-size: 13px;
      color: #ed4014;
      font-weight: initial;
    }
    thead {
      font-size: 13px;
      tr {
        height: 50px;
      }
    }
    tbody {
      font-size: 12px;
    }
    tr {
      height: 48px;
      text-align: center;
      th {
        border: @borderLeft;
        width: 120px;
        border-left: none;
        line-height: 1.5;
        border-top: none;
        div {
          text-decoration: underline;
          cursor: pointer;
        }
        &:last-child {
          border-right: none;
        }
      }
      td {
        border: @borderLeft;
        height: 40px;
        border-left: none;
        border-top: none;
        line-height: initial;
        padding: 6px 8px;
        &:last-child {
          border-right: none;
          color: #9EA4B1;
        }
      }
      &:last-child td {
        border-bottom: none;
      }
      .title-th {
        width: 120px;
        // &:last-child {
        //   width: 80px;
        // }
      }
    }
    .ivu-input-number {
      width: 84px;
      /deep/.ivu-input-number-handler-wrap {
        display: none;
      }
      /deep/.ivu-input-number-input {
        text-align: center;
        font-size: 12px;
      }
    }
    tr td.product-detail-table-multi-distribution-error {
      color: #ed4014;
    }
    .serial-num-input {
      width: 122px;
      line-height: initial;
      vertical-align: middle;
    }
  }
}
</style>
