<template>
  <div class="agent-statistics" v-show="!$store.state.COMMON_loading">
    <Tabs v-model="tabChangeFlag" :animated="false">
      <TabPane
        :label="() => {return $createElement('div', `月度业绩`)}"
        :name="tabChangeArray[0]"
      ></TabPane>
      <TabPane
        :label="() => {return $createElement('div', `季度业绩`)}"
        :name="tabChangeArray[1]"
      ></TabPane>
      <TabPane
        :label="() => {return $createElement('div', `年度业绩`)}"
        :name="tabChangeArray[2]"
      ></TabPane>
    </Tabs>
    <div class="agent-statistics-content">
      <search-list :searchParams="searchParams" :search-data="searchData" @on-change="onSearchSelectChange" :onLine="true">
        <Button :loading="exportLoading" @click="onExportListDataClick" perm="area.agent.performance.view">导出</Button>
      </search-list>
      <common-table
        ref="exportTable"
        :minWidth="1093"
        :loading="tableLoading"
        :columnsData="columnsData"
        :listData="listData"
        @onSortChange="onSortChange"
        @selectData="onSelectionChange"
      ></common-table>
      <div class="bar-pager">
        <Page
          :total="total"
          v-show="listData.length"
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
import cityData from "@/views/shop/components/cityDataThree";
const getNewArea = list => {
  return list.map(item => {
    let item1 = { ...item };
    item1.id = item1.value;
    item1.value = item1.label;
    return item1;
  });
};
let province = getNewArea(cityData[0].provinceArr);
const monthData = [
  (() =>
    new Array(12).fill(null).map((item, index) => {
      return { id: index < 9 ? '0' + (index + 1) : String(index + 1), value: index + 1 + "月" };
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
    area_type: 0,
    prov: 0,
    city: 0,
    district: 0,
    count_year: new Date().getFullYear(),
    count_num: [
      new Date().getMonth() < 9 ? '0' + (new Date().getMonth() + 1) : String(new Date().getMonth() + 1),
      Math.ceil((new Date().getMonth() + 1) / 3),
      ""
    ][index],
    count_period: 1,
    order_by: {
      field: "",
      type: "desc"
    }
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
      exportLoading: false,
      tabChangeArray: tabNameArray,
      tabChangeFlag: tabNameArray[this.$route.query.tab || 0] ? tabNameArray[this.$route.query.tab || 0] : tabNameArray[0],
      tableListExportStatus: false,
      total: 0,
      pageSize: 20,
      currentPage: 1,
      searchParams: [
        {
          type: 1,
          name: "",
          prefixIcon: "ios-search",
          key: "keyword",
          placeholder: "手机/姓名/昵称"
        },
        {
          type: 3,
          key: "area_type",
          name: "区域级别：",
          placeholder: "请选择",
          options: [
            {
              id: 0,
              value: "全部"
            },
            {
              id: 10,
              value: "省代"
            },
            {
              id: 9,
              value: "市代"
            },
            {
              id: 8,
              value: "区代"
            }
          ]
        },
        {
          type: 3,
          key: "prov",
          combine: "agentarea",
          width: 140,
          name: "代理区域：",
          options: [{ id: 0, value: "所有省份" }, ...province]
        },
        {
          type: 3,
          key: "city",
          combine: "agentarea",
          width: 140,
          options: [{ id: 0, value: "所有城市" }]
        },
        {
          type: 3,
          key: "district",
          combine: "agentarea",
          width: 140,
          options: [{ id: 0, value: "所有区/县" }]
        },
        {
          type: 3,
          key: "count_period",
          name: "统计数据：",
          options: [
            {
              id: 1,
              value: "维权期后"
            },
            {
              id: 0,
              value: "付款后"
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
          title: "区域代理信息",
          minWidth: 186,
          render: (h, params) => {
              return h(memberInfor, {
                  props:{
                      id:Number(params.row.member_id),
                      headurl:this.padImgUrl(params.row.headurl) ||
                          "images/head-portrait.png",
                      nickname:params.row.nickname,
                      mobile:params.row.member_mobile,
                      name:params.row.name || '--'
                  },
                  attrs: {
                      perm: "member.detail.view"
                  }
              });
          }
        },
        {
          title: "级别/区域",
          minWidth: 186,
          key: "agent_level",
          align: "left",
          render: (h, params) => {
            return params.row.area_list && params.row.area_list.length ? h("Tooltip",
              {
                props: {
                  placement: "top",
                  "max-width": 500,
                  transfer: true
                }
              },
              [
                h("div", {}, this.getAreaNodeList(h, params.row.area_list)),
                h("div", {slot: "content"}, this.getAreaNodeList(h, params.row.area_list, true))
              ]
            ) : h("div", "--");
          }
        },
        {
          title: "区域业绩统计",
          minWidth: 186,
          key: "money",
          sortable: "custom",
          align: "center",
          render: (h, params) => {
            return h("div", "￥" + params.row.money);
          }
        },
        {
          title: "统计业绩周期",
          minWidth: 130,
          align: "center",
          render: (h, params) => {
            return h("div", `${params.row.date_time_text.start}-${params.row.date_time_text.end}`);
          }
        }
      ],
      listData: []
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
        name: "areaAgentAchievement",
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
        this.searchParams.splice(7, monthParamIndex > -1 ? 1 : 0, {
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
      this.listData = [];
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
     * 获取区代区域展示虚拟节点
     */
    getAreaNodeList(h, list, isToolTip) {
      var provList = list.filter(item => item.area_type == 10);
      var cityList = list.filter(item => item.area_type == 9);
      var districtList = list.filter(item => item.area_type == 8);
      return [
        provList.length && h("div", {
          style: { display: "flex" }
        }, [
          h("span", { style: { "flex-shrink": 0 } }, "省代："),
          h("span", { class: isToolTip ? "" : "one-hide" }, provList.map(item => item.prov_text).join("；"))
        ]),
        cityList.length && h("div", {
          style: { display: "flex" }
        }, [
          h("span", { style: { "flex-shrink": 0 } }, "市代："),
          h("span", { class: isToolTip ? "" : "one-hide" }, cityList.map(item => item.prov_text + "-"+ item.city_text).join("；"))
        ]),
        districtList.length && h("div", {
          style: { display: "flex" }
        }, [
          h("span", { style: { "flex-shrink": 0 } }, "区代："),
          h("span", { class: isToolTip ? "" : "one-hide" }, districtList.map(item => item.prov_text + "-"+ item.city_text + "-" + item.district_text).join("；"))
        ])
      ].filter(item => item);
    },
    onSearchSelectChange(newData, oldData) {
      let provinceStatus = newData.prov !== (oldData && oldData.prov);
      let cityStatus = newData.city !== (oldData && oldData.city);
      // 如果是省或城市修改才需要改下拉框内容
      if (provinceStatus || cityStatus) {
        this.searchParams.forEach(item => {
          // 如果是修改了省才需要改市的选择
          if (provinceStatus && item.key === "city") {
            let options = [{ id: 0, value: "所有城市" }];
            let selectProvince = province.find(n => n.id === newData.prov);
            if (selectProvince && selectProvince.children) {
              options.push(...getNewArea(selectProvince.children));
            }
            this.$set(item, "options", options);
            this.$set(newData, "city", 0);
            this.$set(newData, "district", 0);
          }
          // 不管是改省或市都需要更新市的选择
          if (cityStatus && item.key === "district") {
            let options = [{ id: 0, value: "所有区/县" }];
            let selectProvince = province.find(n => n.id === newData.prov);
            if (selectProvince && selectProvince.children) {
              let selectCity = getNewArea(selectProvince.children).find(
                n => n.id === newData.city
              );
              if (selectCity && selectCity.children) {
                options.push(...getNewArea(selectCity.children));
              }
            }
            this.$set(item, "options", options);
            this.$set(newData, "district", 0);
          }
        });
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
      this.searchData.order_by.field = data.order != "normal" ? data.key : "";
      this.searchData.order_by.type = data.order != "normal" ? data.order : "desc";
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
      if (this.listData.length > this.selectTableData.length) {
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
      this.exportLoading = true;
      commonFunction.exportTable(
        data,
        this.http,
        "/shop/admin/area/agent/performance/export"
      ).then(() => {
        this.exportLoading = false;
      });
    },
    getSearchData() {
      var data = Object.assign(
        {
          page: this.currentPage,
          page_size: this.pageSize,
          time_type: this.tabChangeArray.findIndex(
            item => item === this.tabChangeFlag
          ),
          date_time: String(this.searchData.count_year) + String(this.searchData.count_num)
        },
        this.searchData
      );
      delete data.count_year;
      delete data.count_num;
      return data;
    },
    /**
     * 获取列表数据
     */
    getList() {
      this.tableLoading = true;
      this.$httpPost(
        "/shop/admin/area/agent/performance/list",
        this.getSearchData(),
        res => {
          this.$store.state.COMMON_loading = false;
          this.tableLoading = false;
          if (res.code === 200) {
            this.listData = res.data.list;
            this.total = res.data.total;
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
  }
  // /deep/.data-list-search {
  //   padding: 16px 16px 2px;
  //   margin-right: 0;
  //   margin-bottom: 24px;
  //   background-color: #f8f9fd;
  // }
}
</style>
