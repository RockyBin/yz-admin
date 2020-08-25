<template>
<div class="finance-cloudstock-stock">
  <search-list :searchParams="searchParams" :searchData="searchData" class="shop-search">
    <Button @click="onExportTableList" perm="cloudstock.settle.view">导出</Button>
  </search-list>
  <multi-span-table
    :columnsData="columnsData"
    :listData="listData"
    :summaryRender="summaryRender"
    subPropName="item_list"
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
</div>
</template>
<script>
const statusMap = {
  0: {text: "待付款", className: "table-warning"},
  1: {text: "待财务审核", className: "table-warning"},
  2: {text: "待配仓", className: "table-warning"},
  3: {text: "已完成", className: "table-success"},
  4: {text: "取消订单", className: "table-error"}
}
import searchList from "@/views/shop/components/search/search-list.vue";
import multiSpanTable from "./multi-span-table.vue";
export default {
  components:{
    searchList,
    multiSpanTable
  },
  data() {
    return {
      total: 10,
      page: 1,
      pageSize: 10,
      tableLoading: false,
      selectTableData: [],
      searchParams: [
        {
          type: 1,
          key: "keyword",
          placeholder: "订单号/手机号/昵称",
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
      listData: [],
      summaryRender: (h, p) => {
        return h("div",[
          h("span", {
            style: {
              "margin-right": "50px"
            }
          }, "结算时间：" + p.row.settlementTime),
          h("span", {
            style: {
              "margin-right": "50px"
            }
          }, "总订单号：" + p.row.orderNumber),
          h("span", {
            style: {
              "margin-right": "50px"
            }
          }, "订单状态：" + statusMap[p.row.orderStatus].text),
          h("span","买家信息：" + p.row.buyerInfo),
        ])
      },
      columnsData: [
        {
          key: "product",
          title: "商品信息",
          minWidth: 288,
          render: (h, p) => {
            let img = h("img", {
              style: {
                "width": "40px",
                "height": "40px",
                "object-fit": "contain",
                "border-radius": "5px"
              },
              attrs: {
                src: p.row.productImg
              }
            })
            let info = h("div",{
              style: {
                "margin-left": "14px",
                "line-height": "normal"
              }
            },[
              h("div", {
                class: "two-hide"
              }, p.row.productName),
              p.row.sku_name && JSON.parse(p.row.sku_name).length && h('div', {
                style: {
                  "color": "#9CACC7",
                  "margin-top": "5px"
                }
              }, "规格：" + JSON.parse(p.row.sku_name).join('，'))
            ])
            return h("div", {
              style: {
                "display":"flex",
                "align-items":"center"
              }
            }, [img, info])
          }
        },
        {
          key: "price",
          title: "商品单价（优惠前）",
          align: "center",
          width: 160,
          render: (h, p) => {
            return h("span","￥" + p.row.price)
          }
        },
        {
          key: "realPrice",
          title: "实付单价",
          align: "center",
          width: 160,
          render: (h, p) => {
            return h("span","￥" + p.row.realPrice)
          }
        },
        {
          key: "totalCount",
          title: "下单总数量",
          align: "center",
          width: 160,
        },
        {
          key: "settlement",
          rowSplit: true,
          title: "发货仓库/结算数量/金额",
          align: "left",
          minWidth: 230,
          render: (h, p) => {
            let length = p.row.cellList.length
            return h("div", p.row.cellList.map((item, index) => {
              return h("div",{
                style: {
                  "display": "flex",
                  "justify-content": "flex-start",
                  "align-items": "center",
                  "height": "70px",
                  "padding": "0 14px",
                  "border-bottom": index < length - 1 ? "1px solid #DCDEE2" : "none"
                }
              }, [
                h("div", [
                  h("div","云仓：" + item.cloudstock),
                  h("div",[
                    h("span","数量：" + item.count),
                    h("span"," / 金额：￥" + item.amount)
                  ])
                ])
              ])
            }))
            // return h("div",[
            //   h("div",{
            //     style: {
            //       "display": "flex",
            //       "justify-content": "center",
            //       "align-items": "center",
            //       "height": "70px",
            //       "border-bottom": "1px solid #DCDEE2"
            //     }
            //   }, [
            //     h("div", [
            //       h("div","云仓：" + p.row.cloudstock),
            //       h("div","结算：￥" + p.row.settlement)
            //     ])
            //   ]),
            //   h("div",{
            //     style: {
            //       "display": "flex",
            //       "justify-content": "center",
            //       "align-items": "center",
            //       "height": "70px",
            //     }
            //   }, [
            //     h("div", [
            //       h("div","云仓：" + p.row.cloudstock),
            //       h("div","结算：￥" + p.row.settlement)
            //     ])
            //   ])
            // ])
          }
        },
        {
          key: "totalAmount",
          rowSpan: true,
          title: "结算总额",
          align: "center",
          width: 160,
          render: (h, p) => {
            return h("span","￥" + p.row.totalAmount)
          }
        }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    changePage(page) {
      this.page = page;
      this.getList();
    },
    changePageSize(pageSize) {
      this.pageSize = pageSize;
      this.getList();
    },
    getList() {
      // axios.get("", {

      // }).then(res => {
      //   if(res.code == 200){

      //   } else {
      //     thi.$Message.error(res.msg)
      //   }
      // }).catch(err => {
      //   this.$Message.error(err)
      // })

      this.listData = [
        {
          id: 1,
          orderNumber: "201908090876655",
          settlementTime: "2019-08-09 08:16:55",
          orderStatus: 1,
          buyerInfo: "测试小号的昵称",
          totalAmount: 360,
          item_list: [
            {
              productImg: "http://lorempixel.com/40/40",
              productName: "商品名称商品名称商品名称多规商品",
              sku_name: '["防滑","绿色"]',
              price: 120,
              realPrice:110,
              totalCount: 10,
              cellList: [
                {
                  count: 7,
                  amount: 770,
                  cloudstock: "昵称昵称1",
                },
                 {
                  count: 3,
                  amount: 330,
                  cloudstock: "昵称昵称1",
                }
              ]
            },
            {
              productImg: "http://lorempixel.com/40/40",
              productName: "商品名称商品名称商品名称多规商品",
              sku_name: '["防滑","绿色"]',
              price: 120,
              realPrice:110,
              totalCount: 10,
              cellList: [
                {
                  count: 5,
                  amount: 550,
                  cloudstock: "昵称昵称1",
                }
              ]
            }
          ]
        },
        {
          id: 2,
          orderNumber: "201908090876655",
          settlementTime: "2019-08-09 08:16:55",
          orderStatus: 1,
          buyerInfo: "测试小号的昵称",
          totalAmount: 360,
          item_list: [
            {
              productImg: "http://lorempixel.com/40/40",
              productName: "商品名称商品名称商品名称多规商品",
              sku_name: '["防滑","绿色"]',
              price: 120,
              realPrice:110,
              totalCount: 10,
              cellList: [
                {
                  count: 7,
                  amount: 770,
                  cloudstock: "昵称昵称1",
                },
                 {
                  count: 3,
                  amount: 330,
                  cloudstock: "昵称昵称1",
                }
              ]
            },
            {
              productImg: "http://lorempixel.com/40/40",
              productName: "商品名称商品名称商品名称多规商品",
              sku_name: '["防滑","绿色"]',
              price: 120,
              realPrice:110,
              totalCount: 10,
              cellList: [
                {
                  count: 5,
                  amount: 550,
                  cloudstock: "昵称昵称1",
                }
              ]
            }
          ]
        },
      ]
     
    },
    selectChange(data) {
      this.selectTableData = data;
    },
    onExportTableList() {
      if (this.selectTableData.length === 0) {
        this.$Message.error("请选择要导出的内容");
        return;
      }
    }
  }
}
</script>
<style lang="less" scoped>
  .finance-cloudstock-stock{
    padding: 24px 24px 0;
  }
</style>