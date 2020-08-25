<template>
  <common-table
    type="border"
    class="product-detail-sku-member-table"
    :columnsData="columnsData"
    :listData="tableData"
    :minWidth="400"
    :style="`width:${hasSetting ? (columnSystemShow ? 588 : 454) : 401}px`"
  ></common-table>
</template>
<script>
import commonTable from "@/views/shop/components/table/common-table.vue";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import { hasMagic } from "glob";
const dropType = ["disc", "price"];
export default {
  components: {
    commonTable
  },
  props: {
    hasSetting: {
      type: Boolean,
      default: false
    },
    tableData: {
      type: Array,
      default() {
        return [];
      }
    },
    columnSystemShow: {
      type: Boolean,
      default: true
    },
    value: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      dropName: dropType[0],
      headerValue: null,
      tableSetting: {
        key: "memberSetting",
        align: "center",
        width: 188,
        renderHeader: h => {
          return h("div", [
            h(
              "Dropdown",
              {
                props: {
                  trigger: "click"
                },
                style: {
                  height: "24px",
                  display: "block",
                  lineHeight: "24px"
                },
                on: {
                  "on-click": name => {
                    if (this.dropName !== name) {
                      this.tableData.forEach(item => {
                        let discount_copy = item.member_discount;
                        let discount = null;
                        if (typeof item.discount_copy !== "undefined") {
                          discount = item.discount_copy;
                        }
                        this.$set(item, "member_discount", discount);
                        item.discount_copy = discount_copy;
                      });
                    }
                    this.dropName = name;
                  }
                }
              },
              [
                h("span", [
                  this.dropName === dropType[0]
                    ? "自定义折扣(%)"
                    : "自定义固定价(元)",
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
                        props: {
                          name: dropType[0]
                        }
                      },
                      "自定义折扣(%)"
                    ),
                    h(
                      "DropdownItem",
                      {
                        props: {
                          name: dropType[1]
                        }
                      },
                      "自定义固定价(元)"
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
                  fontWeight: "initial"
                }
              },
              [
                h("InputNumber", {
                  style: {
                    marginRight: "10px"
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
                      let status = this.dropName === dropType[0] && val > 0;
                      this.tableData.forEach(item => {
                        if (status) {
                          this.$set(item, "hasError", false);
                        } else if (
                          this.dropName !== dropType[0] &&
                          ![undefined, null].includes(val)
                        ) {
                          this.$set(item, "hasError", false);
                        }
                        this.$set(item, "member_discount", val);
                      });
                    }
                  }
                }),
                h(moreMessage, {
                  style: {
                    position: "absolute"
                  },
                  props: {
                    text:
                      this.dropName === dropType[0]
                        ? "请设置0.001-100之间的正数，限制3位小数。"
                        : "请设置非负数，限制2位小数。"
                  }
                })
              ]
            )
          ]);
        },
        render: (h, params) => {
          return h(
            "div",
            {
              style: {
                marginRight: "10px"
              }
            },
            [
              h("InputNumber", {
                class: {
                  "ivu-input-number-error": params.row.hasError
                },
                props: {
                  size: "small",
                  placeholder: "请输入",
                  precision: this.dropName === dropType[0] ? 3 : 2,
                  max: this.dropName === dropType[0] ? 100 : Infinity,
                  min: 0,
                  value:
                    typeof params.row.member_discount === "undefined"
                      ? null
                      : params.row.member_discount
                },
                on: {
                  input: val => {
                    params.row.member_discount = val;

                    if (this.dropName === dropType[0] && val > 0) {
                      this.$set(params.row, "hasError", false);
                    } else if (
                      this.dropName !== dropType[0] &&
                      ![undefined, null].includes(val)
                    ) {
                      this.$set(params.row, "hasError", false);
                    }
                    this.tableData[params.index] = params.row;
                  }
                }
              })
            ]
          );
        }
      },
      columnItem: {
        title: "系统会员价(元)",
        align: "center",
        width: 134,
        render: (h, params) => {
          return h(
            "div",
            typeof this.price === "number"
              ? (
                  Math.floor(
                    (params.row.discount
                      ? (this.price * params.row.discount) / 100
                      : this.price) * 100
                  ) / 100
                ).toFixed(2)
              : "--"
          );
        }
      },
      columnsData: [
        {
          title: "会员等级名称",
          key: "name",
          align: "center",
          width: 120,
          render: (h, params) => {
            let status = params.row.status !== 1;
            let headerContent = [
              h(
                "div",
                {
                  style: {
                    display: "inline-block",
                    verticalAlign: "middle",
                    lineHeight: "1.5",
                    maxWidth: status ? "calc(100% - 36px)" : ""
                  }
                },
                params.row.name
              )
            ];
            if (status) {
              headerContent.push(
                h(
                  "div",
                  {
                    style: {
                      display: "inline-block",
                      width: "33px",
                      height: "18px",
                      lineHeight: "19px",
                      marginLeft: "3px",
                      verticalAlign: "middle",
                      backgroundColor: "#ffefe7",
                      color: "#ed4014",
                      border: "solid 1px #ffb193",
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
          title: "系统会员折扣(%)",
          key: "discount",
          align: "center",
          width: 146,
          render: (h, params) => {
            return h("div", params.row.discount);
          }
        }
      ]
    };
  },
  watch: {
    hasSetting: {
      handler(val) {
        if (val) {
          this.columnsData.push(this.tableSetting);
        } else {
          this.columnsData = this.columnsData.filter(
            item => item !== this.tableSetting
          );
        }
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
  methods: {
    checkData(flag = true) {
      let type = [undefined, null];
      let unvalidArray = this.tableData.filter(item => {
        let custom = item.member_discount;
        if (
          (this.dropName === dropType[0] && custom > 0) ||
          (this.dropName !== dropType[0] && !type.includes(custom))
        ) {
          return false;
        } else {
          flag && this.$set(item, "hasError", true);
        }
        return true;
      });
      if (!unvalidArray.length) {
        return true;
      } else {
        return false;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.product-detail-sku-member-table {
  &.ivu-table-wrapper {
    /deep/.ivu-input-number {
      width: 122px;
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
            }
          }
          .ivu-select-dropdown {
            font-weight: initial;
          }
        }
      }
      table tbody tr {
        height: 40px;
      }
    }
  }
}
</style>
