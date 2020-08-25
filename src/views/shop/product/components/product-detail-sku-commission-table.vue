<template>
  <common-table
    type="border"
    class="product-detail-sku-commission-table"
    :columnsData="columnsData"
    :listData="listData"
    :width="width"
    :style="`width:${hasSetting? (columnSystemShow ? width : (width - 186)) : 418}px;`"
  ></common-table>
</template>
<script>
import commonTable from "@/views/shop/components/table/common-table.vue";
import { on, off } from "iview/src/utils/dom";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
const dropType = ["disc", "price"];
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
    resizeStatus: {
      type: Boolean,
      default: true
    },
    value: {
      type: Number,
      default: 0
    },
    setting: {
      type: Object,
      default() {
        return {
          exceedTotalNum: 0
        };
      }
    },
    // 用于多规格设置的弹窗不显示
    columnSystemShow: {
      type: Boolean,
      default: true
    },
    distributorLevel: {
      type: Number,
      default: 0
    },
    customCommission: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      default: 0
    },
    tableFixed: {
      type: String,
      default: "left"
    },
    listData: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      width: tableWidth,
      headerValue1: null,
      headerValue2: null,
      headerValue3: null,
      tableError: {},
      maxDiscount: 0,
      fristMaxArray: [],
      secondMaxArray: [],
      thirdMaxArray: [],
      itemArray: [
        this.getShowItem(0),
        this.getShowItem(1),
        this.getShowItem(2)
      ],
      columnItem: {
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
            [h("div", "一级/二级/三级"), h("div", "系统佣金(元)")]
          );
        },
        render: (h, params) => {
          return h(
            "div",
            typeof this.price === "number"
              ? [
                  (
                    Math.floor(this.price * params.row.commission[1]) / 100
                  ).toFixed(2),
                  (
                    Math.floor(this.price * params.row.commission[2]) / 100
                  ).toFixed(2),
                  (
                    Math.floor(this.price * params.row.commission[3]) / 100
                  ).toFixed(2)
                ].join(" / ")
              : "---"
          );
        }
      },
      dropName: dropType[0],
      columnsData: [
        {
          title: "分销商等级名称",
          key: "name",
          align: "center",
          fixed: "left",
          width: 112,
          render: (h, params) => {
            let status = params.row.status !== 1;
            let headerContent = [
              h(
                "span",
                {
                  style: {
                    lineHeight: "1.5",
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
                  lineHeight: "1.5",
                  textAlign: "left"
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
              [h("div", "一级/二级/三级"), h("div", "系统佣金比例(%)")]
            );
          },
          render: (h, params) => {
            return h(
              "div",
              [
                params.row.commission[1],
                params.row.commission[2],
                params.row.commission[3]
              ].join(" / ")
            );
          }
        }
      ]
    };
  },
  watch: {
    tableFixed: {
      handler(val) {
        this.$set(this.columnsData[0], "fixed", val);
      },
      immediate: true
    },
    columnSystemShow: {
      handler(val) {
        if (val) {
          this.columnsData.splice(2, 0, this.columnItem);
        } else {
          this.columnsData = this.columnsData.filter(
            item => this.columnItem !== item
          );
        }
      },
      immediate: true
    },
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
    maxDiscount() {
      this.$emit("onMaxCommissionChange", this.getMaxDiscount());
    },
    listData: {
      handler() {
        this.setMaxCommission();
      },
      immediate: true
    },
    value: {
      handler(val) {
        this.dropName = dropType[val];
      },
      immediate: true
    },
    dropName(val) {
      this.$emit("input", dropType.findIndex(item => item === val));
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
    setMaxCommission() {
      let fristMaxArray = [];
      let secondMaxArray = [];
      let thirdMaxArray = [];
      if (this.hasSetting) {
        this.listData.forEach(item => {
          if (item.status === 1) {
            fristMaxArray.push(item.commission_custom[1] || 0);
            secondMaxArray.push(item.commission_custom[2] || 0);
            thirdMaxArray.push(item.commission_custom[3] || 0);
          }
        });
      }
      this.fristMaxArray = fristMaxArray;
      this.secondMaxArray = secondMaxArray;
      this.thirdMaxArray = thirdMaxArray;
      this.maxDiscount =
        fristMaxArray.length > 0
          ? [
              0,
              Math.max(...fristMaxArray),
              Math.max(...secondMaxArray),
              Math.max(...thirdMaxArray)
            ]
              .slice(0, this.distributorLevel + 1)
              .reduce((a, b) => {
                return a + b;
              })
          : 0;
    },
    getMaxDiscount() {
      return this.dropName === dropType[0]
        ? this.maxDiscount > 100
          ? 100
          : this.maxDiscount
        : this.maxDiscount;
    },
    checkData(flag = true) {
      let num = 0;
      let unvalidArray = this.listData.filter((item, listIndex) => {
        let custom = item.commission_custom;
        let type = [undefined, null];
        // 如果值不为空
        if (
          [custom[1], custom[2], custom[3]].filter((item1, index) => {
            let status = type.includes(item1);
            if (flag && status) {
              this.$set(this.tableError, listIndex + "hasError" + (index + 1), true);
            }
            return status;
          }).length === 0
        ) {
          // 如果值总和超出100
          if (
            this.dropName === dropType[0] &&
            custom[1] + custom[2] + custom[3] > 100
          ) {
            if (flag) {
              this.$set(this.tableError, listIndex + "hasError", true);
              num++;
            }
            return true;
          }
          return false;
        }
        return true;
      });
      flag && this.$set(this.setting, "exceedTotalNum", num);
      if (!unvalidArray.length) {
        return true;
      } else {
        return false;
      }
    },
    getShowItem(index) {
      let textArray1 = [
        "一级自定义佣金比例(%)",
        "二级自定义佣金比例(%)",
        "三级自定义佣金比例(%)"
      ];
      let textArray2 = [
        "一级自定义固定佣金(元)",
        "二级自定义固定佣金(元)",
        "三级自定义固定佣金(元)"
      ];
      return {
        key: "distributorSetting",
        align: "center",
        width: 168,
        renderHeader: (h, params) => {
          let headerContent = [
            h("InputNumber", {
              style: {
                marginRight: index === 2 ? "4px" : ""
              },
              props: {
                size: "small",
                placeholder: "批量设置",
                precision: this.dropName === dropType[0] ? 3 : 2,
                max: this.dropName === dropType[0] ? 100 : Infinity,
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
                      this.$set(this.tableError, index1 + "hasError" + (index + 1), false);
                      this.$set(this.tableError, index1 + "hasError", false);
                    }
                    this.setMaxCommission();
                    this.$set(item.commission_custom, index + 1, val);
                  });
                }
              }
            })
          ];
          if (index === 2 && this.dropName === dropType[0]) {
            headerContent.push(
              h(moreMessage, {
                style: {
                  position: "absolute"
                },
                props: {
                  text:
                    "一二三级佣金比例之和不能大于100%，设置为0表示不参与分佣。"
                }
              })
            );
          }
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
                      this.listData.forEach(item => {
                        let commission_custom_copy = item.commission_custom;
                        let commission_custom = {};
                        if (item.commission_custom_copy) {
                          commission_custom = item.commission_custom_copy;
                        }
                        this.$set(item, "commission_custom", commission_custom);
                        item.commission_custom_copy = commission_custom_copy;
                      });
                    }
                    this.dropName = name;
                  }
                }
              },
              [
                h("span", [
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
                "ivu-input-number-error":
                  this.tableError[params.index + "hasError"] || this.tableError[params.index + "hasError" + (index + 1)]
              },
              props: {
                size: "small",
                placeholder: "请输入",
                precision: this.dropName === dropType[0] ? 3 : 2,
                max: this.dropName === dropType[0] ? 100 : Infinity,
                min: 0,
                value:
                  typeof this.listData[params.index].commission_custom[
                    index + 1
                  ] === "undefined"
                    ? null
                    : this.listData[params.index].commission_custom[index + 1]
              },
              on: {
                "on-change": val => {
                  params.row.commission_custom[index + 1] = val;
                  let type = [undefined, null];
                  if (!type.includes(val)) {
                    this.$set(this.tableError, params.index + "hasError" + (index + 1), false);
                    this.$set(this.tableError, params.index + "hasError", false);
                  }
                  this.listData[params.index] = params.row;
                  this.setMaxCommission();
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
.product-detail-sku-commission-table {
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
</style>
