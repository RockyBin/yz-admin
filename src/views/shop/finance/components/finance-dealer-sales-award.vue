<template>
  <div class="finance-dealer-sales-award">
    <search-list
      :searchParams="searchParams"
      :search-data="searchData"
      :onLine="true"
    >
      <Button @click="onExportListDataClick" perm="balance.list.view">导出</Button>
    </search-list>
    <btn-group 
      :data="awardStatus" 
      v-model="tabNameSelect"
    ></btn-group>
    <common-table
      :minWidth="1156"
      :loading="tableLoading"
      :columnsData="columnsData"
      :listData="awardList"
      @selectData="onSelectionChange"
    ></common-table>
    <div class="bar-pager">
      <Page
        :total="total"
        v-show="awardList.length"
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
    <sales-award-verify-modal 
      :verifyInfo="verifyInfo"
      v-model="isShowVerifyModal"
      @verify-success="verifySuccess"
    />
  </div>
</template>
<script>
import btnGroup from "@/views/shop/components/button/btn-group.vue";
import searchList from "@/views/shop/components/search/search-list.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import memberInfo from "@/views/shop/components/table/member-infor.vue";
import exportModal from "@/views/shop/components/export/export-modal.vue";
import commonFunction from "@/views/shop/components/common-function.js";
import salesAwardVerifyModal from "./finance-sales-award-verify-modal.vue"
export default {
  components: {
    btnGroup,
    searchList,
    commonTable,
    exportModal,
    salesAwardVerifyModal
  },
  data() {
    return {
      total: 0,
      page: 1,
      pageSize: 10,
      tableLoading: false,
      tableListExportStatus: false,
      selectTableData: [],
      searchParams: [
        {
          type: 10,
          name: "",
          prefixIcon: "ios-search",
          key: "keyword",
          optionWidth: 80,
          optionKey: "keyword_type",
          placeholder: {
            1: "昵称/姓名/手机",
            2: "昵称/手机"
          },
          options: [{ id: 1, value: "得奖人" }, { id: 2, value: "付奖金人" }]
        },
        {
          type: 3,
          key: "payer",
          name: "支付奖金：",
          options: [
            { id: -1, value: "全部" },
            { id: 0, value: "公司" },
            { id: 1, value: "经销商" },
          ]
        },
        {
          type: 2,
          key: "beingTime",
          name: "下单时间："
        }
      ],
      searchData: {
        keyword: "",
        keyword_type: 1,
        payer: -1,
        beingTime: {
          startTime: "",
          endTime: ""
        }
      },
      awardStatus:[
        {
          name: "全部",
          value: -9
        },
        {
          name: "待兑换",
          value: 0
        },
        {
          name: "待审核",
          value: 1
        },
        {
          name: "发放记录",
          value: 2
        },
        {
          name: "拒绝记录",
          value: 3
        }
      ],
      tabNameSelect: -9,
      columnsData: [
        {
          type: "selection", // 开启checkbox
          width: 40,
          align: "center"
        },
        {
          title: "得奖经销商信息",
          minWidth: 307,
          render: (h, params) => {
            return h(
              memberInfo,
              {
                props: {
                  id: Number(params.row.member_id),
                  headurl:
                    this.padImgUrl(params.row.member_headurl) ||
                    "images/head-portrait.png"
                },
                attrs: {
                  perm: "member.detail.view"
                }
              },
              [
                h(
                  "div",
                  {
                    class: "one-hide"
                  },
                  params.row.member_nickname
                ),
                h(
                  "div",
                  {
                    style: {
                      color: "#9ea7b4",
                      fontSize: "12px"
                    }
                  },
                  "姓名：" + (params.row.member_name || "--")
                ),
                h(
                  "div",
                  {
                    style: {
                      color: "#9ea7b4",
                      fontSize: "12px"
                    }
                  },
                  "手机：" + params.row.member_mobile
                ),
                h(
                  "div",
                  {
                    style: {
                      color: "#9ea7b4",
                      fontSize: "12px"
                    }
                  },
                  "ID：" + params.row.member_id
                )
              ]
            );
          }
        },
        {
          renderHeader: (h, p) => {
            return h("div",[
              h("div", "关联进货单号"),
              h("div", "下单时间")
            ])
          },
          minWidth: 175,
          align: "center",
          render: (h, p) => {
            return h("div", [
              h("div", p.row.order_id),
              h("div", p.row.order_created_at)
            ])
          }
        },
        {
          title: "订单金额",
          minWidth: 116,
          render: (h, p) => {
            return h("span", "￥" + p.row.order_money);
          }
        },
        {
          title: "销售奖金",
          minWidth: 117,
          render: (h, p) => {
            return h("span", "￥" + p.row.reward_money);
          }
        },
        {
          title: "支付奖金人信息",
          minWidth: 189,
          render: (h, p) => {
            return h("div", [
              p.row.pay_member_id ? h("div", p.row.pay_member_nickname) : "公司",
              p.row.pay_member_id ? h("div", p.row.pay_member_mobile) : null
            ]);
          }
        },
        {
          title: "状态",
          minWidth: 97,
          render: (h, p) => {
            var statusMap = {
              0: {
                text: "待兑换",
                className: "table-warning"
              },
              1: {
                text: "待审核",
                className: "table-warning"
              },
              2: {
                text: "已发放",
                className: "table-success"
              },
              3: {
                text: "已拒绝",
                className: "table-error"
              }
            };
            return h("span", {
              class: statusMap[p.row.status].className
            }, statusMap[p.row.status].text)
          }
        },
        {
          title: "操作",
          minWidth: 115,
          render: (h, p) => {
            var text = "";
            if(p.row.status == 0) {
              text = "帮他兑换";
            } else if(p.row.status == 1) {
              if(p.row.pay_member_id == 0) {
                text = "审核"
              } else {
                text = "查看";
              }
            } else if(p.row.status == 2) {
              text = "查看通过记录";
            } else {
              text = "查看拒绝记录";
            }
            return h("span", {
              class: "table-operation",
              attrs: {
                perm: p.row.status === 0 || p.row.status === 1 && p.row.pay_member_id == 0
                      ? "cloudstock.settle.operate"
                      : "cloudstock.settle.view"
              },
              on: {
                click: () => {
                  if(p.row.status == 0) {
                    this.$Modal.confirm({
                      title: "提示",
                      content: `确定要帮【${p.row.member_nickname}】兑换该笔销售奖金【￥${p.row.reward_money}】吗？`,
                      onOk:() => {
                        this.exchangeAward(p.row.id);
                      }
                    })
                  } else {
                    this.isShowVerifyModal = true;
                    this.verifyInfo = p.row;
                  }
                }
              }
            }, text);
          }
        }
      ],
      awardList: [],
      isShowVerifyModal: false,
      verifyInfo: {}
    };
  },
  watch: {
    tabNameSelect() {
      this.verifySuccess()
    },
    searchData: {
      handler() {
        this.page = 1;
        this.getAwardList();
      },
      deep: true
    }
  },
  created() {
    this.getAwardList();
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
      this.getAwardList();
    },
    onPageSizeChange(pageSize) {
      this.page = 1;
      this.pageSize = pageSize;
      this.getAwardList();
    },
    
    /**
     *  导出数据
     * params val: 0为当前页，1为所有
     */
    exportModalConfrimClick(val) {
      this.tableListExportStatus = false;
      let data = this.getSearchData();
      data.is_all = val;
      this.exprotData(data);
    },
    onExportListDataClick() {
      if (!this.selectTableData || this.selectTableData.length === 0) {
        this.$Message.error("请选择要导出的内容");
        return;
      }
      if (this.awardList.length > this.selectTableData.length) {
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
        "/shop/admin/dealer/sale/reward/export"
      );
    },
    getSearchData() {
      return {
        status: this.tabNameSelect,
        keyword: this.searchData.keyword,
        keyword_type: this.searchData.keyword_type,
        page: this.page,
        page_size: this.pageSize,
        payer: this.searchData.payer,
        created_at_min: this.searchData.beingTime.startTime || undefined,
        created_at_max: this.searchData.beingTime.endTime || undefined
      }
    },
    onSelectionChange(selectData) {
      this.selectTableData = selectData;
    },
    exchangeAward(id) {
      this.http.post("/shop/admin/dealer/reward/exchange", {
        id: id
      }).then(res => {
        if(res.code == 200) {
          this.$Message.success("兑换成功");
          this.getAwardList();
        } else {
          this.$Message.error(res.msg);
        }
      }).catch(err => {
        this.$Message.error(err);
      })
    },
    verifySuccess() {
      this.isShowVerifyModal = false;
      this.getAwardList()
    },
    getAwardList() {
      this.tableLoading = true;
      this.http.post("/shop/admin/dealer/sale/reward/list", this.getSearchData()).then(res => {
        this.tableLoading = false;
        if(res.code == 200) {
          this.awardList = res.data.list;
          this.total = res.data.total;
        } else {
          this.$Message.error(res.msg)
        }
      }).catch(err => {
        this.$Message.error(err)
      })
    }
  }
}
</script>
<style lang='less' scoped>
.finance-dealer-sales-award {
  padding: 24px 24px 0;
}
</style>