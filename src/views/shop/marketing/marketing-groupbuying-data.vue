<template>
  <div class="marketing-groupbuying-data">
    <search-list
      :searchParams="searchParams"
      :searchData="searchData"
      class="marketing-search"
    />
    <btn-group :data="filterData" v-model="name"></btn-group>
    <common-table
      ref="exportTable"
      :minWidth="1160"
      :loading="tableLoading"
      :columnsData="columnsData"
      :listData="listData"
    ></common-table>
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
  </div>
</template>
<script>
import btnGroup from "@/views/shop/components/button/btn-group.vue";
import searchList from "@/views/shop/components/search/search-list.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import moreMessage from "COMPONENTS/more-message/more-message";
export default {
  components: {
    btnGroup,
    searchList,
    commonTable
  },
  inject: ["yunzhiHome"],
  data() {
    return {
      tableLoading: false,
      total: 0, // 总数量
      currentPage: 1, // 当前页
      pageSize: 20, // 当前页数量
      listData: [],
      searchParams: [
        {
          type: 1,
          key: "keyword",
          placeholder: "活动名称",
          prefixIcon: "ios-search"
        }
      ],
      searchData: {
        // 优惠券搜索框的值
        keyword: this.$route.params.keyword || ""
      },
      filterData: [
        {
          name: "全部",
          value: ""
        },
        {
          name: "拼团中",
          value: "0"
        },
        {
          name: "拼团成功",
          value: "1"
        },
        {
          name: "拼团失败",
          value: "-1"
        }
      ],
      defaultImg: require("@/views/shop/images/head-portrait.png"),
      name: this.$route.query.tab || "", // 搜索的状态
      columnsData: [
        {
          title: "关联拼团活动",
          minWidth: 230,
          render: (h, params) => {
            return h("div", [h("div", params.row.title)]);
          }
        },
        {
          renderHeader: h => {
            return h("div", [
              h("span", "成团人数 /订单"),
              h(moreMessage, {
                props: {
                  text:
                    "成团人数/订单：统计真正参与拼团人\n数，匿名用户不计算在内"
                },
                style: {
                  fontWeight: "initial",
                  height: "14px",
                  lineHeight: "12px",
                  verticalAlign: "text-top"
                }
              })
            ]);
          },
          minWidth: 230,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  style: {
                    textDecoration: "underline",
                    color: "rgb(63, 102, 211)",
                    cursor: "pointer"
                  },
                  attrs: {
                    perm: "order.view"
                  },
                  on: {
                    click: () => {
                      this.$router.push({
                        name: "orderShop",
                        params: {
                          activity_id: params.row.id
                        }
                      })
                    }
                  }
                },
                params.row.current_people_num
              )
            ]);
          }
        },
        {
          title: "拼团成员",
          minWidth: 240,
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  padding: "12px 5px"
                }
              },
              [
                params.row.headurl.slice(0, 3).map((n, index) =>
                  h(
                    "div",
                    {
                      style: {
                        position: "relative",
                        width: "32px",
                        height: "32px",
                        marginLeft: index > 0 ? "20px" : ""
                      }
                    },
                    [
                      h("img", {
                        attrs: {
                          src: n ? this.formatURL(n) : this.defaultImg
                        },
                        style: {
                          display: "block",
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          "object-fit": "cover"
                        }
                      }),
                      index === 0
                        ? h(
                            "div",
                            {
                              style: {
                                position: "absolute",
                                left: "-2px",
                                bottom: "-11px",
                                width: "36px",
                                height: "20px",
                                lineHeight: "20px",
                                borderRadius: "4px",
                                color: "#fff",
                                textAlign: "center",
                                backgroundColor: "#FF9900"
                              }
                            },
                            "团长"
                          )
                        : "",
                      index === 2 && params.row.current_people_num > 3
                        ? h(
                            "div",
                            {
                              style: {
                                position: "absolute",
                                left: 0,
                                top: 0,
                                width: "100%",
                                height: "100%",
                                lineHeight: "32px",
                                borderRadius: "50%",
                                color: "#fff",
                                textAlign: "center",
                                backgroundColor: "rgba(0,0,0,0.5)"
                              }
                            },
                            "+" + (params.row.current_people_num - 2)
                          )
                        : ""
                    ]
                  )
                )
              ]
            );
          }
        },
        {
          title: "成团耗时",
          align: "center",
          minWidth: 230,
          render: (h, params) => {
            return h("div", [
              h(
                "div",
                params.row.status === 0
                  ? "--"
                  : this.getTime(params.row.spend_time)
              )
            ]);
          }
        },
        {
          title: "状态",
          align: "center",
          minWidth: 230,
          render: (h, params) => {
            return h(
              "span",
              {
                class: {
                  "table-warning": params.row.status === 0,
                  "table-success": params.row.status === 1,
                  "table-error": params.row.status === -1
                }
              },
              params.row.status === 0
                ? "拼团中"
                : params.row.status === 1
                ? "拼团成功"
                : "拼团失败"
            );
          }
        }
      ]
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
    name(val) {
      this.$router.replace({
        name: "marketingGroupbuyingData",
        query: val
          ? {
              tab: val
            }
          : {}
      });
      if (this.searchData.keyword !== "") {
        this.$set(this.searchData, "keyword", "");
      } else {
        this.currentPage = 1;
        this.getList();
      }
    }
  },
  created() {
    this.$store.state.COMMON_loading = true;
    this.getList();
  },
  methods: {
    formatURL(url) {
      return /^http/.test(url) ? url : this.$store.state.siteComdataPath + url;
    },
    getTime(time) {
      // 秒数
      let date = Math.floor(new Date(time).getTime());
      let min = Math.floor(date / 60) % 60;
      let hour = Math.floor(date / 60 / 60) % 24;
      let day = Math.floor(date / 60 / 60 / 24);
      return (
        (day ? day + "天" : "") +
        (day || hour ? hour + "小时" : "") +
        (day || hour || min ? min + "分" : "1分")
      );
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
    /**
     * 获取列表数据
     */
    getList() {
      this.tableLoading = true;
      this.$httpPost(
        "shop/admin/group/buying/list",
        {
          page: this.currentPage,
          page_size: this.pageSize,
          status: this.name ? Number(this.name) : "",
          keyword: this.searchData.keyword
        },
        res => {
          this.tableLoading = false;
          this.$store.state.COMMON_loading = false;
          if (res.code === 200) {
            this.total = res.data.total;
            this.listData = res.data.list;
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
.marketing-groupbuying-data {
  padding: 24px 24px 0;
}
</style>
