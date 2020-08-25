<template>
  <div>
    <common-table
      type="border"
      class="product-detail-table-regional"
      :columnsData="columnsData"
      :listData="listData"
      :width="width"
      :style="`width:${hasSetting ? width : 418}px;`"
    ></common-table>
    <div
      class="product-detail-table-regional-tip"
      v-show="Object.values(tableError).filter(n => n).length"
    >
      请输入正确的规则：省代 > 市代 > 区代
    </div>
    <div></div>
  </div>
</template>
<script>
import commonTable from "@/views/shop/components/table/common-table.vue";
import { on, off } from "iview/src/utils/dom";
const dropType = ["disc", "price"];
const commissionKey = ["province", "city", "district"];
// 2px的边差
const tableWidth = 920 + 2;
export default {
  components: {
    commonTable
  },
  props: {
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
    resizeStatus: {
      type: Boolean,
      default: true
    },
    price: {
      type: Number,
      default: 0
    },
    config: {
      type: Object,
      default() {
        return {
          levels: []
        };
      }
    }
  },
  data() {
    return {
      width: tableWidth,
      headerValue1: null,
      headerValue2: null,
      headerValue3: null,
      commission_rule: null,
      tableError: {},
      listData: [],
      itemArray: [
        this.getShowItem(0),
        this.getShowItem(1),
        this.getShowItem(2)
      ],
      dropName: dropType[0],
      columnsData: [
        {
          title: "区代等级",
          key: "name",
          align: "center",
          width: 112,
          render: (h, params) => {
            let status = params.row.status !== 1;
            let headerContent = [
              h(
                "span",
                {
                  style: {
                    lineHeight: "1.5"
                  }
                },
                params.row.name
              )
            ];
            if (status) {
              headerContent.push(
                h(
                  "span",
                  {
                    style: {
                      display: "inline-block",
                      width: "33px",
                      height: "19px",
                      lineHeight: "19px",
                      marginLeft: "3px",
                      verticalAlign: "baseline",
                      textAlign: "center",
                      backgroundColor: "#FFF1F0",
                      color: "#F5222D",
                      border: "solid 1px #FFA39E",
                      borderRadius: "4px"
                    }
                  },
                  "禁用"
                )
              );
            }
            return h(
              "div",
              {
                style: {
                  lineHeight: "1.5"
                }
              },
              headerContent
            );
          }
        },
        {
          align: "center",
          width: 118,
          renderHeader: h => {
            return h(
              "div",
              {
                style: {
                  lineHeight: "initial"
                }
              },
              [h("div", "省代/市代/区代"), h("div", "系统返佣比例（%）")]
            );
          },
          render: (h, params) => {
            return h(
              "div",
              [
                params.row.disc[commissionKey[0]],
                params.row.disc[commissionKey[1]],
                params.row.disc[commissionKey[2]]
              ].join(" / ")
            );
          }
        },
        {
          key: "distributorPrice",
          align: "center",
          width: 186,
          renderHeader: h => {
            return h(
              "div",
              {
                style: {
                  lineHeight: "initial"
                }
              },
              [h("div", "省代/市代/区代"), h("div", "系统返佣（元）")]
            );
          },
          render: (h, params) => {
            return h(
              "div",
              typeof this.price === "number"
                ? [
                    (
                      Math.floor(
                        this.price *
                          (params.row.disc[commissionKey[0]] -
                            params.row.disc[commissionKey[1]])
                      ) / 100
                    ).toFixed(2),
                    (
                      Math.floor(
                        this.price *
                          (params.row.disc[commissionKey[1]] -
                            params.row.disc[commissionKey[2]])
                      ) / 100
                    ).toFixed(2),
                    (
                      Math.floor(
                        this.price * params.row.disc[commissionKey[2]]
                      ) / 100
                    ).toFixed(2)
                  ].join(" / ")
                : "---"
            );
          }
        }
      ]
    };
  },
  watch: {
    hasSetting: {
      handler(val) {
        let itemArray = this.itemArray;
        if (val) {
          this.columnsData.push(...itemArray);
        } else {
          this.columnsData = this.columnsData.filter(
            item => !itemArray.includes(item)
          );
        }
      },
      immediate: true
    },
    dropName(val) {
      this.sku.area_agent_rule_info.amountType = dropType.findIndex(
        item => item === val
      );
    },
    sku: {
      handler(val) {
        this.saleCommission = null;
        if (!val.area_agent_rule_info) {
          this.$set(val, "area_agent_rule_info", {
            amountType: 0,
            rule: Object.assign(
              {},
              ...this.config.levels.map(item => ({
                [item.id]: {
                  commission_rate: {
                    [commissionKey[0]]: null,
                    [commissionKey[1]]: null,
                    [commissionKey[2]]: null
                  },
                  weight: item.weight
                }
              }))
            ),
            type: 0
          });
        }
        this.dropName = dropType[val.area_agent_rule_info.amountType];
        this.listData = this.config.levels.map(item => {
          return {
            id: item.id,
            status: item.status,
            name: item.name,
            disc: item.commission
          };
        });
      },
      immediate: true
    }
  },
  mounted() {
    if (this.resizeStatus) {
      on(window, "resize", this.handleResize);
      this.handleResize();
    }
  },
  methods: {
    handleResize() {
      let width =
        document.querySelector(".matter").offsetWidth - 24 - 48 - 86 - 6; // 减去边框减去内边距减去左边标题宽度,6为右边滚动条宽度
      this.width = width > tableWidth ? tableWidth : width;
    },
    checkData() {
      let unvalidArray = this.listData.filter((item, listIndex) => {
        let custom = this.sku.area_agent_rule_info.rule[item.id].commission_rate;
        let type = [undefined, null];
        // 值为空的数据
        let nullData = [
          custom[commissionKey[0]],
          custom[commissionKey[1]],
          custom[commissionKey[2]]
        ].filter((n, index) => {
          let status = type.includes(n);
          this.$set(
            this.tableError,
            listIndex + "hasError" + (index + 1),
            status
          );
          return status;
        });
        // 如果值不为空
        if (nullData.length === 0) {
          if (
            parseFloat(custom[commissionKey[1]]) === 0 &&
            parseFloat(custom[commissionKey[2]]) === 0
          ) {
            return false;
          } else if ( // 如果值不符合从高到低
            custom[commissionKey[0]] <= custom[commissionKey[1]] ||
            custom[commissionKey[1]] <= custom[commissionKey[2]]
          ) {
            this.$set(
              this.tableError,
              listIndex + "hasError" + 2,
              custom[commissionKey[0]] <= custom[commissionKey[1]]
            );
            this.$set(
              this.tableError,
              listIndex + "hasError" + 3,
              custom[commissionKey[1]] <= custom[commissionKey[2]]
            );
            return true;
          }
          return false;
        }
        return true;
      });
      if (!unvalidArray.length) {
        return true;
      } else {
        return false;
      }
    },
    getShowItem(index) {
      let textArray1 = [
        "省代自定义返佣折扣(%)",
        "市代自定义返佣折扣(%)",
        "区代自定义返佣折扣(%)"
      ];
      let textArray2 = [
        "省代自定义返佣金额(元)",
        "市代自定义返佣金额(元)",
        "区代自定义返佣金额(元)"
      ];
      return {
        key: "distributorSetting",
        align: "center",
        width: 168,
        renderHeader: h => {
          let headerContent = [
            h("InputNumber", {
              style: {
                marginRight: index === 2 ? "4px" : ""
              },
              props: {
                size: "small",
                placeholder: "批量设置",
                precision: this.dropName === dropType[0] ? 3 : 2,
                max: this.dropName === dropType[0] ? 100 : 9999999.99,
                min: 0,
                value: this["headerValue" + (index + 1)]
              },
              on: {
                "on-blur": () => {
                  this["headerValue" + (index + 1)] = null;
                },
                "on-change": val => {
                  this["headerValue" + (index + 1)] = val;
                  let status = ![undefined, null].includes(val);
                  this.listData.forEach((item, index1) => {
                    if (status) {
                      this.$set(
                        this.tableError,
                        index1 + "hasError" + (index + 1),
                        false
                      );
                    }
                    this.$set(
                      this.sku.area_agent_rule_info.rule[item.id]
                        .commission_rate,
                      commissionKey[index],
                      val
                    );
                  });
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
                      let commission_rule_copy = this.sku.area_agent_rule_info
                        .rule;
                      let commission_rule = Object.assign(
                        {},
                        ...this.config.levels.map(item => ({
                          [item.id]: {
                            commission_rate: {
                              [commissionKey[0]]: null,
                              [commissionKey[1]]: null,
                              [commissionKey[2]]: null
                            },
                            weight: item.weight
                          }
                        }))
                      );
                      if (this.commission_rule) {
                        commission_rule = this.commission_rule;
                      }
                      this.$set(
                        this.sku.area_agent_rule_info,
                        "rule",
                        commission_rule
                      );
                      this.commission_rule = commission_rule_copy;
                    }
                    this.dropName = name;
                  }
                }
              },
              [
                h("span", {
                  style: {
                    cursor: "pointer"
                  }
                }, [
                  this.dropName === dropType[0]
                    ? textArray1[index]
                    : textArray2[index],
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
                      textArray1[index]
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
                      textArray2[index]
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
          return h("div", [
            h("InputNumber", {
              class: {
                "ivu-input-number-error": this.tableError[
                  params.index + "hasError" + (index + 1)
                ]
              },
              props: {
                size: "small",
                placeholder: "请输入",
                precision: this.dropName === dropType[0] ? 3 : 2,
                max: this.dropName === dropType[0] ? 100 : 9999999.99,
                min: 0,
                value:
                  this.sku.area_agent_rule_info.rule[params.row.id]
                    .commission_rate[commissionKey[index]] !== null
                    ? Number(
                        this.sku.area_agent_rule_info.rule[params.row.id]
                          .commission_rate[commissionKey[index]]
                      )
                    : null
              },
              on: {
                "on-change": val => {
                  console.log(val)
                  this.sku.area_agent_rule_info.rule[
                    params.row.id
                  ].commission_rate[commissionKey[index]] = val;
                  let type = [undefined, null];
                  if (!type.includes(val)) {
                    this.$set(
                      this.tableError,
                      params.index + "hasError" + (index + 1),
                      false
                    );
                  }
                }
              }
            })
          ]);
        }
      };
    }
  },
  beforeDestroy() {
    off(window, "resize", this.handleResize);
  }
};
</script>
<style lang="less" scoped>
.product-detail-table-regional {
  &.ivu-table-wrapper {
    /deep/.ivu-table-overflowX {
      overflow-x: auto;
    }
    /deep/.ivu-input-number {
      width: 100px;
      input {
        text-align: center;
      }
      &.ivu-input-number-error {
        border: 1px solid #ed4014;
      }
    }
    /deep/.ivu-table-default {
      table thead tr {
        height: 60px;
        .ivu-table-cell {
          padding: 0;
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
      }
      table .ivu-table-cell {
        padding: 0 10px;
        font-size: 12px;
      }
      table tbody tr {
        height: 40px;
      }
    }
  }
}
.product-detail-table-regional-tip {
  position: absolute;
  color: #ed4014;
  margin-top: 4px;
  font-size: 12px;
  line-height: 16px;
}
</style>
