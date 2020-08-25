<template>
  <div data-page="separateShipment">
    <div class="bulk-shipment">
      <Button type="primary" @click="bulkShipment">批量发货</Button>
      <RadioGroup v-model="is_virtual" v-if="orderInfo.virtual_flag == 2">
        <Radio :label="0">实物商品</Radio>
        <Radio :label="1">虚拟商品</Radio>
      </RadioGroup>
    </div>
    <Table
      border
      ref="selection"
      :columns="columns4"
      :data="data1"
      class="my-table"
      :rowClassName="rowClassName"
      @on-selection-change="onSelectChange"
      v-show="showTable"
    ></Table>

    <order-delivery
      v-model="showModal"
      :orderDetail="orderInfo"
      :order_id="orderInfo.id"
      :logisticsInfo="formValidate"
      @changeShowModal="changeShowModal"
      @closeShowModal="closeShowModal"
    ></order-delivery>
  </div>
</template>
<script>
import constants from "@/views/shop/components/constants.js";
import orderDelivery from "./components/order-delivery.vue";
export default {
  components: { orderDelivery },
  data() {
    return {
      id: null,
      constants,
      minWidth: 1094,
      loading: false,
      orderInfo: {},
      showModal: false,
      items: [],
      showTable: false,
      is_virtual: 0, //0实物商品,1虚拟商品
      formValidate: {
        logistics_no: "",
        logistics_company: 6,
        logistics_name: "",
      },
      data1: [],
      columns4: [
        {
          type: "selection",
          width: 39,
          align: "center",
          className: "col-selection-cell",
        },
        {
          title: "商品",
          align: "left",
          minWidth: 280,
          render: (h, params) => {
            return h(
              "Div",
              {
                class: {
                  "tab-cell": true,
                },
                style: {
                  color: "#657180",
                  "font-size": "12px",
                },
              },
              [
                h("Div", [
                  h(
                    "Div",
                    {
                      style: {
                        "background-image": `url(${
                          this.$store.state.siteComdataPath
                        }${params.row.image})`,
                      },
                      class: {
                        "small-img": true,
                      },
                    },
                    [
                      h(
                        "div",
                        {
                          class: "product-type",
                        },
                        params.row.is_virtual ? "虚拟" : "实物"
                      ),
                    ]
                  ),
                  h(
                    "Div",
                    {
                      class: {
                        "right-con": true,
                      },
                    },
                    [
                      h(
                        "Div",
                        {
                          class: {
                            "shop-title": true,
                          },
                        },
                        `${params.row.name}`
                      ),
                      h(
                        "Div",
                        {
                          class: {
                            specifications: true,
                          },
                          style: {
                            color: "#9ea7b4",
                          },
                        },
                        ((names) => {
                          let name = "规格：";
                          if (names.length > 0) {
                            names.forEach((item, index) => {
                              if (index + 1 === names.length) {
                                name += `${item}`;
                              } else {
                                name += `${item},`;
                              }
                            });
                          } else {
                            return ""
                          }
                          return name;
                        })(params.row.sku_names)
                      ),
                    ]
                  ),
                ]),
              ]
            );
          },
        },
        {
          title: "数量",
          align: "center",
          minWidth: 150,
          render: (h, params) => {
            return h(
              "span",
              {
                style: {
                  color: "#657180",
                  "font-size": "12px",
                },
              },
              params.row.num
            );
          },
        },
        {
          title: "发货信息",
          align: "center",
          key: "address",
          minWidth: 384,
          render: (h, params) => {
            if (params.row.logistics_name || params.row.logistics_no) {
              return h(
                "Div",
                {
                  style: {
                    "font-size": "12px",
                  },
                },
                [
                  h(
                    "p",
                    params.row.is_virtual ? "" : params.row.logistics_name
                  ),
                  params.row.is_virtual && params.row.logistics_no
                    ? h(
                        "Tooltip",
                        {
                          props: {
                            content: params.row.logistics_no,
                            placement: "top",
                            transfer: true,
                            maxWidth: 384,
                          },
                        },
                        [
                          h(
                            "p",
                            {
                              style: {
                                display: "-webkit-box",
                                "-webkit-line-clamp": "3",
                                "-webkit-box-orient": "vertical",
                                overflow: "hidden",
                                "text-overflow": "ellipsis",
                              },
                            },
                            params.row.logistics_no
                          ),
                        ]
                      )
                    : h("p", params.row.logistics_no || "--"),
                  // h("p", [
                  //   h(
                  //     "a",
                  //     {
                  //       props: {
                  //         href: "javascript:void(0)",
                  //       },
                  //       class: "table-operation",
                  //       on: {
                  //         click: () => {
                  //           if (params.row.is_virtual == 0) {
                  //             this.$httpGet(
                  //               "/shop/admin/logistics/info",
                  //               { id: params.row.logistics_id },
                  //               (res) => {
                  //                 if (res.code === 200) {
                  //                   this.iframeSrc = res.data.search_url;
                  //                 }
                  //               }
                  //             );
                  //             this.logisticsValue = true;
                  //           } else {
                  //             this.formValidate.isReadOnly = true;
                  //             this.formValidate.logistics_id =
                  //               params.row.logistics_id;
                  //             this.formValidate.logistics_no =
                  //               params.row.logistics_no;
                  //             this.formValidate.logistics_company =
                  //               params.row.logistics_company;
                  //             this.formValidate.logistics_name =
                  //               params.row.logistics_name;
                  //             this.formValidate.is_virtual =
                  //               params.row.is_virtual;
                  //             this.showModal = true;
                  //           }
                  //         },
                  //       },
                  //     },
                  //     params.row.is_virtual ? "查看发货信息" : "查看物流"
                  //   ),
                  //   h(
                  //     "a",
                  //     {
                  //       props: {
                  //         href: "javascript:void(0)",
                  //       },
                  //       class: "table-operation",
                  //       style: {
                  //         marginLeft: "15px",
                  //       },
                  //       on: {
                  //         click: () => {
                  //           this.formValidate.isReadOnly = false;
                  //           this.formValidate.logistics_id =
                  //             params.row.logistics_id;
                  //           this.formValidate.logistics_no =
                  //             params.row.logistics_no;
                  //           this.formValidate.logistics_company =
                  //             params.row.logistics_company;
                  //           this.formValidate.logistics_name =
                  //             params.row.logistics_name;
                  //           this.formValidate.is_virtual =
                  //             params.row.is_virtual;
                  //           this.showModal = true;
                  //         },
                  //       },
                  //     },
                  //     "修改"
                  //   ),
                  // ]),
                ]
              );
            } else {
              return h(
                "Div",
                {
                  style: {
                    color: "#657180",
                    "font-size": "12px",
                  },
                },
                "暂无"
              );
            }
          },
        },
        {
          title: "订单状态",
          align: "center",
          minWidth: 150,
          render: (h, params) => {
            const statusName = this.getStatu(params.row.status);
            return h(
              "span",
              {
                class: {
                  "table-success": [3, 4, 5].includes(
                    Number(params.row.status)
                  ),
                  "table-warning": [0, 1, 2].includes(
                    Number(params.row.status)
                  ),
                  "table-error": [-1, 6, 7, 8].includes(
                    Number(params.row.status)
                  ),
                },
              },
              this.isShowafterSele(
                params.row.after_sale_status,
                params.row.after_sale_type,
                params.row.status
              )
            );
          },
        },
        {
          title: "操作",
          align: "center",
          width: 150,
          render: (h, params) => {
            return h(
              "a",
              {
                on: {
                  click: () => {
                    if (!params.row._disabled) {
                      this.formValidate.items = params.row.id;
                      this.formValidate.logistics_id = "";
                      this.formValidate.logistics_no = "";
                      this.formValidate.logistics_company = params.row
                        .is_virtual
                        ? 0
                        : 6;
                      this.formValidate.logistics_name = params.row.is_virtual
                        ? "虚拟商品物流"
                        : "";
                      this.formValidate.is_virtual = params.row.is_virtual;
                      this.showModal = true;
                    }
                  },
                },
                props: {
                  href: "javascript:void(0)",
                },
                class: {
                  linki: params.row._disabled,
                  "table-operation": true,
                },
                style: {
                  "font-size": "12px",
                },
              },
              params.row._disabled ? "/" : "发货"
            );
          },
        },
      ],
    };
  },
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被 confirm 前调用
    // 不！能！获取组件实例 `this`
    // 因为当钩子执行前，组件实例还没被创建
    next((vm) => {
      vm.id = vm.$route.query.id;
      vm.getSeparateShipmentList();
    });
  },
  watch: {
    is_virtual(is_virtual) {
      this.items = [];
      this.data1.forEach((item) => {
        if (item.is_virtual != is_virtual || !item.can_deliver) {
          item._checked = false;
          item._disabled = true;
        } else {
          item._disabled = false;
        }
      });
      this.data1 = [...this.data1]
    },
  },
  methods: {
    // 给不能发货的行指定样式
    rowClassName(row, index) {
      if (
        !row.can_deliver ||
        (row.is_virtual != this.is_virtual && this.orderInfo.virtual_flag == 2)
      ) {
        return "row-disabled";
      }
    },
    // 售后状态存在显示售后装填， 否则显示订单状态
    isShowafterSele(afterSeleStatus, afterSeleType, val) {
      if (afterSeleStatus !== null) {
        let name = "";
        if (afterSeleType === 0) {
          name = "退款";
        } else {
          name = "退货";
        }
        // 退款或退货成功
        let newName = "";
        if (afterSeleStatus === 5) {
          newName =
            name + this.matchName(afterSeleStatus, this.constants.refundStatus);
        } else {
          newName =
            this.matchName(afterSeleStatus, this.constants.refundStatus) + name;
        }
        return newName;
      } else {
        return this.matchName(val, this.constants.orderStatus);
      }
    },
    // 匹配名称
    matchName(val, data) {
      let names = "";
      data.forEach((item) => {
        if (val === item.id) {
          names = item.value;
        }
      });
      return names;
    },
    // 批量发货
    bulkShipment() {
      if (this.items.length > 0) {
        this.formValidate.logistics_id = "";
        this.formValidate.logistics_no = "";
        this.formValidate.logistics_name = "";
        this.formValidate.items = this.items.toString();
        this.formValidate.is_virtual = this.is_virtual;
        this.formValidate.logistics_company = this.is_virtual ? 0 : 6;
        this.formValidate.logistics_name = this.is_virtual
          ? "虚拟商品物流"
          : "";
        this.showModal = true;
      } else {
        this.$Message.error("请选择要批量发货的商品");
      }
    },
    closeShowModal() {
      this.showModal = false;
    },
    // 关闭发货弹窗
    changeShowModal() {
      this.items = [];
      this.showModal = false;
      this.getSeparateShipmentList();
    },
    //选中项发生变化
    onSelectChange(selection) {
      this.items = selection.map((item) => item.id);
    },
    // 获取终端类型
    getTerminal(terminal_type) {
      return this.$constants.getConstantsValue(
        "terminalTypes",
        "id",
        terminal_type
      );
    },
    // 获取订单状态
    getStatu(status) {
      return this.$constants.getConstantsValue("orderStatus", "id", status);
    },
    //某个元素前插入
    insertBefore(newElement, targetElement) {
      // targetElement = SeeUtils.getElObj(targetElement); // hmtl
      if (targetElement == null) {
        return void 0;
      }

      var parent = targetElement.parentNode;
      if (parent.headElm) {
        parent.removeChild(parent.headElm);
      }
      // 如果最后的节点是目标元素，则直接添加
      if (typeof newElement === "string") {
        var temp = document.createElement("div");
        temp.innerHTML = newElement;
        // 防止元素太多 进行提速
        var frag = document.createDocumentFragment();
        while (temp.firstChild) {
          parent.headElm = temp.firstChild;
          frag.appendChild(temp.firstChild);
        }
        parent.insertBefore(frag, targetElement);
      } else {
        parent.headElm = newElement;
        parent.insertBefore(newElement, targetElement);
      }
    },
    getSeparateShipmentList() {
      this.$httpGet("/shop/admin/order/info", { id: this.id }, (res) => {
        if (res.code === 200) {
          this.orderInfo = res.data;
          this.data1 = [];
          if (res.data.item_list.length > 0) {
            if (
              res.data.item_list
                .filter((item) => {
                  return item.can_deliver;
                })
                .every((item) => {
                  return item.is_virtual == 1;
                })
            ) {
              this.is_virtual = 1;
            }
            res.data.item_list.forEach((item) => {
              if (!item.can_deliver || item.is_virtual != this.is_virtual) {
                item._disabled = true;
              }
              item.receiver_name = res.data.receiver_name;
              item.receiver_tel = res.data.receiver_tel;
              item.prov = res.data.address.prov_text;
              item.city = res.data.address.city_text;
              item.area = res.data.address.area_text;
              item.receiver_address = res.data.receiver_address;
              this.data1.push(item);
            });
            this.showTable = true;
            // if (this.orderInfo.virtual_flag == 2) {
            //   //实物虚拟商品混合的订单不显示复选框
            //   setTimeout(() => {
            //     window.$(".col-selection-cell .ivu-checkbox-wrapper").hide();
            //   }, 100);
            // }
            this.$nextTick(() => {
              if (this.data1.length > 0) {
                const child_one = this.$refs["selection"].$el.querySelector(
                  ".ivu-table-body"
                );
                let htmlTeml =
                  "<div style='color:#657180;font-size:12px;padding:0px 20px;line-height:40px;border-bottom:1px solid #e8eaec;'>" +
                  `<span class="desc-line">下单时间：${
                    this.orderInfo.created_at
                  } </span>` +
                  `<span class="desc-line">总订单号： ${
                    this.orderInfo.id
                  }</span>` +
                  `<span class="desc-line">总订单状态： ${this.getStatu(
                    this.orderInfo.status
                  )}</span>` +
                  `<span class="desc-line">终端来源： ${this.getTerminal(
                    this.orderInfo.terminal_type
                  )}</span>` +
                  "</div>";
                this.insertBefore(htmlTeml, child_one);
              }
            });
          }
        }
      });
    },
  },
  mounted() {
    if (this.minWidth) {
      let tableSelection = this.$refs["selection"];
      // 销毁computed产生的监听器
      tableSelection._computedWatchers.tableHeaderStyle.teardown();
      tableSelection._computedWatchers.tableStyle.teardown();
      // 重新定义get方法，防止旧的getter方法触发
      Object.defineProperty(tableSelection, "tableHeaderStyle", {
        get() {
          return {
            minWidth: this.minWidth + "px",
          };
        },
        set() {},
      });
      Object.defineProperty(tableSelection, "tableStyle", {
        get() {
          return {
            minWidth: this.minWidth + "px",
          };
        },
        set() {},
      });
      // 重新赋值最小宽度
      tableSelection.$el.querySelector(
        ".ivu-table-header table"
      ).style.minWidth = this.minWidth + "px";
      tableSelection.$el.querySelector(".ivu-table-body table").style.minWidth =
        this.minWidth + "px";
    }
  },
};
</script>
<style lang="less" scoped>
@import "../css/_color-val.less";
[data-page="separateShipment"] {
  padding: 24px;
  /deep/.ivu-table-wrapper {
    .ivu-table-border {
      thead {
        th {
          background: #f8f9fd;
        }
      }
    }
  }
  /deep/.bulk-shipment {
    margin-bottom: 20px;
    .ivu-btn-primary {
      height: 34px;
      font-size: 14px;
      margin-right: 12px;
    }
    .ivu-radio-wrapper {
      margin-right: 20px;
    }
  }
  /deep/.ivu-table th {
    border-right: none !important;
  }
  /deep/.specifications {
    text-align: left;
  }
  /deep/.tab-cell {
    padding: 15px 0;
  }
  /deep/.col-selection-cell {
    border-right: 0;
    .ivu-table-cell {
      padding-left: 13.5px;
      padding-right: 13.5px;
    }
  }
  /deep/.hidden {
    display: none;
  }
  /deep/.small-img {
    width: 50px;
    height: 50px;
    display: inline-block;
    vertical-align: middle;
    background-size: contain;
    background-position: center;
    border-radius: 5px;
    position: relative;

    .product-type {
      position: absolute;
      bottom: 0;
      width: 100%;
      line-height: 16px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      text-align: center;
      border-radius: 0 0 5px 5px;
    }
  }
  /deep/.link {
    color: @primary-color;
  }
  /deep/.right-con {
    display: inline-block;
    vertical-align: middle;
    width: calc(100% - 65px);
    margin-left: 15px;
  }
  /deep/.error-msg {
    border: 1px solid @error-color;
    padding: 1px 2px;
    color: @error-color;
  }
  /deep/.success-msg {
    border: 1px solid @success-color;
    padding: 1px 2px;
    color: @success-color;
  }
  /deep/.warn-msg {
    border: 1px solid @warning-color;
    padding: 1px 2px;
    color: @warning-color;
  }
  /deep/.desc-line {
    margin-right: 30px;
  }
  /deep/.shop-title {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    margin-bottom: 10px;
    text-align: left;
  }
  /deep/.row-disabled {
    td {
      background: rgba(248, 248, 249, 1);
    }
  }
  /deep/.linki {
    color: #657180;
  }
}
.modal {
  /deep/.delivery {
    width: 343px;
    background: #f5f6f7;
    padding: 16px;
    p:nth-child(1) {
      margin-bottom: 10px;
      font-weight: bold;
      font-size: 13px;
      line-height: 16px;
    }
    p:nth-child(2) {
      line-height: 32px;
    }
  }
  /deep/.ivu-modal {
    /deep/.ivu-modal-body {
      padding: 24px;
    }
  }
}
</style>
