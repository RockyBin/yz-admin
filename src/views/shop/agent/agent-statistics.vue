<template>
  <div class="agent-statistics" v-show="!$store.state.COMMON_loading">
    <Tabs v-model="tabChangeFlag" :animated="false">
      <TabPane
        :label="() => {return $createElement('div', `月度团队业绩`)}"
        :name="tabChangeArray[0]"
      ></TabPane>
      <TabPane
        :label="() => {return $createElement('div', `季度团队业绩`)}"
        :name="tabChangeArray[1]"
      ></TabPane>
      <TabPane
        :label="() => {return $createElement('div', `年度团队业绩`)}"
        :name="tabChangeArray[2]"
      ></TabPane>
    </Tabs>
    <div class="agent-statistics-content">
      <search-list :searchParams="searchParams" :search-data="searchData" :onLine="true">
        <Button @click="onExportListDataClick" perm="agent.performance.view">导出</Button>
      </search-list>
      <common-table
        ref="exportTable"
        :minWidth="1093"
        :loading="tableLoading"
        :columnsData="columnsData"
        :listData="agentList"
        @onSortChange="onSortChange"
        @selectData="onSelectionChange"
      ></common-table>
      <div class="bar-pager">
        <Page
          :total="total"
          v-show="agentList.length"
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
    }))(),
  []
];
const getSearchData = (index = 0) => {
  return {
    keyword: "",
    agent_level: -1,
    agent_parent_id: -1,
    count_year: new Date().getFullYear(),
    count_num: [
      new Date().getMonth() + 1,
      Math.ceil((new Date().getMonth() + 1) / 3),
      ""
    ][index],
    period: 1,
    order_by: "",
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
    return {
      tabChangeArray: tabNameArray,
      tabChangeFlag: tabNameArray[this.$route.query.tab || 0] ? tabNameArray[this.$route.query.tab || 0] : tabNameArray[0],
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
          key: "agent_level",
          name: "代理等级：",
          placeholder: "请选择",
          options: [
            {
              id: -1,
              value: "全部"
            },
            {
              id: 1,
              value: "一级代理"
            },
            {
              id: 2,
              value: "二级代理"
            },
            {
              id: 3,
              value: "三级代理"
            }
          ]
        },
        {
          type: 3,
          key: "agent_parent_id",
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
          key: "period",
          name: "统计数据：",
          options: [
            {
              id: 0,
              value: "付款后"
            },
            {
              id: 1,
              value: "维权期后"
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
        (this.$route.query.tab || 0) < 2 ? {
          type: 3,
          key: "count_num",
          combine: "countTime",
          placeholder: "请选择",
          options: monthData[this.$route.query.tab || 0]
        } : null
      ].filter(item => item),
      searchData: getSearchData(this.$route.query.tab),
      tableLoading: false,
      columnsData: [
        {
          type: "selection", // 开启checkbox
          width: 40,
          className: "agent-statistics-selection",
          align: "center"
        },
        {
          title: "代理商信息",
          minWidth: 186,
          render: (h, params) => {
              return h(memberInfor, {
                  props:{
                      id:Number(params.row.member_id),
                      headurl:this.padImgUrl(params.row.member_headurl) ||
                          "images/head-portrait.png",
                      nickname:params.row.member_nickname,
                      mobile:params.row.member_mobile,
                      name:params.row.member_name || '--'
                  },
                  attrs: {
                      perm: "member.detail.view"
                  }
              });
          }
        },
        {
          title: "代理等级",
          minWidth: 186,
          key: "agent_level",
          align: "center",
          render: (h, params) => {
            return h("div", params.row.member_agent_level_text || "暂无");
          }
        },
        {
          title: "团队业绩统计",
          minWidth: 186,
          key: "performance",
          sortable: "custom",
          align: "center",
          render: (h, params) => {
            return h("div", "￥" + params.row.performance);
          }
        },
        {
          title: "上级领导",
          minWidth: 186,
          align: "center",
          render: (h, params) => {
            return params.row.agent_parent_id
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
                            id: params.row.agent_parent_id
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
                      params.row.agent_parent_nickname
                    ),
                    h("div", params.row.agent_parent_mobile)
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
      agentList: []
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
        name: "agentStatistics",
        query: {
          tab: index
        }
      });
      let monthParamIndex = this.searchParams.findIndex(
        item => item.key === "count_num"
      );
      // 更新要显示的搜索列表
      if (index === 2) {
        if (monthParamIndex > -1) {
          this.searchParams.splice(monthParamIndex, 1);
        }
      } else {
        this.searchParams.splice(5, monthParamIndex > -1 ? 1 : 0, {
          type: 3,
          key: "count_num",
          combine: "countTime",
          placeholder: "请选择",
          options: monthData[index]
        });
      }
      // 还原搜索条件
      this.searchData = Object.assign(
        {},
        this.searchData,
        getSearchData(index)
      );
      this.agentList = [];
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
    this.getList();
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
      if (this.agentList.length > this.selectTableData.length) {
        let data = this.getSearchData();
        delete data.page;
        delete data.page_size;
        data = Object.assign({ ids: this.selectTableData.map(item => item.member_id) }, data);
        this.exprotData(data);
      } else {
        this.tableListExportStatus = true;
      }
    },
    exprotData(data) {
      commonFunction.exportTable(
        data,
        this.http,
        "/shop/admin/agent/performance/export"
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
        "/shop/admin/agent/performance/list",
        this.getSearchData(),
        res => {
          this.$store.state.COMMON_loading = false;
          this.tableLoading = false;
          if (res.code === 200) {
            this.agentList = res.data.list;
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
.agent-statistics {
  /deep/.ivu-tabs {
    .ivu-tabs-bar {
      margin-bottom: 0;
      padding: 0 24px;
    }
  }
  /*/deep/.agent-statistics-selection {*/
    /*border-right: none;*/
    /*& + th .ivu-table-cell,*/
    /*& + td .ivu-table-cell {*/
      /*padding-left: 0;*/
    /*}*/
  /*}*/
  .agent-statistics-content {
    padding: 24px 24px 0;
    height: calc(100vh - 120px);
    overflow:auto;
    /deep/.data-list-search{
      /deep/.data-list-search-btn{
        /deep/.ivu-btn{
          width: 58px;
        }
      }
    }
  }
  // /deep/.data-list-search {
  //   padding: 16px 16px 2px;
  //   margin-right: 0;
  //   margin-bottom: 24px;
  //   background-color: #f8f9fd;
  // }
}
</style>
