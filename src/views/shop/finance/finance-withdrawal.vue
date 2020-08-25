<template>
  <div class="finance-manage">
    <search-list :searchParams="searchParams" :searchData="searchData" class="marketing-search">
      <Button @click="onExportTableList" perm="withdraw.view">导出</Button>
    </search-list>
    <btn-group :data="filterData" v-model="name" @on-click="clickTabs"></btn-group>
    <!-- <Tabs :value="name" @on-click="clickTabs">
      <TabPane label="全部" name="-1"></TabPane>
      <TabPane label="待审核" name="0"></TabPane>
      <TabPane label="提现成功" name="1"></TabPane>
      <TabPane label="提现失败" name="2"></TabPane>
    </Tabs> -->
    <check-expand
      :loading="tableLoading"
      :expandComponents="expandComponents"
      :columnsData="financeManageColumns"
      :listData="financeManageData"
      :rowIndex="rowIndex"
      :checkedAll="checkedAll"
      @onCheckAllChange="onCheckAllChange"
      :openDetail="openDetail"
      :detailsData="detailsData"
      class="finance-list"
    ></check-expand>
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
    <finance-modal
      v-model="isShowModal"
      :buttonLoading="buttonLoading"
      :withdrawalDetails="withdrawalDetails"
      :withdrawFrom="withdrawFrom"
      @agree="agree"
      @refuse="refuse"
    ></finance-modal>
    <!-- <finance-model
      :isShowModal="isShowModal"
      :buttonLoading="buttonLoading"
      :withdrawalDetails="withdrawalDetails"
      @successButton="successButton"
      @cancelButton="cancelButton"
    ></finance-model>
    <finance-refused-model
      v-model="isShowRefusedModel"
      :buttonRefusedLoading="buttonRefusedLoading"
      @successRefusedButton="successRefusedButton"
      @cancelRefusedButton="cancelRefusedButton"
    ></finance-refused-model>-->
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
import exportModal from "@/views/shop/components/export/export-modal.vue";
import checkExpand from "@/views/shop/components/table/check-expand.vue";
import financeModal from "./components/finance-modal.vue";
// import financeModel from "./components/finance-model.vue";
import commonFunction from "@/views/shop/components/common-function.js";
import memberInfor from "@/views/shop/components/table/member-infor.vue";
export default {
  components: {
    btnGroup,
    searchList,
    checkExpand,
    financeModal,
    exportModal
  },
  data() {
    return {
      withdrawFrom: "",
      commonFunction,
      id: "",
      buttonLoading: false,
      tableLoading: false,
      buttonRefusedLoading: false,
      isShowRefusedModel: false, // 拒绝的弹框
      exportData: {}, // 导出传参
      isShowModal: false, // 打款弹框
      isShowWater: false, // false 展开详情 true 收起详情
      withdrawalDetails: {}, // 流水详情数据
      tableListExportStatus: false,
      expandComponents: "expandFinanace", // 动态组件
      name: this.$route.query.tab || "-1", // 搜索的状态
      filterData:[
        {
          name: "全部",
          value: "-1"
        },
        {
          name: "待审核",
          value: "0"
        }, 
        {
          name: "提现成功",
          value: "1"
        }, 
        {
          name: "提现失败",
          value: "2"
        }
      ],
      searchData: {
        // 优惠券搜索框的值
        keyword: "",
        transaction_type: -1, // 交易类型
        pay_types: -1, //提现详细类型
        times: {
          // 交易时间
          startTime: "",
          endTime: ""
        }
      },
      detailsData: [], // 类表数据
      total: 1, // 总数量
      currentPage: 1, // 当前页
      pageSize: 10, // 当前页数量
      searchParams: [
        {
          type: 1,
          key: "keyword",
          placeholder: "提现单号/昵称/姓名/手机",
          prefixIcon: "ios-search"
        },
        {
          type: 3,
          name: "类型：",
          key: "transaction_type",
          options: [
            {
              id: -1,
              value: "全部"
            },
            {
              id: 2,
              value: "余额提现(至第三方)"
            },
            {
              id: 3,
              value: "分销佣金提现(至余额)"
            },
            {
              id: 1,
              value: "分销佣金提现(至第三方)"
            },
            {
              id: 5,
              value: "代理分红提现(至余额)"
            },
            {
              id: 4,
              value: "代理分红提现(至第三方)"
            },
            {
              id: 8,
              value: "区代返佣提现(至余额)"
            },
            {
              id: 9,
              value: "区代返佣提现(至第三方)"
            },
            {
              id: 6,
              value: "经销商资金提现(至余额）"
            },
            {
              id: 7,
              value: "经销商资金提现(第三方）"
            },
            {
              id: 23,
              value: "供应商货款提现(至余额)"
            },
            {
              id: 24,
              value: "供应商货款提现(至第三方)"
            }
          ].filter(item => {
            if ([1, 3].includes(item.id)) {
              return this.hasLicensePerm('ENABLE_DISTRIBUTION')
            } else if ([4, 5].includes(item.id)) {
              return this.hasLicensePerm('ENABLE_AGENT')
            } else if ([6, 7].includes(item.id)) {
              return this.hasLicensePerm('ENABLE_CLOUDSTOCK')
            } else if ([8, 9].includes(item.id)) {
              return this.hasLicensePerm('ENABLE_AREA_AGENT')
            } else if ([23, 24].includes(item.id)) {
              return this.hasLicensePerm('ENABLE_SUPPLIER')
            } else {
              return true;
            }
          })
        },
        {
          type: 3,
          name: "提现至：",
          key: "pay_types",
          options: [
            {
              id: -1,
              value: "全部"
            },
            {
              id: "1,99,79,98",
              value: "余额"
            },
            {
              id: 2,
              value: "微信钱包(线上结算)"
            },
            {
              id: 6,
              value: "微信钱包(线下结算)"
            },
            {
              id: 3,
              value: "支付宝(线上结算)"
            },
            {
              id: "7,8",
              value: "支付宝(线下结算)"
            },
            {
              id: 9,
              value: "银行账户(线下结算)"
            }
          ]
        },
        {
          type: 2,
          name: "申请时间：",
          showDate: true,
          key: "times"
        }
      ],
      transactionType: [
        // 交易类型
        {
          value: 1,
          name: "购物"
        },
        {
          value: 3,
          name: "冲帐"
        },
        {
          value: 4,
          name: "退款到外部"
        },
        {
          value: 5,
          name: "提现到外部"
        },
        {
          value: 98,
          name: "分销佣金转余额"
        }
      ],
      financeManageData: [], // 表格数据
      rowIndex: [],
      rowChecked: [], // 默认空数组不选中
      checkedAll: false, // 默认不全选
      openDetail: false,
      financeManageColumns: [
        {
          key: "checkbox",
          align: "center",
          width: "40px",
          render: (h, params) => {
            return h(
              "span",
              {
                class: {
                  "ivu-checkbox": true,
                  "ivu-checkbox-checked":
                    this.rowChecked.indexOf(params.row.id) !== -1 ? true : false
                },
                on: {
                  click: () => {
                    if (this.rowChecked.length <= 0) {
                      this.rowChecked.push(params.row.id);
                    } else {
                      if (this.rowChecked.indexOf(params.row.id) === -1) {
                        this.rowChecked.push(params.row.id);
                        if (
                          this.rowChecked.length ===
                          this.financeManageData.length
                        ) {
                          this.checkedAll = true;
                        } else {
                          this.checkedAll = false;
                        }
                      } else {
                        this.checkedAll = false;
                        this.rowChecked.splice(
                          this.rowChecked.indexOf(params.row.id),
                          1
                        );
                      }
                    }
                  }
                }
              },
              [
                h("span", {
                  class: {
                    "ivu-checkbox-inner": true,
                    "ivu-checkbox-focus": true
                  }
                }),
                h("input", {
                  class: {
                    "ivu-checkbox-input": true
                  }
                })
              ]
            );
          }
        },
        {
          title: "申请时间/提现单号",
          minWidth: "194px",
          isShowWrap: true,
          align: "left",
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  "padding-left": "-14px"
                }
              },
              [
                h(
                  "span",
                  {
                    style: {
                      display: "block"
                    }
                  },
                  params.row.created_at
                ),
                h(
                  "span",
                  {
                    style: {
                      display: "block"
                    }
                  },
                  params.row.id
                )
              ]
            );
          }
        },
        {
          title: "会员信息",
          align: "left",
          minWidth: "170px",
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
          minWidth: "100px",
          render: (h, params) => {
            if (params.row.transaction_type_extend) {
              return h("span", [params.row.transaction_type, h("br"), '(至' + params.row.transaction_type_extend + ')']);
            } else {
              return h("span", params.row.transaction_type);
            }
          }
        },
        {
          title: "提现至",
          align: "center",
          minWidth: "90px",
          render: (h, params) => {
            if (params.row.withdraw_from_extend) {
              return h("span", [params.row.withdraw_from, h("br"), '(' + params.row.withdraw_from_extend + ')']);
            } else {
              return h("span", params.row.withdraw_from);
            }
          }
        },
        //   title: "终端来源",
        //   align: "center",
        //   minWidth: "100px",
        //   render: (h, params) => {
        //     return h(
        //       "span",
        //       this.returnValue(
        //         params.row.terminal_type,
        //         constants.terminalSearch
        //       )
        //     );
        //   }
        // },
        {
          title: "提现金额",
          align: "center",
          minWidth: "100px",
          render: (h, params) => {
            return h("span", "￥" + params.row.money);
          }
        },
        {
          title: "手续费",
          align: "center",
          minWidth: "90px",
          render: (h, params) => {
            return h("span", "￥" + params.row.money_fee);
          }
        },
        {
          title: "到账金额",
          align: "center",
          minWidth: "100px",
          render: (h, params) => {
            return h(
              "span",
              params.row.status == 0 || params.row.status == 2
                ? "--"
                : params.row.money_real
                ? "￥" + params.row.money_real
                : "--"
            );
          }
        },
        {
          title: "提现状态",
          align: "center",
          minWidth: "90px",
          render: (h, params) => {
            return h(
              "span",
              {
                class: {
                  "table-warning": params.row.status === 0,
                  "table-success": params.row.status === 1,
                  "table-error": params.row.status === 2
                }
              },
              params.row.status === 0
                ? "待审核"
                : params.row.status === 1
                ? "提现成功"
                : "提现失败"
            );
          }
        },
        {
          title: "操作",
          align: "center",
          width: "120px",
          render: (h, params) => {
            let verify = h(
              "span",
              {
                class: "table-operation",
                attrs:{
                  perm:"withdraw.operate"
                },
                on: {
                  click: () => {
                    // this.rowIndex = [];
                    // if (this.rowIndex.indexOf(params.index) === -1) {
                    //   this.rowIndex.push(params.index);
                    // }
                    this.id = params.row.id;
                    this.showDetails(params.row.withdraw_from, params.row.withdraw_from_extend);
                  }
                }
              },
              "审核"
            );
            let toggle = h(
              "span",
              {
                class: "table-operation",
                on: {
                  click: () => {
                    this.rowIndex = [];
                    if (this.rowIndex.indexOf(params.index) === -1) {
                      this.rowIndex.push(params.index);
                    }
                    this.id = params.row.id;
                    this.financeManageData.forEach((item, index) => {
                      if (index === params.index) {
                        status = true;
                        this.$set(
                          this.financeManageData[params.index],
                          "openDetail",
                          !params.row.openDetail
                        );
                      } else {
                        this.$set(
                          this.financeManageData[index],
                          "openDetail",
                          false
                        );
                      }
                    });
                    // this.$set(
                    //   this.financeManageData[params.index],
                    //   "openDetail",
                    //   !params.row.openDetail
                    // );
                    this.$httpPost(
                      "/shop/admin/withdraw/info",
                      { id: this.id },
                      res => {
                        if (res.code === 200) {
                          let newObj = {};
                          newObj = res.data;
                          newObj.index = params.index;
                          newObj.mobile = params.row.mobile;
                          if (!params.row.openDetail) {
                            this.detailsData = [];
                            this.detailsData.forEach((item, indexs) => {
                              if (item.index === index) {
                                this.detailsData.splice(indexs, 1);
                              }
                            });
                          } else {
                            let status = false;
                            if (this.detailsData) {
                              this.detailsData.forEach(items => {
                                // 如果当前下标相同且id不同则清空数据，重新赋值
                                status =
                                  items.index === newObj.index &&
                                  items.id === newObj.id
                                    ? true
                                    : false;
                              });
                            }
                            // 如果存在相同的index，则不push到数组中
                            if (!status) {
                              this.detailsData = [];
                              this.detailsData.push(newObj);
                            }
                          }
                          if (params.row.status === 0) {
                            params.row.status = 1;
                          }
                        }
                      }
                    );
                  }
                }
              },
              params.row.openDetail ? "收起流水" : "展开流水"
            );

            let checkReason = h(
              "span",
              {
                class: "table-operation",
                on: {
                  click: () => {
                    this.$Modal.info({
                      title: "拒绝原因",
                      content: params.row.reason
                    });
                  }
                }
              },
              "查看原因"
            );

            let tempArr = [verify, toggle, checkReason];
            return h("div", [tempArr[params.row.status]]);
          }
        }
      ]
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
    name(val) {
      this.$router.replace({
        name: "financeWithdrawal",
        query: {
          tab: val
        }
      });
    }
  },
  created() {
    if (this.$route.query.tab !== undefined) {
      this.name = "" + this.$route.query.tab;
    }
  },
  methods: {
    successRefusedButton(val) {
      this.buttonRefusedLoading = true;
      this.$httpPost(
        "/shop/admin/withdraw/reject",
        { id: this.id, reason: val },
        res => {
          this.buttonRefusedLoading = false;
          if (res.code === 200) {
            this.$Message.success("拒绝成功");
            this.getList();
          } else {
            this.$Message.error("拒绝失败：" + res.msg);
          }
        }
      );
      this.isShowRefusedModel = false;
    },
    cancelRefusedButton() {
      this.isShowRefusedModel = false;
    },
    // 提现详情
    showDetails(withdrawFrom, withdrawFromExtend) {
      this.openDetail = false;
      this.$httpPost("/shop/admin/withdraw/info", { id: this.id }, res => {
        if (res.code === 200) {
          this.isShowModal = true;
          this.withdrawalDetails = res.data;
          this.withdrawFrom = withdrawFrom + (withdrawFromExtend ? '-' + withdrawFromExtend : '');
        }
      });
    },
    // 确认打款
    successButton(reason) {
      this.buttonLoading = true;
      this.$httpPost("/shop/admin/withdraw/withdraw", { id: this.id }, res => {
        if (res.code === 200) {
          this.$Message.success("打款成功");
          this.getList();
        } else {
          this.$Message.error(res.msg);
        }
        this.buttonLoading = false;
      });
      this.isShowModal = false;
    },
    // 取消打款
    cancelButton() {
      this.isShowModal = false;
    },
    agree() {
      this.buttonLoading = true;
      this.$httpPost("/shop/admin/withdraw/withdraw", { id: this.id }, res => {
        if (res.code === 200) {
          this.$Message.success("打款成功");
          this.getList();
        } else {
          this.$Message.error(res.msg);
        }
        this.buttonLoading = false;
      });
      this.isShowModal = false;
    },
    refuse(reason) {
      this.buttonLoading = true;
      this.$httpPost(
        "/shop/admin/withdraw/reject",
        { id: this.id, reason: reason },
        res => {
          this.buttonLoading = false;
          if (res.code === 200) {
            this.$Message.success("拒绝成功");
            this.getList();
          } else {
            this.$Message.error("拒绝失败：" + res.msg);
          }
        }
      );
      this.isShowModal = false;
    },
    // 切换标签
    clickTabs(name) {
      this.currentPage = 1;
      this.name = name;
      this.getList();
    },
    // 匹配名称
    matchName(val, data) {
      let names = "";
      data.forEach(el => {
        if (el.value === val) {
          names = el.name;
        }
      });
      return names;
    },
    // 判断是否全选
    onCheckAllChange(val) {
      this.checkedAll = !val;
      if (this.checkedAll) {
        this.financeManageData.forEach(item => {
          if (this.rowChecked.indexOf(item.id) === -1) {
            this.rowChecked.push(item.id);
          }
        });
      } else {
        this.rowChecked = [];
      }
    },
    // 根据数据返回对应的名称
    returnValue(val, arr) {
      let returnVal = "";
      arr.forEach(item => {
        if (Number(item.id) === val) {
          returnVal = item.value;
        }
      });
      return returnVal;
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
        this.rowChecked.forEach(item => {
          this.exportData.ids.push(item);
        });
      }
      this.commonFunction.exportTable(
        this.exportData,
        this.http,
        "/shop/admin/withdraw/export"
      );
      this.tableListExportStatus = false;
    },
    // 导出功能
    onExportTableList() {
      if (this.rowChecked.length === 0) {
        this.$Message.error("请选择要导出的内容");
        return;
      }
      this.exportData.show_all = "";
      if (this.financeManageData.length > this.rowChecked.length) {
        this.exportData.ids = [];
        this.rowChecked.forEach(item => {
          this.exportData.ids.push(item);
        });
        this.commonFunction.exportTable(
          this.exportData,
          this.http,
          "/shop/admin/withdraw/export"
        );
      } else {
        this.tableListExportStatus = true;
      }
    },
    // 选中
    onSelectionChange(val) {
      this.rowChecked = val;
    },
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
    getSearchData() {
      let obj = {};
      obj.withdraw_keyword = this.searchData.keyword;
      obj.created_at_start = this.searchData.times.startTime;
      obj.created_at_end = this.searchData.times.endTime;
      obj.transaction_type = this.searchData.transaction_type;
      obj.pay_types = this.searchData.pay_types;
      obj.status = this.name;
      return obj;
    },
    getList() {
      this.rowChecked = [];
      this.checkedAll = false;
      let obj = this.getSearchData();
      obj.page = this.currentPage;
      obj.page_size = this.pageSize;
      this.tableLoading = true;
      this.$httpPost("/shop/admin/withdraw/list", obj, res => {
        this.$store.state.COMMON_loading = false;
        this.tableLoading = false;
        this.financeManageData = [];
        this.$nextTick(() => {
          res.data.list.forEach(item => {
            let newObj = {};
            newObj = item;
            newObj.openDetail = false;
            this.financeManageData.push(newObj);
          });
          this.total = res.data.total;
          this.pageSize = res.data.page_size;
          this.currentPage = res.data.current;
          if (res.data.agent_level) {
            if (
              this.searchParams.filter(
                item => item.key === "transaction_type"
              )[0].options.length === 4
            ) {
              this.searchParams
                .filter(item => item.key === "transaction_type")[0]
                .options.push(
                  {
                    id: 4,
                    value: "代理中心提现（至余额）"
                  },
                  {
                    id: 5,
                    value: "代理中心提现（至第三方）"
                  }
                );
            }
          }
        });
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
  /deep/.ivu-checkbox-focus {
    box-shadow: 0 0 0 0 transparent;
  }
  // .finance-list {
  //   margin: 24px 24px 0px;
  // }
  .marketing-search {
    // background-color: #f8f9fd;
    // border-radius: 5px;
    // // margin-bottom: 30px;
    // // margin-right: 0px;
    // margin: 0 24px 24px;
    // text-align: left;
    // padding-top: 16px;
    // padding-left: 16px;
    // padding:0 24px;
    /deep/.data-list-search-item {
      margin-left: 0px;
      & > span.date-line {
        width: 6px;
      }
    }
    /deep/.commmon-date-style {
      width: 49px !important;
      margin-left: 12px;
      text-align: left;
      margin-right: 0px;
    }
  }
  /deep/.p-t-20 {
    font-weight: bold;
    font-size: 14px;
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
