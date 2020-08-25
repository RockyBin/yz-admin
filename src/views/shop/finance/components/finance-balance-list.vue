<template>
  <div class="finance-balance-list">
    <titlebar title="累计数据"></titlebar>
    <div class="summary">
      <div class="item">
        <span class="name">累计可用余额：</span>
        <span class="value">￥{{total_available_balance || '0.00'}}</span>
      </div>
      <div class="item">
        <span class="name">累计充值：</span>
        <span class="value">￥{{total_cumulative_recharge || '0.00'}}</span>
      </div>
      <div class="item">
        <span class="name">累计已提现：</span>
        <span class="value">￥{{total_withdrawal_done || '0.00'}}</span>
      </div>
      <div class="item">
        <span class="name">累计提现中：</span>
        <span class="value">￥{{total_withdrawal_ing || '0.00'}}</span>
      </div>
    </div>
    <Button
      type="primary"
      shape="circle"
      icon="md-add"
      perm="balance.operate"
      @click="rechargeBtnClick"
      >充值/扣减</Button
    >
    <search-list
      :searchParams="searchParams"
      :search-data="searchData"
      :onLine="true"
    >
      <Button @click="onExportListDataClick" perm="balance.view">导出</Button>
    </search-list>
    <common-table
      :minWidth="1156"
      :loading="tableLoading"
      :columnsData="columnsData"
      :listData="balanceList"
      @selectData="onSelectionChange"
    ></common-table>
    <div class="bar-pager">
      <Page
        :total="total"
        v-show="balanceList.length"
        :page-size="pageSize"
        show-sizer
        :current="page"
        @on-change="onPageChange"
        @on-page-size-change="onPageSizeChange"
        show-elevator
        class="page-style"
        :transfer="true"
      />
    </div>
    <recharge-modal 
      ref="balanceRechargeModal" 
      v-model="isShowModal" 
      :memberInfo="memberInfo"
      @selectBtnClick="memberModalStatus = true"
    />
    <select-modal
      title="选择会员"
      ref="memberSelectModal"
      :width="500"
      optionsText="全部会员"
      :columns="memberModalColumn"
      :searchData="memberSearchData"
      :headList="memberLevelData"
      headName="name"
      :selectData="memberInfo"
      :tableData="tableMemberData"
      placeholder="请输入会员昵称或手机号"
      v-model="memberModalStatus"
      @getList="onGetMemberList"
      @onGetSelectData="onGetMemberSelectData"
    ></select-modal>
    <export-modal
      :tableListExportStatus="tableListExportStatus"
      @exportList="exportModalConfrimClick"
      @cancelExportList="tableListExportStatus = false"
    ></export-modal>
  </div>
</template>
<script>
import searchList from "@/views/shop/components/search/search-list.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import memberInfo from "@/views/shop/components/table/member-infor.vue";
import rechargeModal from "./finance-balance-recharge-modal";
import selectModal from "@/views/shop/components/modal/modal-select-list.vue";
import exportModal from "@/views/shop/components/export/export-modal.vue";
import commonFunction from "@/views/shop/components/common-function.js";
import titlebar from "@/views/shop/components/titlebar/vertical-line-titlebar";
export default {
  provide() {
    return {
      target: this
    };
  },
  components: {
    searchList,
    commonTable,
    rechargeModal,
    selectModal,
    exportModal,
    titlebar
  },
  data() {
    return {
      total: 0,
      page: 1,
      pageSize: 10,
      isShowModal: false,
      tableLoading: false,
      tableListExportStatus: false,
      selectTableData: [],
      searchParams: [
        {
          type: 1,
          name: "",
          prefixIcon: "ios-search",
          key: "keyword",
          placeholder: "昵称/姓名/手机"
        }
      ],
      searchData: {
        keyword: ""
      },
      columnsData: [
        {
          type: "selection", // 开启checkbox
          width: 40,
          align: "center"
        },
        {
          title: "会员信息",
          minWidth: 376,
          render: (h, params) => {
            return h(memberInfo, {
              props: {
                id: Number(params.row.id),
                headurl:
                  this.padImgUrl(params.row.headurl) ||
                  "images/head-portrait.png"
              },
              attrs: {
                perm: "member.detail.view"
              }
            }, [
                h(
                  "div",
                  {
                    class: "one-hide"
                  },
                  params.row.nickname
                ),
                h(
                  "div",
                  {
                    style: {
                      color: "#9ea7b4",
                      fontSize: "12px"
                    }
                  },
                  "姓名：" + (params.row.name || "--")
                ),
                h(
                  "div",
                  {
                    style: {
                      color: "#9ea7b4",
                      fontSize: "12px"
                    }
                  },
                  "手机：" + params.row.mobile
                ),
                h(
                  "div",
                  {
                    style: {
                      color: "#9ea7b4",
                      fontSize: "12px"
                    }
                  },
                  "ID：" + params.row.id
                )
            ]);
          }
        },
        {
          title: "可用余额",
          render: (h, p) => {
            return h("span", "￥" + p.row.available_balance);
          }
        },
        {
          title: "累计充值",
          render: (h, p) => {
            return h("span", "￥" + p.row.cumulative_recharge);
          }
        },
        {
          title: "已提现",
          render: (h, p) => {
            return h("span", "￥" + p.row.withdrawal_done);
          }
        },
        {
          title: "提现中",
          render: (h, p) => {
            return h("span", "￥" + p.row.withdrawal_ing);
          }
        }
      ],
      total_available_balance: null,
      total_cumulative_recharge: null,
      total_withdrawal_done: null,
      total_withdrawal_ing: null,
      balanceList: [],
      memberInfo: null,
      memberModalColumn: [
        {
          title: "会员信息",
          minWidth: 227,
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center"
                }
              },
              [
                h("img", {
                  style: {
                    width: "40px",
                    height: "40px",
                    borderRadius: "4px",
                    marginRight: "14px"
                  },
                  attrs: {
                    src: params.row.headurl
                      ? this.padImgUrl(params.row.headurl)
                      : "images/head-portrait.png"
                  }
                }),
                h(
                  "div",
                  {
                    style: {
                      width: "calc(100% - 50px)"
                    }
                  },
                  [
                    h(
                      "div",
                      {
                        style: {
                          overflow: "hidden",
                          "text-overflow": "ellipsis",
                          "white-space": "nowrap",
                          color: "#657180",
                          fontSize: "13px"
                        }
                      },
                      params.row.nickname
                    ),
                    h(
                      "div",
                      {
                        style: {
                          overflow: "hidden",
                          "text-overflow": "ellipsis",
                          "white-space": "nowrap",
                          color: "#9EA7B4"
                        }
                      },
                      "姓名：" + (params.row.name || "--")
                    ),
                    h(
                      "div",
                      {
                        style: {
                          color: "#9EA7B4"
                        }
                      },
                      "手机：" + params.row.mobile || ""
                    ),
                    h(
                      "div",
                      {
                        style: {
                          color: "#9EA7B4"
                        }
                      },
                      "ID：" + params.row.id
                    )
                  ]
                )
              ]
            );
          }
        },
        {
          title: "会员等级",
          width: 142,
          key: "level_name",
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              params.row.level > 0 ? params.row.level_name : "--"
            );
          }
        }
      ],
      memberSearchData: {
        searchName: "",
        selectClass: 0,
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      memberLevelData: [],
      tableMemberData: [],
      memberModalStatus: false
    };
  },
  watch: {
    searchData: {
      handler() {
        this.page = 1;
        this.getBalanceList();
      },
      deep: true
    }
  },
  created() {
    this.getBalanceList();
    this.getMemberLevel();
  },
  methods: {
    padImgUrl(url) {
      if (!url) {
        return;
      }
      if (/^http/i.test(url)) {
        return url;
      } else {
        return this.$store.state.siteComdataPath + url;
      }
    },
    onPageChange(page) {
      this.page = page;
      this.getBalanceList();
    },
    onPageSizeChange(pageSize) {
      this.page = 1;
      this.pageSize = pageSize;
      this.getBalanceList();
    },

    rechargeBtnClick() {
      this.isShowModal = true;
      this.resetModalData();
    },
    /**
     * 重置会员数据
     */
    resetModalData() {
      this.memberSelectData = null;
      this.$refs["balanceRechargeModal"].resetData();
      this.$refs["memberSelectModal"].resetData();
    },
    /**
     * 获取会员列表
     */
    onGetMemberList(searchData) {
      this.memberSearchData = searchData;
      let data = {
        keyword: searchData.searchName,
        page: searchData.currentPage,
        page_size: searchData.pageSize,
        // is_agent: 0
      };
      if (searchData.selectClass) {
        data.level = searchData.selectClass;
      }
      this.http({
        url: "shop/admin/common/member/list",
        method: "POST",
        data
      }).then(res => {
        if (res.code === 200) {
          this.tableMemberData = res.data.list || [];
          this.memberSearchData.currentPage = Number(res.data.current);
          this.memberSearchData.pageSize = Number(res.data.page_size);
          this.memberSearchData.total = Number(res.data.total);
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    /**
     * 获取会员选择ID
     */
    onGetMemberSelectData(data) {
      if (data && data.status == 0) {
        return this.$Message.error("该会员已被封号，请重新选择");
      }
      this.memberInfo = data;
      this.memberModalStatus = false;
    },

    onSelectionChange(selectData) {
      this.selectTableData = selectData;
    },
    /**
     *  导出数据
     * params val: 0为当前页，1为所有
     */
    exportModalConfrimClick(val) {
      this.tableListExportStatus = false;
      let data = this.getSearchData();
      data.show_all = val;
      this.exprotData(data);
    },
    onExportListDataClick() {
      if (!this.selectTableData || this.selectTableData.length === 0) {
        this.$Message.error("请选择要导出的内容");
        return;
      }
      if (this.balanceList.length > this.selectTableData.length) {
        let data = this.getSearchData();
        delete data.page;
        delete data.page_size;
        data = Object.assign({ ids: this.selectTableData.map(item => item.id) }, data);
        this.exprotData(data);
      } else {
        this.tableListExportStatus = true;
      }
    },
    exprotData(data) {
      commonFunction.exportTable(
        data,
        this.http,
        "/shop/admin/finance/balance/member/export"
      );
    },
    getSearchData() {
      return Object.assign(
        {
          page: this.page,
          page_size: this.pageSize,
        },
        this.searchData
      );
    },
    getMemberLevel() {
      return new Promise(resolve => {
        this.$httpGet("/shop/admin/member/level/list", null, res => {
          if (res.code === 200) {
            this.memberLevelData = (res.data.list || []).filter(
              item => item.status
            );
            resolve();
          } else {
            this.$store.state.COMMON_loading = false;
            this.$Message.error(res.msg);
          }
        });
      });
    },
    getBalanceList() {
      this.tableLoading = true;
      return this.http.post("/shop/admin/finance/balance/member/list", {
        page: this.page,
        page_size: this.pageSize,
        keyword: this.searchData.keyword
      }).then(res => {
        this.tableLoading = false;
        if(res.code == 200) {
          this.balanceList = res.data.list;
          this.total = res.data.total;
          this.total_available_balance = res.data.total_available_balance;
          this.total_cumulative_recharge = res.data.total_cumulative_recharge;
          this.total_withdrawal_done = res.data.total_withdrawal_done;
          this.total_withdrawal_ing = res.data.total_withdrawal_ing;
        } else {
          this.$Message.error(res.msg);
        }
      }).catch(err => {
        this.$Message.error(err);
      })
    }
  }
};
</script>
<style lang="less" scoped>
.finance-balance-list {
  padding: 24px 24px 0;
  .ivu-btn-circle {
    margin-bottom: 25px;
  }
  .summary {
    display: flex;
    padding-left: 12px;
    line-height: 32px;
    margin-bottom: 25px;
    margin-top: 10px;
    max-width: 1170px;
    .item {
      width: 25%;
      font-size: 12px;
      .name {
        font-weight: bold;
      }
    }
  }
}
</style>
