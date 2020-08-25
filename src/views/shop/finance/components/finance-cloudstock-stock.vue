<template>
  <div class="finance-cloudstock-stock">
    <search-list :searchParams="searchParams" :searchData="searchData" class="shop-search">
      <Button v-show="true" @click="onExportTableList" perm="cloudstock.settle.view">导出</Button>
    </search-list>
    <multi-span-table
      :columnsData="columnsData"
      :listData="listData"
      :summaryRender="summaryRender"
      subPropName="items"
      :selectable="true"
      :loading="tableLoading"
      @selectChange="selectChange"
    ></multi-span-table>
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
    <export-modal
      :tableListExportStatus="isShowExportModal"
      @exportList="exportList"
      @cancelExportList="cancelExportList"
    ></export-modal>
  </div>
</template>
<script>
const statusMap = {
  0: { text: "待付款", className: "table-warning" },
  1: { text: "待财务审核", className: "table-warning" },
  2: { text: "待配仓", className: "table-warning" },
  3: { text: "已完成", className: "table-success" },
  4: { text: "取消订单", className: "table-error" }
};
import axios from "axios";
import searchList from "@/views/shop/components/search/search-list.vue";
import exportModal from "@/views/shop/components/export/export-modal.vue";
import commonFunction from "@/views/shop/components/common-function.js";
import multiSpanTable from "./multi-span-table.vue";
export default {
  components: {
    searchList,
    exportModal,
    multiSpanTable
  },
  data() {
    return {
      total: 0,
      page: 1,
      pageSize: 10,
      tableLoading: false,
      selectedData: [],
      isShowExportModal: false,
      exportData: {}, // 导出传参
      searchParams: [
        {
          type: 10,
          name: "",
          prefixIcon: "ios-search",
          key: "keyword",
          optionKey: "keyword_type",
          optionWidth: 80,
          placeholder: {
            1: "订单号",
            2: "昵称/手机",
            3: "昵称/手机"
          },
          options: [
            { id: 1, value: "订单号" },
            { id: 2, value: "云仓买家" },
            { id: 3, value: "云仓卖家" }
          ]
        },
        {
          type: 2,
          name: "结算时间：",
          showDate: true,
          key: "orderTimes"
        }
      ],
      searchData: {
        keyword: "",
        keyword_type: 1,
        orderTimes: {
          startTime: "",
          endTime: ""
        }
      },
      listData: [],
      summaryRender: (h, p) => {
        return h("div", [
          h(
            "span",
            {
              style: {
                "margin-right": "50px"
              }
            },
            "结算时间：" + p.row.finished_at
          ),
          h(
            "span",
            {
              style: {
                "margin-right": "50px"
              }
            },
            "进货单号：" + p.row.order_id
          ),
          h(
            "span",
            {
              style: {
                "margin-right": "50px"
              }
            },
            "订单状态：" + p.row.status_text
          ),
          h("span", "买家信息：" + p.row.buyer_nickname+"/"+p.row.buyer_mobile)
        ]);
      },
      columnsData: [
        {
          key: "product",
          title: "商品信息",
          minWidth: 288,
          render: (h, p) => {
            let img = h("img", {
              style: {
                "flex-shrink": 0,
                width: "40px",
                height: "40px",
                "object-fit": "contain",
                "border-radius": "5px"
              },
              attrs: {
                src: p.row.image
              }
            });
            let info = h(
              "div",
              {
                style: {
                  "margin-left": "14px",
                  "line-height": "normal"
                }
              },
              [
                h(
                  "div",
                  {
                    class: "two-hide"
                  },
                  p.row.product_name
                ),
                p.row.sku_name && p.row.sku_name.length
                  ? h(
                      "div",
                      {
                        style: {
                          color: "#9EA7B4",
                          "margin-top": "5px"
                        }
                      },
                      this.yzArrayToString(p.row.sku_name)
                    )
                  : null
              ]
            );
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  "align-items": "center"
                }
              },
              [img, info]
            );
          }
        },
        {
          key: "price",
          title: "云仓订货单价",
          align: "center",
          width: 218,
          render: (h, p) => {
            return h("span", "￥" + p.row.price);
          }
        },
        {
          key: "num",
          title: "数量",
          align: "center",
          width: 218
        },
        {
          key: "settlement",
          title: "配仓仓库/结算金额",
          align: "left",
          width: 318,
          render: (h, p) => {
            return h("div", [
              h(
                "div",
                "云仓：" +
                  p.row.cloudstock_nickname +
                  (p.row.cloudstock_mobile
                    ? " / " + p.row.cloudstock_mobile
                    : "")
              ),
              h("div", "结算：￥" + p.row.money)
            ]);
          }
        },
        {
          key: "total",
          rowSpan: true,
          title: "结算总额",
          align: "center",
          width: 118,
          render: (h, p) => {
            return h("span", "￥" + p.row.total);
          }
        }
      ]
    };
  },
  watch: {
    searchData: {
      handler() {
        this.page = 1;
        this.getList();
      },
      deep: true
    }
  },
  created() {
    this.getList();
  },
  methods: {
    formatURL(url) {
      return /^http/.test(url) ? url : this.$store.state.siteComdataPath + url;
    },
    changePage(page) {
      this.page = page;
      this.getList();
    },
    changePageSize(pageSize) {
      this.page = 1;
      this.pageSize = pageSize;
      this.getList();
    },
    getSearchData() {
      return {
        keyword: this.searchData.keyword,
        keyword_type: this.searchData.keyword_type,
        finished_at_min: this.searchData.orderTimes.startTime,
        finished_at_max: this.searchData.orderTimes.endTime
      };
    },
    getList() {
      this.$store.state.COMMON_loading = true;
      axios
        .post("/shop/admin/cloudstock/settle/list", {
          page: this.page,
          page_size: this.pageSize,
          ...this.getSearchData()
        })
        .then(res => {
          if (res.code == 200) {
            this.listData = [];
            setTimeout(() => {
              this.listData = Object.keys(res.data.list).map(item => {
                res.data.list[item].items &&
                  res.data.list[item].items.forEach(n => {
                    n.cloudstock_mobile = res.data.list[item].cloudstock_mobile;
                  });
                return res.data.list[item];
              });
            }, 30);
            this.total = res.data.total;
          } else {
            this.$Message.error(res.msg);
          }
          this.$store.state.COMMON_loading = false;
        })
        .catch(err => {
          this.$Message.error(err);
        })
        .finally(() => {
          this.$store.state.COMMON_loading = false;
        });
    },
    selectChange(data) {
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
        Object.assign(this.exportData, this.getSearchData());
      } else {
        this.selectedData.forEach(item => {
          this.exportData.ids.push(item.order_id);
        });
      }
      commonFunction.exportTable(
        this.exportData,
        this.http,
        "shop/admin/cloudstock/settle/export"
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
          "shop/admin/cloudstock/settle/export"
        );
      } else {
        this.isShowExportModal = true;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.finance-cloudstock-stock {
  padding: 24px 24px 0;
}
</style>