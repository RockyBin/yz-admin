<template>
  <div class="finance-manage">
    <search-list :searchParams="searchParams" :searchData="searchData" class="marketing-search">
      <Button @click="onExportTableList" perm="commission.view">导出</Button>
    </search-list>
    <btn-group :data="filterData" v-model="status" @on-click="clickTabs"></btn-group>
    <!-- <Tabs :value="status" @on-click="clickTabs">
      <TabPane label="全部" name="-1"></TabPane>
      <TabPane label="预计发放佣金" name="1"></TabPane>
      <TabPane label="已发放佣金" name="3"></TabPane>
      <TabPane label="失效佣金" name="2"></TabPane>
    </Tabs>-->
    <row-table
      :columnsData="financeManageColumns"
      :listData="tableListData"
      :loading="tableLoading"
      :headData="headData"
      @backChooseData="backChooseData"
    ></row-table>
    <div class="bar-pager">
      <Page
        v-if="total > 0"
        :total="total"
        :current="currentPage"
        :page-size="pageSize"
        @on-change="changePage"
        @on-page-size-change="changePageSize"
        show-sizer
        show-elevator
        class="page-style"
        :transfer="true"
      />
    </div>
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
import rowTable from "@/views/shop/components/table/row-table.vue";
import constants from "@/views/shop/components/constants.js";
import commonFunction from "@/views/shop/components/common-function.js";
import exportModal from "@/views/shop/components/export/export-modal.vue";
const filterData = [
  {
    name: "全部",
    value: "-1"
  },
  {
    name: "预计发放佣金",
    value: "1"
  },
  {
    name: "已发放佣金",
    value: "3"
  },
  {
    name: "失效佣金",
    value: "2"
  }
];

export default {
  components: {
    btnGroup,
    searchList,
    rowTable,
    exportModal
  },
  data() {
    return {
      ids: [], // 选中数据
      tableLoading: false,
      tableListExportStatus: false,
      commonFunction,
      exportData: {}, // 导出传参
      constants,
      filterData,
      headData: [
        {
          value: "",
          name: "下单时间："
        },
        {
          value: "",
          name: "总订单号："
        },
        {
          value: "",
          name: "总订单状态："
        },
        {
          value: "",
          name: "终端来源："
        }
      ],
      status: filterData.findIndex(n => n.value === this.$route.query.tab) > -1 ? this.$route.query.tab : "-1",
      searchData: {
        // 优惠券搜索框的值
        keyword: "",
        terminal_type: constants.terminalSearch[0].id,
        times: {
          // 交易时间
          startTime: "",
          endTime: ""
        }
      },
      total: 1, // 总数量
      currentPage: 1, // 当前页
      pageSize: 10, // 当前页数量
      searchParams: [
        {
          type: 1,
          key: "keyword",
          placeholder: "订单号/昵称/手机号",
          prefixIcon: "ios-search"
        },
        {
          type: 3,
          name: "终端来源：",
          width: "67px",
          key: "terminal_type",
          options: constants.terminalSearch
        },

        {
          type: 2,
          name: "下单时间：",
          showDate: true,
          key: "times"
        }
      ],
      // financeManageData: [], // 表格数据
      financeManageColumns: [
        {
          title: "商品信息",
          minWidth: "240px",
          width: "20%",
          padding: "0 10px 0 15px",
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  position: "relative",
                  display: "flex",
                  "align-items": "Center"
                }
              },
              [
                h("img", {
                  attrs: {
                    src: this.$store.state.siteComdataPath + params.row.image
                  },
                  style: {
                    display: "inline-block",
                    width: "50px",
                    height: "50px",
                    objectFit: "contain"
                  }
                }),
                h(
                  "div",
                  {
                    style: {
                      width: "calc(100% - 86px)",
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
                            placement: "top"
                          }
                        },
                        [
                          h(
                            "span",
                            {
                              style: {
                                overflow: "hidden",
                                "text-overflow": "ellipsis",
                                display: "-webkit-box",
                                "-webkit-line-clamp": 2,
                                "-webkit-box-orient": "vertical"
                              }
                            },
                            params.row.name
                          )
                        ]
                      )
                    ]),

                    JSON.parse(params.row.sku_names).join(" ")
                      ? h(
                          "Tooltip",
                          {
                            props: {
                              content: JSON.parse(params.row.sku_names).join(
                                ","
                              ),
                              placement: "top"
                            },
                            style: {
                              height: "18px"
                            }
                          },
                          [
                            h(
                              "span",
                              {
                                style: {
                                  color: "#9ea7b4",
                                  overflow: "hidden",
                                  display: "-webkit-box",
                                  "line-clamp": "1",
                                  "-webkit-box-orient": "vertical"
                                }
                              },
                              JSON.parse(params.row.sku_names).join(" ")
                            )
                          ]
                        )
                      : "",
                    h(
                      "div",
                      {
                        class: {
                          isHide:
                            [0, 1, 3, 4, 5].indexOf(
                              params.row.after_sale_status
                            ) === -1
                        }
                      },
                      [
                        h(
                          "span",
                          {
                            style: {
                              display: "inline-block",
                              cursor: "pointer"
                            },
                            class: {
                              "table-waiting":
                                [0, 1, 3, 4].indexOf(
                                  params.row.after_sale_status
                                ) !== -1,
                              "table-start": params.row.after_sale_status === 5
                            },
                            on: {
                              click: () => {
                                this.$router.push({
                                  name: "orderAfterSeleDetails",
                                  query: {
                                    id: params.row.after_sale_id
                                  }
                                });
                              }
                            }
                          },
                          this.showAfterSele(params.row.after_sale_status)
                        )
                      ]
                    )
                  ]
                )
              ]
            );
          }
        },
        {
          title: "成本价",
          align: "center",
          minWidth: "100px",
          render: (h, params) => {
            return h("span", "￥" + params.row.cost);
          }
        },
        {
          title: "单价",
          align: "center",
          minWidth: "100px",
          render: (h, params) => {
            return h("span", "￥" + params.row.price);
          }
        },
        {
          title: "数量",
          align: "center",
          minWidth: "80px",
          render: (h, params) => {
            return h("span", params.row.num);
          }
        },
        {
          title: "优惠",
          align: "center",
          minWidth: "80px",
          render: (h, params) => {
            return h("span", "￥" + params.row.discount);
          }
        },
        {
          title: "小计(优惠后)",
          align: "center",
          minWidth: "100px",
          render: (h, params) => {
            return h("span", "￥" + params.row.sub_total);
          }
        },
        {
          title: "利润",
          align: "center",
          minWidth: "100px",
          render: (h, params) => {
            return h("span", "￥" + params.row.profit);
          }
        },
        {
          title: "总佣金",
          align: "center",
          minWidth: "100px",
          levelData: true,
          showIndex: true, // 显示合并的那一列
          rowSpan: true, // 是否合并
          render: (h, params) => {
            return h("div", "￥" + params.row.total_commission);
          }
        },
        {
          title: "分销级别佣金",
          align: "center",
          levelData: true,
          showIndex: true, // 显示合并的那一列
          rowSpan: true, // 是否合并
          minWidth: "160px",
          render: (h, params) => {
            return h("div", [
              h(
                "div",
                {
                  style: {
                    lineHeight: "22px",
                    // paddingLeft: "20px",
                    textAlign: "left",
                    display: "inline-block",
                    padding: "18px 0"
                  }
                },
                this.bakcContent(1, params.row.commission)
              )
            ]);
          }
        },
        {
          title: "商品佣金",
          align: "center",
          minWidth: "160px",
          render: (h, params) => {
            return h("span", this.bakcContent(2, params.row.commission));
          }
        },
        {
          title: "发放状态",
          align: "center",
          minWidth: "90px",
          levelData: true,
          showIndex: true, // 显示合并的那一列
          rowSpan: true, // 是否合并
          render: (h, params) => {
            return h(
              "span",
              {
                class: {
                  "table-success": params.row.balance_status === 3,
                  "table-warning": params.row.balance_status == 1,
                  "table-error": params.row.balance_status == 2
                }
              },
              this.showDifferentStatus(params.row.balance_status)
            );
          }
        }
      ],
      tableListData: []
    };
  },
  watch: {
    searchData: {
      handler() {
        this.currentPage = 1;
        this.getList();
      },
      deep: true
    },
    status(val) {
      this.$router.replace({
        name: "financeSettlement",
        query: {
          tab: val
        }
      });
    }
  },
  methods: {
    // 匹配售后状态
    showAfterSele(status) {
      if ([0, 1, 3, 4].indexOf(status) !== -1) {
        return "售后中";
      } else if (status === 5) {
        return "退款成功";
      }
    },
    // 显示不同的状态
    showDifferentStatus(balance_status) {
      let names = "";
      if (balance_status === 1) {
        names = "预计发放";
      } else if (balance_status === 2) {
        names = "失效";
      } else {
        names = "已发放";
      }
      return names;
    },
    // 返回选中的数据
    backChooseData(val) {
      this.ids = val;
    },
    // 返回分销商内容
    bakcContent(num, commission) {
      commission = commission || [];
      if (commission.length === 0) {
        return "无";
      }
      let data = [];
      for (let key in commission) {
        let obj = {};
        obj = commission[key];
        data.push(obj);
      }
      let names = [];
      for (let i = 0; i < data.length; i++) {
        if (num === 1) {
          if (data[i].floor_level === 1) {
            names.push("一级：" + data[i].nickname);
          } else if (data[i].floor_level === 2) {
            names.push("二级：" + data[i].nickname);
          } else {
            names.push("三级：" + data[i].nickname);
          }
          names.push(
            ...[this.$createElement("br"), "佣金：" + "￥" + data[i].money, ,],
            this.$createElement("br")
          );
        } else {
          if (data[i].floor_level === 1) {
            names.push("一级：");
          } else if (data[i].floor_level === 2) {
            names.push("二级：");
          } else {
            names.push("三级：");
          }
          names.push(...["￥" + data[i].money, this.$createElement("br")]);
        }
      }
      return names;
    },
    // 切换标签
    clickTabs(name) {
      this.currentPage = 1;
      this.status = name;
      this.getList();
    },
    cancelExportList() {
      this.tableListExportStatus = false;
    },
    exportList(val) {
      this.exportData.ids = [];
      if (val === 1) {
        this.exportData.show_all = 1;
        Object.assign(this.exportData, this.getSearchData());
      } else {
        this.ids.forEach(item => {
          this.exportData.ids.push(item);
        });
      }
      this.commonFunction.exportTable(
        this.exportData,
        this.http,
        "/shop/admin/balance/export"
      );
      this.tableListExportStatus = false;
    },
    // 导出功能
    onExportTableList() {
      if (this.ids.length === 0) {
        this.$Message.error("请选择要导出的内容");
        return;
      }
      this.exportData.show_all = "";
      if (this.tableListData.length > this.ids.length) {
        this.exportData.ids = [];
        this.ids.forEach(item => {
          this.exportData.ids.push(item);
        });
        this.commonFunction.exportTable(
          this.exportData,
          this.http,
          "/shop/admin/balance/export"
        );
      } else {
        this.tableListExportStatus = true;
      }
    },
    // 翻页
    changePage(page) {
      this.currentPage = page;
      this.getList();
    },
    // 条数
    changePageSize(val) {
      this.currentPage = 1;
      this.pageSize = val;
      this.getList();
    },
    getSearchData() {
      let obj = {};
      obj.keyword = this.searchData.keyword;
      obj.terminal_type = this.searchData.terminal_type;
      obj.created_start = this.searchData.times.startTime;
      obj.created_end = this.searchData.times.endTime;
      obj.balance_status = this.status;
      return obj;
    },
    // 获取数据
    getList() {
      let obj = this.getSearchData();
      obj.page_size = this.pageSize;
      obj.page = this.currentPage;
      this.tableLoading = true;
      this.$httpPost("/shop/admin/balance/list", obj, res => {
        this.$store.state.COMMON_loading = false;
        this.tableLoading = false;
        if (res.code === 200) {
          this.tableListData = [];
          this.$nextTick(() => {
            this.total = res.data.total;
            this.currentPage = res.data.current;
            this.pageSize = res.data.page_size;
            this.tableListData = res.data.list;
            this.tableListData.forEach(() => {
              let arr = [];
              this.tableListData.forEach(item => {
                let obj = {};
                this.constants.terminalTypes.forEach(el => {
                  if (el.id === item.terminal_type) {
                    item.terminals = el.value;
                  }
                });
                this.constants.orderStatus.forEach(items => {
                  if (items.id === item.status) {
                    item.name = items.value;
                  }
                });
                (obj["a"] = [
                  { key: "下单时间：", value: item.created_at },
                  { key: "总订单号：", value: item.id },
                  { key: "总订单状态：", value: item.name },
                  { key: "终端来源：", value: item.terminals },
                  {
                    key: "买家信息：",
                    value: item.member_nickname + "/" + item.member_mobile
                  }
                ]),
                  arr.push(obj);
              });
              this.headData = arr;
            });
          });
        }
      });
    }
  },
  mounted() {
    this.$store.state.COMMON_loading = true;
    this.getList();
  }
};
</script>
<style lang="less" scoped>
.finance-manage {
  padding: 24px 24px 0;
  height: 100%;
  overflow: auto;
  /deep/.row-table {
    .gridtable {
      tbody.tobdy-margin {
        tr {
          td {
            height: 90px;
          }
        }
      }
    }
    thead {
      tr {
        height: 0 !important;
      }
    }
    .tobdy-margin::before {
      margin-bottom: 10px !important;
    }
  }
  .marketing-search {
    // background-color: #f8f9fd;
    // border-radius: 5px;
    // margin: 0 24px 24px;
    // text-align: left;
    // padding-top: 16px;
    // padding-left: 16px;
    /deep/.data-list-search-item {
      margin-left: 0px;
      & > span.date-line {
        width: 6px;
      }
    }
  }
  // /deep/.ivu-tabs {
  //   .ivu-tabs-bar {
  //     padding: 0 24px;
  //     margin-bottom: 10px;
  //   }
  // }
  .finance-manage-table {
    /deep/.ivu-table-default {
      table {
        tbody {
          tr td:nth-child(3) .ivu-table-cell {
            -webkit-line-clamp: 3 !important;
          }
        }
      }
    }
    /deep/thead {
      tr {
        th:first-child {
          .ivu-table-cell {
            padding-left: 13px;
            padding-right: 13px;
          }
        }
      }
    }
  }
  /deep/.is-hide {
    display: none;
  }
}
</style>
