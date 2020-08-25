<template>
  <div class="cloudstock-order-get">
    <search-list :searchParams="searchParams" :searchData="searchData" class="shop-search">
      <Button @click="onExportTableList" perm="cloudstock.order.view">导出</Button>
    </search-list>
    <btn-group :data="statusMap" v-model="status"></btn-group>
    <common-table
      :minWidth="1158"
      :loading="tableLoading"
      :columnsData="columnsData"
      :listData="listData"
      @selectData="onSelectionChange"
    ></common-table>
    <order-delivery
      v-model="isShowDeliverModal"
      :is_virtual="currentOrder.virtual_flag"
      :logisticsInfo="null"
      :orderDetail="currentOrder"
      :product_ids="[]"
      @deliverSuccess="getList()"
    ></order-delivery>
    <div class="bar-pager">
      <Page
        v-if="total > 0"
        :total="total"
        :current="page"
        :page-size="pageSize"
        @on-change="changePage"
        @on-page-size-change="changePageSize"
        show-sizer
        show-elevator
        :transfer="true"
      />
    </div>
    <export-modal :tableListExportStatus="isShowExportModal" @exportList="exportList" @cancelExportList="cancelExportList"></export-modal>
  </div>
</template>
<script>
import axios from "axios";
import {getOrderStatus as statusMap} from "./cloudstock-config.js"
import searchList from "@/views/shop/components/search/search-list.vue";
import btnGroup from "@/views/shop/components/button/btn-group.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import exportModal from "@/views/shop/components/export/export-modal.vue";
import orderDelivery from "./cloudstock-order-delivery.vue"
import commonFunction from "@/views/shop/components/common-function.js";
export default {
  components:{
    searchList,
    btnGroup,
    commonTable,
    orderDelivery,
    exportModal
  },
  inject: ["yunzhiHome"],
  data(){
    return {
      tableLoading:false,
      status: null,
      total: 0,
      page: 1,
      pageSize: 10,
      listData: [],
      selectedData:[],
      exportData: {}, // 导出传参
      isShowExportModal: false,
      isShowDeliverModal: false,
      currentOrder:{},
      statusMap,
      searchParams: [
        {
          type: 1,
          key: "keyword",
          placeholder: "订单号/手机号/昵称/姓名",
          prefixIcon: "ios-search"
        },
        {
          type: 2,
          name: "下单时间：",
          showDate: true,
          key: "getTimes"
        }
      ],
      searchData: {
        keyword: "",
        getTimes: {
          startTime: "",
          endTime: ""
        },
      },
      columnsData:[
        {
          type: 'selection',
          width: 40,
          align: 'center'
        },
        {
          key: "order_id",
          title: "提货单号",
        },
        {
          key: "userInfo",
          width: 232,
          title: "提货会员信息",
          render: (h, p) => {
            return h("div", {}, [
              h("div", p.row.nickname),
                h("div", p.row.name),
              h("div", p.row.mobile)
            ])
          }
        },
        {
          key: "product_num",
          title: "提货数量",
          align: "center"
        },
        {
          key: "created_at",
          title: "下单时间",
          render: (h, p) => {
            return h("div", {}, p.row.created_at.replace(/-/g, '.'))
          }
        },
        {
          key: "status",
          title: "状态",
          align: "left",
          render: (h, p) => {
            let status = this.statusMap.find(item => item.value == p.row.status)
            return status ? h("span",{
              class:status.className
            },status.name) 
            : h("span", "--")
          }
        },
        {
          key: "action",
          title: "操作",
          width: 130,
          render: (h, p) => {
            let viewOrder = h("span", {
              class: "table-operation",
              attrs: {
                perm: "cloudstock.order.view"
              },
              on: {
                click: () => {
                  this.$router.push({
                    name: "cloudstockOrderDetailGet",
                    query: {
                      order_id: p.row.order_id
                    }
                  })
                }
              }
            },"查看订单");
            let verticalLine = h("span", {
              class: "table-operation",
              style: {
                margin: "0 10px"
              }
            },"|")
            let deliver = h("span", {
              class: "table-operation",
              attrs: {
                perm: "cloudstock.order.operate"
              },
              on: {
                click: () => {
                  if(p.row.virtual_flag == 2) {
                    this.$router.push({
                      name: "cloudstockOrderDemolition",
                      query: {
                        order_id: p.row.order_id
                      }
                    })
                  } else {
                    this.currentOrder = p.row
                    this.isShowDeliverModal = true
                  }
                  
                }
              }
            },"发货")
            return h("div",p.row.status == 0 ? [viewOrder, verticalLine, deliver] : [viewOrder])
          }
        }
      ]
    }
  },
  watch: {
    searchData: {
      handler() {
        this.page = 1;
        this.getList();
      },
      deep: true
    },
    status() {
      this.page = 1;
      this.getList();
    }
  },
  created() {
    this.$store.state.COMMON_loading = true;
    this.getList();
  },
  methods: {
    changePage(page) {
      this.page = page;
      this.getList();
    },
    changePageSize(pageSize) {
      this.page = 1
      this.pageSize = pageSize;
      this.getList(true);
    },
    getList(flag) {
      this.tableLoading = true;
      this.$httpPost(
        "/shop/admin/cloudstock/take/delivery/order/list",
        {
          page: this.page,
          page_size: this.pageSize,
          status: this.status,
          keyword: this.searchData.keyword,
          created_at_start: this.searchData.getTimes.startTime,
          created_at_end: this.searchData.getTimes.endTime
        },
        res => {
          this.tableLoading = false;
          this.$store.state.COMMON_loading = false;
          if (res.code == 200) {
            this.setListData(res);
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    // 赋值列表数据
    setListData(res) {
      this.listData = res.data.list;
      this.total = res.data.total;
      this.successCallBack();
    },
    /**
     * 返回头部
     */
    successCallBack() {
      this.$el && this.yunzhiHome.scrollToTop();
    },

    onSelectionChange(data) {
      this.selectedData = data;
    },
    // 取消导出
    cancelExportList() {
      this.isShowExportModal = false;
    },
    // 导出当前页 0 导出所有 1
    exportList(val) {
      this.exportData.ids = [];
      if (val === 1) {
        this.exportData.show_all = 1;
      } else {
        this.selectedData.forEach(item => {
          this.exportData.ids.push(item.order_id);
        });
      }
      commonFunction.exportTable(
        this.exportData,
        this.http,
        "shop/admin/cloudstock/take/delivery/order/export"
      );
      this.isShowExportModal = false;
    },
    onExportTableList() {
      if (this.selectedData.length === 0) {
        this.$Message.error("请选择要导出的内容");
        return;
      }
      this.exportData.show_all = "";
      if (this.listData.length > this.selectedData.length) {
        this.exportData.ids = [];
        this.selectedData.forEach(item => {
          this.exportData.ids.push(item.order_id);
        });

        commonFunction.exportTable(
          this.exportData,
          this.http,
          "shop/admin/cloudstock/take/delivery/order/export"
        );
      } else {
        this.isShowExportModal = true;
      }
    }
  }
}
</script>
<style lang="less" scoped>
  .cloudstock-order-get{
    padding: 24px 24px 0;
  }
</style>