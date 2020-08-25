<template>
  <div style="margin-bottom: 10px;">
    <common-table
      type="border"
      class="product-list-table-stock"
      :columnsData="columnsData"
      :listData="value.skus"
      :width="tableWidth + 2"
    ></common-table>
    <div
      v-show="Object.values(tableError).filter(n => n).length"
      style="position: absolute;font-size: 12px;color: #ED4014;"
    >
      请输入商品库存
    </div>
  </div>
</template>
<script>
import commonTable from "@/views/shop/components/table/common-table.vue";
const createSkuColumn = function(n, obj = {}) {
  return Object.assign(
    {
      title: n.name,
      width: 140,
      align: "center",
      render: (h, params) => {
        return h("div", this.getName(params.row, n));
      }
    },
    obj
  );
};
export default {
  props: {
    value: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  components: {
    commonTable
  },
  data() {
    return {
      tableError: {},
      column: [
        {
          renderHeader: h => {
            return h("div", [
              h("div", { class: "product-list-table-head" }, "库存"),
              h("InputNumber", {
                props: {
                  size: "small",
                  precision: 0,
                  min: 0,
                  max: 9999999,
                  placeholder: "批量设置",
                  value: null
                },
                style: {
                  width: "100px"
                },
                on: {
                  "on-change": val => {
                    this.value.skus.forEach(n => {
                      this.$set(n, "inventory", val);
                      this.$set(this.tableError, n.id, false);
                    });
                  }
                }
              })
            ]);
          },
          width: 150,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              {
                class: {
                  "ivu-form-item-error": !!this.tableError[params.row.id]
                }
              },
              [
                h("InputNumber", {
                  props: {
                    size: "small",
                    precision: 0,
                    min: 0,
                    max: 9999999,
                    value: params.row.inventory
                  },
                  style: {
                    width: "100px"
                  },
                  on: {
                    "on-change": val => {
                      this.value.skus[params.index].inventory = val;
                      this.$set(this.tableError, params.row.id, false);
                    }
                  }
                })
              ]
            );
          }
        }
      ]
    };
  },
  watch: {
    value() {
      this.tableError = {};
    }
  },
  computed: {
    tableWidth() {
      return this.value.skuName.length > 3
        ? 150 + 140 * this.value.skuName.length
        : 576;
    },
    // 获取表格需要显示的列
    columnsData() {
      let obj =
        this.value.skuName.length > 3
          ? {}
          : { width: 576 / (this.value.skuName.length + 1) };
      let columns = [];
      this.value.skuName.forEach(n => {
        columns.push(createSkuColumn.call(this, n, obj));
      });
      return columns.concat(Object.assign({}, this.column[0], obj));
    },
    // 多规格树状结构
    skuInfo() {
      let skuInfo = {};
      this.value.skuName.forEach(n => {
        skuInfo[n.id] = {};
      });
      this.value.skuValue.forEach(n => {
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
      let status = true;
      this.value.skus.forEach(n => {
        status = status && n.inventory !== null;
        this.$set(this.tableError, n.id, n.inventory === null);
      });
      return status;
    }
  }
};
</script>
<style lang="less" scoped>
.product-list-table-stock {
  /deep/.ivu-table-default .ivu-table-header table thead tr {
    height: 50px;
  }
  /deep/.ivu-table-header {
    input {
      text-align: center;
    }
    table thead tr {
      th .ivu-table-cell {
        font-size: 12px;
      }
    }
    .product-list-table-head {
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
