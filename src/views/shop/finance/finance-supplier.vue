<template>
  <div class="finance-supplier">
    <search-list :searchParams="searchParams" :searchData="searchData" class="marketing-search">
      <Button @click="onExportTableList" perm="supplier.settle.view">导出</Button>
    </search-list>
    <btn-group :data="filterData" v-model="status" @on-click="clickTabs"></btn-group>
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
import commonFunction from "@/views/shop/components/common-function.js";
import exportModal from "@/views/shop/components/export/export-modal.vue";
const filterData = [
  {
    name: "全部",
    value: "-1"
  },
  {
    name: "待结算货款",
    value: "0"
  },
  {
    name: "已结算货款",
    value: "1"
  },
  {
    name: "结算失败",
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
        }
      ],
      status: filterData.findIndex(n => n.value === this.$route.query.tab) > -1 ? this.$route.query.tab : "-1",
      searchData: {
        // 优惠券搜索框的值
        keyword: "",
        keyword_type: "0",
        times: {
          // 交易时间
          startTime: "",
          endTime: ""
        }
      },
      total: 1, // 总数量
      currentPage: 1, // 当前页
      pageSize: 20, // 当前页数量
      searchParams: [
          {
          type: 10,
          key: "keyword",
          prefixIcon: "ios-search",
          placeholder: {
            0: "平台名称",
            1: "昵称/姓名/手机",
            2: "订单编号"
          },
          optionKey: "keyword_type",
          options: [
           this.hasLicensePerm("ENABLE_SUPPLIER") ?{
              id: "0",
              value: "供应平台"
            } : null,
            {
              id: "1",
              value: "买家"
            },
            {
              id: "2",
              value: "订单号"
            }
          ].filter(item => item)
        },
        {
          type: 2,
          name: "下单时间：",
          showDate: true,
          key: "times"
        }
      ],
      financeManageColumns: [
        {
          title: "商品信息",
          minWidth: "260px",
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

                    params.row.sku_names.join(";")
                      ? h(
                          "Tooltip",
                          {
                            props: {
                              content: params.row.sku_names.join(
                                ";"
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
                              params.row.sku_names.join(";")
                            )
                          ]
                        )
                      : "",
                    h(
                      "div",
                      {
                        class: {
                          isHide:  params.row.after_sale_num == 0 && params.row.after_sale_over_num == 0,
                        }
                      },
                      [
                        h(
                          "span",
                          {
                            style: {
                              display: "inline-block",
                              borderRadius: "3px",
                              cursor: "pointer"
                            },
                            class: {
                              "table-waiting":  params.row.after_sale_num > 0,                               
                              "table-start": params.row.after_sale_over_num > 0
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
                          this.showAfterSele(params.row.after_sale_num,params.row.after_sale_over_num)
                        )
                      ]
                    )
                  ]
                )
              ]
            );
          }
        },
        // {
        //   title: "单价(优惠后)",
        //   align: "center",
        //   minWidth: "105px",
        //   render: (h, params) => {
        //     return h("span", "￥" + params.row.real_price);
        //   }
        // },
        {
          title: "供货单价",
          align: "center",
          minWidth: "105px",
          render: (h, params) => {
            return h("span", "￥" + params.row.supplier_price);
          }
        },
        {
          title: "数量",
          align: "center",
          minWidth: "100px",
          render: (h, params) => {
            return h("div", {},[
               h("p",params.row.num),
               params.row.after_sale_num > 0 || params.row.after_sale_over_num > 0 ? h("span",{style:{
                 color: "#ed4014",
                lineHeight: "19px"
               }},`退${params.row.after_sale_num || params.row.after_sale_over_num}件`) : ""
            ]);
          }
        },
        {
          title: "订单金额",
          align: "center",
          minWidth: "110px",
          levelData: true,
          showIndex: true, // 显示合并的那一列
          rowSpan: true, // 是否合并
          render: (h, params) => {
            return h("div",{},[
              h("p","￥" + params.row.money),
              h("span",`(含运费￥${params.row.freight})`)
            ]);
          }
        },
        {
          title: "结算金额/明细",
          align: "center",
          minWidth: "172px",
          levelData: true,
          showIndex: true, // 显示合并的那一列
          rowSpan: true, // 是否合并
          render: (h, params) => {
            return h("div",{},[
              h("p","实际结算：" + "￥" + params.row.real_settle),
              h("p", "(+商品￥" + params.row.settle_money + ")"),
              h("p", "(+运费￥" + params.row.settle_freight + ")"),
              h("p", "(-售后￥" + (Number(params.row.all_after_sale) < 0 ? params.row.all_after_sale.substr(1) : params.row.all_after_sale) + ")" )
            ]);
          }
        },
        {
          title: "供应商信息",
          align: "center",
          minWidth: "200px",
          levelData: true,
          showIndex: true, // 显示合并的那一列
          rowSpan: true, // 是否合并
          render: (h, params) => {
            return h("div",{
                 style: { display:"flex",justifyContent: "center"}
              },[
                  h("i",{
                    attrs: { class: "iconfont icon-gonghuoshang" },
                    style: { color: "#41b44d",fontSize:"18px"}
                  }),
                  h("span",{ style: { display:"inline-block",marginLeft:"3px",worBwrap: "break-word", wordBreak: "break-all",textAlign:"left",paddingTop:"5px"}},
                 params.row.supplier_name)
            ]);
          }
        },
        {
          title: "结算状态",
          align: "center",
          minWidth: "106px",
          levelData: true,
          showIndex: true, // 显示合并的那一列
          rowSpan: true, // 是否合并
          render: (h, params) => {
            return h(
              "span",
              {
                class: {
                  "table-success": params.row.settle_status === 1,
                  "table-warning": params.row.settle_status == 0,
                  "table-error": params.row.settle_status == 2
                }
              },
              this.showDifferentStatus(params.row.settle_status)
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
        name: "financeSupplier",
        query: {
          tab: val
        }
      });
    }
  },
  methods: {
    // 匹配售后状态
    showAfterSele(v1,v2) {
      if (v1 > 0) {
        return "售后中";
      }else {
        if (v2 > 0) {
            return "退款成功";
        }
      }
      
    },
    // 显示不同的状态
    showDifferentStatus(settle_status) {
      let names = "";
      if (settle_status === 0) {
        names = "待结算";
      } else if (settle_status === 2) {
        names = "结算失败";
      } else {
        names = "已结算";
      }
      return names;
    },
    // 返回选中的数据
    backChooseData(val) {
      this.ids = val;
    },
    clickTabs(name) { // 切换标签 触发发送请求
      this.currentPage = 1;
      this.status = name;
      this.getList();      
    },
    cancelExportList() {
      this.tableListExportStatus = false;
    },
    exportList(val) {
      this.exportData = {}
      this.exportData.ids = [];
      if (val === 1) {
        this.exportData.show_all = 1;
        Object.assign(this.exportData, this.getSearchData());
      } else {
        this.exportData.show_all = "";
        this.ids.forEach(item => {
          this.exportData.ids.push(item);
        });
      }
      this.commonFunction.exportTable(
        this.exportData,
        this.http,
        "/shop/admin/supplier/settle/export"
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
          "/shop/admin/supplier/settle/export"
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
      obj.search_type = Number(this.searchData.keyword_type);
      obj.created_start = this.searchData.times.startTime;
      obj.created_end = this.searchData.times.endTime;
      obj.settle_status = Number(this.status)
      return obj;
    },
    // 获取数据
    getList() {
      let obj = this.getSearchData();
      obj.page_size = this.pageSize;
      obj.page = this.currentPage;
      this.tableLoading = true;
      this.$httpPost("/shop/admin/supplier/settle/list", obj, res => {
        this.$store.state.COMMON_loading = false;
        this.tableLoading = false;
        if (res.code === 200) {
          this.tableListData = [];
          this.$nextTick(() => {
            this.total = res.data.total;
            this.currentPage = res.data.current;
            this.pageSize = res.data.page_size;
            this.tableListData = res.data.list;
            function status_text (text) {
              let str = text
              if(text === "交易完成" || text === "交易成功") {
                str = '已完成'
              }else if (text === "已关闭"){
                str = '交易关闭'
              }
              return str
            }
            this.tableListData.forEach(() => {
              let arr = [];
              this.tableListData.forEach(item => {
                let obj = {};
                (obj["a"] = [
                  { key: "下单时间：", value: item.created_at },
                  { key: "总订单号：", value: item.id },
                  { key: "总订单状态：", value: status_text(item.status_text)},
                  {
                    key: "买家信息：",
                    value: item.member_nickname + "/" + item.member_mobile
                  }
                ]),
                  arr.push(obj);
              });
              this.headData = arr;
            })
          });
        }else {
          this.$Message.error(res.msg)
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
.finance-supplier {
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
    /deep/ .ivu-select-selected-value,/deep/.ivu-select-item {
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
