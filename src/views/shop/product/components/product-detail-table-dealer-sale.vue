<template>
  <div class="product-detail-table-dealer-sale">
    <common-table
      type="border"
      :columnsData="columnsData"
      :listData="tableData"
      :width="(hasSetting ? width : width - 158) + 2"
    ></common-table>
  </div>
</template>
<script>
import commonTable from "@/views/shop/components/table/common-table.vue";
const dropType = ["disc", "price"];
const textArray = ["自定义返佣比例(%)", "自定义返佣金额(元)"];
export default {
  components: {
    commonTable
  },
  props: {
    hasSetting: {
      type: Boolean,
      default: false
    },
    price: {
      type: Number,
      default: 0
    },
    dealerConfig: {
      type: Object,
      default() {
        return {};
      }
    },
    showError: {
      type: Boolean,
      default: false
    },
    sku: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      width: 920,
      dropName: dropType[0],
      dropType,
      headerValue: null,
      cloudstockCommission: null, // 记录切换前的数据
      columnsData: [
        {
          title: "推荐人等级",
          width: 172,
          align: "center",
          render: (h, params) => {
            return h("div", params.row.name);
          }
        },
        {
          title: "被推荐人等级",
          width: 172,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              this.tableData
                .filter(n => n.weight >= params.row.weight)
                .map(n => h("p", n.name))
            );
          }
        },
        {
          title: "销售奖类别",
          width: 118,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              this.tableData
                .filter(n => n.weight >= params.row.weight)
                .map(n =>
                  h("p", n.weight > params.row.weight ? "越级奖" : "平级奖")
                )
            );
          }
        },
        {
          renderHeader: h => {
            return h(
              "div",
              {
                style: {
                  "line-height": "initial"
                }
              },
              [h("div", "系统设置"), h("div", "推荐人获取返佣比例")]
            );
          },
          width: 150,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              this.tableData
                .filter(n => n.weight >= params.row.weight)
                .map(item => {
                  let disc = this.dealerConfig.dealer_sale_reward_config
                    .reward_rule[params.row.id + "-" + item.id];
                  disc = disc && disc.commission;
                  return h("p", (Number(disc) ? disc : 0) + "%");
                })
            );
          }
        },
        {
          renderHeader: h => {
            return h(
              "div",
              {
                style: {
                  "line-height": "initial"
                }
              },
              [h("div", "系统设置"), h("div", "推荐人获取返佣金额")]
            );
          },
          width: 150,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              this.tableData
                .filter(n => n.weight >= params.row.weight)
                .map(item => {
                  let cloudDisc = item.discount;
                  let disc = this.dealerConfig.dealer_sale_reward_config
                    .reward_rule[params.row.id + "-" + item.id];
                  disc = disc && disc.commission;
                  return h(
                    "p",
                    this.price !== null
                      ? "￥" +
                          (
                            Math.floor(
                              ((Number(disc) ? disc : 0) *
                                (Number(cloudDisc) ? cloudDisc : 0) *
                                this.price) /
                                100
                            ) / 100
                          ).toFixed(2)
                      : "--"
                  );
                })
            );
          }
        }
      ],
      customColumn: {
        align: "center",
        width: 158,
        renderHeader: h => {
          return h("div", [
            h(
              "Dropdown",
              {
                props: {
                  transfer: true,
                  trigger: "click"
                },
                on: {
                  "on-click": name => {
                    if (this.dropName !== name) {
                      let cloudstockCommission_copy = this.sku
                        .dealer_sale_reward_info.rule.commission;
                      let cloudstockCommission = {};
                      if (this.cloudstockCommission) {
                        cloudstockCommission = this.cloudstockCommission;
                      }
                      this.$set(
                        this.sku.dealer_sale_reward_info.rule,
                        "commission",
                        cloudstockCommission
                      );
                      this.cloudstockCommission = cloudstockCommission_copy;
                    }
                    this.dropName = name;
                  }
                }
              },
              [
                h("span", [
                  this.dropName === dropType[0] ? textArray[0] : textArray[1],
                  h("Icon", {
                    props: {
                      type: "ios-arrow-down"
                    }
                  })
                ]),
                h(
                  "DropdownMenu",
                  {
                    slot: "list"
                  },
                  [
                    h(
                      "DropdownItem",
                      {
                        style: {
                          fontWeight: "initial"
                        },
                        props: {
                          name: dropType[0]
                        }
                      },
                      textArray[0]
                    ),
                    h(
                      "DropdownItem",
                      {
                        style: {
                          fontWeight: "initial"
                        },
                        props: {
                          name: dropType[1]
                        }
                      },
                      textArray[1]
                    )
                  ]
                )
              ]
            )
          ]);
        },
        render: (h, params) => {
          return h(
            "div",
            this.tableData
              .filter(n => n.weight >= params.row.weight)
              .map(n => {
                let value = this.sku.dealer_sale_reward_info.rule.commission[
                  params.row.id + "-" + n.id
                ];
                return h(
                  "p",
                  {
                    class: this.showError && !value ? "ivu-form-item-error" : ""
                  },
                  [
                    h("InputNumber", {
                      props: {
                        size: "small",
                        placeholder: "请输入",
                        precision: this.dropName === dropType[0] ? 3 : 2,
                        max: this.dropName === dropType[0] ? 100 : 9999999.99,
                        min: 0,
                        value: value || value === 0 ? value : null
                      },
                      style: {
                        width: "100px"
                      },
                      on: {
                        "on-change": val => {
                          if (val === null) {
                            this.$delete(
                              this.sku.dealer_sale_reward_info.rule.commission,
                              params.row.id + "-" + n.id
                            );
                          } else {
                            this.$set(
                              this.sku.dealer_sale_reward_info.rule.commission,
                              params.row.id + "-" + n.id,
                              val
                            );
                          }
                        }
                      }
                    })
                  ]
                );
              })
          );
        }
      },
      tableData: []
    };
  },
  watch: {
    dropName(val) {
      this.sku.dealer_sale_reward_info.amountType = dropType.findIndex(
        item => item === val
      );
    },
    hasSetting: {
      handler(val) {
        if (val) {
          this.columnsData.push(this.customColumn);
        } else {
          this.columnsData = this.columnsData.filter(
            item => this.customColumn !== item
          );
        }
      },
      immediate: true
    },
    sku: {
      handler(val) {
        this.cloudstockCommission = null;
        if (!val.dealer_sale_reward_info) {
          this.$set(val, "dealer_sale_reward_info", {
            amountType: 0,
            rule: {
              commission: {}
            },
            type: 0
          });
        }
        this.dropName = dropType[val.dealer_sale_reward_info.amountType];
        this.tableData = [];
        this.dealerConfig.levels
          .sort((a, b) => b.weight - a.weight)
          .forEach(item => {
            this.tableData.push({
              id: item.id,
              name: item.name,
              weight: item.weight,
              parent_id: item.parent_id,
              discount: item.discount
            });
          });
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.product-detail-table-dealer-sale {
  /deep/.ivu-table-wrapper .ivu-table-default table {
    font-size: 12px;
    th {
      .ivu-table-cell {
        font-size: 12px;
      }
      &:last-child {
        .ivu-table-cell {
          padding: 0;
        }
      }
    }
    .ivu-input-number input {
      text-align: center;
    }
    thead tr {
      height: 50px;
      th {
        font-size: 12px;
        .ivu-dropdown {
          display: "block";
          height: "24px";
          line-height: "24px";
          .ivu-dropdown-rel {
            line-height: 20px;
          }
        }
      }
    }
    .ivu-dropdown {
      .ivu-dropdown-rel span {
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
    tbody tr {
      height: auto;
      .ivu-table-cell {
        padding: 0;
        p {
          line-height: 48px;
          & + p {
            border-top: 1px solid #e8eaec;
          }
        }
      }
    }
  }
}
</style>
