<template>
  <div class="product-detail-table-multi-cloudstock" :style="'width:' + tableWidth + 'px'">
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
          <th class="title-th" v-show="commissionType !== -1">
            <span>
              <label class="product-detail-specifications-required"></label>云仓价格
            </span>
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
          <td
            style="text-decoration:underline;cursor:pointer;"
            :class="{'product-detail-table-multi-cloudstock-error' : commissionType === 1  && setArray['multi_cloudstock_error_' + item.sku_code]}"
            v-show="commissionType !== -1"
            @click="onViewAndSetCommissionClick(item)"
          >{{commissionType === 0 ? '点击查看' : item.cloud_stock_rule_info && Object.values(item.cloud_stock_rule_info.rule.commission).length && !Object.values(item.cloud_stock_rule_info.rule.commission).filter(n => n === null).length ? '修改设置' : '去设置'}}</td>
        </tr>
        <tr v-if="!value.skuArray.length">
          <td :colspan="specificationsShowList.length + 5">暂无数据</td>
        </tr>
      </tbody>
    </table>
    <modal-cloudstock
      v-model="commissionStatus"
      :skuData="memberSkuString"
      :sku="selectSku"
      :priceDiff="priceDiff"
      :dealerConfig="dealerConfig"
      :systemCommission="systemCommission"
      :status="commissionTableStatus"
      @onComfirm="onCommissionModalComfirm"
    ></modal-cloudstock>
  </div>
</template>
<script>
import modalCloudstock from "./product-detail-modal-cloudstock";
export default {
  props: {
    value: {
      type: Object,
      default() {
        return {};
      }
    },
    dealerConfig: {
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
  components: { modalCloudstock },
  data() {
    return {
      width: 0,
      commissionStatus: false,
      selectSku: {},
      memberSkuString: "", // 用于显示弹窗的sku组合
      commission_info: null, // 弹窗的分佣情况
      selectSkuDataItem: {}, // 用于设置item的属性
      member_level_info: null, // 弹窗的会员价情况
      commissionTableStatus: false,
      specificationsShowList: [],
      skuValueData: {},
      priceDiff: null,
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
      return 360 + 120 * this.specificationsShowList.length;
    }
  },
  methods: {
    checkData(flag = true) {
      let status = true;
      if (this.commissionType === 1) {
        status =
          this.value.skuArray.filter(item => {
            let status1 = false; // 标识分红是否有空
            if (item.cloud_stock_rule_info) {
              let values = Object.values(
                item.cloud_stock_rule_info.rule.commission
              );
              status1 =
                !Object.keys(values).length ||
                Object.values(values).includes(null);
            } else {
              status1 = true;
            }

            if (flag) {
              if (status1) {
                this.$set(
                  this.setArray,
                  "multi_cloudstock_error_" + item.sku_code,
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
    /**
     * 批量修改
     */
    onBatchSettingCommisionClick() {
      if (!this.commissionType) {
        return;
      }
      // 规格值组合
      this.priceDiff = null;
      this.memberSkuString = null;
      this.selectSku = {
        cloud_stock_rule_info: null
      };
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
        .join("; ");

      this.selectSku = {
        cloud_stock_rule_info: item.cloud_stock_rule_info
          ? JSON.parse(JSON.stringify(item.cloud_stock_rule_info))
          : null
      };

      this.priceDiff = typeof item.price === "number" ? item.price : null;

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
    onCommissionModalComfirm() {
      if (this.memberSkuString === null) {
        // 批量设置
        this.value.skuArray.forEach(item => {
          delete this.setArray["multi_cloudstock_error_" + item.sku_code];
          this.$set(
            item,
            "cloud_stock_rule_info",
            JSON.parse(JSON.stringify(this.selectSku.cloud_stock_rule_info))
          );
        });
      } else {
        this.$set(
          this.selectSkuDataItem,
          "cloud_stock_rule_info",
          this.selectSku.cloud_stock_rule_info
        );
        delete this.setArray[
          "multi_cloudstock_error_" + this.selectSkuDataItem.sku_code
        ];
      }
    }
  }
};
</script>
<style lang="less" scoped>
@borderLeft: 1px solid #e8eaec;
.product-detail-table-multi-cloudstock {
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
          color: #9ea4b1;
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
    tr td.product-detail-table-multi-cloudstock-error {
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
