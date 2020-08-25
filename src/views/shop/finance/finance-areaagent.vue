<template>
  <div class="finance-area-agent">
    <search-list :searchParams="searchParams" :searchData="searchData" class="marketing-search">
      <Button @click="onExportTableList" perm="area.agent.settle.view">导出</Button>
    </search-list>
    <btn-group :data="filterData" v-model="filter" @on-click="clickTabs"></btn-group>
    <common-table :minWidth="1158" :columnsData="Columns" :listData="listData" @selectData="onSelectionChange"></common-table>
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
      :tableListExportStatus="isShowExportModal"
      @exportList="exportList"
      @cancelExportList="cancelExportList"
    ></export-modal>
  </div>
</template>
<script>
import btnGroup from "@/views/shop/components/button/btn-group.vue";
import searchList from "@/views/shop/components/search/search-list.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import exportModal from "@/views/shop/components/export/export-modal.vue";
import commonFunction from "@/views/shop/components/common-function.js";
const strMap = {
  province: "省代",
  city: "市代",
  district: "区代"
}
const statusMap = {
  1: {
    text: "预计发放",
    class: "table-warning"
  },
  2: {
    text: "已发放",
    class: "table-success"
  },
  3: {
    text: "失效",
    class: "table-end"
  }
}
export default {
  components: {
    btnGroup,
    searchList,
    commonTable,
    exportModal
  },
  data() {
    return {
      exportData: {},
      selectedData: [],
      isShowExportModal: false,
      total: 1, // 总数量
      currentPage: 1, // 当前页
      pageSize: 10, // 当前页数量
      searchParams: [
        {
          type: 1,
          key: "keyword",
          placeholder: "订单号",
          prefixIcon: "ios-search"
        }, {
          type: 2,
          name: "下单时间：",
          showDate: true,
          key: "times"
        }
      ],
      searchData: {
        keyword: "",
        times: {
          // 下单时间
          startTime: "",
          endTime: ""
        }
      },
      filter: "-1",
      filterData:[
        {
          name: "全部",
          value: "-1"
        },
        {
          name: "预计发放返佣",
          value: "1"
        }, 
        {
          name: "已发放返佣",
          value: "2"
        }, 
        {
          name: "失效返佣",
          value: "3"
        }
      ],
      listData: [],
      Columns: [
        {
          type: 'selection',
          width: 40,
          align: 'center'
        },
        {
          title: "订单号/下单时间",
          key: "order_id",
          align: "left",
          minWidth: 240,
          render: (h, p) => {
            return h("div", {}, [
              h("div", {
                style: {
                  cursor: "pointer"
                },
                on: {
                  click: () => {
                    this.$router.push({
                      name: "orderShopDetail",
                      query: {
                        id: p.row.order_id
                      }
                    });
                  }
                }
              }, p.row.order_id),
              h("div", p.row.created_at)
            ]);
          }
        },{
          title: "订单金额",
          key: "order_money",
          align: "center",
          minWidth: 200,
          render: (h, p) => {
            return h("div", "￥" + p.row.order_money);
          }
        },{
          title: "订单区域返佣",
          key: "total_commission",
          align: "center",
          minWidth: 200,
          render: (h, p) => {
            return h("div", "￥" + p.row.total_commission);
          }
        },{
          title: "区域级别返佣",
          key: "area_agent_commission",
          align: "left",
          minWidth: 278,
          render: (h, p) => {
            return h("div", {}, p.row.area_agent_commission.map(item => {
              return h("div", {
                style: {
                  "display": "-webkit-box",
                  "-webkit-line-clamp": 1,
                  "-webkit-box-orient": "vertical",
                  "text-overflow": "ellipsis",
                  "overflow": "hidden"
                }
              }, `${strMap[item.area_type]}：￥${item.money} / ${item.nickname}`);
            }));
          }
        },{
          title: "发放状态",
          key: "area_agent_commission_status",
          align: "center",
          minWidth: 200,
          render: (h, p) => {
            return h("div", {
              class: statusMap[p.row.area_agent_commission_status].class
            }, statusMap[p.row.area_agent_commission_status].text);
          }
        }
      ]
    }
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
  created() {
    this.getList();
  },
  methods: {
    getSearchData() {
      return {
        keyword: this.searchData.keyword,
        page: this.currentPage,
        page_size: this.pageSize,
        status: this.filter,
        created_at_min: this.searchData.times.startTime,
        created_at_max: this.searchData.times.endTime
      }
    },
    cancelExportList() {
      this.isShowExportModal = false;
    },
    exportList(val) {
      if (val === 1) {
        this.exportData = this.getSearchData();
        this.exportData.is_all = 1;
      } else {
        this.exportData.ids = this.selectedData.map(item => item.order_id);
      }
      commonFunction.exportTable(
        this.exportData,
        this.http,
        "/shop/admin/area/agent/commission/export"
      );
      this.isShowExportModal = false;
    },
    // 导出功能
    onExportTableList() {
      if (this.selectedData.length === 0) {
        this.$Message.error("请选择要导出的内容");
        return;
      }
      this.exportData = {};
      if (this.listData.length > this.selectedData.length) {
        this.exportData.ids = this.selectedData.map(item => item.order_id);
        commonFunction.exportTable(
          this.exportData,
          this.http,
          "/shop/admin/area/agent/commission/export" 
        );
      } else {
        this.isShowExportModal = true;
      }
    },
    // 选中
    onSelectionChange(val) {
      this.selectedData = val;
    },
    // 切换标签
    clickTabs(filter) {
      this.currentPage = 1;
      this.filter = filter;
      this.getList();
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
    getList() {
      var data = this.getSearchData();
      this.$httpPost("/shop/admin/area/agent/commission/list", data, res => {
        if(res.code == 200) {
          this.listData = [];
          this.$nextTick(() => {
            this.listData = res.data.list;
            this.total = res.data.total;
          })
        } else {
          this.$Message.error(res.msg)
        }
      })
    }
  }
}
</script>
<style lang='less' scoped>
.finance-area-agent {
  padding: 24px 24px 0;
}
</style>