<template>
  <div class="member-detail-agent">
    <!-- 头部信息 -->
    <div class="member-detail-agent-head">
      <div class="member-detail-agent-head-left">
        <div
          class="member-detail-agent-head-image"
          :style="`background-image: url(${value.headurl ? formatURL(value.headurl) : 'images/head-portrait.png'});`"
        ></div>
        <div class="member-detail-agent-head-info">
          <div>昵称：{{value.nickname}}</div>
          <div>会员ID：{{value.id}}</div>
          <div>手机号：{{value.mobile}}</div>
          <div style="white-space: normal;">经销商等级：<span style="display: inline-block;width: calc(100% - 72px);vertical-align: top;">{{value.level_names && value.level_names.length ? value.level_names.join(" - ") : "--"}}</span></div>
        </div>
      </div>
      <div class="member-detail-agent-head-right">
        <div class="member-detail-agent-head-item" style="position: relative;">
          <titlebar title="云仓商品结算概况"></titlebar>
          <more-message style="position: absolute;top: 9px;left: 150px;" text="云仓订单结算收入是指云仓回款，当系统设置了【货款打款给公司】，则经销商的下级订货时，公司给经销商的云仓回款收入"></more-message>
          <div class="member-detail-agent-head-item-content">
            <div class="member-detail-agent-head-item-flex">
              <div>
                <div class="member-detail-agent-head-item-line">
                  <span>云仓订单结算收入：</span>
                  ￥{{value.settle}}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="member-detail-agent-content">
      <div class="member-detail-agent-search">
        <search-list :searchParams="searchParams" :search-data="searchData" :onLine="true" />
      </div>

      <common-table
        :minWidth="962"
        :loading="tableLoading"
        :columnsData="columnsData"
        :listData="listData"
      ></common-table>
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
</template>
<script>
import titlebar from "@/views/shop/components/titlebar/vertical-line-titlebar";
import searchList from "@/views/shop/components/search/search-list.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
const searchData = {
  keyword: "",
  type: -1,
  beingTime: {
    startTime: "",
    endTime: ""
  }
};
export default {
  components: {
    titlebar,
    searchList,
    commonTable,
    moreMessage
  },
  inject: ["yunzhiHome"],
  data() {
    return {
      value: {
        settle: {}
      },
      searchParams: [
        {
          type: 1,
          name: "",
          prefixIcon: "ios-search",
          key: "keyword",
          placeholder: "商品名称/订单号"
        },
        {
          type: 3,
          key: "type",
          placeholder: "请选择",
          name: "结算类型：",
          options: [
            { id: -1, value: "全部" },
            { id: 2, value: "下级进货单" },
            // { id: 1, value: "C端零售订单" }
          ]
        },
        {
          type: 2,
          key: "beingTime",
          name: "结算时间："
        }
      ],
      searchData: JSON.parse(JSON.stringify(searchData)),
      tableLoading: false,
      columnsData: [
        {
          title: "商品",
          align: "left",
          minWidth: 382,
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  "align-items": "center"
                }
              },
              [
                h("img", {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  attrs: {
                    src: params.row.product_image
                  },
                  style: {
                    width: "44px",
                    height: "44px",
                    marginRight: "12px"
                  }
                }),
                h(
                  "div",
                  {
                    style: {
                      width: "calc(100% - 56px)",
                      "min-height": "44px"
                    }
                  },
                  [
                    h("div", {
                      style: {
                        overflow: "hidden",
                        "text-overflow": "ellipsis",
                        display: "-webkit-box",
                        "-webkit-line-clamp": 2,
                        "-webkit-box-orient": "vertical"
                      }
                    }, params.row.product_name),
                    params.row.sku_name && params.row.sku_name.length ? h("div", {
                      style: {
                        color: "#9EA7B4",
                        "margin-top": "5px"
                      }
                    }, this.yzArrayToString(params.row.sku_name)) : ""
                  ]
                )
              ]
            );
          }
        },
        {
          title: "结算单价",
          minWidth: 99,
          align: "left",
          render: (h, params) => {
            return h("div", [h("span", "￥" + params.row.price)]);
          }
        },
        {
          title: "数量",
          minWidth: 70,
          align: "left",
          render: (h, params) => {
            return h("div", params.row.num);
          }
        },
        {
          title: "结算金额",
          minWidth: 99,
          align: "left",
          render: (h, params) => {
            return h("div", [h("span", "￥" + params.row.money)]);
          }
        },
        {
          title: "结算类型",
          minWidth: 148,
          align: "left",
          render: (h, params) => {
            return h("div", params.row.order_type_text);
          }
        },
        {
          title: "所属订单/结算时间",
          minWidth: 146,
          align: "left",
          render: (h, params) => {
            return h("div", [
              h("div", params.row.order_id),
              h("div", params.row.settled_at)
            ]);
          }
        }
      ],
      listData: [],
      total: 0,
      currentPage: 1,
      pageSize: 20
    };
  },
  watch: {
    searchData: {
      handler() {
        this.currentPage = 1;
        this.getLoadingList();
      },
      deep: true
    }
  },
  created() {
    this.$store.state.COMMON_loading = true;
    Promise.all([this.getStorageDetail(), this.getList()])
      .catch(e => {
        this.$Message.error(e);
      })
      .finally(() => {
        this.$store.state.COMMON_loading = false;
      });
  },
  methods: {
    formatURL(url){
      return /^http/.test(url) ? url : this.$store.state.siteComdataPath + url
    },
    onPageChange(val) {
      this.currentPage = val;
      this.getLoadingList();
    },
    onPageSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.getLoadingList();
    },
    getStorageDetail() {
      return new Promise((resolve, reject) => {
        this.$httpPost(
          "/shop/admin/cloudstock/settlesummary",
          {
            member_id: this.$route.query.id
          },
          res => {
            if (res.code === 200) {
              this.value = res.data;
              resolve();
            } else {
              reject(res.msg);
            }
          }
        );
      });
    },
    getLoadingList() {
      this.tableLoading = true;
      this.getList()
        .catch(e => {
          this.$Message.error(e);
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
    getList() {
      return new Promise((resolve, reject) => {
        this.$httpPost(
          "/shop/admin/cloudstock/settlelist",
          {
            member_id: this.$route.query.id,
            keyword: this.searchData.keyword,
            type:
              this.searchData.type === -1 ? "" : this.searchData.type,
            created_at_min: this.searchData.beingTime.startTime,
            created_at_max: this.searchData.beingTime.endTime,
            page: this.currentPage,
            page_size: this.pageSize
          },
          res => {
            if (res.code === 200) {
              resolve();
              this.currentPage = res.data.current;
              this.total = res.data.total;
              this.listData = res.data.list;
              this.successCallBack();
            } else {
              reject(res.msg);
            }
          }
        );
      });
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
@border-color: #e9eaf2;
.member-detail-agent {
  padding: 24px;
  color: #464c5b;
  // 头部信息样式
  .member-detail-agent-head {
    display: flex;
    margin-bottom: 30px;
    .member-detail-agent-head-left {
      display: flex;
      width: 325px;
      min-height: 173px;
      box-sizing: border-box;
      text-align: center;
      padding: 5px 0 0;
      border: 1px solid @border-color;
      border-radius: 5px 0 0 5px;
      background-color: #fcfcfd;
      .member-detail-agent-head-image {
        width: 63px;
        height: 63px;
        border-radius: 5px;
        margin: 8px 0 0 13px;
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
      }
      .member-detail-agent-head-info {
        width: calc(100% - 76px);
        line-height: 32px;
        text-align: left;
        font-size: 12px;
        padding: 0 14px;
        & > div {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
    }
    .member-detail-agent-head-right {
      display: flex;
      width: calc(100% - 325px);
      min-height: 173px;
      .member-detail-agent-head-item {
        padding-left: 16px;
        border: 1px solid @border-color;
        border-left: none;
        flex: 1;
        /deep/.vertical-line-titlebar-wrapper {
          font-size: 14px;
          margin-top: 5px;
        }
        &:last-child {
          border-radius: 0 5px 5px 0;
        }
        .member-detail-agent-head-item-content {
          padding: 0 14px;
          font-size: 12px;
          .member-detail-agent-head-item-line {
            color: #657180;
            line-height: 32px;
          }
        }
      }
      .member-detail-agent-head-item-flex {
        display: flex;
        & > div {
          margin-right: 40px;
        }
      }
    }
  }
  .member-detail-agent-content {
    /deep/.page-style.ivu-page {
      text-align: right;
      line-height: 56px;
    }
  }
}
</style>
