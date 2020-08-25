<template>
  <div class="product-detail-table-reward">
    <common-table
      type="border"
      :columnsData="columnsData"
      :listData="tableData"
      :width="(hasSetting ? width : width - 150) + 2"
    ></common-table>
    <div
      class="product-detail-table-reward-tip"
      v-show="graduallyErrorIndex.length"
    >请输入正确的规则：一级代理 > 二级代理 > 三级代理</div>
  </div>
</template>
<script>
import commonTable from "@/views/shop/components/table/common-table.vue";
const dropType = ["disc", "price"];
const textArray = ["自定义分红比例(%)", "自定义分红金额(元)"];
const agentText = ["一级代理", "二级代理", "三级代理"];
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
    agentConfig: {
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
    return {
      width: 446,
      dropName: dropType[0],
      headerValue: null,
      tableError: {},
      graduallyErrorIndex: [], // 标识逐级分红不符合要求的代理等级分红
      rewardCommission: null, // 记录切换前的数据
      columnsData: [
        {
          title: "代理等级名称",
          width: 112,
          key: "name",
          align: "center"
        },
        {
          title: "系统分红比例",
          width: 92,
          key: "disc",
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              params.row.disc !== null ? params.row.disc + "%" : "--"
            );
          }
        },
        {
          title: "系统分红金额",
          width: 92,
          align: "center",
          render: (h, params) => {
            let bonusMode =
              this.agentConfig.agent_base_config &&
              this.agentConfig.agent_base_config.bonus_mode;
            let disc =
              params.row.disc -
              ((bonusMode &&
                this.tableData[params.index + 1] &&
                this.tableData[params.index + 1].disc) ||
                0);
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
                  this.$set(this.tableError, "hasError1", false);
                  this.$set(this.tableError, "hasError2", false);
                  this.$set(this.tableError, "hasError3", false);
                  this.headerValue = val;
                  this.$set(
                    this.sku.agent_order_commission_info.rule,
                    "commission",
                    {
                      1: val,
                      2: val,
                      3: val
                    }
                  );
                }
              }
            })
          ];
          return h("div", [
            h(
              "Dropdown",
              {
                class: {
                  "product-detail-table-reward-dropdown-mode": this.agentConfig.agent_base_config.bonus_mode
                },
                props: {
                  transfer: true,
                  trigger: "click"
                },
                on: {
                  "on-click": name => {
                    if (this.dropName !== name) {
                      let rewardCommission_copy = this.sku
                        .agent_order_commission_info.rule.commission;
                      let rewardCommission = {
                        1: null,
                        2: null,
                        3: null
                      };
                      if (this.rewardCommission) {
                        rewardCommission = this.rewardCommission;
                      }
                      this.$set(
                        this.sku.agent_order_commission_info.rule,
                        "commission",
                        rewardCommission
                      );
                      this.rewardCommission = rewardCommission_copy;
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
            this.agentConfig.agent_base_config.bonus_mode
              ? ""
              : h(
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
          return h(
            "div",
            {
              class: {
                "ivu-form-item-error":
                  this.tableError["hasError" + (params.index + 1)] ||
                  this.graduallyErrorIndex.includes(params.index + 1)
              }
            },
            [
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
                  value: this.sku.agent_order_commission_info.rule.commission[
                    params.index + 1
                  ]
                },
                on: {
                  "on-change": val => {
                    this.$set(
                      this.tableError,
                      "hasError" + (params.index + 1),
                      false
                    );
                    this.$set(
                      this.sku.agent_order_commission_info.rule.commission,
                      params.index + 1,
                      val
                    );
                    this.checkGraduallyData();
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
      this.sku.agent_order_commission_info.amountType = dropType.findIndex(
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
        this.rewardCommission = null;
        if (!val.agent_order_commission_info) {
          this.$set(val, "agent_order_commission_info", {
            amountType: 0,
            rule: {
              commission: {
                1: null,
                2: null,
                3: null
              }
            },
            type: 0
          });
        }
        this.dropName = dropType[val.agent_order_commission_info.amountType];
        this.tableData = agentText.map((item, index) => {
          return {
            name: item,
            disc:
              this.agentConfig.agent_base_config &&
              this.agentConfig.agent_base_config.commision &&
              this.agentConfig.agent_base_config.commision[index + 1] !==
                undefined
                ? this.agentConfig.agent_base_config.commision[index + 1]
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
      let values = this.sku.agent_order_commission_info.rule;
      // 必须有值（防止外部传入没值）
      if (Object.keys(values.commission).length !== 3) {
        this.$set(this.tableError, "hasError1", true);
        this.$set(this.tableError, "hasError2", true);
        this.$set(this.tableError, "hasError3", true);
        status = false;
      } else {
        let commissionArray = [];
        Object.keys(values.commission).forEach(n => {
          // 不能为空
          if (values.commission[n] === null) {
            this.$set(this.tableError, "hasError" + n, true);
            status = false;
          } else {
            commissionArray.push(values.commission[n]);
          }
        });
      }
      this.checkGraduallyData();
      if (this.graduallyErrorIndex.length) {
        status = false;
      }
      return status;
    },
    /**
     * 检测逐级分红比例不符合要求的情况
     */
    checkGraduallyData() {
      this.graduallyErrorIndex = [];
      if (this.agentConfig.agent_base_config.bonus_mode) {
        let commision = this.sku.agent_order_commission_info.rule.commission;
        let value = Object.values(commision);
        // 检测是否有空值
        let status = value.findIndex(n => n === null) > -1;
        if (status) {
          return;
        }
        // 返回不符合要求的位置
        if (commision[3] && commision[2] <= commision[3]) {
          this.graduallyErrorIndex.push(2);
        }
        if (
          (commision[3] && commision[1] <= commision[3]) ||
          (commision[2] && commision[1] <= commision[2])
        ) {
          this.graduallyErrorIndex.push(1);
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
.product-detail-table-reward {
  .product-detail-table-reward-tip {
    font-size: 12px;
    line-height: 16px;
    color: #ed5714;
  }
  /deep/.ivu-table-wrapper .ivu-table-default table {
    font-size: 12px;
    .ivu-table-cell {
      padding: 0;
      font-size: 12px;
    }
    thead tr {
      height: 50px;
      th {
        font-size: 12px;
        .ivu-dropdown {
          display: "block";
          &:not(.product-detail-table-reward-dropdown-mode) {
            height: "24px";
            line-height: "24px";
            .ivu-dropdown-rel {
              line-height: 20px;
            }
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
