<template>
  <div class="product-detail-table-cloudstock">
    <common-table
      type="border"
      :columnsData="columnsData"
      :listData="tableData"
      :width="(hasSetting ? width : width - 150) + 2"
    ></common-table>
  </div>
</template>
<script>
import commonTable from "@/views/shop/components/table/common-table.vue";
const dropType = ["disc", "price"];
const textArray = ["自定义云仓折扣(%)", "自定义固定云仓价(元)"];
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
    sku: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    let errorData = {};
    return {
      width: 558,
      dropName: dropType[0],
      dropType,
      headerValue: null,
      tableError: {},
      cloudstockCommission: null, // 记录切换前的数据
      columnsData: [
        {
          title: "经销商等级",
          width: 172,
          key: "name",
          align: "left",
          render: (h, params) => {
            return h("div", {
              style: {
                position: "relative"
              }
            }, [
              params.row.parent_id ? h("div", {
                style: {
                  position: "absolute",
                  top: "50%",
                  width: "12px",
                  height: "12px",
                  borderLeft: "1px solid #657180",
                  borderBottom: "1px solid #657180",
                  transform: "translateY(-100%)"
                }
              }) : "",
              h("div", {
                style: {
                  paddingLeft: params.row.parent_id ? "22px" : ""
                }
              }, params.row.name)
            ])
          }
        },
        {
          title: "系统云仓折扣",
          width: 118,
          key: "disc",
          align: "center",
          render: (h, params) => {
            return h("div", Number(params.row.disc) + "%");
          }
        },
        {
          title: "系统云仓价",
          width: 118,
          align: "center",
          render: (h, params) => {
            let disc = params.row.disc;
            return h(
              "div",
              this.price !== null
                ? "￥" + (Math.floor(disc * this.price) / 100).toFixed(2)
                : "--"
            );
          }
        }
      ],
      customColumn: {
        align: "center",
        width: 150,
        renderHeader: (h, params) => {
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
                        .cloud_stock_rule_info.rule.commission;
                      let cloudstockCommission = {};
                      if (this.cloudstockCommission) {
                        cloudstockCommission = this.cloudstockCommission;
                      }
                      this.$set(
                        this.sku.cloud_stock_rule_info.rule,
                        "commission",
                        cloudstockCommission
                      );
                      this.cloudstockCommission = cloudstockCommission_copy;
                      this.resetErrorStatus(errorData);
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
            {
              class: {
                "ivu-form-item-error":
                  this.tableError[params.row.id + "hasError"]
              }
            },
            [
              h("InputNumber", {
                props: {
                  size: "small",
                  placeholder: "请输入",
                  precision: this.dropName === dropType[0] ? 3 : 2,
                  max:
                    this.dropName === dropType[0]
                      ? 100
                      : 9999999.99,
                  min: this.dropName === dropType[0] ? 0.001 : 0.01,
                  value: this.sku.cloud_stock_rule_info.rule.commission[
                    params.row.id
                  ]
                    ? this.sku.cloud_stock_rule_info.rule.commission[
                        params.row.id
                      ]
                    : null
                },
                style: {
                  width: "100px"
                },
                on: {
                  "on-change": val => {
                    this.$set(
                      this.tableError,
                      params.row.id + "hasError",
                      false
                    );
                    this.$set(
                      this.sku.cloud_stock_rule_info.rule.commission,
                      params.row.id,
                      val
                    );
                  }
                }
              })
            ]
          );
        }
      },
      tableData: []
    };
  },
  watch: {
    dropName(val) {
      this.sku.cloud_stock_rule_info.amountType = dropType.findIndex(
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
        if (!val.cloud_stock_rule_info) {
          this.$set(val, "cloud_stock_rule_info", {
            amountType: 0,
            rule: {
              commission: {}
            },
            type: 0
          });
        }
        this.dropName = dropType[val.cloud_stock_rule_info.amountType];
        this.tableData = [];
        this.dealerConfig.levels.forEach(item => {
          this.tableData.push({
            id: item.id,
            name: item.name,
            disc: item.discount,
            parent_id: item.parent_id
          });
          item.sub_levels.forEach(subitem => {
            this.tableData.push({
              id: subitem.id,
              name: subitem.name,
              disc: subitem.discount,
              parent_id: subitem.parent_id
            });
          });
        });
      },
      immediate: true
    }
  },
  methods: {
    resetErrorStatus(errorData) {
      let tableError = this.tableError;
      this.tableError = errorData.tableError || {};
      errorData.tableError = tableError;
    },
    /**
     * 检测数据是否正确
     */
    checkData() {
      let status = true;
      let values = this.sku.cloud_stock_rule_info.rule;
      // 必须有值（防止外部传入没值）
      // 检查数据是否正确
      this.tableData.forEach(item => {
        // 不能为空或0
        if (!values.commission[item.id]) {
          this.$set(this.tableError, item.id + "hasError", true);
          status = false;
        }
      });
      return status;
    }
  }
};
</script>
<style lang="less" scoped>
.product-detail-table-cloudstock {
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
      height: 48px;
    }
  }
}
</style>
