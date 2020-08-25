<template>
  <div class="distributor-verify-rejected">
    <search-list :searchParams="searchParams" :onLine="true" :search-data="searchData"></search-list>
    <common-table
      :minWidth="1093"
      v-if="iscurrent"
      :loading="tableLoading"
      :columnsData="columnsData"
      :listData="distributorListArray"
    ></common-table>
    <div class="bar-pager">
      <Page
        v-show="distributorListArray.length"
        :total="total"
        :page-size="pageSize"
        show-sizer
        :current="currentPage"
        @on-change="onPageChange"
        @on-page-size-change="onPageSizeChange"
        show-elevator
        class="page-style"
        :transfer="true"
      />
    </div>
  </div>
</template>
<script>
import searchList from "@/views/shop/components/search/search-list.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import applyCondition from "./components/distributor-apply-condition.vue";
import memberInfor from "@/views/shop/components/table/member-infor.vue";
export default {
  components: {
    searchList,
    commonTable,
    applyCondition
  },
  props: {
    iscurrent: {
      type: Boolean
    }
  },
  data() {
    return {
      tableLoading: false,
      isShowCondition: true,
      // 分页数据
      total: 0,
      pageSize: 20,
      currentPage: 1,
      searchParams: [
        {
          type: 1,
          name: "",
          prefixIcon: "ios-search",
          key: "keyword",
          placeholder: "昵称/姓名/手机号"
        },
        {
          type: 3,
          key: "member_level",
          name: "会员等级：",
          options: [
            {
              id: -1,
              value: "全部"
            }
          ]
        },
        // {
        //   type: 3,
        //   key: "status",
        //   name: "审核状态：",
        //   options: [
        //     {
        //       id: -2,
        //       value: "全部"
        //     },
        //     {
        //       id: 0,
        //       value: "待审核"
        //     },
        //     {
        //       id: 1,
        //       value: "审核通过"
        //     },
        //     {
        //       id: -1,
        //       value: "审核不通过"
        //     }
        //   ]
        // },
        {
          type: 6,
          key: "dealType",
          min: 0,
          step: 1,
          precision: 0,
          options: [
            {
              id: 0,
              value: "交易次数"
            },
            {
              id: 1,
              value: "交易金额"
            }
          ]
        },
        // {
        //   type: 2,
        //   key: "beingTime",
        //   name: "申请分销商时间："
        // },
        {
          type: 2,
          key: "rejectTime",
          name: "拒绝时间："
        }
      ],
      // 搜索数据
      searchData: {
        keyword: "",
        member_level: -1,
        // status: this.$route.query.status === "0" ? 0 : -2,
        // beingTime: {
        //   startTime: "",
        //   endTime: ""
        // },
        rejectTime: {
          startTime: "",
          endTime: ""
        },
        dealType: {
          select: 0,
          startStep: null,
          endStep: null
        }
      },
      columnsData: [
        {
          title: "申请人",
          minWidth: 150,
          render: (h, params) => {
              return h(memberInfor, {
                  props:{
                      id:Number(params.row.member_id),
                      headurl:params.row.headurl ||
                          require("../images/head-portrait.png"),
                      nickname:params.row.nickname,
                      mobile:params.row.member_mobile,
                      name:params.row.name||'--'
                  },
                  attrs: {
                      perm: "member.detail.view"
                  }
              });
          }
        },
        {
          title: "会员等级",
          minWidth: 120,
          key: "member_level_name",
          align: "center",
          render: (h, params) => {
            return h("div", params.row.member_level_name || "--");
          }
        },
        {
          title: "拒绝时间",
          minWidth: 130,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              params.row.passed_at && params.row.passed_at.replace(/-/g, ".")
            );
          }
        },
        {
          title: "交易情况",
          minWidth: 180,
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  display: "inline-block",
                  textAlign: "left"
                }
              },
              [
                // h("div", `付款：${params.row.member_buy_times || 0}次/￥${params.row.member_buy_money}`),
                // h("div", `成交：${params.row.member_deal_times || 0}次/￥${params.row.member_deal_money}`)
                h("div", `次数：${params.row.trade_time || 0}次`),
                h("div", `金额：￥${params.row.trade_money || 0}`)
              ]
            );
          }
        },
        {
          title: "状态",
          minWidth: 120,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "span",

                {
                  class: {
                    "table-success": params.row.status === 1,
                    "table-error": params.row.status === -1,
                    "table-warning": params.row.status === 0
                  }
                },
                (() => {
                  if (params.row.status === 1) return "已通过";
                  if (params.row.status === -1) return "已拒绝";
                  return "待审核";
                })()
              )
            ]);
          }
        },
        {
          title: "操作",
          minWidth: 100,
          align: "center",
          render: (h, p) => {
            return h("div", [
              h(
                "span",
                {
                  class: {
                    "table-operation": true
                  },
                  style: {
                    marginRight: "10px"
                  },
                  attrs: {
                    perm: "distributor.review.view"
                  },
                  on: {
                    click: () => {
                      this.$Modal.info({
                        title: "拒绝原因",
                        content: p.row.reject_reason
                      });
                    }
                  }
                },
                "查看原因"
              ),
              h(
                "span",
                {
                  class: {
                    "table-operation": true
                  },
                  style: {
                    marginRight: "10px"
                  }
                },
                "|"
              ),
              h(
                "span",
                {
                  class: {
                    "table-operation": true
                  },
                  attrs: {
                    perm: "distributor.review.operate"
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: "删除",
                        content: "确认删除该分销商审核记录？",
                        okText: "删除",
                        cancelText: "取消",
                        onOk: () => {
                          this.deleteDistributorVerify(p.row.member_id);
                        }
                      });
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      distributorListArray: []
    };
  },
  watch: {
    searchData: {
      handler() {
        this.currentPage = 1;
        this.getDistributorVerifyList();
      },
      deep: true
    }
  },
  methods: {
    loadPageData() {
      this.distributorListArray = [];
      this.$store.state.COMMON_loading = true;
      this.getMemberLevelList().then(() => {
        this.getDistributorVerifyList();
      });
    },
    /**
     * 分页改变重新拉取数据
     */
    onPageChange(val) {
      this.currentPage = val;
      this.getDistributorVerifyList();
    },
    onPageSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.getDistributorVerifyList();
    },
    deleteDistributorVerify(id) {
      this.$httpGet(
        "/shop/admin/distribution/distributor/deleteInReview",
        {
          id: id
        },
        res => {
          if (res.code === 200) {
            this.$Message.success("删除成功！");
            this.getDistributorVerifyList();
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    getMemberLevelList() {
      return new Promise(resolve => {
        this.http({
          url: "/shop/admin/member/level/list"
        })
          .then(res => {
            if (res.code === 200) {
              this.memberLevelData = res.data.list || [];
              this.searchParams
                .filter(item => item.key === "member_level")
                .forEach(item => {
                  this.$set(item, "options", [
                    ...item.options,
                    ...this.memberLevelData.map(item => {
                      return {
                        id: item.id,
                        value: item.name
                      };
                    })
                  ]);
                });
            } else {
              this.$Message.error(res.msg);
            }
            resolve();
          })
          .catch(e => {
            this.$store.state.COMMON_loading = false;
            this.$Message.error(e);
          });
      });
    },
    getDistributorVerifyList() {
      let data = this.getSearchParams();
      return new Promise(resolve => {
        this.tableLoading = true;
        this.http({
          url: "/shop/admin/distribution/distributor/list",
          data,
          method: "POST"
        })
          .then(res => {
            this.tableLoading = false;
            if (res.code === 200) {
              this.distributorListArray = [];
              this.$nextTick(() => {
                let distributorList = res.data.data || [];
                this.distributorListArray = distributorList;
                this.total = res.data.total;
                resolve();
              });
            } else {
              this.$Message.error(res.msg);
            }
          })
          .catch(e => {
            this.$Message.error(e);
          })
          .finally(() => {
            this.$store.state.COMMON_loading = false;
          });
      });
    },
    getSearchParams() {
      let selectArray = [
        "trade_time_min",
        "trade_time_max",
        "trade_money_min",
        "trade_money_max"
        // "deal_times_min",
        // "deal_times_max",
        // "deal_money_min",
        // "deal_money_max",
        // "buy_times_min",
        // "buy_times_max",
        // "buy_money_min",
        // "buy_money_max",
      ];
      let data = {
        type: 1,
        keyword: this.searchData.keyword,
        // reg_time_start: this.searchData.registerTime.startTime,
        // reg_time_end: this.searchData.registerTime.endTime,
        // passed_time_start: this.searchData.beingTime.startTime,
        // passed_time_end: this.searchData.beingTime.endTime,
        // created_time_start: this.searchData.applyTime.startTime,
        // created_time_end: this.searchData.applyTime.endTime,
        passed_time_start: this.searchData.rejectTime.startTime,
        passed_time_end: this.searchData.rejectTime.endTime,
        page: this.currentPage,
        page_size: this.pageSize
      };
      let firstName = selectArray[this.searchData.dealType.select * 2];
      let lastName = selectArray[this.searchData.dealType.select * 2 + 1];
      data[firstName] = this.searchData.dealType.startStep;
      data[lastName] = this.searchData.dealType.endStep;
      if (this.searchData.member_level !== -1) {
        data["member_level"] = this.searchData.member_level;
      }
      data["status"] = -1; //写死的,审核未通过
      // if (this.searchData.status !== -2) {
      //   data["status"] = this.searchData.status;
      // }
      return data;
    }
  }
};
</script>
<style lang="less" scoped>
.distributor-verify-rejected {
  padding: 24px 24px 0;
  height: calc(100vh - 120px);
  overflow: auto;
  /deep/.data-list-search {
    // padding:16px 16px 0;
    // background:#F8F9FD;
    // margin-bottom:24px;
    .data-list-search-item {
      &:nth-child(3) {
        .ivu-select-dropdown,
        .ivu-select {
          width: 100px;
        }
      }
    }
  }
}
</style>