<template>
  <div class="marketing-groupbuying-create-product">
    <Form :model="info" :label-width="88" :rules="ruleValidate">
      <FormItem label="团长优惠：">
        <i-switch
          :true-value="1"
          :false-value="0"
          :disabled="info.base_info.status === 1"
          v-model="info.base_info.open_head_discount"
        >
          <span slot="open">开</span>
          <span slot="close">关</span>
        </i-switch>
        <div class="marketing-groupbuying-create-product-tip">
          *开启团长(开团人)优惠后，团长将享受更优惠价格，有助于提高开团率和成团率。<br />请注意：模拟成团的团长也能享受团长优惠，请谨慎设置，避免资金损失。
        </div>
      </FormItem>
      <FormItem label="库存限制：">
        <i-switch
          :true-value="1"
          :false-value="0"
          v-model="info.base_info.open_inventory"
        >
          <span slot="open">开</span>
          <span slot="close">关</span>
        </i-switch>
        <div class="marketing-groupbuying-create-product-tip">
          *开启活动库存限制后，该次活动的商品同时受到【现有库存】和【活动库存】的<br />限制；关闭时，只受【现有库存】的限制。
        </div>
      </FormItem>
      <FormItem label="拼单基数：">
        <i-switch
            :true-value="1"
            :false-value="0"
            v-model="info.base_info.open_order_base_num"
        >
          <span slot="open">开</span>
          <span slot="close">关</span>
        </i-switch>
        <div class="marketing-groupbuying-create-product-tip">
          *开启拼单基数后，将在客户端展示的【已拼数量=拼单基数+实际拼单数量】
        </div>
      </FormItem>
      <FormItem label="商品限购：">
        <i-switch
            :true-value="1"
            :false-value="0"
            :disabled="info.base_info.status === 1"
            v-model="info.base_info.open_buy_limit"
        >
          <span slot="open">开</span>
          <span slot="close">关</span>
        </i-switch>
        <div class="marketing-groupbuying-create-product-tip">
          *开启商品限购后，则根据商品的SKU做活动限制，限制会员在该活动可以购买最高数量。
        </div>
      </FormItem>
      <FormItem label="选择商品：" prop="product_list">
        <div>
          <add-more
            text="选择商品"
            @onAddMoreClick="onAddNewProductClick"
          ></add-more>
          <span
            style="margin-left: 12px;margin-right: 2px;vertical-align: top;"
            v-show="info.product_list.length"
            >(共选择了{{ info.product_list.length }}个商品)</span
          ><span
            style="margin-left: 12px;vertical-align: top;color: #ED4014;"
            v-show="
              checkedError &&
                (!info.product_list.length ||
                  Object.keys(tableError).filter(
                    n => /head_price_large/.test(n) && tableError[n]
                  ).length)
            "
            >{{
              info.product_list.length ? "团长价不能大于拼团价" : "请选择商品"
            }}</span
          >
        </div>
        <div
            :style="
            `width: ${1200 -
              ((showInventory ? 0 : 1)+(showOrderBaseNum ? 0 : 1) +(showCommodityRestrictions?0:1)+ (showHeadDiscount ? 0 : 1)) * 128}px;`
          "
          :class="{
            'marketing-groupbuying-create-inventory-hide': !showInventory,
            'marketing-groupbuying-create-headdisc-hide': !showHeadDiscount,
            'marketing-groupbuying-create-orderbase-hide': !showOrderBaseNum,
            'marketing-groupbuying-create-commodityrestrictions-hide':!showCommodityRestrictions
          }"
        >
          <common-table
            :columnsData="productSelectTableColumn"
            :listData="info.product_list"
            type="border"
            ref="table"
          ></common-table>
        </div>
      </FormItem>
    </Form>
    <product-list-modal
      @onGetProductInfo="onGetProductInfo"
      v-model="modalStatus"
      :productIds="productIds"
    ></product-list-modal>
    <stock-modal
      v-model="stockModalStatus"
      :info="modalInfo"
      :showInventory="showInventory"
      :showHeadDiscount="showHeadDiscount"
      :showTableError="showModalTableError"
      @on-ok="onStockModalConfirmClick"
    ></stock-modal>
  </div>
</template>
<script>
import addMore from "@/views/shop/components/button/add-more.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import productListModal from "@/views/shop/store/design/components/product-list";
let columnWidth = [224, 100, 128, 128, 99, 128,128,128, 134];
import stockModal from "./marketing-groupbuying-create-modal-stock";
export default {
  components: {
    addMore,
    commonTable,
    productListModal,
    stockModal
  },
  props: {
    info: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      modalStatus: false,
      stockModalStatus: false,
      modalInfo: null,
      tableError: {},
      batchValue: {},
      checkedError: false,
      showModalTableError: false, // 显示弹窗表格错误提示
      productSelectTableColumn: [
        {
          title: "商品信息",
          width: columnWidth[0],
          render: (h, params) => {
            let status = params.row.product_status === -9;
            let multi = parseInt(params.row.sku_code.replace(",", ""));
            return h("div", {}, [
              h(
                "div",
                {
                  style: {
                    display: "inline-block",
                    marginRight: "14px",
                    verticalAlign: "middle"
                    // border: "1px solid #eeeeee"
                  }
                },
                [
                  h("img", {
                    attrs: {
                      src:
                        params.row.small_images.split(",").length &&
                        this.$store.state.siteComdataPath +
                          params.row.small_images.split(",")[0]
                    },
                    style: {
                      height: "40px",
                      width: "40px",
                      display: "block",
                      objectFit: "contain"
                    }
                  })
                ]
              ),
              h(
                "div",
                {
                  style: {
                    display: "inline-block",
                    verticalAlign: "middle",
                    width: "calc(100% - 55px)",
                    textAlign: "left",
                    lineHeight: "initial",
                    "font-size": "0"
                  }
                },
                [
                  h(
                    "Tooltip",
                    {
                      style: {
                        width: "100%"
                      },
                      props: {
                        content: params.row.name,
                        maxWidth: 300,
                        transfer: true,
                        placement: "top"
                      }
                    },
                    [
                      h(
                        "div",
                        {
                          style: {
                            display: "-webkit-inline-box",
                            "-webkit-line-clamp": 2,
                            "-webkit-box-orient": "vertical",
                            overflow: "hidden",
                            lineHeight: "16px",
                            "font-size": "12px"
                          }
                        },
                        params.row.name
                      )
                    ]
                  ),
                  status || multi || params.row.product_status === 0
                    ? h("div", { style: "margin-top: 4px;" }, [
                        multi
                          ? h(
                              "div",
                              {
                                class: "table-warning",
                                style: "margin-right: 8px"
                              },
                              "多规格"
                            )
                          : "",
                        status
                          ? h("div", { class: "table-error" }, "已删除")
                          : params.row.product_status === 0
                          ? h("div", { class: "table-error" }, "已下架")
                          : ""
                      ])
                    : ""
                ]
              )
            ]);
          }
        },
        {
          title: "销售价",
          align: "center",
          width: columnWidth[1],
          render: (h, params) => {
            return h(
              "div",
              {},
              params.row.product_status === -9 ? "--" : "￥" + params.row.product_price
            );
          }
        },
        this.createColumn(
          "拼团价",
          "设置拼团价",
          "group_price",
          2,
          "请输入拼团价",
          0,
          columnWidth[2]
        ),
        this.createColumn(
          "团长价",
          "设置团长价",
          "head_price",
          2,
          "请输入团长价",
          0,
          columnWidth[3]
        ),
        {
          title: "现有总库存",
          align: "center",
          width: columnWidth[4],
          render: (h, params) => {
            return h("div", params.row.inventory);
          }
        },
        this.createColumn(
          "活动库存",
          "设置库存",
          "group_inventory",
          0,
          "请输入库存",
          0,
          columnWidth[5]
        ),
        this.createColumn(
          "拼单基数",
          "",
          "order_base_num",
          0,
          "请输入",
          0,
          columnWidth[6]
        ),
        this.createColumn(
          "商品限购",
          "",
          "buy_limit_num",
          0,
          "请输入",
          1,
          columnWidth[7]
        ),
        {
          title: "操作",
          align: "center",
          width: columnWidth[8],
          render: (h, params) => {
            return h("div", [
              params.row.product_status === -9
                ? ""
                : h(
                    "a",
                    {
                      class: {
                        "table-operation": true
                      },
                      on: {
                        click: () => {
                          this.$router.push({
                            name: "productDetail",
                            query: {
                              id: params.row.master_product_id
                            }
                          });
                        }
                      }
                    },
                    "查看详情"
                  ),
              params.row.product_status === -9
                ? ""
                : h(
                    "div",
                    {
                      class: {
                        "table-operation": true
                      },
                      style: {
                        display: "inline",
                        margin: "0 14px",
                        cursor: "default"
                      }
                    },
                    "|"
                  ),
              h(
                "a",
                {
                  class: {
                    "table-operation": true
                  },
                  on: {
                    click: () => {
                      this.info.product_list.splice(params.index, 1);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      ruleValidate: {
        product_list: [
          {
            required: true,
            validator: (rule, value, callback) => {
              return callback();
            }
          }
        ]
      }
    };
  },
  computed: {
    productIds() {
      return this.info.product_list.map(item => item.master_product_id);
    },
    showHeadDiscount() {
      return !!this.info.base_info.open_head_discount;
    },
    showInventory() {
      return !!this.info.base_info.open_inventory;
    },
    showOrderBaseNum() {
      return !!this.info.base_info.open_order_base_num;
    },
    showCommodityRestrictions() {
      return !!this.info.base_info.open_buy_limit;
    },
  },
  watch: {
    showHeadDiscount: {
      handler() {
        if (this.$refs["table"]) {
          this.unpdateColumnWidth();
        } else {
          this.$nextTick(() => {
            this.unpdateColumnWidth();
          });
        }
      },
      immediate: true
    },
    showInventory: {
      handler() {
        if (this.$refs["table"]) {
          this.unpdateColumnWidth();
        } else {
          this.$nextTick(() => {
            this.unpdateColumnWidth();
          });
        }
      },
      immediate: true
    },
    showOrderBaseNum:{
      handler() {
        if (this.$refs["table"]) {
          this.unpdateColumnWidth();
        } else {
          this.$nextTick(() => {
            this.unpdateColumnWidth();
          });
        }
      },
      immediate: true
    },
    showCommodityRestrictions:{
      handler() {
        if (this.$refs["table"]) {
          this.unpdateColumnWidth();
        } else {
          this.$nextTick(() => {
            this.unpdateColumnWidth();
          });
        }
      },
      immediate: true
    }
  },
  methods: {
    formatTime(val) {
      let value = val.toString();
      value = value[1] ? value : "0" + value;
      return value;
    },
    /**
     * 更新表格宽度
     */
    unpdateColumnWidth() {
      let columns = columnWidth.filter((n, index) => {
        let status = true;
        if (index === 3 && !this.showHeadDiscount) status = false;
        if (index === 5 && !this.showInventory) status = false;
        if (index === 6 && !this.showOrderBaseNum) status = false;
        if (index === 7 && !this.showCommodityRestrictions) status = false;
        return status;
      });
      columns.forEach((n, index) => {
        this.$set(
          this.$refs["table"].$refs.selection._data.cloneColumns[index],
          "width",
          n
        );
      });
    },
    /**
     * 创建表格选项
     */
    createColumn(title, text, key, precision, placeholder,buyLimitNumType) {
      return {
        renderHeader: h => {
          return h("div", [
            h(
              "div",
              key=="order_base_num"||key=="buy_limit_num"?{class: "marketing-groupbuying-create-table-basenum"}:{ class: "marketing-groupbuying-create-table-head" },
              title
            ),
            h("InputNumber", {
              props: {
                size: "small",
                precision: precision,
                min: key=="buy_limit_num"?1:0,
                max: precision ? 9999999.99 : 9999999,
                disabled:buyLimitNumType&&this.info.base_info.status==1?true:false,
                placeholder: buyLimitNumType&&this.info.base_info.status==1?"--":"批量设置",
                value: this.batchValue[key] || null
              },
              style: {
                width: "100px"
              },
              on: {
                "on-change": val => {
                  this.$set(this.batchValue, key, val);
                  this.info.product_list = this.info.product_list.map(n => {
                    let multi = key=="order_base_num"||key=="buy_limit_num"?false:parseInt(n.sku_code.replace(",", ""));
                    if (!multi) {
                      n[key] = val;
                      this.$set(
                        this.tableError,
                        key + n.master_product_id,
                        false
                      );
                    }
                    return n;
                  });
                },
                "on-blur": () => {
                  this.$set(this.batchValue, key, null);
                }
              }
            })
          ]);
        },
        width: 128,
        align: "center",
        className:
          key === "group_inventory"
            ? "table_group_inventory"
            : key === "head_price"
            ? "table_group_head"
            : key === "order_base_num"
            ?"order-base-number"
            :key === "buy_limit_num"?"table_buy_limit_num":"",
        render: (h, params) => {
          let multi = key=="order_base_num"||key=="buy_limit_num"?false:parseInt(params.row.sku_code.replace(",", ""));
          let status = false;
          return h(
            "div",
            {
              class: {
                "ivu-form-item-error": this.tableError[
                  key + params.row.master_product_id
                ]
              }
            },
            [
              multi
                ? h(
                    "div",
                    {
                      style: {
                        color: !this.tableError[
                          key + params.row.master_product_id
                        ]
                          ? "#9EA4B1"
                          : "#ED4014",
                        textDecoration: "underline",
                        cursor: "pointer"
                      },
                      on: {
                        click: () => {
                          if (status) {
                            return;
                          }
                          status = true;
                          this.getProductInfo(params.row)
                            .then(data => {
                              // 将拼团sku中的数据合并到商品sku列表，_checked标识列表选中
                              let skuList = this.info.product_list[params.index]
                                .sku_list;
                              if (skuList) {
                                let obj = Object.assign(
                                  {},
                                  ...skuList.map(n => ({
                                    [n.id || n.sku_id]: n
                                  }))
                                );
                                // 合并原来的sku_list数据
                                data.sku_list.forEach(n => {
                                  n._checked = false;
                                  Object.assign(
                                    n,
                                    obj[n.id || n.sku_id] || {},
                                    {
                                      sku_name: n.sku_name
                                    }
                                  );
                                  n.group_price = n.group_price
                                    ? Number(n.group_price)
                                    : null;
                                  n.head_price = n.head_price
                                    ? Number(n.head_price)
                                    : null;
                                });
                              } else {
                                data.sku_list.forEach(
                                  n => (n._checked = false)
                                );
                              }
                              // 合并整个商品数据
                              this.modalInfo = Object.assign(
                                {},
                                this.info.product_list[params.index],
                                data
                              );
                              let itemObj = {};
                              !this.checkItemData(this.modalInfo, itemObj);
                              this.showModalTableError = !!Object.keys(
                                itemObj
                              ).filter(n => this.tableError[n]).length;
                              this.stockModalStatus = true;
                            })
                            .catch(() => {})
                            .finally(() => {
                              status = false;
                            });
                        }
                      }
                    },
                    text
                  )
                : h("InputNumber", {
                    props: {
                      size: "small",
                      precision: precision,
                      min: key=="buy_limit_num"?1:0,
                      disabled:buyLimitNumType&&this.info.base_info.status==1?true:false,
                      max: precision ? 9999999.99 : 9999999,
                      placeholder:buyLimitNumType&&this.info.base_info.status==1?"--":placeholder,
                      value: params.row[key]
                    },
                    style: {
                      width: "100px"
                    },
                    on: {
                      "on-change": val => {
                        this.info.product_list[params.index][key] = val;
                      }
                    }
                  })
            ]
          );
        }
      };
    },
    /**
     * 获取多规格单个商品信息
     */
    getProductInfo(item) {
      this.modalInfo = null;
      return new Promise((resolve, reject) => {
        this.$httpPost(
          "/shop/admin/group/buying/product/info",
          {
            product_id: item.master_product_id,
            group_id: (item.sku_list && this.info.base_info.id) || 0
          },
          res => {
            if (res.code === 200) {
              resolve(res.data);
            } else {
              reject();
              this.$Message.error(res.msg);
            }
          }
        );
      });
    },
    /**
     * 添加活动商品
     */
    onAddNewProductClick() {
      this.modalStatus = true;
    },
    // 添加商品到表格
    onGetProductInfo(val) {
      val = val.map(n => {
        n = Object.assign({}, n);
        let multi = parseInt(n.sku_code.replace(",", ""));
        if (!multi) {
          n.group_price = null;
          n.head_price = null;
          n.group_inventory = null;
        }
        n.order_base_num = null;
        n.buy_limit_num = null;
        n.product_price = n.price;
        n.master_product_id = n.id;
        delete n.id;
        return n;
      });
      this.info.product_list.unshift(...val);
    },
    // 保存弹窗设置的多规格数据
    onStockModalConfirmClick() {
      // 保存sku数据
      let sku_list = this.modalInfo.sku_list.filter(n => n._checked);
      this.$set(
        this.info.product_list.find(
          n => n.master_product_id === this.modalInfo.master_product_id
        ),
        "sku_list",
        sku_list
      );
      // 更新当前table报错信息
      let tableError = {};
      this.checkItemData(
        Object.assign(
          { master_product_id: this.modalInfo.master_product_id },
          sku_list[0]
        ),
        tableError
      );
      this.tableError = Object.assign({}, this.tableError, tableError);
      this.stockModalStatus = false;
    },
    checkData() {
      let status = !!this.info.product_list.length;
      let tableError = {};
      this.info.product_list.forEach(n => {
        let multi = parseInt(n.sku_code.replace(",", ""));
        if (multi) {
          if (!n.sku_list) {
            status = false;
            // 统一检测
            this.checkItemData(
              {
                master_product_id: n.master_product_id
              },
              tableError
            );
          } else {
            n.sku_list.forEach(m => {
              let itemObj = {};
              let check = this.checkItemData(
                Object.assign({ master_product_id: n.master_product_id }, m),
                itemObj
              );
              status = status && check;
              // 将多规格的检测结果放到tableError
              Object.keys(itemObj).forEach(n => {
                tableError[n] =
                  (tableError.hasOwnProperty(n) ? tableError[n] : false) ||
                  itemObj[n];
              });
            });
          }
        } else {
          // 判断输入的值是否正确
          let check = this.checkItemData(n, tableError);
          status = status && check;
        }
      });
      this.checkedError = !status;
      this.tableError = tableError;
      return status;
    },
    checkItemData(n, tableError = {}) {
      // 判断输入的值是否正确
      let status =
        !!n.group_price &&
        (this.showHeadDiscount
          ? !!n.head_price && n.group_price >= n.head_price
          : true) &&
        (this.showInventory ? !!n.group_inventory : true);
      // 提示拼团价报错
      tableError["group_price" + n.master_product_id] = !n.group_price;
      // 提示团长价报错
      tableError["head_price" + n.master_product_id] = this.showHeadDiscount
        ? !n.head_price || (!!n.group_price && n.group_price < n.head_price)
        : false;
      // 用于判断提示语是否显示
      tableError["head_price_large" + n.master_product_id] =
        !!n.group_price &&
        (this.showHeadDiscount
          ? !!n.head_price && n.group_price < n.head_price
          : false);
      // 提示库存限制报错
      tableError["group_inventory" + n.master_product_id] = this.showInventory
        ? !n.group_inventory
        : false;
      return status;
    }
  }
};
</script>
<style lang="less" scoped>
.marketing-groupbuying-create-product {
  padding: 24px;
  .marketing-groupbuying-create-product-tip {
    position: absolute;
    top: 5px;
    min-height: 22px;
    left: 60px;
    line-height: 16px;
    font-size: 12px;
    color: #9ea7b4;
    display: flex;
    align-items: center;
  }
  /deep/.ivu-form-item {
    .ivu-table-header table thead tr {
      height: 50px;
    }
    .ivu-table-tip td{
      width: 100% !important;
    }
    .marketing-groupbuying-create-inventory-hide {
      .table_group_inventory {
        display: none;
      }
    }
    .marketing-groupbuying-create-orderbase-hide{
      .order-base-number{
        display: none;
      }
    }
    .marketing-groupbuying-create-commodityrestrictions-hide{
      .table_buy_limit_num{
        display: none;
      }
    }
    .marketing-groupbuying-create-headdisc-hide {
      .table_group_head {
        display: none;
      }
    }
    table {
      .marketing-groupbuying-create-table-basenum{
        line-height: 17px;
      }
      .marketing-groupbuying-create-table-head {
        line-height: 17px;
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
      .ivu-input-number {
        display: block;
        height: 22px;
        margin: auto;
        input {
          text-align: center;
        }
      }
    }
  }
}
</style>
