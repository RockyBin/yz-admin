<template>
  <div style="margin-bottom: 10px;position: relative;">
    <div
      v-show="
        checkedError &&
          (!hasChecked ||
            Object.keys(tableError).filter(
              n => /head_price_large/.test(n) && tableError[n]
            ).length)
      "
      style="position: absolute;font-size: 12px;color: #ED4014;margin-top: -18px;"
    >
      {{ hasChecked ? "团长价不能大于拼团价" : "至少选择一个SKU" }}
    </div>
    <common-table
      type="border"
      class="marketing-groupbuying-create-table-stock"
      :columnsData="columnsData"
      :listData="listData"
      :width="tableWidth + 2"
      @selectData="onSelectionChange"
    ></common-table>
  </div>
</template>
<script>
import commonTable from "@/views/shop/components/table/common-table.vue";
const createSkuColumn = function(n) {
  return {
    title: n.name,
    width: 100,
    align: "center",
    render: (h, params) => {
      return h("div", this.getName(params.row, n));
    }
  };
};
export default {
  props: {
    value: {
      type: Object,
      default() {
        return {};
      }
    },
    showInventory: {
      type: Boolean,
      default: false
    },
    showHeadDiscount: {
      type: Boolean,
      default: false
    }
  },
  components: {
    commonTable
  },
  data() {
    return {
      tableError: {},
      checkedError: false,
      batchValue: {},
      listData: [],
      column: [
        {
          title: "销售价",
          align: "center",
          width: 100,
          render: (h, params) => {
            return h(
              "div",
              {},
              params.row.status === -9 ? "--" : "￥" + params.row.price
            );
          }
        },
        this.createPriceColumn("拼团价", "group_price", 2, "请输入拼团价")
      ]
    };
  },
  watch: {
    value: {
      handler(val) {
        this.tableError = {};
        this.batchValue = {};
        this.checkedError = false;
        this.listData = val.sku_list;
      },
      immediate: true
    }
  },
  computed: {
    tableWidth() {
      return (
        640 +
        100 * this.value.sku_names.length -
        ((this.showInventory ? 0 : 1) + (this.showHeadDiscount ? 0 : 1)) * 120
      );
    },
    hasChecked() {
      return !!this.listData.filter(n => n._checked).length;
    },
    // 获取表格需要显示的列
    columnsData() {
      let columns = [
        {
          type: "selection",
          width: 80,
          align: "center"
        }
      ];
      this.value.sku_names.forEach(n => {
        columns.push(createSkuColumn.call(this, n));
      });
      return columns.concat(
        this.column,
        this.showHeadDiscount
          ? this.createPriceColumn("团长价", "head_price", 2, "请输入团长价")
          : [],
        {
          title: "现有总库存",
          align: "center",
          width: 100,
          render: (h, params) => {
            return h("div", params.row.inventory);
          }
        },
        this.showInventory
          ? this.createPriceColumn(
              "活动库存",
              "group_inventory",
              0,
              "请输入库存"
            )
          : []
      );
    },
    // 多规格树状结构
    skuInfo() {
      let skuInfo = {};
      this.value.sku_names.forEach(n => {
        skuInfo[n.id] = {};
      });
      this.value.sku_values.forEach(n => {
        if (skuInfo[n.sku_name_id]) {
          skuInfo[n.sku_name_id][n.id] = n;
        } else {
          skuInfo[n.sku_name_id] = { [n.id]: n };
        }
      });
      return skuInfo;
    }
  },
  methods: {
    createPriceColumn(title, key, precision, placeholder) {
      return {
        renderHeader: h => {
          return h("div", [
            h(
              "div",
              { class: "marketing-groupbuying-create-table-head" },
              title
            ),
            h("InputNumber", {
              props: {
                size: "small",
                precision: precision,
                min: 0,
                max: precision ? 9999999.99 : 9999999,
                placeholder: "批量设置",
                value: this.batchValue[key] || null
              },
              style: {
                width: "100px"
              },
              on: {
                "on-change": val => {
                  this.$set(this.batchValue, key, val);
                  this.listData.forEach(n => {
                    this.$set(n, key, val);
                    this.$set(this.tableError, key + n.sku_id, false);
                    if (key === "head_price") {
                      this.$set(
                        this.tableError,
                        key + "_large" + n.sku_id,
                        false
                      );
                    }
                  });
                },
                "on-blur": () => {
                  this.$set(this.batchValue, key, null);
                }
              }
            })
          ]);
        },
        width: 120,
        align: "center",
        render: (h, params) => {
          return h(
            "div",
            {
              class: {
                "ivu-form-item-error": !!this.tableError[
                  key + params.row.sku_id
                ]
              }
            },
            [
              h("InputNumber", {
                props: {
                  size: "small",
                  precision: precision,
                  min: 0,
                  max: precision ? 9999999.99 : 9999999,
                  placeholder,
                  value: params.row[key]
                },
                style: {
                  width: "100px"
                },
                on: {
                  "on-change": val => {
                    this.listData[params.index][key] = val;
                    this.$set(this.tableError, key + params.row.sku_id, false);
                  }
                }
              })
            ]
          );
        }
      };
    },
    /**
     * 选中发生改变
     */
    onSelectionChange(val) {
      let selectDataId = Object.assign(
        {},
        ...val.map(n => ({ [n.sku_id]: true }))
      );
      let tableError = {};
      this.listData.forEach(n => {
        if (selectDataId[n.sku_id]) {
          this.updateTableError(tableError, n, this.tableError);
          n._checked = true;
        } else {
          n._checked = false;
        }
      });
      this.checkedError =
        !this.hasChecked || !!Object.values(tableError).filter(n => n).length;
      this.tableError = tableError;
    },
    updateTableError(tableError, n, data) {
      tableError["group_price" + n.sku_id] = !!data["group_price" + n.sku_id];
      tableError["head_price" + n.sku_id] = !!data["head_price" + n.sku_id];
      tableError["head_price_large" + n.sku_id] = !!data[
        "head_price_large" + n.sku_id
      ];
      tableError["group_inventory" + n.sku_id] = !!data[
        "group_inventory" + n.sku_id
      ];
    },
    /**
     * 获取列表中需要显示的规格值
     * item为每行的数据，item1为规格名的数据
     */
    getName(item, item1) {
      let skuCodeArray = item.sku_code.split(",").filter(n => n);
      let skuCode = skuCodeArray.find(n => this.skuInfo[item1.id][n]);
      return this.skuInfo[item1.id][skuCode].value;
    },
    checkData() {
      let status = this.hasChecked;
      let tableError = {};
      this.listData.forEach(n => {
        if (n._checked) {
          let check = this.checkItemData(n, tableError);
          status = status && check;
        }
      });
      this.tableError = tableError;
      this.checkedError = !status;
      return status;
    },
    checkItemData(n, tableError) {
      // 判断输入的值是否正确
      let status =
        !!n.group_price &&
        (this.showHeadDiscount
          ? !!n.head_price && n.group_price >= n.head_price
          : true) &&
        (this.showInventory ? !!n.group_inventory : true);
      // 提示拼团价报错
      tableError["group_price" + n.sku_id] = !n.group_price;
      // 提示团长价报错
      tableError["head_price" + n.sku_id] = this.showHeadDiscount
        ? !n.head_price || (!!n.group_price && n.group_price < n.head_price)
        : false;
      // 用于判断提示语是否显示
      tableError["head_price_large" + n.sku_id] =
        !!n.group_price &&
        (this.showHeadDiscount
          ? !!n.head_price && n.group_price < n.head_price
          : false);
      // 提示库存限制报错
      tableError["group_inventory" + n.sku_id] = this.showInventory
        ? !n.group_inventory
        : false;
      return status;
    }
  }
};
</script>
<style lang="less" scoped>
.marketing-groupbuying-create-table-stock {
  /deep/.ivu-table-default .ivu-table-header table thead tr {
    height: 50px;
  }
  /deep/.ivu-table-header {
    input {
      text-align: center;
    }
    table thead tr {
      th:first-child .ivu-table-cell::before {
        content: "是否参与";
        display: block;
      }
      th .ivu-table-cell {
        font-size: 12px;
      }
    }
    .marketing-groupbuying-create-table-head {
      &:before {
        content: "*";
        display: inline-block;
        margin-right: 4px;
        line-height: 1;
        font-family: SimSun;
        font-size: 13px;
        color: #ed4014;
        font-weight: initial;
      }
    }
  }
  /deep/.ivu-table-default table .ivu-table-column-center {
    .ivu-table-cell {
      padding: 0 8px;
    }
  }
  /deep/.ivu-table-body {
    input {
      text-align: center;
    }
    table tbody tr {
      height: 48px;
    }
  }
}
</style>
