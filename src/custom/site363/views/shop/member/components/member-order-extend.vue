<template>
  <div class="order-shop">
    <search-list :searchParams="searchParams" :searchData="searchData" class="shop-search">
      <span>订单总额：{{total_money}}</span>
    </search-list>
    <order-shop-table
      :columnsData="columnsData"
      :listData="listData"
      :headData="headData"
      :loading="tableLoading"
      @backChooseData="backChooseData"
    ></order-shop-table>
    <div class="bar-pager">
      <Page
        v-if="total > 0"
        :total="total"
        :current="current"
        :page-size="page_size"
        @on-change="changePage"
        @on-page-size-change="changePageSize"
        show-sizer
        show-elevator
        class="page-style"
        :transfer="true"
      />
    </div>
  </div>
</template>

<script>
import searchList from "@/views/shop/components/search/search-list.vue";
import constants from "@/views/shop/components/constants.js";
import orderShopTable from "@/views/shop/order/components/order-shop-table.vue";
import commonFunction from "@/views/shop/components/common-function.js";
export default {
  components: {
    searchList,
    orderShopTable,
  },
  props: {
    value: {
      type: Object,
      default() {
        return {
          member_id: 0,
        };
      }
    }
  },
  data() {
    return {
      commonFunction,
      constants,
      tableLoading: false,
      selectTableData: [], // 选中的数据
      terminalTypes: constants.terminalTypes, // 终端来源
      headData: [], // 表格每列的头部数据
      searchData: {
        // 搜索框的值
        keyword: "",
        times: {
          // 交易时间
          startTime: "",
          endTime: ""
        }
      },
      current: 1,
      page_size: 10,
      total: 0,
      total_money: 0,
      searchParams: [
        {
          type: 1,
          key: "keyword",
          placeholder: "订单号/昵称/手机号",
          prefixIcon: "ios-search"
        },
        {
          type: 2,
          name: "下单时间：",
          showDate: true,
          key: "times"
        }
      ],
      listData: [],
      columnsData: [
        {
          title: "商品信息",
          minWidth: "228px",
          width: "20%",
          padding: "0 10px 0 15px",
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  position: "relative",
                  display: "flex",
                  "align-items": "center"
                }
              },
              [
                h("img", {
                  attrs: {
                    src: this.$store.state.siteComdataPath + params.row.image
                  },
                  style: {
                    display: "inline-block",
                    width: "50px",
                    height: "50px",
                    objectFit: "contain"
                  }
                }),
                h(
                  "div",
                  {
                    style: {
                      width: "calc(100% - 80px)",
                      "margin-left": "16px",
                      display: "inline-block"
                    }
                  },
                  [
                    h("div", [
                      h(
                        "Tooltip",
                        {
                          props: {
                            content: params.row.name,
                            maxWidth: 300,
                            transfer: true,
                            placement: "top"
                          }
                        },
                        [
                          h(
                            "span",
                            {
                              class: {
                                "two-hide": true
                              }
                            },
                            params.row.name
                          )
                        ]
                      )
                    ]),
                    h(
                      "Tooltip",
                      {
                        props: {
                          content: this.yzArrayToString(params.row.sku_names),
                          maxWidth: 300,
                          transfer: true,
                          placement: "top"
                        },
                        class: {
                          isHide: !(params.row.sku_names && params.row.sku_names.length)
                        }
                      },
                      [
                        h(
                          "span",
                          {
                            style: {
                              color: "#9ea7b4"
                            },
                            class: {
                              "one-hide": true
                            }
                          },
                          this.yzArrayToString(params.row.sku_names)
                        )
                      ]
                    )
                  ]
                )
              ]
            );
          }
        },
        {
          title: "单价",
          align: "center",
          minWidth: "100px",
          render(h, p) {
            return h("span", "￥" + p.row.price);
          }
        },
        {
          title: "数量",
          key: "num",
          minWidth: "80px",
          align: "center"
        },
        {
          title: "订单金额",
          align: "center",
          minWidth: "126px",
          status: "order",
          showIndex: true, // 显示合并的那一列
          rowSpan: true, // 是否合并
          expandComponents: "orderGoodsComponent" // 动态组件
        },
        {
          title: "买家信息",
          minWidth: "160px",
          align: "center",
          showIndex: true, // 显示合并的那一列
          rowSpan: true, // 是否合并
          status: "news",
          expandComponents: "orderGoodsComponent" // 动态组件
        }
      ],
    };
  },
  watch: {
    searchData: {
      handler() {
        this.current = 1;
        this.getList();
      },
      deep: true
    }
  },
  methods: {
    // 售后状态存在显示售后装填， 否则显示订单状态
    isShowafterSele(afterSeleStatus, afterSeleType, val) {
      if (afterSeleStatus !== null) {
        let name = "";
        if (afterSeleType === 0) {
          name = "退款";
        } else {
          name = "退货";
        }
        // 退款或退货成功
        let newName = "";
        if (afterSeleStatus === 5) {
          newName =
            name + this.matchName(afterSeleStatus, this.constants.refundStatus);
        } else {
          newName =
            this.matchName(afterSeleStatus, this.constants.refundStatus) + name;
        }
        return newName;
      } else {
        return this.matchName(val, this.constants.orderStatus);
      }
    },
    backChooseData(data) {
      this.selectTableData = data;
    },
    // 匹配名称
    matchName(val, data) {
      let names = "";
      data.forEach(item => {
        if (val === item.id) {
          names = item.value;
        }
      });
      return names;
    },
    // 分页
    changePage(val) {
      this.current = val;
      this.getList();
    },
    // 条数
    changePageSize(val) {
      this.current = 1;
      this.page_size = val;
      this.getList();
    },
    dataList() {
      this.current = 1;
      this.getList();
    },
    // 获取列表数据
    getList() {
      let obj = {};
      if (!this.value.member_id) {
        return;
      }
      obj.member_id = this.value.member_id;
      obj.keyword = this.searchData.keyword;
      obj.created_end = this.searchData.times.endTime;
      obj.created_start = this.searchData.times.startTime;
      obj.page_size = this.page_size;
      obj.page = this.current;
      this.tableLoading = true;
      this.$httpPost("/shop/admin/custom/distribution/order/list", obj, res => {
        this.tableLoading = false;
        if (res.code === 200) {
          this.listData = [];
          this.total = res.data.total;
          this.total_money = res.data.total_money;
          this.page_size = res.data.page_size;
          this.current = res.data.current;
          this.listData = res.data.list;
          let arr = [];
          this.listData.forEach(item => {
            let obj = {};
            this.terminalTypes.forEach(el => {
              if (el.id === item.terminal_type) {
                item.terminals = el.value;
              }
            });
            this.constants.orderStatus.forEach(items => {
              if (items.id === item.status) {
                item.name = items.value;
              }
            });
            (obj["a"] = [
              { key: "下单时间：", value: item.created_at },
              { key: "总订单号：", value: item.id },
              { key: "总订单状态：", value: item.name },
            ]);
            arr.push(obj);
          });
          this.headData = arr;
          this.listData.forEach(item => {
            let target = null;
            item.can_deliver = false;
            item.item_list.forEach(items => {
              items.receiver_name = item.receiver_name;
              items.receiver_tel = item.receiver_tel;
              items.prov = item.prov;
              items.city = item.city;
              items.area = item.area;
              items.receiver_address = item.receiver_address;
            });
            if (target) {
              target.rowspan = 1;
            }
          });
        }
      });
    }
  },
  created() {
    // 如果修改了searchData则不用手动调用getList
    if (this.$route.query.keyword) {
      this.searchData.keyword = this.$route.query.keyword;
    } else {
      this.getList();
    }
  }
};
</script>

<style lang="less" scoped>
.order-shop {
  padding: 24px 24px 0;
  height: 100%;
  overflow: auto;
  .shop-search{
    /deep/.data-list-search-btn{
      /deep/.ivu-btn{
        width: 58px;
      }
    }
  }
  /deep/.is-hide {
    display: none;
  }
  /deep/.row-table {
    thead {
      tr {
        height: 0 !important;
      }
    }

    .tobdy-margin::before {
      margin-bottom: 10px !important;
    }
  }
}
</style>
