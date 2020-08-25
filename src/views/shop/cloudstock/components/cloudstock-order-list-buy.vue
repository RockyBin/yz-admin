<template>
  <div class="cloudstock-order-buy">
    <search-list :searchParams="searchParams" :searchData="searchData" class="shop-search">
      <Button @click="onExportTableList" perm="cloudstock.order.view">导出</Button>
    </search-list>
    <btn-group :data="statusMap" v-model="status"></btn-group>
    <common-table
      :minWidth="1152"
      :loading="tableLoading"
      :columnsData="columnsData"
      :listData="listData"
      @selectData="onSelectionChange"
    ></common-table>
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
    <finance-verify :order_info="currentOrderInfo" :order_id="currentOrderId" v-model="isShowVerify"></finance-verify>
    <export-modal :tableListExportStatus="isShowExportModal" @exportList="exportList" @cancelExportList="cancelExportList"></export-modal>
  </div>
</template>
<script>
import axios from "axios";
import searchList from "@/views/shop/components/search/search-list.vue";
import btnGroup from "@/views/shop/components/button/btn-group.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import financeVerify from "./cloudstock-order-finance-verify.vue"
import exportModal from "@/views/shop/components/export/export-modal.vue";
import {buyOrderStatus as statusMap} from "./cloudstock-config.js"
import commonFunction from "@/views/shop/components/common-function.js";
export default {
  components:{
    searchList,
    btnGroup,
    commonTable,
    financeVerify,
    exportModal
  },
  inject: ["yunzhiHome"],
  data(){
    return {
      tableLoading:false,
      isShowVerify:false,
      currentOrderId: null,
      status: null, //订单状态 0=未支付 1=已支付 待审核 2=已审核 待配仓 3=完成 4=取消
      total: 0,
      page: 1,
      pageSize: 10,
      currentOrderInfo: {},
      listData:[],
      selectedData:[],
      exportData: {}, // 导出传参
      isShowExportModal: false,
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
          key: "orderTimes"
        }
      ],
      searchData: {
        keyword: "",
        orderTimes: {
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
          minWidth: 176,
          title: "进货单号",
        },
        {
          key: "buyerInfo",
          minWidth: 232,
          title: "买家信息",
          render: (h, p) => {
            return h("div", {}, [
              h("div", p.row.nickname),
                h("div", p.row.name),
              h("div", p.row.mobile)
            ])
          }
        },
        {
          key: "total_money",
          minWidth: 176,
          title: "订单金额",
          render: (h, p) => {
            return h("span","￥" + p.row.total_money)
          }
        },
        {
          key: "created_at",
          minWidth: 176,
          title: "下单时间",
          render: (h, p) => {
            return h("div", {}, p.row.created_at.replace(/-/g, '.'))
          }
        },
        {
          key: "status",
          minWidth: 176,
          title: "状态",
          render: (h, p) => {
            let status = this.statusMap.find(item => item.value == p.row.status)
            return status ? h("span",{
              class:status.className
            },p.row.status_text)
            : h("span", "--")
          }
        },
        {
          key: "action",
          title: "操作",
          minWidth: 176,
          render: (h, p) => {
            let viewOrder = h("span", {
              class: "table-operation",
              attrs: {
                perm: "cloudstock.order.view"
              },
              on: {
                click: () => {
                  this.$router.push({
                    name: "cloudstockOrderDetailBuy",
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
            let verifyOrder = h("span", {
              class: "table-operation",
              attrs: {
	              perm: "finance.operate & cloudstock.order.operate"
              },
              on: {
                click: () => {
                  this.isShowVerify = true
                  this.currentOrderId = p.row.order_id
                  axios.post("/shop/admin/cloudstock/purchase/finance/review/info", {
                    order_id: p.row.order_id
                  }).then(res => {
                    if(res.code == 200) {
                      this.currentOrderInfo = res.data
                    } else {
                      this.$Message.error(res.msg)
                    }
                  }).catch(e => {
                    this.$Message.error(e)
                  })
                }
              }
            },"审核")
            return h("div",p.row.status == 1&&!p.row.payee ? [viewOrder, verticalLine, verifyOrder] : [viewOrder])
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
      this.page = 1;
      this.pageSize = pageSize;
      this.getList(true);
    },
    getList(flag) {
      this.tableLoading = true;
      this.$httpPost(
        "/shop/admin/cloudstock/purchase/order/list",
        {
          page: this.page,
          page_size: this.pageSize,
          status: this.status,
          keyword: this.searchData.keyword,
          created_at_start: this.searchData.orderTimes.startTime,
          created_at_end: this.searchData.orderTimes.endTime
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
        "shop/admin/cloudstock/purchase/order/export"
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
          "shop/admin/cloudstock/purchase/order/export"
        );
      } else {
        this.isShowExportModal = true;
      }
    }
  }
}
</script>
<style lang="less" scoped>
  .cloudstock-order-buy{
    padding: 24px 24px 0;
    .shop-search{
      /deep/.data-list-search-btn{
        /deep/.ivu-btn{
          width: 58px;
        }
      }
    }
  }
</style>