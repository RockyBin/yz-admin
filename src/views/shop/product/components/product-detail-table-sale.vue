<template>
  <div class="product-detail-table-sale">
    <common-table
      type="border"
      :columnsData="columnsData"
      :listData="tableData"
      :width="(hasSetting ? width : (width - 150)) + 2"
    ></common-table>
  </div>
</template>
<script>
import commonTable from "@/views/shop/components/table/common-table.vue";
const dropType = ["disc", "price"];
const textArray = ["自定义返佣比例(%)", "自定义返佣金额(元)"];
const saleText = ["一级平级奖", "二级平级奖", "三级平级奖", "越级奖"];
export default {
  components: {
    commonTable
  },
  props: {
    price: {
      type: Number,
      default: 0
    },
    hasSetting: {
      type: Boolean,
      default: false
    },
    sku: {
      type: Object,
      default() {
        return {};
      }
    },
    agentConfig: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      width: 426,
      dropName: dropType[0],
      tableError: {},
      headerValue: null,
      saleCommission: null,
      columnsData: [
        {
          title: "代理奖项名称",
          width: 92,
          key: "name",
          align: "center"
        },
        {
          title: "系统返佣比例",
          width: 92,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              params.row.disc !== null ? params.row.disc + "%" : "--"
            );
          }
        },
        {
          title: "系统返佣金额",
          width: 92,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              this.price !== null ? "￥" + (Math.floor(params.row.disc * this.price) / 100).toFixed(2) : "--"
            );
          }
        }
      ],
      customColumn: {
        align: "center",
        width: 150,
        renderHeader: (h, params) => {
          let headerContent = [
            h("InputNumber", {
              style: {
                width: "100px"
              },
              props: {
                size: "small",
                placeholder: "批量设置",
                precision: this.dropName === dropType[0] ? 3 : 2,
                max: this.dropName === dropType[0] ? 100 : Infinity,
                min: 0,
                value: this.headerValue
              },
              on: {
                "on-blur": () => {
                  this.headerValue = null;
                },
                "on-change": val => {
                  this.headerValue = val;
                  this.$set(this.tableError, 'hasError1', false);
                  this.$set(this.tableError, 'hasError2', false);
                  this.$set(this.tableError, 'hasError3', false);
                  this.$set(this.tableError, 'hasError4', false);
                  this.$set(
                    this.sku.agent_sale_reward_info.rule,
                    "commission",
                    {
                      1: val,
                      2: val,
                      3: val
                    }
                  );
                  this.$set(
                    this.sku.agent_sale_reward_info.rule,
                    "low_commission",
                    val
                  );
                }
              }
            })
          ];
          return h("div", [
            h(
              "Dropdown",
              {
                style: {
                  height: "24px",
                  display: "block",
                  lineHeight: "24px"
                },
                props: {
                  transfer: true,
                  trigger: "click"
                },
                on: {
                  "on-click": name => {
                    if (this.dropName !== name) {
                      let saleCommission_copy = this.sku.agent_sale_reward_info
                        .rule;
                      let saleCommission = {
                        commission: {
                          1: null,
                          2: null,
                          3: null
                        },
                        low_commission: null
                      };
                      if (this.saleCommission) {
                        saleCommission = this.saleCommission;
                      }
                      this.$set(
                        this.sku.agent_sale_reward_info,
                        "rule",
                        saleCommission
                      );
                      this.saleCommission = saleCommission_copy;
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
            ),
            h(
              "div",
              {
                style: {
                  lineHeight: "22px",
                  height: "25px",
                  fontWeight: "initial",
                  position: "relative"
                }
              },
              headerContent
            )
          ]);
        },
        render: (h, params) => {
          return h("div",{
            class: {
                "ivu-form-item-error": this.tableError["hasError" + (params.index + 1)]
              },
          }, [
            h("InputNumber", {
              style: {
                width: "100px"
              },
              props: {
                size: "small",
                placeholder: "请输入",
                precision: this.dropName === dropType[0] ? 3 : 2,
                max: this.dropName === dropType[0] ? 100 : Infinity,
                min: 0,
                value:
                  params.index !== 3
                    ? this.sku.agent_sale_reward_info.rule.commission[
                        params.index + 1
                      ]
                    : this.sku.agent_sale_reward_info.rule.low_commission
              },
              on: {
                "on-change": val => {
                  this.$set(this.tableError, "hasError" + (params.index + 1), false);
                  if (params.index === 3) {
                    this.$set(
                      this.sku.agent_sale_reward_info.rule,
                      "low_commission",
                      val
                    );
                  } else {
                    this.$set(
                      this.sku.agent_sale_reward_info.rule.commission,
                      params.index + 1,
                      val
                    );
                  }
                }
              }
            })
          ]);
        }
      },
      tableData: []
    };
  },
  watch: {
    dropName(val) {
      this.sku.agent_sale_reward_info.amountType = dropType.findIndex(item => item === val);
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
        this.saleCommission = null;
        if (!val.agent_sale_reward_info) {
          this.$set(val, "agent_sale_reward_info", {
            amountType: 0,
            rule: {
              commission: {
                1: null,
                2: null,
                3: null
              },
              low_commission: null
            },
            type: 0
          });
        }
        this.dropName = dropType[val.agent_sale_reward_info.amountType];
        this.tableData = saleText.map((item, index) => {
          return {
            name: item,
            disc: this.agentConfig.agent_sale_reward_config
              ? index === 3
                ? this.agentConfig.agent_sale_reward_config.lowcommision
                : this.agentConfig.agent_sale_reward_config.commision &&
                  this.agentConfig.agent_sale_reward_config.commision[
                    index + 1
                  ] !== undefined
                ? this.agentConfig.agent_sale_reward_config.commision[index + 1]
                : null
              : null
          };
        });
      },
      immediate: true
    }
  },
  methods: {
    checkData() {
      let status = true;
      let values = this.sku.agent_sale_reward_info.rule;
      // 必须有值（防止外部传入没值）
      if (Object.keys(values.commission).length !== 3 || values.low_commission === null) {
        this.$set(this.tableError, 'hasError1', true);
        this.$set(this.tableError, 'hasError2', true);
        this.$set(this.tableError, 'hasError3', true);
        this.$set(this.tableError, 'hasError4', true);
        status = false;
      } else {
        let commissionArray = [];
        Object.keys(values.commission).forEach(n => {
          // 不能为空
          if (values.commission[n] === null) {
            this.$set(this.tableError, 'hasError' + n, true);
            status = false;
          } else {
            commissionArray.push(values.commission[n]);
          }
        })
        if (values.low_commission === null) {
          this.$set(this.tableError, 'hasError4', true);
          status = false;
        } else {
          commissionArray.push(values.low_commission);
        }
      }
      return status;
    }
  }
};
</script>
<style lang="less" scoped>
.product-detail-table-sale {
  /deep/.ivu-table-wrapper .ivu-table-default table {
    font-size: 12px;
    thead tr {
      height: 50px;
      th {
        font-size: 12px;
        .ivu-dropdown-rel {
          line-height: 20px;
        }
      }
    }
    .ivu-table-cell {
      padding: 0 8px;
      font-size: 12px;
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
