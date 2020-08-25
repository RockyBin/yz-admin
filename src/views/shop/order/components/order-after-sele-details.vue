<template>
  <div class="order-details">
    <div class="details-head">
      <details-news :detailsList="detailsList"></details-news>
      <details-container :detailsList="detailsList" :saleId="saleId" @updateList="updateList"></details-container>
    </div>
    <Table border ref="table" :columns="columns1" :data="detailsList.products" class="sele-tble"></Table>
  </div>
</template>
<script>
import detailsNews from "./order-after-sele-details-news.vue";
import detailsContainer from "./order-after-sele-details-container.vue";
export default {
  components: {
    detailsNews,
    detailsContainer
  },
  data() {
    return {
      minWidth: 1102,
      saleId: "", // 售后订单号
      detailsList: {}, // 订单详情数据
      columns1: [
        {
          title: "商品信息",
          minWidth: 228,
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  "align-items": "center"
                }
              },
              [
                h(
                  "Div",
                  {
                    class: {
                      "small-img": true,
                    },
                  },
                  [
                    h("img", {
                      attrs: {
                        src: this.$store.state.siteComdataPath + params.row.image
                      },
                      style: {
                        width: "50px",
                        height: "50px",
                        objectFit: "contain",
                        "border-radius":"4px",
                        flexShrink: 0
                      }
                    }),
                    h(
                      "div",
                      {
                        class: "product-type",
                      },
                      params.row.is_virtual ? "虚拟" : "实物"
                    ),
                  ]
                ),
                h("div", { style: { "margin-left": "15px" } }, [
                  h("span", params.row.name),
                  h(
                    "span",
                    {
                      style: {
                        color: "#9ea7b4",
                        display: "block"
                      }
                    },
                    params.row.sku_name
                  ),
                  params.row.supplier_member_id
                    ? h("Tooltip", {
                      props: {
                        content: params.row.supplier_name,
                        maxWidth: 300,
                        transfer: true,
                        placement: "top"
                      }
                    }, [
                      h("div", {
                        class: "one-hide"
                      }, [
                        h("i", {
                          class: "iconfont icon-gonghuoshang",
                          style: {
                            color: "#41B44D",
                            marginRight: "3px",
                            verticalAlign: "-1px"
                          }
                        }),
                        h("span", {
                          style: {
                            color: "#9EA4B1"
                          }
                        }, params.row.supplier_name)
                      ]) 
                    ])
                    : h("div", {
                      style: {
                        display: "none",
                        color: "white",
                        width: "32px",
                        height: "16px",
                        lineHeight: "16px",
                        textAlign: "center",
                        backgroundColor:"#FF9900",
                        borderRadius: "3px"
                      }
                    }, "自营")
                ])
              ]
            );
          }
        },
        {
          title: "成本价",
          // key: "cost",
          align: "center",
          minWidth: 110,
          render: (h, params) => {
            return h("span", `￥${params.row.cost}`);
          }
        },
        {
          title: "单价",
          // key: "price",
          align: "center",
          minWidth: 110,
          render: (h, params) => {
            return h("span", `￥${params.row.price}`);
          }
        },
        {
          title: "数量",
          key: "refund_num",
          minWidth: 84,
          align: "center"
        },
        {
          title: "优惠",
          align: "center",
          minWidth: 110,
          // key: "preferential",
          render: (h, params) => {
            return h("span", `￥${params.row.preferential}`);
          }
        },
        {
          // title: "小计（优惠后）",
          align: "center",
          minWidth: 110,
          // key: "subtotal",
          render: (h, params) => {
            return h("span", `￥${params.row.subtotal}`);
          },
          renderHeader: (h, params) => {
            return h("div", [
              h("span", "小计"),
              h(
                "span",
                {
                  style: {
                    "font-size": "12px"
                  }
                },
                "(优惠后)"
              )
            ]);
          }
        },
        {
          title: "实付金额",
          align: "center",
          minWidth: 110,
          render: (h, params) => {
            return this.tableExpand(
              h,
              params,
              this.detailsList.actual_amount,
              "total_money",
              this.detailsList.total_refund_freight,
              this.detailsList.is_all_after_sale
            );
          }
        },
        {
          title: "申请金额",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            return this.tableExpand(h, params, this.detailsList.actual_amount);
          }
        },
        {
          title: "实退金额",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            return this.tableExpand(
              h,
              params,
              this.detailsList.real_money ? this.detailsList.real_money : "--"
            );
          }
        }
      ]
    };
  },
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被 confirm 前调用
    // 不！能！获取组件实例 `this`
    // 因为当钩子执行前，组件实例还没被创建
    next(vm => {
      vm.saleId = vm.$route.query.id;
      vm.getList();
    });
  },
  methods: {
    // 更新列表
    updateList(id) {
      this.getList(id);
    },
    tableExpand(h, params, key, status, statusKey, isShowStatus) {
      if (params.row.rowspan) {
        this.$nextTick(() => {
          this.$refs["table"].$el
            .querySelector(
              ".ivu-table-tbody tr:nth-child(" +
                (params.index + 1) +
                ") td:nth-child(" +
                (params.column._index + 1) +
                ")"
            )
            .setAttribute("rowspan", params.row.rowspan);
        });
        if (status === "total_money") {
          return h("div", [
            h(
              "div",
              (() => {
                return key > 0 ? `￥${key}` : "--";
              })()
            ),
            h(
              "div",
              isShowStatus == 1 ? "(含运费￥" + statusKey + ")" : "(不含运费)"
            )
          ]);
        } else {
          return h(
            "div",
            (() => {
              return key > 0 ? `￥${key}` : "--";
            })()
          );
        }
      } else {
        this.$nextTick(() => {
          let selectClass = `.ivu-table-tbody tr:nth-child(${params.index +
            1}) td:nth-child(${params.column._index + 1})`;
          this.$refs["table"].$el.querySelector(selectClass).style.display =
            "none";
        });
        return h("span", "");
      }
    },
    getList(id) {
      let ids = "";
      if (id) {
        ids = id;
      } else {
        ids = this.saleId;
      }
      this.$store.state.COMMON_loading = true;
      this.$httpPost("/shop/admin/aftersale/info", { id: ids }, res => {
        this.$store.state.COMMON_loading = false;
        if (res.code === 200) {
          this.detailsList = res.data;
          res.data.products.forEach((item, index) => {
            if (index === 0) {
              item.rowspan = res.data.products.length;
              this.detailsList.push(item);
            } else {
              this.detailsList.push(item);
            }
          });
        }
      });
    }
  },
  mounted() {
    if (this.minWidth) {
      let tableSelection = this.$refs["table"];
      // 销毁computed产生的监听器
      tableSelection._computedWatchers.tableHeaderStyle.teardown();
      tableSelection._computedWatchers.tableStyle.teardown();
      // 重新定义get方法，防止旧的getter方法触发
      Object.defineProperty(tableSelection, "tableHeaderStyle", {
        get() {
          return {
            minWidth: this.minWidth + "px"
          };
        },
        set() {}
      });
      Object.defineProperty(tableSelection, "tableStyle", {
        get() {
          return {
            minWidth: this.minWidth + "px"
          };
        },
        set() {}
      });
      // 重新赋值最小宽度
      tableSelection.$el.querySelector(
        ".ivu-table-header table"
      ).style.minWidth =
        this.minWidth + "px";
      tableSelection.$el.querySelector(".ivu-table-body table").style.minWidth =
        this.minWidth + "px";
    }
  }
};
</script>
<style lang="less" scoped>
.order-details {
  padding: 24px !important;
  width: 100%;
  /deep/.ivu-table-wrapper .ivu-table-border thead th {
    background: #f8f9fd;
  }
  .details-head {
    display: flex;
    align-items: stretch;
    div {
      display: inline-block;
      vertical-align: top;
    }
    div:last-child {
      width: calc(100% - 434px);
      margin-left: 16px;
    }
  }
  /deep/.small-img {
    width: 50px;
    height: 50px;
    /*display: inline-block;*/
    /*vertical-align: middle;*/
    border-radius: 4px;
    position: relative;

    .product-type {
      position: absolute;
      bottom: 0;
      width: 100%;
      line-height: 16px;
      text-align: center;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      border-radius: 0 0 4px 4px;
    }
  }
  .sele-tble {
    margin-top: 30px;
    position: relative;
    /deep/.ivu-table-border th {
      border-right: none;
    }
    /deep/.ivu-table-border td {
      height: 80px;
      font-size:12px;
      color:#657180;
    }
    /deep/.ivu-table-row-hover {
      td {
        background-color: transparent !important;
      }
    }
  }
  /deep/.is-show {
    display: none;
  }
}
</style>
