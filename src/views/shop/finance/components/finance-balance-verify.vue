<template>
  <div class="finance-balance-verify">
    <search-list
      :searchParams="searchParams"
      :search-data="searchData"
      :onLine="true"
    >
      <Button @click="onExportListDataClick" perm="balance.view">导出</Button>
    </search-list>
    <btn-group 
      :data="verifyTypes" 
      v-model="tabNameSelect"
    ></btn-group>
    <common-table
      :minWidth="1156"
      :loading="tableLoading"
      :columnsData="columnsData"
      :listData="verifyList"
      @selectData="onSelectionChange"
    ></common-table>
    <div class="bar-pager">
      <Page
        :total="total"
        v-show="verifyList.length"
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
    <export-modal
      :tableListExportStatus="tableListExportStatus"
      @exportList="exportModalConfrimClick"
      @cancelExportList="tableListExportStatus = false"
    ></export-modal>
    <balance-verify-modal
      :verifyInfo="verifyInfo"
      v-model="isShowVerifyModal"
    ></balance-verify-modal>
    <balance-verify-result
      :verifyInfo="verifyInfo"
      v-model="isShowVerifyResult"
    ></balance-verify-result>
  </div>
</template>
<script>
import btnGroup from "@/views/shop/components/button/btn-group.vue";
import memberInfor from "@/views/shop/components/table/member-infor.vue";
import searchList from "@/views/shop/components/search/search-list.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import exportModal from "@/views/shop/components/export/export-modal.vue";
import commonFunction from "@/views/shop/components/common-function.js";
import balanceVerifyModal from "./finance-balance-verify-modal.vue";
import balanceVerifyResult from "./finance-balance-verify-result.vue";
export default {
  components: {
    btnGroup,
    searchList,
    commonTable,
    exportModal,
    balanceVerifyModal,
    balanceVerifyResult
  },
  data() {
    return {
      total: 0,
      page: 1,
      pageSize: 10,
      tableLoading: false,
      tableListExportStatus: false,
      isShowVerifyModal: false,
      isShowVerifyResult: false,
      selectTableData: [],
      searchParams: [
        {
          type: 1,
          name: "",
          prefixIcon: "ios-search",
          key: "keyword",
          placeholder: "昵称/姓名/手机"
        },
        {
          type: 3,
          key: "pay_type",
          name: "充值方式：",
          options: [
            { id: "-1", value: "全部" },
            { id: "wechat", value: "线下结算-微信" },
            { id: "alipay", value: "线下结算-支付宝" },
            { id: "bank_account", value: "线下结算-银行账户" }
          ]
        },
        {
          type: 2,
          key: "beingTime",
          name: "充值时间："
        },
      ],
      searchData: {
        keyword: "",
        pay_type: "-1",
        beingTime: {
          startTime: "",
          endTime: ""
        }
      },
      verifyTypes:[
        {
          name: "全部",
          value: undefined
        },
        {
          name: "待审核",
          value: 0
        },
        {
          name: "已通过记录",
          value: 1
        },
        {
          name: "拒绝记录",
          value: -1
        }
      ],
      tabNameSelect: undefined,
      columnsData: [
        {
          type: "selection", // 开启checkbox
          width: 40,
          align: "center"
        },
        {
          title: "会员信息",
          minWidth: 328,
          render: (h, params) => {
            return h(memberInfor, {
              props: {
                id: Number(params.row.info.member_id),
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
          title: "金额",
          minWidth: 178,
          render: (h, p) => {
            return h("div",[
              h("div","充值：￥" + (p.row.info ? p.row.info.money : "0.00")),
              p.row.info && p.row.info.recharge_bonus && parseFloat(p.row.info.recharge_bonus.bonus) != 0 ? 
              h("div","赠送：￥" + p.row.info.recharge_bonus.bonus) : null
            ])
          }
        },
        {
          title: "充值支付方式",
          minWidth: 154,
          render: (h, p) => {
            var textMap = {
              6: "线下结算-微信",
              7: "线下结算-支付宝",
              8: "线下结算-支付宝",
              9: "线下结算-银行账户"
            }
            return h("div",p.row.info ? textMap[p.row.info.pay_type] : "--")
          }
        },
        {
          title: "充值时间",
          key: "created_at",
          minWidth: 189,
        },
        {
          title: "状态",
          minWidth: 123,
          render: (h, p) => {
            var statusMap = {
              "0": {className: "table-warning", statusText: "待审核"},
              "1": {className: "table-success", statusText: "已通过"},
              "-1": {className: "table-error", statusText: "已拒绝"},
            }
            return h("span",{
              class: statusMap[p.row.status].className
            }, statusMap[p.row.status].statusText)
          }
        },
        {
          title: "操作",
          minWidth: 144,
          render: (h, p) => {
            var operationMap = {
              "0": {text: "财务审核", perm: "balance.operate"},
              "1": {text: "查看通过记录", perm: "balance.view"},
              "-1": {text: "查看拒绝记录", perm: "balance.view"}
            }
            return h("span", {
              class: "table-operation",
              attrs: {
                perm: operationMap[p.row.status].perm
              },
              on: {
                click: () => {
                  this.getVerifyResult(p.row.id).then(() => {
                    if(p.row.status == "0") {
                      this.isShowVerifyModal = true;
                    }
                    if(p.row.status == "1" || p.row.status == "-1") {
                      this.isShowVerifyResult = true;
                    }
                  })
                }
              }
            }, operationMap[p.row.status].text)
          }
        }
      ],
      verifyList: [],
      verifyInfo: null
    };
  },
  watch: {
    tabNameSelect() {
      this.page = 1;
      this.getVerifyList();
    },
    searchData: {
      handler() {
        this.page = 1;
        this.getVerifyList();
      },
      deep: true
    }
  },
  created() {
    this.getVerifyList()
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
      if (this.verifyList.length > this.selectTableData.length) {
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
        "/shop/admin/finance/recharge/export"
      );
    },
    getSearchData() {
      return {
        page: this.page,
        page_size: this.pageSize,
        keyword: this.searchData.keyword,
        pay_type: this.searchData.pay_type == "-1" ? undefined : this.searchData.pay_type,
        status: this.tabNameSelect,
        created_at_start: this.searchData.beingTime.startTime || undefined,
        created_at_end: this.searchData.beingTime.endTime || undefined
      }
    },
    onPageChange(page) {
      this.page = page;
      this.getVerifyList();
    },
    onPageSizeChange(pageSize) {
      this.page = 1;
      this.pageSize = pageSize;
      this.getVerifyList();
    },
    getVerifyList() {
      this.tableLoading = true;
      this.http.post("/shop/admin/finance/recharge/list",{
        page: this.page,
        page_size: this.pageSize,
        keyword: this.searchData.keyword,
        pay_type: this.searchData.pay_type == "-1" ? undefined : this.searchData.pay_type,
        status: this.tabNameSelect,
        created_at_start: this.searchData.beingTime.startTime,
        created_at_end: this.searchData.beingTime.endTime
      }).then(res => {
        this.tableLoading = false;
        this.verifyList = [];
        if(res.code == 200) {
          this.$nextTick(() => {
            this.verifyList = res.data.list;
          })
          this.total = res.data.total;
          this.$emit("show-dot",res.data.balance_unaudited_count);
        } else {
          this.$Message.error(res.msg)
        }
      }).catch(err => {
        this.$Message.error(err)
      })
    },
    getVerifyResult(log_id) {
      return this.http.post("shop/admin/finance/recharge/info", {
        log_id: log_id
      }).then(res => {
        if(res.code == 200) {
          this.verifyInfo = res.data;
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
.finance-balance-verify {
  padding: 24px 24px 0;
}
</style>
