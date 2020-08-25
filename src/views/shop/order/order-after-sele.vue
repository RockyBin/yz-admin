<template>
  <div class="order-shop">
    <search-list :searchParams="searchParams" :searchData="searchData" class="shop-search">
      <Button @click="onExportTableList" perm="order.after-sale.view">导出</Button>
    </search-list>
    <btn-group :data="orderTypes" v-model="tabNameSelect" @on-click="dataList"></btn-group>
    <row-table
      :columnsData="columnsData"
      :listData="listData"
      :loading="tableLoading"
      :headData="headData"
      @backChooseData="backChooseData"
      :idName="idName"
    ></row-table>
    <div class="bar-pager">
      <Page
        v-if="total > 0"
        :total="total"
        :current="current"
        :page-size="page_size"
        @on-change="changePage"
        @on-page-size-change="changePageSize"
        show-sizer
        show-elevator
        class="page-style"
        :transfer="true"
      />
    </div>
    <!-- </Tabs> -->
    <order-model
      :isShowModal="isShowModal"
      :formItem="formItem"
      :amountPay="amountPay"
      :types="types"
      :status="afterStatus"
      :buttonLoading="buttonLoading"
      :detail="detail"
      :productList="detail.item_list"
      @cancelButton="cancelButton"
      @confrimButton="confrimButton"
    ></order-model>
    <export-modal
      :tableListExportStatus="tableListExportStatus"
      @exportList="exportList"
      @cancelExportList="cancelExportList"
    ></export-modal>
  </div>
</template>

<script>
import btnGroup from "@/views/shop/components/button/btn-group.vue";
import searchList from "@/views/shop/components/search/search-list.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import constants from "@/views/shop/components/constants.js";
import rowTable from "@/views/shop/components/table/row-table.vue";
import exportModal from "@/views/shop/components/export/export-modal.vue";
import commonFunction from "@/views/shop/components/common-function.js";
import orderModel from "./components/order-model.vue";
export default {
  components: {
    btnGroup,
    searchList,
    commonTable,
    rowTable,
    commonFunction,
    orderModel,
    exportModal
  },
  data() {
    return {
      buttonLoading: false,
      tableLoading: false,
      idName: "after_sale_id",
      page_size: 10,
      current: 1,
      total: 0,
      formItem: {
        refundStatus: 1, // 退款状态
        refundAmount: 0,
        about: "" // 备注
      },
      types: 0, // 退货或退款
      amountPay: "", // 实付金额
      afterSaleId: "", // 当前售后id
      afterStatus: 1, // 当前的售后状态
      isShowModal: false,
      detail: "", //某行数据的详细内容
      terminalTypes: constants.terminalTypes, // 终端来源
      headData: [],
      tabNameSelect: "",
      orderTypes: [
        {
          name: "全部",
          value: ""
        },
        {
          name: "申请退款",
          value: "1"
        },
        {
          name: "申请退货",
          value: "2"
        },
        {
          name: "等待买家退货",
          value: "3"
        },
        {
          name: "等待卖家收货",
          value: "4"
        },
        {
          name: "已收货待退款",
          value: "6"
        },
        {
          name: "退款成功",
          value: "5"
        },
        {
          name: "审核不通过",
          value: "7"
        },
        {
          name: "退款关闭",
          value: "8"
        }
      ],
      searchData: {
        // 搜索框的值
        keyword: "",
        //搜索类型
        search_type: "0",
        order_type:-1,
        terminal_type: constants.terminalSearch[0].id, // 终端类型
        times: {
          // 交易时间
          startTime: "",
          endTime: ""
        },
        applyTimes: {
          // 交易时间
          startTime: "",
          endTime: ""
        },
        //订单性质
        is_supplier: -1
      },
      searchParams: [
        {
          type: 10,
          key: "keyword",
          prefixIcon: "ios-search",
          placeholder: {
            0: "订单编号",
            1: "昵称/姓名/手机",
            2: "平台名称"
          },
          optionWidth: 80,
          optionKey: "search_type",
          options: [
            {
              id: "0",
              value: "订单号"
            },
            {
              id: "1",
              value: "买家"
            },
            this.hasLicensePerm("ENABLE_SUPPLIER") ? {
              id: "2",
              value: "供应平台"
            } : null
          ].filter(item => item)
        },
        this.hasLicensePerm("ENABLE_GROUP_BUYING") ? {
          type: 3,
          name: "订单类型：",
          key: "order_type",
          options: [
            {
              id: -1,
              value: "全部"
            },
            {
              id: 0,
              value: " 普通订单"
            },
            {
              id: 1,
              value: " 多人拼团"
            }
          ]
        } : null,
        {
          type: 3,
          name: "终端来源：",
          key: "terminal_type",
          options: constants.terminalSearch
        },
        {
          type: 2,
          name: "申请时间：",
          width: "65px",
          showDate: true,
          key: "applyTimes"
        },
        this.hasLicensePerm("ENABLE_SUPPLIER") ? {
          type: 3,
          name: "订单性质：",
          key: "is_supplier",
          options: [
            {
              id: -1,
              value: "全部"
            },
            {
              id: 0,
              value: " 自营订单"
            },
            {
              id: 1,
              value: " 供应商订单"
            }
          ]
        } : null
      ].filter(item => item),
      afterSeleReason: [
        {
          id: 0,
          value: "发错货/少件/空包/包装破损"
        },
        {
          id: 1,
          value: "商品质量问题"
        },
        {
          id: 2,
          value: "实物与商品描述不符"
        },
        {
          id: 3,
          value: "买卖双方协商一致"
        },
        {
          id: 4,
          value: "不喜欢/不想要"
        },
        {
          id: 5,
          value: "未按约定时间发货"
        },
        {
          id: 6,
          value: "快递/物流一直未送到"
        },
        {
          id: 7,
          value: "货物破损已拒签"
        },
        {
          id: 8,
          value: "产品质量存在问题"
        },
        {
          id: 9,
          value: "效果与描述不符"
        }
      ],
      afterSeleStatus: [
        {
          value: "",
          name: "所有"
        },
        {
          value: -1,
          name: "取消"
        },
        {
          value: 0,
          name: "申请中"
        },
        {
          value: 1,
          name: "待发货"
        },
        {
          value: 2,
          name: "拒绝"
        },
        {
          value: 3,
          name: "买家已发货"
        },
        {
          value: 4,
          name: "卖家已收货"
        },
        {
          value: 5,
          name: "完成"
        }
      ],
      listData: [],
      columnsData: [
        {
          title: "商品信息",
          width: "20%",
          minWidth: "228px",
          padding: "5px 10px 5px 15px",
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  position: "relative",
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
                h(
                  "div",
                  {
                    style: {
                      width: "calc(100% - 80px)",
                      "margin-left": "16px",
                      display: "inline-block",
                      "vertical-align": "top"
                    }
                  },
                  [
                    h("div", [
                      h(
                        "Tooltip",
                        {
                          props: {
                            content: params.row.name,
                            maxWidth: 300,
                            transfer: true,
                            placement: "top"
                          }
                        },
                        [
                          h(
                            "span",
                            {
                              class: {
                                "two-hide": true
                              }
                            },
                            params.row.name
                          )
                        ]
                      )
                    ]),
                  params.row.sku_names ? 
                   h(
                      "Tooltip",
                      {
                        style: {
                          height: "17px",
                          display: "block",
                        },
                        props: {
                          content: params.row.sku_names,
                          maxWidth: 300,
                          transfer: true,
                          placement: "top"
                        }
                      },
                      [
                        h(
                          "span",
                          {
                            style: {
                              color: "#9ea7b4"
                            },
                            class: {
                              "one-hide": true
                            }
                          },
                          params.row.sku_names
                        )
                      ]
                    ) : '',
                    params.row.supplier_member_id
                    ? h("Tooltip", {
                      props: {
                        content: params.row.supplier_name,
                        maxWidth: 300,
                        transfer: true,
                        placement: "top"
                      },
                      style:{
                        height: "24px"
                      }
                    }, [
                      h("div", {}, [
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
                        display: "none", //暂时隐藏自营标志
                        color: "white",
                        width: "32px",
                        height: "16px",
                        lineHeight: "16px",
                        textAlign: "center",
                        backgroundColor:"#FF9900",
                        borderRadius: "3px"
                      }
                    }, "自营")
                  ]
                )
              ]
            );
          }
        },
        {
          title: "单价",
          // key: "price",
          align: "center",
          minWidth: "100px",
          render: (h, params) => {
            return h("span", {}, "￥" + params.row.price);
          }
        },
        {
          title: "数量",
          key: "after_sale_item_num",
          align: "center",
          minWidth: "80px"
        },
        {
          title: "优惠",
          align: "center",
          minWidth: "80px",
          // key: "preferential",
          render: (h, params) => {
            return h("span", {}, "￥" + params.row.preferential);
          }
        },
        {
          title: "小计",
          align: "center",
          minWidth: "110px",
          titleLabel: "(优惠后)",
          // key: "subtotal",
          render: (h, params) => {
            return h("span", {}, "￥" + params.row.subtotal);
          }
        },
        {
          title: "实付金额",
          align: "center",
          minWidth: "126px",
          levelData: true,
          showIndex: true, // 显示合并的那一列
          rowSpan: true, // 是否合并
          tooltip:
            '当订单使用了优惠券，并部分商品发生售后时，可能会产生"商品小计之和"与"实付金额"有¥0.01的误差。',
          render: (h, params) => {
            return h("div", [
              h("div", "￥" + params.row.actual_amount),
              h(
                "div",
                params.row.is_all_after_sale == 1
                  ? "(含运费￥" + params.row.total_refund_freight + ")"
                  : "(不含运费)"
              )
            ]);
          }
        },
        {
          title: "退款金额",
          align: "center",
          minWidth: "160px",
          levelData: true,
          showIndex: true, // 显示合并的那一列
          rowSpan: true, // 是否合并
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  display: "inline-block",
                  "text-align": "left"
                  // paddingLeft: "20px"
                }
              },
              [
                h("div", "申请退款：￥" + params.row.actual_amount),
                h(
                  "div",
                  "实际退款：￥" +
                    (params.row.real_money && params.row.real_money !== null
                      ? params.row.real_money
                      : "--")
                )
              ]
            );
          }
        },
        // {
        //   title: "申请原因",
        //   align: "center",
        //   minWidth: "120px",
        //   levelData: true,
        //   showIndex: true, // 显示合并的那一列
        //   rowSpan: true, // 是否合并
        //   render: (h, params) => {
        //     return h(
        //       "span",
        //       commonFunction.matchName(params.row.reason, this.afterSeleReason)
        //     );
        //   }
        // },
        {
          title: "买家信息",
          align: "center",
          minWidth: "160px",
          padding: "0 10px 0 15px",
          levelData: true,
          showIndex: true, // 显示合并的那一列
          rowSpan: true, // 是否合并
          render: (h, params) => {
            return h(
              "div",
              {
                class: "order-after-sele-table-buyer",
                attrs: {
                  perm: "member.detail.view"
                },
                on: {
                  click: () => {
                    this.$router.push({
                      name: "memberDetail",
                      query: {
                        id: params.row.member_id
                      }
                    });
                  }
                }
              },
              [
                h("div", "昵称：" + params.row.nickname),
                  params.row.name?h("div", "姓名：" + params.row.name):h("div", "姓名：--"),
                h("div", "手机号：" + params.row.mobile)
              ]
            );
          }
        },
        {
          title: "操作",
          align: "center",
          width: "120px",
          minWidth: "120px",
          maxWidth: "120px",
          levelData: true,
          showIndex: true, // 显示合并的那一列
          rowSpan: true, // 是否合并
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  attrs: {
                    perm: "order.after-sale.view"
                  },
                  class: { "table-operation": true },
                  on: {
                    click: () => {
                      this.afterSaleId = params.row.after_sale_id;
                      this.urlRouter();
                    }
                  }
                },
                "查看详情"
              ),
              h(
                "span",
                {
                  attrs: {
                    perm: "finance.operate"
                  },
                  style: {
                    marginLeft: "5px",
                    display:
                      params.row.after_sale_status === 1 ||
                      params.row.after_sale_status === 6 ||
                      params.row.after_sale_status === 2
                        ? "block"
                        : "none"
                  },
                  class: {
                    "table-operation": true
                  },
                  on: {
                    click: () => {
                      this.afterSaleId = params.row.after_sale_id;
                      this.amountPay = params.row.actual_amount;
                      this.types = params.row.after_sale_type;
                      this.afterStatus = params.row.after_sale_status;
                      this.isShowModal = true;
                      this.detail = params.row;
                    }
                  }
                },
                "审核"
              )
            ]);
          }
        }
      ],
      selectTableData: [], // 选中的数据
      tableListExportStatus: false,
      exportData: {}, // 导出传参
      commonFunction
    };
  },
  watch: {
    searchData: {
      handler() {
        this.current = 1;
        this.getList();
      },
      deep: true
    }
  },
  methods: {
    // 分页
    changePage(val) {
      this.current = val;
      this.getList();
    },
    // 条数
    changePageSize(val) {
      this.current = 1;
      this.page_size = val;
      this.getList();
    },
    // 确认
    confrimButton() {
      let obj = {};
      obj.status = this.formItem.refundStatus;
      obj.id = this.afterSaleId;
      if (this.formItem.refundStatus === 1) {
        obj.money = this.formItem.refundAmount;
        this.refundFunction(obj);
      } else {
        obj.refuse_msg = this.formItem.about;
        this.refundFunction(obj);
      }
    },
    // 退款
    refundFunction(obj) {
      this.buttonLoading = true;
      this.$httpPost("/shop/admin/aftersale/edit", obj, res => {
        if (res.code === 200) {
          this.$Message.success("提交成功");
          this.getList();
        } else {
          this.$Message.error(res.msg);
        }
        this.isShowModal = false;
        this.buttonLoading = false;
      });
    },
    // 取消
    cancelButton() {
      this.isShowModal = false;
    },
    // 跳转页面
    urlRouter() {
      this.$router.push({
        name: "orderAfterSeleDetails",
        query: { id: this.afterSaleId }
      });
    },
    backChooseData(data) {
      this.selectTableData = data;
    },
    // 导出
    onExportTableList() {
      if (this.selectTableData.length === 0) {
        this.$Message.error("请选择要导出的内容");
        return;
      }
      this.exportData = {};
      if (this.listData.length > this.selectTableData.length) {
        this.exportData.ids = [];
        this.selectTableData.forEach(item => {
          this.exportData.ids.push(item);
        });
        this.commonFunction.exportTable(
          this.exportData,
          this.http,
          "/shop/admin/aftersale/export"
        );
      } else {
        this.tableListExportStatus = true;
      }
    },
    // 取消导出
    cancelExportList() {
      this.tableListExportStatus = false;
    },
    // 导出当前页 0 导出所有 1
    exportList(val) {
      this.exportData.ids = [];
      if (val === 1) {
        this.exportData.show_all = 1;
        Object.assign(this.exportData, this.postData());
      } else {
        this.selectTableData.forEach(item => {
          this.exportData.ids.push(item);
        });
      }
      this.commonFunction.exportTable(
        this.exportData,
        this.http,
        "/shop/admin/aftersale/export"
      );
      this.tableListExportStatus = false;
    },
    dataList() {
      this.current = 1;
      let queryData = {
        name: "orderAfterSele",
        query: {
          tab: this.tabNameSelect
        }
      };
      if (this.$route.query.id) {
        queryData.query.id = this.$route.query.id;
      }
      this.$router.replace(queryData);
      this.getList();
    },
    //  处理提交数据
    postData() {
      let obj = {};
      obj.keyword = this.searchData.keyword;
      obj.search_type = this.searchData.search_type;
      obj.order_type = this.searchData.order_type;
      obj.order_created_at_end = this.searchData.times.endTime;
      obj.order_created_at_start = this.searchData.times.startTime;
      obj.after_sale_created_at_end = this.searchData.applyTimes.endTime;
      obj.after_sale_created_at_start = this.searchData.applyTimes.startTime;
      obj.terminal_type = this.searchData.terminal_type;
      obj.is_supplier = this.searchData.is_supplier;
      obj.after_sale_status = this.tabNameSelect;
      return obj;
    },
    // 获取列表数据
    getList() {
      let obj = this.postData();
      obj.page = this.current;
      obj.page_size = this.page_size;
      this.tableLoading = true;
      this.$httpPost("/shop/admin/aftersale/list", obj, res => {
        if (res.code === 200) {
          this.listData = [];
          this.$nextTick(() => {
            this.tableLoading = false;
            this.listData = res.data.list;
            this.total = res.data.total;
            this.page_size = res.data.page_size;
            this.current = res.data.current;
            let arr = [];
            this.listData.forEach(item => {
              let obj = {};
              this.terminalTypes.forEach(el => {
                if (el.id === item.terminal_type) {
                  item.terminals = el.value;
                }
              });
              (obj["a"] = [
                { key: "申请时间：", value: item.after_sale_created_at },
                { key: "售后订单号：", value: item.after_sale_id },
                item.order_type==1?{ key: "总订单号：", value: item.order_id ,tag:"多人拼团"}:{ key: "总订单号：", value: item.order_id},
                { key: "售后状态：", value: item.status_text },
                { key: "终端来源：", value: item.terminals },
                {
                  key: "申请原因：",
                  value: commonFunction.matchName(
                    item.reason,
                    this.afterSeleReason
                  )
                }
              ]),
                arr.push(obj);
            });
            this.headData = arr;
          });
        }
      });
    }
  },
  created() {
    if (this.$route.query.id) {
      this.afterSaleId = this.$route.query.id;
      this.isShowModal = true;
    }
    if (this.$route.query.tab) {
      this.tabNameSelect = this.$route.query.tab;
    }
    // 如果修改了searchData则不用手动调用getList
    if (this.$route.query.keyword) {
      this.searchData.keyword = this.$route.query.keyword;
      this.searchData.search_type = this.$route.query.search_type || '0'
    } else {
      this.getList();
    }
  }
};
</script>

<style lang="less" scoped>
.order-shop {
  padding: 24px 24px 0;
  height: 100%;
  overflow: auto;
  //.shop-search {
  // background-color: #f8f9fd;
  // border-radius: 5px;
  // margin: 0px 24px 24px;
  // text-align: left;
  // padding-top: 16px;
  // padding-left: 16px;
  //}
  /deep/.order-after-sele-table-buyer {
    display: inline-block;
    text-align: left;
    cursor: pointer;
  }
  // .order-tab {
  //   background: #fff;
  //   /deep/.ivu-tabs-content {
  //     padding: 24px 24px 0;
  //   }
  // }
  /deep/.is-show {
    display: none;
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
  /deep/.row-table {
    thead {
      tr {
        height: 0 !important;
      }
    }

    .tobdy-margin::before {
      margin-bottom: 10px !important;
    }

    .container-padding {
      padding: 7px 0;
    }
  }
}
</style>
