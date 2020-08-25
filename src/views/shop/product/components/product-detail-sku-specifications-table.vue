<template>
  <div
    class="product-detail-specifications-table"
    :style="'width:' + width + 'px'"
  >
    <table
      class="table-wrapper"
      cellspacing="0"
      cellpadding="0"
      border="0"
      :style="'min-width: ' + minWidth + 'px;width:' + (width - 1) + 'px'"
    >
      <thead>
        <tr>
          <th
            class="title-th"
            v-for="(item, index) in specificationsShowList"
            :key="index"
          >{{item.name}}</th>
          <th class="title-th" style="border-left:none">
            <span>
              商品编码
              <more-message
                text="商品编号不能重复"
                style="margin-left: -2px;vertical-align: middle;font-weight: initial;"
              ></more-message>
            </span>
          </th>
          <th class="title-th">
            <span>市场价(元)</span>
            <div class="product-detail-specifications-table-border">
              <InputNumber
                :disabled="disabled"
                :min="0"
                :max="9999999.99"
                :precision="2"
                size="small"
                v-model="batchSettingValue1"
                @on-blur="batchSettingValue1 = null"
                @on-change="onAddAllSetting.apply(this,[...arguments,1])"
                placeholder="批量设置"
              />
            </div>
          </th>
          <th class="title-th">
            <span>
              <label class="product-detail-specifications-required"></label>销售价(元)
            </span>
            <div class="product-detail-specifications-table-border">
              <InputNumber
                :disabled="disabled"
                :min="0"
                :max="9999999.99"
                :precision="2"
                size="small"
                v-model="batchSettingValue2"
                @on-blur="batchSettingValue2 = null"
                @on-change="onAddAllSetting.apply(this,[...arguments,2])"
                placeholder="批量设置"
              />
            </div>
          </th>
          <th class="title-th" v-if="supplierInfo.id">
            <span><label></label>供货价(元) </span>
          </th>
          <th class="title-th">
            <span>
              <label class="product-detail-specifications-required"></label>成本价(元)
            </span>
            <div class="product-detail-specifications-table-border">
              <InputNumber
                :disabled="disabled"
                :min="0"
                :max="9999999.99"
                :precision="2"
                size="small"
                v-model="batchSettingValue0"
                @on-blur="batchSettingValue0 = null"
                @on-change="onAddAllSetting.apply(this,[...arguments,0])"
                placeholder="批量设置"
              />
            </div>
          </th>
          <th class="title-th">
            <span>
              <label class="product-detail-specifications-required"></label>库存(件)
            </span>
            <div
              class="product-detail-specifications-table-border"
              v-if="!supplierInfo.id"
            >
              <InputNumber
                :min="0"
                :max="9999999"
                :precision="0"
                size="small"
                v-model="batchSettingValue6"
                @on-blur="batchSettingValue6 = null"
                @on-change="onAddAllSetting.apply(this,[...arguments,6])"
                placeholder="批量设置"
              />
            </div>
          </th>
          <th class="title-th" v-show="productType==0">
            <span>重量(kg)</span>
            <more-message
              text="当该商品选择了<按重量计算的运费模板>时，请填写商品重量！"
              style="margin-left: 2px;vertical-align: middle;height: 16px;line-height: 14px;font-weight: initial;"
            />
            <div class="product-detail-specifications-table-border">
              <InputNumber
                :disabled="disabled"
                :min="0"
                :max="9999999.999"
                :precision="3"
                size="small"
                v-model="batchSettingValue5"
                @on-blur="batchSettingValue5 = null"
                @on-change="onAddAllSetting.apply(this,[...arguments,5])"
                placeholder="批量设置"
              />
            </div>
          </th>
          <th class="title-th" v-show="memberPriceType !== -1">
            <span>会员价</span>
            <div class="product-detail-specifications-table-border">
              <a
                href="javacript:;"
                v-show="this.memberPriceType"
                @click="onBatchSettingMemberClick"
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
            <td
              v-if="index % tableLengthArray[index1] == 0"
              :key="index1"
              style="word-break: break-all;"
              :rowspan="tableLengthArray[index1]"
            >{{item1.values[(index / tableLengthArray[index1]) % item1.values.length].value}}</td>
          </template>
          <td
            style="border-left:none"
            :class="{'product-detail-specifications-table-border': !setArray[item.sku_code + 'serial_number_error'], 'ivu-form-item-error': setArray[item.sku_code + 'serial_number_error']}"
          >
            <Input
              :disabled="disabled"
              size="small"
              v-model="item.serial_number"
              :maxlength="20"
              class="serial-num-input"
              @on-change="onInputChange(item,'serial_number')"
              placeholder="请输入商品编码"
            />
          </td>
          <td class="product-detail-specifications-table-border">
            <InputNumber
              :disabled="disabled"
              :min="0"
              :max="9999999.99"
              :precision="2"
              size="small"
              v-model="item.market_price"
              placeholder="请输入金额"
            />
          </td>
          <td
            :class="{'product-detail-specifications-table-border': !setArray[item.sku_code + 'price_error'], 'ivu-form-item-error': setArray[item.sku_code + 'price_error']}"
          >
            <InputNumber
              :disabled="disabled"
              :min="0"
              :max="9999999.99"
              :precision="2"
              size="small"
              @on-change="onInputChange(item,'price')"
              v-model="item.price"
              placeholder="请输入金额"
            />
          </td>
          <td v-if="supplierInfo.id">
            <InputNumber
              class="product-detail-supplier-disabled"
              disabled
              size="small"
              :value="Number(item.supplier_price)"
            />
          </td>
          <td
            :class="{'product-detail-specifications-table-border': !setArray[item.sku_code + 'supply_price_error'], 'ivu-form-item-error': setArray[item.sku_code + 'supply_price_error']}"
          >
            <InputNumber
              :disabled="disabled"
              :max="9999999.99"
              :precision="2"
              :min="0"
              size="small"
              v-model="item.supply_price"
              @on-change="onInputChange(item,'supply_price')"
              placeholder="请输入金额"
            />
          </td>
          <td
            :class="{'product-detail-specifications-table-border': !setArray[item.sku_code + 'inventory_error'], 'ivu-form-item-error': (productID && skuNumWarning && item.id && item.inventory < skuNumWarning) || setArray[item.sku_code + 'inventory_error']}"
          >
            <InputNumber
              :precision="0"
              :min="0"
              :max="9999999"
              :class="{ 'product-detail-supplier-disabled': supplierInfo.id }"
              :disabled="!!supplierInfo.id"
              size="small"
              @on-change="onInputChange(item,'inventory')"
              v-model="item.inventory"
              placeholder="请输入库存"
            />
          </td>
          <td class="product-detail-specifications-table-border" v-show="productType==0">
            <InputNumber
              :disabled="disabled"
              :min="0"
              :max="9999999.999"
              :precision="3"
              size="small"
              @on-change="onInputChange(item, 'weight')"
              v-model="item.weight"
              placeholder="请输入重量"
            />
          </td>
          <td
            style="text-decoration:underline;cursor:pointer;"
            v-show="memberPriceType !== -1"
            :class="{'product-detail-specifications-table-error' : memberPriceType === 1 && setArray[item.sku_code + 'member_error']}"
            @click="onViewAndSetMemberClick(item)"
          >{{memberPriceType === 0 ? '点击查看' : item.member_level_info && Object.values(item.member_level_info.rule).filter(n => n.discount !== null).length ? '修改设置' : '去设置'}}</td>
        </tr>
      </tbody>
    </table>
    <div
      class="product-detail-specifications-table-fixed"
      :style="'width:' + specificationsShowList.length * columnWidth + 'px'"
    >
      <table
        class="table-wrapper"
        cellspacing="0"
        cellpadding="0"
        border="0"
        :style="'min-width: ' + minWidth + 'px;width:' + (width - 1) + 'px'"
      >
        <thead>
          <tr>
            <th
              class="title-th"
              v-for="(item, index) in specificationsShowList"
              :key="index"
            >{{item.name}}</th>
            <th
              style="border-left:none"
              class="product-detail-fixed-hidden"
            ></th>
            <th class="product-detail-fixed-hidden"></th>
            <th class="product-detail-fixed-hidden"></th>
            <th class="product-detail-fixed-hidden" v-if="supplierInfo.id"></th>
            <th class="product-detail-fixed-hidden"></th>
            <th class="product-detail-fixed-hidden"></th>
            <th
              class="product-detail-fixed-hidden"
              v-show="productType == 0"
            ></th>
            <th
              class="product-detail-fixed-hidden"
              v-show="memberPriceType !== -1"
            ></th>
          </tr>
        </thead>
        <tbody>
          <!-- 规格数据循环 -->
          <tr v-for="(item,index) in value.skuArray" :key="index">
            <template v-for="(item1,index1) in specificationsShowList">
              <td
                v-if="index % tableLengthArray[index1] == 0"
                :key="index1"
                style="word-break: break-all;"
                :rowspan="tableLengthArray[index1]"
              >{{item1.values[(index / tableLengthArray[index1]) % item1.values.length].value}}</td>
            </template>
            <td
              class="product-detail-fixed-hidden"
              style="border-left:none"
            ></td>
            <td class="product-detail-fixed-hidden"></td>
            <td class="product-detail-fixed-hidden"></td>
            <td class="product-detail-fixed-hidden" v-if="supplierInfo.id"></td>
            <td class="product-detail-fixed-hidden"></td>
            <td class="product-detail-fixed-hidden"></td>
            <td
              class="product-detail-fixed-hidden"
              v-show="productType == 0"
            ></td>
            <td
              class="product-detail-fixed-hidden"
              v-show="memberPriceType !== -1"
            ></td>
          </tr>
        </tbody>
      </table>
    </div>
    <member-modal
      v-model="memberStatus"
      :skuData="memberSkuString"
      :memberLevelList="memberLevelList"
      :sellPrice="sellPrice"
      :member_level_info="member_level_info"
      :status="memberTableStatus"
      :memberPriceType="memberPriceType"
      @onComfirm="onMemberModalComfirm"
    ></member-modal>
  </div>
</template>
<script>
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import memberModal from "./product-detail-sku-member-modal";
import { on, off } from "iview/src/utils/dom";
const skuName = [
  "supply_price",
  "market_price",
  "price",
  "member_rule",
  "fenxiao_rule",
  "weight",
  "inventory",
  "serial_number"
];
const needColumn = [
  "supply_price",
  "market_price",
  "price",
  "member_price",
  "dis_price",
  "weight",
  "inventory",
  "serial_number"
];
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
    memberPriceType: {
      type: Number,
      default: 0
    },
    setArray: {
      required: true
    },
    productType: {
      required: true,
      default: 0
    },
    productID: {
      required: true
    },
    skuNumWarning: {
      required: true
    },
    disabled: {
      default: false,
      type: Boolean
    },
    memberLevelList: {
      type: Array,
      default() {
        return [];
      }
    },
    supplierInfo: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  components: { moreMessage, memberModal },
  data() {
    return {
      width: 0,
      memberStatus: false,
      memberSkuString: "", // 用于显示弹窗的sku组合
      selectSkuDataItem: {}, // 用于设置item的属性
      member_level_info: null, // 弹窗的会员价情况
      sellPrice: 0,
      priceDiff: 0,
      memberTableStatus: false,
      specificationsShowList: [],
      skuValueData: {},
      tableLengthArray: [],
      batchSettingValue0: null,
      batchSettingValue1: null,
      batchSettingValue2: null,
      batchSettingValue5: null,
      batchSettingValue6: null
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
          // 保存每个value用于设置自定义会员价时查找数据
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
    minWidth() {
      return 110 * this.columnLength;
    },
    columnLength() {
      return (
        8 +
        this.specificationsShowList.length -
        (this.memberPriceType === -1 ? 1 : 0) -
        (this.supplierInfo.id ? 0 : 1) -
        (this.productType == 0 ? 0 : 1)
      );
    },
    columnWidth() {
      return Math.max(110, this.width / this.columnLength);
    }
  },
  mounted() {
    this.handleResize();
    on(window, "resize", this.handleResize);
  },
  methods: {
    handleResize() {
      this.width =
        document.querySelector(".matter").offsetWidth - 48 - 86; // 减去内边距减去左边标题宽度
    },
    checkSkuData(flag = true) {
      let status = true;
      if (this.memberPriceType === 1) {
        status =
          this.value.skuArray.filter(item => {
            let status1 = false;
            if (this.memberPriceType === 1) {
              if (item.member_level_info) {
                let values = Object.values(item.member_level_info.rule);
                status1 =
                  values.filter(item => {
                    return item.discount === null;
                  }).length > 0;
              } else {
                status1 = true;
              }
            }
            if (flag) {
              if (status1) {
                this.$set(this.setArray, item.sku_code + "member_error", true);
              }
            }
            // 任何一个为true都是不合格
            return status1;
          }).length === 0;
      }
      return status;
    },
    getSkuMemberLevelData() {
      if (!this.memberLevelList || this.memberLevelList.length == 0) {
        return {
          rule: [],
          amountType: 0,
          type: 0
        };
      }
      return {
        rule: Object.assign(
          ...this.memberLevelList.map(item => {
            return {
              [item.id]: {
                discount: null,
                weight: item.weight
              }
            };
          })
        ),
        amountType: 0,
        type: 0
      };
    },
    onBatchSettingMemberClick() {
      if (!this.memberPriceType) {
        return;
      }
      // 规格值组合
      this.memberSkuString = null;
      this.sellPrice = null;
      this.member_level_info = this.getSkuMemberLevelData();
      this.memberStatus = true;
      this.memberTableStatus = true;
    },
    /**
     * 查看和编辑会员折扣
     */
    onViewAndSetMemberClick(item) {
      // 规格值组合
      this.memberSkuString = item.sku_code
        .split(",")
        .map(item => this.skuValueData[item].value)
        .join(",");
      this.sellPrice = typeof item.price === "number" ? item.price : null;
      item.member_level_info = item.member_level_info
        ? item.member_level_info
        : this.getSkuMemberLevelData();
      this.selectSkuDataItem = item;
      this.member_level_info = item.member_level_info;
      this.memberStatus = true;
      // 是否需要设置
      if (this.memberPriceType === 0) {
        this.memberTableStatus = false;
      } else {
        this.memberTableStatus = true;
      }
    },
    onMemberModalComfirm(amountType, listData) {
      if (this.memberSkuString === null) {
        // 批量设置
        this.value.skuArray.forEach(item => {
          delete this.setArray[item.sku_code + "member_error"];
          let data = {
            amountType,
            rule: {},
            type: 0
          }
          listData.forEach(item1 => {
            data.rule[item1.id] = {
              discount: item1.member_discount,
              weight: item1.weight
            };
          });
          this.$set(item, "member_level_info", data);
        });
      } else {
        listData.forEach(item => {
          this.member_level_info.rule[item.id].discount = item.member_discount;
        });
        delete this.setArray[this.selectSkuDataItem.sku_code + "member_error"];
        this.member_level_info.amountType = amountType;
      }
    },
    // 当数据变化时去掉报错提示
    onInputChange(item, key) {
      delete this.setArray[item.sku_code + key + "_error"];
    },
    /**
     * 批量设置
     */
    onAddAllSetting(el, index) {
      this.value.skuArray.forEach(item => {
        delete this.setArray[item.sku_code + needColumn[index] + "_error"];
        this.$set(item, skuName[index], el);
      });
    }
  },
  beforeDestroy() {
    off(window, "resize", this.handleResize);
  }
};
</script>
<style lang="less" scoped>
@borderLeft: 1px solid #e8eaec;
.product-detail-specifications-table {
  overflow-x: auto;
  // box-shadow: 1px 1px 0 0px #e8eaec;
  border-right: @borderLeft;
  border-bottom: @borderLeft;
  // box-sizing: border-box;
  table.table-wrapper {
    text-align: center;
    table-layout: fixed;
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
    }
    tbody {
      font-size: 12px;
    }
    tr {
      th {
        border: @borderLeft;
        width: 110px;
        height: 60px;
        border-right: none;
        line-height: 1.5;
        border-bottom: none;
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
        border-right: none;
        border-bottom: none;
        line-height: initial;
        // padding: 6px 14px;
        &:last-child {
          border-right: none;
          color: #9EA4B1;
        }
      }
    }
    .ivu-input-number {
      width: calc(100% - 16px);
      /deep/.ivu-input-number-input {
        text-align: center;
        font-size: 12px;
      }
    }
    tr td.product-detail-specifications-table-error {
      color: #ed4014;
    }
    .serial-num-input {
      width: calc(100% - 16px);
      line-height: initial;
      vertical-align: middle;
    }
  }
  .product-detail-specifications-table-fixed {
    position: absolute;
    top: 0;
    overflow: hidden;
    background-color: #fff;
    box-shadow: 2px 0 6px -2px rgba(0, 0, 0, 0.2);
    .product-detail-fixed-hidden{
      visibility:hidden;
    }
  }
}
</style>
