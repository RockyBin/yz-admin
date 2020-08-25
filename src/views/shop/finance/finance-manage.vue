<template>
  <div class="finance-manage">
    <search-list :searchParams="searchParams" :search-data="searchData" class="marketing-search">
      <Button @click="onExportTableList" perm="finance.view">导出</Button>
    </search-list>
    <common-table
      :minWidth="1094"
      :columnsData="financeManageColumns"
      :loading="tableLoading"
      :listData="financeManageData"
      align="cneter"
      @selectData="onSelectionChange"
      class="finance-manage-table"
    ></common-table>
    <div class="bar-pager">
      <Page
        v-if="total"
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
import searchList from "@/views/shop/components/search/search-list.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import exportModal from "@/views/shop/components/export/export-modal.vue";
import constants from "@/views/shop/components/constants.js";
import commonFunction from "@/views/shop/components/common-function.js";
import memberInfor from "@/views/shop/components/table/member-infor.vue";
const payTypes = [
  {
    id: "-1",
    value: "全部"
  },
  {
    id: "1",
    value: "余额"
  },
  {
    id: "2",
    value: "微信"
  },
  {
    id: "3",
    value: "支付宝"
  },
  {
    id: "11",
    value: "通联支付"
  },
  {
    id: "99,79",
    value: "佣金结算"
  },
  {
    id: "5,6,7,8,9",
    value: "线下结算"
  },
  {
    id: "10",
    value: "平台返款"
  },
  // {
  //   id: "98",
  //   value: "供应商货款"
  // }
];
export default {
  components: {
    searchList,
    commonTable,
    exportModal
  },
  data() {
    return {
      commonFunction,
      tableLoading: false,
      tableListExportStatus: false,
      searchData: {
        // 优惠券搜索框的值
        keyword: "",
        trading_type: constants.transactionType[0].id,
        bill: "-99", // 出/入账
        paytype: "-1",
        times: {
          // 交易时间
          startTime: "",
          endTime: ""
        }
      },
      selectTableData: [],
      currentPage: 1, // 当前页
      total: 10, // 总数量
      pageSize: 10, // 当前页数量
      searchParams: [
        {
          type: 1,
          key: "keyword",
          width: "80px",
          placeholder: "流水号/昵称/姓名/手机号",
          prefixIcon: "ios-search"
        },
        {
          type: 3,
          name: "类型：",
          key: "trading_type",
          options: constants.transactionType.filter(item => {
            if (item.id == "16") {
              return window.hasLicensePerm("ENABLE_RECHARGE_BONUS");
            } else if (item.id == "13") {
              return window.hasLicensePerm("ENABLE_AGENT");
            } else if (item.id == "12" || item.id == "19" || item.id == "20") {
              return window.hasLicensePerm("ENABLE_CLOUDSTOCK");
            } else if (item.id == "21" || item.id == "22") {
              return window.hasLicensePerm("ENABLE_AREA_AGENT");
            } else if (item.id == "23" || item.id == "24") {
              return window.hasLicensePerm("ENABLE_SUPPLIER");
            } else {
              return true;
            }
          })
        },
        {
          type: 3,
          name: "出/入账：",
          key: "bill",
          options: [
            {
              id: "-99",
              value: "全部"
            },
            {
              id: "1",
              value: "入账"
            },
            {
              id: "-1",
              value: "出账"
            },
            {
              id: "0",
              value: "平账"
            }
          ]
        },
        {
          type: 3,
          name: "结算方式：",
          key: "paytype",
          options: payTypes.filter(item => {
            if (["10"].includes(item.id)) {
              return this.hasLicensePerm("ENABLE_RECHARGE_BONUS")
            } else if (["98"].includes(item.id)) {
              return this.hasLicensePerm("ENABLE_SUPPLIER")
            } else {
              return true;
            }
          })
        },
        {
          type: 2,
          name: "时间：",
          key: "times",
          showDate: true
        }
      ],
      financeManageData: [], // 表格数据
      financeManageColumns: [
        {
          type: "selection",
          align: "center",
          width: 40
        },
        {
          title: "时间/流水号",
          key: "tradeno",
          align: "left",
          minWidth: 260,
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  style: {
                    display: "block"
                  }
                },
                params.row.active_at
              ),
              h(
                "span",
                {
                  style: {
                    display: "block"
                  }
                },
                params.row.tradeno
              )
            ]);
          }
        },
        {
          title: "会员信息",
          align: "left",
          minWidth: 170,
          render: (h, params) => {
            return h(memberInfor, {
              props: {
                id: params.row.member_id,
                name: params.row.name || "--",
                nickname: params.row.nickname,
                mobile: params.row.mobile
              }
            });
          }
        },
        {
          title: "类型",
          align: "center",
          width: 140,
          render: (h, params) => {
            return h(
              "span",
              {
                style: {
                  display: "block"
                }
              },
              params.row.transaction_type_extend
                ? [
                    params.row.transaction_type,
                    h("br"),
                    "(至" + params.row.transaction_type_extend + ")"
                  ]
                : params.row.transaction_type
            );
          }
        },
        {
          title: "金额",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            return h(
              "span",
              {
                style: {
                  display: "block"
                }
              },
              "￥" + params.row.money
            );
          }
        },
        {
          title: "出/入账",
          key: "account_type_text",
          align: "center",
          width: 100
        },
        {
          title: "结算方式",
          key: "pay_type_text",
          align: "center",
          minWidth: 100
        },
        {
          title: "摘要",
          key: "about",
          align: "left",
          minWidth: 164
        }
      ],
      exportData: {} // 导出传参
    };
  },
  watch: {
    searchData: {
      handler() {
        this.currentPage = 1;
        this.getList();
      },
      deep: true
    }
  },
  methods: {
    // 分页条数
    changePageSize(val) {
      this.currentPage = 1;
      this.pageSize = val;
      this.getList();
    },
    // 翻页
    changePage(val) {
      this.currentPage = val;
      this.getList();
    },
    returnValue(val, arr) {
      let returnVal = "";
      arr.forEach(item => {
        if (Number(item.id) === val) {
          returnVal = item.value;
        }
      });
      return returnVal;
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
        Object.assign(this.exportData, this.getSearchData());
      } else {
        this.selectTableData.forEach(item => {
          this.exportData.ids.push(item.id);
        });
      }
      this.commonFunction.exportTable(
        this.exportData,
        this.http,
        "/shop/admin/finance/export"
      );
      this.tableListExportStatus = false;
    },
    // 导出功能
    onExportTableList() {
      if (this.selectTableData.length === 0) {
        this.$Message.error("请选择要导出的内容");
        return;
      }
      this.exportData.show_all = "";
      if (this.financeManageData.length > this.selectTableData.length) {
        this.exportData.ids = [];
        this.selectTableData.forEach(item => {
          this.exportData.ids.push(item.id);
        });

        this.commonFunction.exportTable(
          this.exportData,
          this.http,
          "/shop/admin/finance/export"
        );
      } else {
        this.tableListExportStatus = true;
      }
    },
    // 选中
    onSelectionChange(val) {
      this.selectTableData = val;
    },
    getSearchData() {
      let obj = {};
      obj.keyword = this.searchData.keyword;
      obj.pay_types = this.searchData.paytype;
      obj.trade_type = this.searchData.trading_type;
      obj.active_at_start = this.searchData.times.startTime;
      obj.active_at_end = this.searchData.times.endTime;
      obj.account_type = this.searchData.bill;
      return obj;
    },
    getList() {
      let obj = this.getSearchData();
      obj.page = this.currentPage;
      obj.page_size = this.pageSize;
      // 出入账：0=平账，1=入账，-1=出账
      //obj.account_type = [];
      // this.searchData.bill.forEach(item => {
      //   switch (item) {
      //     case "平账":
      //       obj.account_type.push(0);
      //       break;
      //     case "入账":
      //       obj.account_type.push(1);
      //       break;
      //     case "出账":
      //       obj.account_type.push(-1);
      //       break;
      //     default:
      //       break;
      //   }
      // });
      this.tableLoading = true;
      this.$httpPost("/shop/admin/finance/list", obj, res => {
        this.tableLoading = false;
        if (res.code === 200) {
          this.financeManageData = [];
          this.$nextTick(() => {
            this.total = res.data.total;
            this.pageSize = res.data.page_size;
            this.currentPage = res.data.current;
            this.financeManageData = res.data.list;
          });
        }
      });
    }
  },
  created() {
    // 如果没有代理的授权，隐藏相关数据
    let field1 = this.searchParams.find(item => {
      return item.key == "trading_type";
    });
    if (field1 && !this.hasLicensePerm("ENABLE_DISTRIBUTION")) {
      field1.options = field1.options.filter(item => {
        return item.id != 4 && item.id != 5;
      });
    }
    if (field1 && !this.hasLicensePerm("ENABLE_AGENT")) {
      field1.options = field1.options.filter(item => {
        return item.id != 10 && item.id != 11 && item.id != 13;
      });
    }
    if (field1 && !this.hasLicensePerm("ENABLE_CLOUDSTOCK")) {
      field1.options = field1.options.filter(item => {
        return item.id != 12 && item.id != 14 && item.id != 15;
      });
    }
    var field2 = this.searchParams.find(item => item.key == "paytype");
    if (
      field2 &&
      !this.hasLicensePerm("ENABLE_DISTRIBUTION") &&
      !this.hasLicensePerm("ENABLE_AGENT")
    ) {
      field2.options = field2.options.filter(item => {
        return item.id != "99,79";
      });
    }
  },
  mounted() {
    this.getList();
  }
};
</script>
<style lang="less" scoped>
.finance-manage {
  padding: 24px 24px 0;
  height: 100%;
  overflow: auto;
  .marketing-search {
    /deep/.data-list-search-item {
      margin-left: 0px;
      & > span.date-line {
        width: 6px;
      }
    }
  }
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
    /deep/.ivu-table-tip {
      overflow-x: hidden;
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
}
</style>
