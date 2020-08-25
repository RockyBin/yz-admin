<template>
  <div data-page="separateShipment">
    <div class="bulk-shipment">
      <Button type="primary" @click="batchDelivery">批量发货</Button>
      <RadioGroup v-model="is_virtual" v-if="order_info.virtual_flag == 2">
        <Radio :label="0">实物商品</Radio>
        <Radio :label="1">虚拟商品</Radio>
      </RadioGroup>
    </div>
    <Table
      class="my-table"
      ref="selection"
      border
      :columns="columns"
      :data="product_list"
      :rowClassName="rowClassName"
      @on-selection-change="onSelectChange"
    ></Table>

    <order-delivery
      v-model="isShowDeliverModal"
      :isReadOnly="isReadOnly"
      :is_virtual="virtualFlag"
      :logisticsInfo="currentRow"
      :orderDetail="order_info"
      :product_id="currentProductId"
      :product_ids="selectProductIds"
      @deliverSuccess="deliverSuccess"
      @deliverCanceled="deliverCanceled"
    ></order-delivery>
    <modal-logistics
      :logisticsValue="isShowLogistics"
      :iframeSrc="iframeSrc"
      @onCancel="isShowLogistics = false"
    ></modal-logistics>
  </div>
</template>
<script>
import axios from "axios";
import constants from "@/views/shop/components/constants.js";
import orderDelivery from "./cloudstock-order-delivery.vue";
import modalLogistics from "@/views/shop/components/modal/modal-logistics.vue";
import { getOrderStatus as statusMap } from "./cloudstock-config.js";
export default {
  components: {
    orderDelivery,
    modalLogistics,
  },
  data() {
    return {
      constants,
      minWidth: 1094,
      loading: false,
      order_info: {},
      isShowDeliverModal: false,
      isReadOnly: false,
      currentProductId: null, //单独发货时的商品id，可以区分单独发货与批量发货
      selectProductIds: [], //批量发货时的商品id数组
      is_virtual: 0, //0实物商品,1虚拟商品
      product_list: [],
      currentRow: null,
      virtualFlag: 0,
      isShowLogistics: false,
      iframeSrc: "",
      columns: [
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
              "div",
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
                h("div", [
                  h(
                    "div",
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
                    "div",
                    {
                      class: {
                        "right-con": true,
                      },
                    },
                    [
                      h(
                        "div",
                        {
                          class: {
                            "shop-title": true,
                          },
                        },
                        `${params.row.product_name}`
                      ),
                      h(
                        "div",
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
          render: (h, p) => {
            if (p.row.delivery_status != 0) {
              return h(
                "div",
                {
                  style: {
                    "font-size": "12px",
                  },
                },
                [
                  h(
                    "div",
                    {
                      style: {
                        display: p.row.is_virtual ? "none" : "block",
                      },
                    },
                    p.row.logistics_name
                  ),
                  p.row.is_virtual && p.row.logistics_no
                    ? h(
                        "Tooltip",
                        {
                          props: {
                            content: p.row.logistics_no,
                            placement: "top",
                            transfer: true,
                            maxWidth: 384,
                          },
                        },
                        [
                          h(
                            "div",
                            {
                              style: {
                                display: "-webkit-box",
                                "-webkit-line-clamp": "2",
                                "-webkit-box-orient": "vertical",
                                overflow: "hidden",
                                "text-overflow": "ellipsis",
                                "word-break": "break-all",
                              },
                            },
                            p.row.logistics_no
                          ),
                        ]
                      )
                    : h("div", p.row.logistics_no || "--"),
                  // h("div", [
                  //   h(
                  //     "span",
                  //     {
                  //       class: "table-operation",
                  //       attrs: {
                  //         perm: "cloudstock.order.view",
                  //       },
                  //       on: {
                  //         click: () => {
                  //           if (p.row.is_virtual) {
                  //             this.currentRow = p.row;
                  //             this.isReadOnly = true;
                  //             this.virtualFlag = 1;
                  //             this.isShowDeliverModal = true;
                  //           } else {
                  //             this.$httpGet(
                  //               "/shop/admin/logistics/info",
                  //               { id: p.row.logistics_id },
                  //               (res) => {
                  //                 if (res.code === 200) {
                  //                   this.iframeSrc = res.data.search_url;
                  //                   this.isShowLogistics = true;
                  //                 }
                  //               }
                  //             );
                  //           }
                  //         },
                  //       },
                  //     },
                  //     p.row.is_virtual ? "查看发货信息" : "查看物流"
                  //   ),
                  //   this.order_info.status !== 2
                  //     ? h(
                  //         "span",
                  //         {
                  //           class: "table-operation",
                  //           attrs: {
                  //             perm: "cloudstock.order.operate",
                  //           },
                  //           style: {
                  //             "margin-left": "15px",
                  //           },
                  //           on: {
                  //             click: () => {
                  //               this.currentRow = p.row;
                  //               this.isReadOnly = false;
                  //               this.virtualFlag = p.row.is_virtual;
                  //               this.isShowDeliverModal = true;
                  //             },
                  //           },
                  //         },
                  //         "修改"
                  //       )
                  //     : "",
                  // ]),
                ]
              );
            } else {
              return h(
                "span",
                {
                  style: {
                    "font-size": "12px",
                  },
                },
                "暂无"
              );
            }
          },
        },
        {
          title: "商品状态",
          align: "center",
          minWidth: 150,
          render: (h, p) => {
            let status = statusMap.find(
              (item) => item.value == p.row.delivery_status
            );
            return status
              ? h(
                  "span",
                  {
                    style: {
                      "font-size": "12px",
                    },
                  },
                  p.row.delivery_status_text
                )
              : h(
                  "span",
                  {
                    style: {
                      "font-size": "12px",
                    },
                  },
                  "--"
                );
          },
        },
        {
          title: "操作",
          align: "center",
          width: 150,
          render: (h, p) => {
            return p.row.delivery_status == 0 &&
              p.row.is_virtual == this.is_virtual
              ? h(
                  "span",
                  {
                    class: "table-operation",
                    style: {
                      "font-size": "12px",
                    },
                    attrs: {
                      perm: "cloudstock.order.operate",
                    },
                    on: {
                      click: () => {
                        this.currentProductId = p.row.id;
                        this.virtualFlag = p.row.is_virtual;
                        this.currentRow = null;
                        this.isShowDeliverModal = true;
                      },
                    },
                  },
                  "发货"
                )
              : h(
                  "span",
                  {
                    style: {
                      "font-size": "12px",
                    },
                  },
                  "--"
                );
          },
        },
      ],
    };
  },
  watch: {
    is_virtual(is_virtual) {
      this.selectProductIds = [];
      this.product_list.forEach((item) => {
        if (item.is_virtual != is_virtual || item.delivery_status != 0) {
          item._checked = false;
          item._disabled = true;
        } else {
          item._disabled = false;
        }
      });
      this.product_list = [...this.product_list]
    },
  },
  created() {
    this.getDeliveryInfo();
  },
  methods: {
    // 给不能发货的行指定样式
    rowClassName(row, index) {
      if (
        row.delivery_status != 0 ||
        (row.is_virtual != this.is_virtual && this.order_info.virtual_flag == 2)
      ) {
        return "row-disabled";
      }
    },
    //选中项发生变化
    onSelectChange(selection) {
      this.selectProductIds = selection.map((item) => item.id);
    },
    // 获取终端类型
    getTerminal(terminal_type) {
      return this.$constants.getConstantsValue(
        "terminalTypes",
        "id",
        terminal_type
      );
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
    batchDelivery() {
      if (this.selectProductIds.length) {
        this.currentRow = null;
        this.virtualFlag = this.is_virtual;
        this.isShowDeliverModal = true;
      } else {
        this.$Message.error("请选择要批量发货的商品");
      }
    },
    deliverSuccess() {
      if (this.currentProductId) {
        this.currentProductId = null; // 单独发货关闭弹窗时清除单独发货的标志
      }
      if(this.selectProductIds.length) {
        this.selectProductIds = [];
      }
      this.getDeliveryInfo();
    },
    deliverCanceled() {
      if (this.currentProductId) {
        this.currentProductId = null; // 单独发货关闭弹窗时清除单独发货的标志
      }
    },
    getDeliveryInfo() {
      this.$store.state.COMMON_loading = true;
      axios
        .post("/shop/admin/cloudstock/take/delivery/order/info", {
          order_id: this.$route.query.order_id,
        })
        .then((res) => {
          if (res.code == 200) {
            this.order_info = res.data.order_info;
            this.product_list = res.data.product_list;
            this.product_list.forEach((item) => {
              if (
                item.delivery_status != 0 ||
                item.is_virtual != this.is_virtual
              ) {
                item._disabled = true;
              }
            });
            if (
              this.product_list
                .filter((item) => {
                  return item.delivery_status == 0;
                })
                .every((item) => {
                  return item.is_virtual == 1;
                })
            ) {
              this.is_virtual = 1;
            } else {
              this.is_virtual = 0;
            }
            this.$nextTick(() => {
              if (this.product_list.length > 0) {
                const child_one = this.$refs["selection"].$el.querySelector(
                  ".ivu-table-body"
                );
                let htmlTeml =
                  "<div style='color:#657180;font-size:12px;padding:0px 20px;line-height:40px;border-bottom:1px solid #e8eaec;'>" +
                  `<span class="desc-line">下单时间：${
                    this.order_info.created_at
                  } </span>` +
                  `<span class="desc-line">提货单号： ${
                    this.order_info.id
                  }</span>` +
                  `<span class="desc-line">订单状态： ${
                    this.order_info.status_text
                  }</span>` +
                  "</div>";
                this.insertBefore(htmlTeml, child_one);
              }
            });
          } else {
            this.$Message.error(res.msg);
          }
        })
        .catch((err) => {
          this.$Message.error(err.message);
        })
        .finally(() => {
          this.$store.state.COMMON_loading = false;
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
@import "../../css/_color-val.less";
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
