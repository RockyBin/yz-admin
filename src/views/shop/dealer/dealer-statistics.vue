<template>
  <div class="dealer-statistics" v-show="!$store.state.COMMON_loading">
    <Tabs v-model="tabChangeFlag" :animated="false">
      <TabPane :label="() => {return $createElement('div', `月度业绩`)}" :name="tabChangeArray[0]"></TabPane>
      <TabPane :label="() => {return $createElement('div', `季度业绩`)}" :name="tabChangeArray[1]"></TabPane>
      <TabPane :label="() => {return $createElement('div', `年度业绩`)}" :name="tabChangeArray[2]"></TabPane>
    </Tabs>
    <div class="dealer-statistics-content">
      <search-list :searchParams="searchParams" :search-data="searchData" :onLine="true">
        <Button @click="onExportListDataClick" perm="dealer.performance.view">导出</Button>
      </search-list>
      <common-table
        ref="exportTable"
        :minWidth="1093"
        :loading="tableLoading"
        :columnsData="columnsData"
        :listData="dealerList"
        @onSortChange="onSortChange"
        @selectData="onSelectionChange"
      ></common-table>
      <div class="bar-pager">
        <Page
          :total="total"
          v-show="dealerList.length"
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
import exportModal from "@/views/shop/components/export/export-modal.vue";
import commonFunction from "@/views/shop/components/common-function.js";
import memberInfor from "@/views/shop/components/table/member-infor.vue";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
const monthData = [
  (() =>
    new Array(12).fill(null).map((item, index) => {
      return { id: index + 1, value: index + 1 + "月" };
    }))(),
  (() =>
    new Array(4).fill(null).map((item, index) => {
      return {
        id: index + 1,
        value: "第" + ["一", "二", "三", "四"][index] + "季度"
      };
    }))()
];
const getSearchData = (index = 0) => {
  return {
    keyword: "",
    dealer_level: -1,
    dealer_parent_id: -1,
    count_year: new Date().getFullYear(),
    count_num: [
      new Date().getMonth() + 1,
      Math.ceil((new Date().getMonth() + 1) / 3),
      ""
    ][index],
    period: 1,
    order_by: "performance",
    order_sort: "desc"
  };
};
export default {
  components: {
    searchList,
    commonTable,
    exportModal
  },
  inject: ["yunzhiHome"],
  data() {
    let tabNameArray = ["monthly", "quarter", "year"];
    const monthParam = {
      type: 3,
      key: "count_num",
      combine: "countTime",
      placeholder: "请选择",
      options: monthData[0]
    };
    return {
      tabChangeArray: tabNameArray,
      tabChangeFlag: tabNameArray[this.$route.query.tab || 0]
        ? tabNameArray[this.$route.query.tab || 0]
        : tabNameArray[0],
      tableListExportStatus: false,
      total: 0,
      pageSize: 20,
      currentPage: 1,
      startTime: new Date(),
      endTime: new Date(),
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
          key: "dealer_level",
          name: "经销商等级：",
          placeholder: "请选择",
          options: [
            {
              id: -1,
              value: "全部"
            }
          ]
        },
        {
          type: 3,
          key: "dealer_parent_id",
          name: "上级领导：",
          placeholder: "请选择",
          options: [
            {
              id: -1,
              value: "全部"
            },
            {
              id: 0,
              value: "总店"
            },
            {
              id: -2,
              value: "非总店"
            }
          ]
        },
        {
          type: 3,
          key: "count_year",
          name: "统计时间：",
          combine: "countTime",
          placeholder: "请选择",
          options: (() =>
            new Array(new Date().getFullYear() - 2019 + 1)
              .fill(null)
              .map((item, index) => {
                return { id: index + 2019, value: index + 2019 + "年" };
              }))()
        },
        monthParam
      ],
      searchData: getSearchData(),
      tableLoading: false,
      columnsData: [
        {
          type: "selection", // 开启checkbox
          width: 40,
          className: "agent-statistics-selection",
          align: "center"
        },
        {
          title: "经销商信息",
          minWidth: 186,
          render: (h, params) => {
            return h(memberInfor, {
              props: {
                id: Number(params.row.member_id),
                headurl:
                  this.padImgUrl(params.row.member_headurl) ||
                  "images/head-portrait.png",
                nickname: params.row.member_nickname,
                mobile: params.row.member_mobile,
                  name:params.row.member_name ||"--"
              },
              attrs: {
                perm: "member.detail.view"
              }
            });
          }
        },
        {
          title: "经销商等级",
          minWidth: 186,
          key: "dealer_level",
          align: "center",
          render: (h, params) => {
            return h("div", {}, [
              h(
                "span",
                { style: { display: "block" } },
                params.row.member_dealer_level_text || "暂无"
              ),
              h(
                "span",
                { style: { display: "block" } },
                params.row.member_dealer_hide_level_text
              )
            ]);
          }
        },
        {
          minWidth: 186,
          key: "performance",
          sortable: "custom",
          align: "center",
          render: (h, params) => {
            return h("div", "￥" + params.row.performance);
          },
          renderHeader: (h, index) => {
            return h(
              "div",
              {
                style: {
                  display: "inline-block",
                  "line-height": "32px"
                }
              },
              [
                h("span", "个人业绩统计"),
                h(moreMessage, {
                  props: {
                    text:
                      "经销商个人业绩是指经销商自己订购的云仓虚拟库存的业绩统计"
                  }
                })
              ]
            );
          }
        },
        {
          title: "上级领导",
          minWidth: 186,
          align: "center",
          render: (h, params) => {
            return params.row.dealer_parent_id
              ? h(
                  "div",
                  {
                    attrs: {
                      perm: "member.detail.view"
                    },
                    style: {
                      cursor: "pointer"
                    },
                    on: {
                      click: () => {
                        this.$router.push({
                          name: "memberDetail",
                          query: {
                            id: params.row.dealer_parent_id
                          }
                        });
                      }
                    }
                  },
                  [
                    h(
                      "div",
                      {
                        style: {
                          overflow: "hidden",
                          "text-overflow": "ellipsis",
                          display: "-webkit-box",
                          "-webkit-line-clamp": 2,
                          "-webkit-box-orient": "vertical"
                        }
                      },
                      params.row.dealer_parent_nickname
                    ),
                    h("div", params.row.dealer_parent_mobile)
                  ]
                )
              : h("div", "总店");
          }
        },
        {
          title: "统计业绩周期",
          minWidth: 130,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                [
                  this.startTime.getFullYear(),
                  this.startTime.getMonth() + 1,
                  this.startTime.getDate()
                ].join(".")
              ),
              "-",
              h(
                "span",
                [
                  this.endTime.getFullYear(),
                  this.endTime.getMonth() + 1,
                  this.endTime.getDate()
                ].join(".")
              )
            ]);
          }
        }
      ],
      dealerList: []
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
    tabChangeFlag(val) {
      let index = this.tabChangeArray.findIndex(item => item === val);
      this.$router.replace({
        name: "dealerStatistics",
        query: {
          tab: index
        }
      });
      this.resetSearchParamsData();
      // 还原搜索条件
      this.searchData = Object.assign(
        {},
        this.searchData,
        getSearchData(index)
      );
      this.dealerList = [];
      this.total = 0;
      this.currentPage = 1;
      // 清除列表排序样式
      this.$refs["exportTable"].$refs["selection"].cloneColumns.forEach(
        item => {
          item._sortType = "normal";
        }
      );
    }
  },
  created() {
    this.$store.state.COMMON_loading = true;
    this.resetSearchParamsData();
    this.getList();
    this.getdealerLevelList();
  },
  methods: {
    resetSearchParamsData() {
      let index = this.tabChangeArray.findIndex(
        item => item === this.tabChangeFlag
      );
      let monthParamIndex = this.searchParams.findIndex(
        item => item.key === "count_num"
      );
      // 更新要显示的搜索列表
      if (index === 2) {
        if (monthParamIndex > -1) {
          this.searchParams.splice(monthParamIndex, 1);
        }
      } else {
        this.searchParams.splice(4, monthParamIndex > -1 ? 1 : 0, {
          type: 3,
          key: "count_num",
          combine: "countTime",
          placeholder: "请选择",
          options: monthData[index]
        });
      }
    },
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
    /**
     * 获取经销商等级列表
     */
    getdealerLevelList() {
      this.$httpPost("/shop/admin/dealer/level/list", null, res => {
        this.$store.state.COMMON_loading = false;
        if (res.code === 200) {
          let levelData = res.data.list || [];
          this.searchParams
            .filter(item => item.key === "dealer_level")
            .forEach(item => {
              this.$set(item, "options", [
                ...item.options,
                ...levelData.map(item => {
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
      });
    },
    /**
     * 分页改变重新拉取数据
     */
    onPageChange(val) {
      this.currentPage = val;
      this.getList();
    },
    onPageSizeChange(size) {
      this.currentPage = 1;
      this.pageSize = size;
      this.getList();
    },
    /**
     * 排序回调
     */
    onSortChange(data) {
      this.searchData.order_by = data.order != "normal" ? data.key : "";
      this.searchData.order_sort = data.order != "normal" ? data.order : "desc";
    },
    /**
     * table选择变化时触发
     */
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
      data.is_all = val;
      this.exprotData(data);
    },
    onExportListDataClick() {
      if (!this.selectTableData || this.selectTableData.length === 0) {
        this.$Message.error("请选择要导出的内容");
        return;
      }
      if (this.dealerList.length > this.selectTableData.length) {
        let data = this.getSearchData();
        delete data.page;
        delete data.page_size;
        data = Object.assign(
          { ids: this.selectTableData.map(item => item.member_id) },
          data
        );
        this.exprotData(data);
      } else {
        this.tableListExportStatus = true;
      }
    },
    exprotData(data) {
      commonFunction.exportTable(
        data,
        this.http,
        "/shop/admin/dealer/performance/export"
      );
    },
    getSearchData() {
      return Object.assign(
        {
          page: this.currentPage,
          page_size: this.pageSize,
          count_type: this.tabChangeArray.findIndex(
            item => item === this.tabChangeFlag
          )
        },
        this.searchData
      );
    },
    /**
     * 获取列表数据
     */
    getList() {
      this.tableLoading = true;
      this.$httpPost(
        "/shop/admin/dealer/performance/list",
        this.getSearchData(),
        res => {
          this.$store.state.COMMON_loading = false;
          this.tableLoading = false;
          if (res.code === 200) {
            this.dealerList = res.data.list;
            this.total = res.data.total;
            this.currentPage = res.data.current;
            this.pageSize = res.data.page_size;
            this.startTime = new Date(res.data.time_start);
            this.endTime = new Date(res.data.time_end);
            this.successCallBack();
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    /**
     * 返回头部
     */
    successCallBack() {
      this.$el && this.yunzhiHome.scrollToTop();
    }
  }
};
</script>
<style lang="less" scoped>
.dealer-statistics {
  /deep/.ivu-tabs {
    .ivu-tabs-bar {
      margin-bottom: 0;
      padding: 0 24px;
    }
  }
  .dealer-statistics-content {
    padding: 24px 24px 0;
    height: calc(100vh - 120px);
    overflow: auto;
    /deep/.data-list-search {
      /deep/.data-list-search-btn {
        /deep/.ivu-btn {
          width: 58px;
        }
      }
    }
    /deep/.ivu-table-wrapper {
      /deep/.ivu-table-header {
        & > table > thead > tr > th {
          .more-message {
            font-weight: lighter;
            margin-left: 5px;
          }
          .ivu-table-sort {
            left: -4px;
          }
        }
      }
    }
  }
}
</style>
