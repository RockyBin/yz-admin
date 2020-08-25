<template>
  <div class="order-shop">
    <search-list :searchParams="searchParams" :searchData="searchData" class="shop-search">
      <Button @click="onExportTableList" perm="order.view">导出</Button>
      <div
        style="display: inline-block;"
        v-show="express_status && tabNameSelect === '1'"
      >
        <Button
          @click="onSyncTableList"
          perm="order.operate"
          style="width: 82px;"
          >同步订单</Button
        >
        <Tooltip
          placement="top"
          transfer
          :max-width="300"
          style="line-height: 32px;height: 32px;vertical-align: top;"
        >
          <i
            class="iconfont icon-ios-help-circle-outl"
            style="font-size: 18px;"
          ></i>
          <div
            v-html="
              `同步商城的待发货订单到快递100后台发货；\n同步订单到快递后台后，请到快递后台发货`
            "
            slot="content"
          ></div>
        </Tooltip>
      </div>
    </search-list>
    <btn-group :data="orderType" v-model="tabNameSelect" @on-click="dataList"></btn-group>
    <order-shop-table
      :columnsData="columnsData"
      :listData="listData"
      :headData="headData"
      :loading="tableLoading"
      @backChooseData="backChooseData"
    ></order-shop-table>
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
    <order-delivery
      v-model="showModal"
      :orderDetail="order_detail"
      :order_id="order_id"
      @changeShowModal="changeShowModal"
      @closeShowModal="closeShowModal"
    ></order-delivery>
    <page-select
      v-model="pageSelectStatus"
      :title="pageSelectTitle"
      :text="pageSelectText"
      @on-select="onPageSelectConfirmClick"
    ></page-select>
  </div>
</template>

<script>
import btnGroup from "@/views/shop/components/button/btn-group.vue";
import searchList from "@/views/shop/components/search/search-list.vue";
import constants from "@/views/shop/components/constants.js";
import orderShopTable from "./components/order-shop-table.vue";
import orderDelivery from "./components/order-delivery.vue";
import pageSelect from "@/views/shop/components/modal/modal-page-select.vue";
import commonFunction from "@/views/shop/components/common-function.js";
export default {
  components: {
    btnGroup,
    searchList,
    orderShopTable,
    orderDelivery,
    pageSelect
  },
  data() {
    return {
      commonFunction,
      constants,
      tableLoading: false,
      pageSelectStatus: false,
      pageSelectType: 1,
      status: -1,//是否显示订单性质输入框
      selectTableData: [], // 选中的数据
      showModal: false, // 物流弹框
      order_id: "", // 保存订单id
      order_detail: "",
      terminalTypes: constants.terminalTypes, // 终端来源
      headData: [], // 表格每列的头部数据
      tabNameSelect: "",
      orderTypes: [
        {
          name: "全部",
          value: ""
        },
        {
          name: "待付款",
          value: "0"
        },
        {
          name: "待发货",
          value: "1"
        },
        {
          name: "待收货",
          value: "2"
        },
        {
          name: "已完成",
          value: "4,5"
        },
        {
          name: "订单取消",
          value: "8"
        },
        {
          name: "交易关闭",
          value: "6"
        }
      ],
      activity_id: this.$route.params.activity_id || null, // 拼团id，用于拼团数据跳转
      searchData: {
        // 搜索框的值
        keyword: "",
        type: -1,
        keyword_type: "0",
        nature: -1,
        terminal_type: constants.terminalSearch[0].id, // 终端类型
        times: {
          // 交易时间
          startTime: "",
          endTime: ""
        },
        express_sync_status: -1
      },
      current: 1,
      page_size: 20,
      total: 0,
      express_status: false,
      searchParams: [
        {
          type: 10,
          key: "keyword",
          prefixIcon: "ios-search",
          placeholder: {
            2: "平台名称",
            1: "昵称/姓名/手机",
            0: "订单编号"
          },
          optionKey: "keyword_type",
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
        this.hasLicensePerm("ENABLE_GROUP_BUYING")
          ? {
              type: 3,
              name: "订单类型：",
              key: "type",
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
            }
          : "",
        {
          type: 3,
          width: "65px",
          name: "终端来源：",
          key: "terminal_type",
          options: constants.terminalSearch
        },
        {
          type: 2,
          name: "下单时间：",
          showDate: true,
          key: "times"
        }
      ].filter(n => n),
      listData: [],
      columnsData: [
        {
          title: "商品信息",
          minWidth: "228px",
          width: "20%",
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
                      display: "inline-block"
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
                   params.row.sku_names && params.row.sku_names.length ?
                    h(
                      "Tooltip",
                      {
                        props: {
                          content: this.yzArrayToString(params.row.sku_names),
                          maxWidth: 300,
                          transfer: true,
                          placement: "top"
                        },
                        style: {
                          display: "block"
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
                          this.yzArrayToString(params.row.sku_names)
                        )
                      ]
                    ) : "",
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
          align: "center",
          minWidth: "100px",
          render(h, p) {
            return h("span", "￥" + p.row.price);
          }
        },
        {
          title: "数量",
          key: "num",
          minWidth: "80px",
          align: "center"
        },

        {
          title: "优惠",
          align: "center",
          minWidth: "80px",
          render(h, p) {
            return h("span", "￥" + p.row.discount);
          }
        },
        {
          title: "小计",
          align: "center",
          minWidth: "110px",
          titleLabel: "(优惠后)",
          render(h, p) {
            return h("span", "￥" + p.row.sub_total);
          }
        },
        {
          title: "订单金额",
          align: "center",
          minWidth: "126px",
          status: "order",
          showIndex: true, // 显示合并的那一列
          rowSpan: true, // 是否合并
          expandComponents: "orderGoodsComponent" // 动态组件
        },
        {
          title: "商品状态",
          // key: "status_text",
          minWidth: "90px",
          align: "center",
          render(h, p) {
            return h(
              "span",
              {
                class: {
                  "table-success":
                    (p.row.status === 4 && !p.row.after_sale_status) ||
                    p.row.status === 5 ||
                    (p.row.status === 1 && p.row.after_sale_status === 5) ||
                    (p.row.status === 6 && p.row.after_sale_status),
                  "table-error":
                    p.row.status === 8 ||
                    (p.row.status === 6 && !p.row.after_sale_status),
                  "table-warning":
                    (p.row.status === 4 &&
                      (p.row.after_sale_status ||
                        p.row.after_sale_status === 0)) ||
                    [0, 2, 3, 7].indexOf(p.row.status) !== -1 ||
                    (p.row.status === 1 && p.row.after_sale_status !== 5) ||
                    (p.row.status === 1 && p.row.type_status === 100)
                }
              },
              p.row.status_text
            );
          }
        },
        {
          title: "买家信息",
          minWidth: "160px",
          align: "center",
          showIndex: true, // 显示合并的那一列
          rowSpan: true, // 是否合并
          status: "news",
          expandComponents: "orderGoodsComponent" // 动态组件
          // isShowClass: "member-info"
        },
        // {
        //   title: "用户留言/备注",
        //   width: "200px",
        //   align: "center",
        //   status: "remark",
        //   showIndex: true, // 显示合并的那一列
        //   rowSpan: true, // 是否合并
        //   expandComponents: "orderGoodsComponent" // 动态组件
        // },
        {
          title: "操作",
          align: "center",
          width: "120px",
          minWidth: "120px",
          maxWidth: "120px",
          rowSpan: true,
          breakUp: true,
          levelData: true, // 一级数据
          render: (h, params) => {
            return h("div", [
              h(
                "div",
                {
                  attrs: {
                    perm: "order.view"
                  },
                  style: {
                    cursor: "pointer"
                  },
                  class: { "table-operation": true },
                  on: {
                    click: () => {
                      this.$router.push({
                        name: "orderShopDetail",
                        query: {
                          id: params.row.id
                        }
                      });
                    }
                  }
                },
                "查看订单"
              ),
              params.row.status != 9 &&
              params.row.can_deliver &&
              params.row.type_status != 100 &&
              params.row.supplier_member_id === 0
                ? h(
                    "div",
                    {
                      attrs: {
                        perm: "order.operate"
                      },
                      style: {
                        cursor: "pointer"
                      },
                      class: {
                        "table-operation": true
                      },
                      on: {
                        click: () => {
                          if (params.row.virtual_flag == 2) {
                            this.$router.push({
                              name: "orderDemolitionOrder",
                              query: {
                                id: params.row.id
                              }
                            });
                          } else {
                            this.order_id = params.row.id;
                            this.order_detail = params.row;
                            this.showModal = true;
                          }
                        }
                      }
                    },
                    "发货"
                  )
                : "",
              params.row.status != 9 &&
              params.row.can_deliver &&
              params.row.type_status != 100 &&
              params.row.supplier_member_id
                ? h("div", { style: "color: #ED4014;" }, "待供应商发货")
                : "",
              // 同步结果（express_sync_status > 0表明操作过同步并符合同步的条件，不用考虑是否拆单虚拟商品等）
              params.row.status === 1 &&
              !params.row.item_list.find(n => n.status !== 1) &&
              params.row.express_sync_status > 0
                ? h(
                    "div",
                    { style: "color: #ED4014;" },
                    params.row.express_sync_status === 2
                      ? "同步中"
                      : params.row.express_sync_status === 3
                      ? "同步失败"
                      : "已同步订单"
                  )
                : "",
              params.row.status === 2 &&
              !params.row.item_list.find(n =>
                [0, 1, 3, 4].includes(n.after_sale_status)
              )
                ? h(
                    "div",
                    {
                      attrs: {
                        perm: "order.operate"
                      },
                      style: {
                        cursor: "pointer"
                      },
                      class: {
                        "table-operation": true
                      },
                      on: {
                        click: () => {
                          this.$Modal.confirm({
                            title: "提示",
                            loading: true,
                            content: `代客户【${params.row.member_nickname}】，【订单编号：${params.row.id}】订单操作确认收货；确定后，将不能恢复，是否代客户确认收货？`,
                            onOk: () => {
                              this.$httpPost(
                                "/shop/admin/order/receipt",
                                {
                                  order_id: params.row.id
                                },
                                res => {
                                  this.$Modal.remove();
                                  if (res.code === 200) {
                                    this.$Message.success("收货成功");
                                    this.changePage(1);
                                  } else if (res.code === 501) {
                                    this.$Message.error(res.msg);
                                    window.setTimeout(() => {
                                      this.changePage(this.current);
                                    }, 1000);
                                  } else {
                                    this.$Message.error(res.msg);
                                  }
                                }
                              );
                            }
                          });
                        }
                      }
                    },
                    "代客确认收货"
                  )
                : ""
            ]);
          }
        }
      ],
      exportData: {} // 导出传参
    };
  },
  watch: {
    searchData: {
      handler() {
        this.current = 1;
        this.activity_id = null;
        this.getList();
      },
      deep: true
    },
    tabNameSelect(val) {
      let status = this.searchParams.findIndex(item => item.key === "nature");
      if (val && val != 0 && this.hasLicensePerm("ENABLE_SUPPLIER")) {
        status === -1 &&
          this.searchParams.splice(2, 0, {
            type: 3,
            name: "订单性质：",
            key: "nature",
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
          });
      } else {
        status === -1 ? "" : this.searchParams.splice(status, 1);
      }
      let sync = this.searchParams.findIndex(
        item => item.key === "express_sync_status"
      );
      if (this.express_status && this.tabNameSelect === "1") {
        sync === -1 &&
          this.searchParams.push({
            type: 3,
            name: "同步状态：",
            key: "express_sync_status",
            options: [
              {
                id: -1,
                value: "全部"
              },
              {
                id: 2,
                value: "已同步"
              },
              {
                id: 3,
                value: "未同步"
              },
              {
                id: 1,
                value: "同步中"
              },
              {
                id: 4,
                value: "同步失败"
              }
            ]
          });
      } else {
        sync !== -1 && this.searchParams.splice(sync, 1);
      }
    }
  },
  computed: {
    orderType() {
      if (this.searchData.type == 1) {
        let typeArr = JSON.parse(JSON.stringify(this.orderTypes));
        typeArr.splice(2, 0, {
          name: "待成团",
          value: "9"
        });
        return typeArr;
      } else {
        return this.orderTypes;
      }
    },
    pageSelectTitle() {
      return this.pageSelectType === 1 ? "导出" : "同步订单";
    },
    pageSelectText() {
      return this.pageSelectType === 1
        ? ["导出当前页面所有内容", "导出全部页面所有内容"]
        : [
            "同步当前页所有订单数据到快递100后台",
            "同步全部页面的所有订单数据快递100后台"
          ];
    }
  },
  methods: {
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
    backChooseData(data) {
      this.selectTableData = data;
    },
    closeShowModal() {
      this.showModal = false;
    },
    // 关闭发货弹窗
    changeShowModal() {
      this.showModal = false;
      this.getList();
    },
    // 匹配名称
    matchName(val, data) {
      let names = "";
      data.forEach(item => {
        if (val === item.id) {
          names = item.value;
        }
      });
      return names;
    },
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
    onPageSelectConfirmClick(val) {
      if (this.pageSelectType === 1) {
        this.exportList(val);
      } else {
        this.$Modal.confirm({
          title: "提示",
          loading: true,
          content: "是否确定把所选待发货订单同步到快递100后台发货？",
          onOk: () => {
            this.modalSyncConfirm(val);
          }
        });
      }
    },
    // 导出
    onExportTableList() {
      if (this.selectTableData.length === 0) {
        this.$Message.error("请选择要导出的内容");
        return;
      }
      this.exportData = {};
      // 导出选中的项
      if (this.listData.length > this.selectTableData.length) {
        this.exportData.ids = [];
        this.selectTableData.forEach(item => {
          this.exportData.ids.push(item);
        });
        this.commonFunction.exportTable(
          this.exportData,
          this.http,
          "/shop/admin/order/export"
        );
      } else {
        this.pageSelectStatus = true;
        this.pageSelectType = 1;
      }
    },
    // 导出当前页 0 导出所有 1
    exportList(val) {
      this.exportData.ids = [];
      if (val === 1) {
        this.exportData.show_all = 1;
        Object.assign(this.exportData, this.getSearchData());
      } else {
        this.selectTableData.forEach(item => {
          this.exportData.ids.push(item);
        });
      }
      this.commonFunction.exportTable(
        this.exportData,
        this.http,
        "/shop/admin/order/export"
      );
    },
    onSyncTableList() {
      if (this.selectTableData.length === 0) {
        this.$Message.error("请选择要同步的待发货订单");
        return;
      }
      this.exportData = {};
      // 导出选中的项
      if (this.listData.length > this.selectTableData.length) {
        this.$Modal.confirm({
          title: "提示",
          loading: true,
          content: "是否确定把所选待发货订单同步到快递100后台发货？",
          onOk: () => {
            this.exportData.ids = [];
            this.selectTableData.forEach(item => {
              this.exportData.ids.push(item);
            });
            this.syncOrder(this.exportData);
          }
        });
      } else {
        this.pageSelectStatus = true;
        this.pageSelectType = 2;
      }
    },
    // 导出当前页 0 导出所有 1
    modalSyncConfirm(val) {
      this.exportData.ids = [];
      if (val === 1) {
        this.exportData.show_all = 1;
        Object.assign(this.exportData, this.getSearchData());
      } else {
        this.selectTableData.forEach(item => {
          this.exportData.ids.push(item);
        });
      }
      this.syncOrder(this.exportData);
    },
    // 同步表格数据到快递100
    syncOrder(data) {
      this.$httpPost("/shop/admin/express/order/sync", data, res => {
        this.$Modal.remove();
        if (res.code === 200) {
          // 延时等待上一个弹窗消失
          window.setTimeout(() => {
            this.$Modal.info({
              title: "提示",
              content: "订单同步处理中，请稍后查看同步结果",
              onOk: () => {
                this.changePage(this.current);
              }
            });
          }, 300);
          
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    dataList() {
      this.current = 1;
      this.$router.replace({
        name: "orderShop",
        query: {
          tab: this.tabNameSelect
        }
      });
      this.getList();
    },
    getSearchData() {
      let obj = {};
      obj.keyword = this.searchData.keyword;
      obj.created_end = this.searchData.times.endTime;
      obj.type = this.searchData.type;
      obj.created_start = this.searchData.times.startTime;
      obj.terminal_type = this.searchData.terminal_type;
      obj.is_supplier = this.tabNameSelect &&  this.tabNameSelect != 0  && hasLicensePerm('ENABLE_SUPPLIER') ?  Number(this.searchData.nature) : -1
      obj.search_type = Number(this.searchData.keyword_type)
      if (this.tabNameSelect == 9) {
        obj.status = "1";
        obj.type_status = 100;
      } else {
        obj.status = this.tabNameSelect;
      }
      // 拼团订单
      if (this.activity_id) {
        obj.activity_id = this.activity_id;
        obj.do_pay = 1;
      }
      obj.express_sync_status =
        this.tabNameSelect !== "1" || this.searchData.express_sync_status === -1
          ? null
          : this.searchData.express_sync_status;
      return obj;
    },
    // 获取列表数据
    getList() {
      let obj = this.getSearchData();
      obj.page_size = this.page_size;
      obj.page = this.current;
      this.tableLoading = true;
      this.$httpGet("/shop/admin/order/list", obj, res => {
        if (res.code === 200) {
          this.listData = [];
          this.$nextTick(() => {
            this.total = res.data.total;
            this.page_size = res.data.page_size;
            this.current = res.data.current;
            this.listData = res.data.list;
            this.express_status = res.data.express_status;
            let arr = [];
            this.listData.forEach(item => {
              let obj = {};
              this.terminalTypes.forEach(el => {
                if (el.id === item.terminal_type) {
                  item.terminals = el.value;
                }
              });
              this.constants.orderStatus.forEach(items => {
                if (items.id === item.status) {
                  if (item.status == 1 && item.type_status == 100) {
                    item.name = "待成团";
                  } else {
                    item.name = items.value;
                  }
                }
              });
              (obj["a"] = [
                { key: "下单时间：", value: item.created_at },
                item.type == 1
                  ? { key: "总订单号：", value: item.id, tag: "多人拼团" }
                  : { key: "总订单号：", value: item.id },
                { key: "总订单状态：", value: item.name },
                { key: "终端来源：", value: item.terminals }
              ]),
                arr.push(obj);
            });
            this.headData = arr;
            this.listData.forEach(item => {
              let rowData = null;
              let indexLength = 0;
              let target = null;
              item.can_deliver = false;
              item.item_list.forEach(items => {
                if (items.group_key === rowData) {
                  indexLength++;
                } else {
                  rowData = items.group_key;
                  if (target) {
                    target.rowspan = indexLength;
                  }
                  target = items;
                  indexLength = 1;
                }
                if (items.can_deliver && item.can_deliver == false) {
                  item.can_deliver = true;
                }
                items.receiver_name = item.receiver_name;
                items.receiver_tel = item.receiver_tel;
                items.prov = item.prov;
                items.city = item.city;
                items.area = item.area;
                items.receiver_address = item.receiver_address;
              });
              if (target) {
                target.rowspan = indexLength;
              }
            });
            this.tableLoading = false;
          });
        }
      });
    }
  },
  created() {
    if (this.$route.query.tab !== undefined) {
      this.tabNameSelect = "" + this.$route.query.tab;
    }
    // 如果修改了searchData则不用手动调用getList
    if (this.$route.query.keyword) {
      this.searchData.keyword = this.$route.query.keyword;
      this.searchData.keyword_type = this.$route.query.keyword_type || '0'
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
  .shop-search {
    /deep/.data-list-search-btn {
      .ivu-btn {
        width: 58px;
      }
    }
    /deep/ .ivu-select-selected-value,
    /deep/.ivu-select-item {
      overflow: visible;
    }
    /deep/.ivu-select-arrow {
      right: 4px;
    }
    /deep/.data-list-search-item {
      margin-left: 0px;
      & > span.date-line {
        width: 6px;
      }
    }
  }
  // .shop-search {
  // background-color: #f8f9fd;
  // border-radius: 5px;
  // margin: 0px 24px 24px;
  // text-align: left;
  // padding-top: 16px;
  // padding-left: 16px;
  //}
  // .order-tab {
  //   background: #fff;
  //   /deep/.ivu-tabs-content {
  //     padding: 0 24px;
  //   }
  // }
  /deep/.is-hide {
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
  }
}
</style>
