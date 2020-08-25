<template>
  <div class="member-detail-dealer">
    <!-- 头部信息 -->
    <div class="member-detail-dealer-head">
      <div class="member-detail-dealer-head-left">
        <div
          class="member-detail-dealer-head-image"
          :style="`background-image: url(${getHeadImg(value.headurl)});`"
        ></div>
        <div class="member-detail-dealer-head-info">
          <div>昵称：{{ value.nickname }}</div>
          <div>姓名：{{ value.name || "--" }}</div>
          <div>会员ID：{{ value.id }}</div>
          <div>手机号：{{ value.mobile }}</div>
          <div style="white-space: normal;">
            经销商等级：<span
              style="display: inline-block;width: calc(100% - 78px);vertical-align: top;"
              >{{ value.dealer_level_text }}
              {{ value.dealer_hide_level ? " - " : "" }}
              {{ value.dealer_hide_level_text }}</span
            >
          </div>
        </div>
      </div>
      <div class="member-detail-dealer-head-right">
        <div class="member-detail-dealer-head-item">
          <titlebar title="团队概况"></titlebar>
          <div class="member-detail-dealer-head-item-content">
            <div class="member-detail-dealer-head-item-line">
              <span>下级经销商：</span>
              {{ value.sub_dealer_count || "0" }}
            </div>
          </div>
        </div>
        <div class="member-detail-dealer-head-item" v-if="value.money_data">
          <titlebar title="业绩概况"></titlebar>
          <div class="member-detail-dealer-head-item-content">
            <div class="member-detail-dealer-head-item-line">
              <span>个人业绩：</span>
              {{ value.member_order_count.order_num }}笔/￥{{
                value.member_order_count.total_money
              }}
              <more-message
                class="notice-text"
                :text="'个人业绩是指经销商自己订购的云仓虚拟库存的业绩统计'"
              ></more-message>
            </div>
            <div class="member-detail-dealer-head-item-line">
              <span>下级团队业绩：</span>
              {{ value.sub_order_count.order_num }}笔/￥{{
                value.sub_order_count.total_money
              }}
              <more-message
                class="notice-text"
                :text="
                  '下级团队业绩是指经销商的所有下级向自己订购的云仓虚拟库存的业绩统计'
                "
              ></more-message>
            </div>
          </div>
        </div>
        <div class="member-detail-dealer-head-item" v-if="value.money_data">
          <titlebar title="资金概况"></titlebar>
          <div class="member-detail-dealer-head-item-content">
            <div class="member-detail-dealer-head-item-flex">
              <div style="border-right: 1px dashed #e9eaf2">
                <div class="member-detail-dealer-head-item-line">
                  <span>资金累计：</span>
                  ￥{{ value.money_data.total }}
                </div>
                <div class="member-detail-dealer-head-item-line">
                  <span>云仓回款：</span>
                  ￥{{ value.money_data.order_all }}
                  <more-message
                    class="notice-text"
                    text="云仓回款是指当下级经销商下云仓订单时，货款支付到公司，待完成配仓后，公司返还给上级的云仓回款收入。"
                  ></more-message>
                </div>
                <div class="member-detail-dealer-head-item-line">
                  <span>业绩奖金：</span>
                  ￥{{ value.money_data.performance_reward }}
                </div>
                <div class="member-detail-dealer-head-item-line">
                  <span>推荐奖金：</span>
                  ￥{{ value.money_data.recommend_reward }}
                </div>
                <div class="member-detail-dealer-head-item-line">
                  <span>销售奖金：</span>
                  ￥{{ value.money_data.sale_reward }}
                </div>
                <div class="member-detail-dealer-head-item-line" v-show="false">
                  <span>业绩奖金：</span>
                  ￥{{ value.money_data.performance }}
                  <more-message
                    class="notice-text"
                    :text="'业绩奖金是指公司给经销商发放的业绩奖金。'"
                  ></more-message>
                </div>
              </div>
              <div>
                <div class="member-detail-dealer-head-item-line">
                  <span>可提现：</span>
                  ￥{{ value.money_data.balance }}
                </div>
                <div class="member-detail-dealer-head-item-line">
                  <span>提现中：</span>
                  ￥{{ value.money_data.freeze }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="member-detail-dealer-content">
      <div class="member-detail-dealer-search">
        <search-list
          :searchParams="searchParams"
          :search-data="searchData"
          :onLine="true"
          @on-change="onSearchOptionChange"
        />
      </div>

      <common-table
        :minWidth="982"
        v-if="tabIndex === 'dealer' && Object.keys(value).length"
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
import memberInfor from "@/views/shop/components/table/member-infor.vue";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
const searchData = {
  keyword: "",
  dealer_level: -1,
  dealer_hide_level: -1
};
export default {
  components: {
    titlebar,
    searchList,
    commonTable,
    moreMessage
  },
  inject: ["yunzhiHome"],
  props: {
    value: {
      type: Object,
      default() {
        return null;
      }
    },
    tabIndex: {
      type: String
    }
  },
  data() {
    return {
      defaultImg: require("../../images/head-portrait.png"),
      searchParams: [
        {
          type: 1,
          name: "",
          prefixIcon: "ios-search",
          key: "keyword",
          placeholder: "会员昵称/手机号"
        },
        {
          type: 3,
          key: "dealer_level",
          name: "经销商等级：",
          placeholder: "请选择经销商等级",
          options: [{ id: -1, value: "经销商全部等级" }]
        },
        ...(this.hasLicensePerm("ENABLE_DEALER_HIDE_LEVEL")
          ? [
              {
                type: 3,
                key: "dealer_hide_level",
                name: "隐藏等级：",
                options: [{ id: -1, value: "全部" }]
              }
            ]
          : [])
      ],
      searchData: Object.assign({}, searchData),
      tableLoading: false,
      columnsData: [
        {
          title: "会员信息",
          minWidth: 380,
          render: (h, params) => {
            return h(memberInfor, {
              props: {
                id: Number(params.row.id),
                headurl: this.getHeadImg(params.row.headurl),
                nickname: params.row.nickname,
                name:params.row.name||'--',
                mobile: params.row.mobile
              }
            });
          }
        },
        {
          title: "经销商等级",
          minWidth: 174,
          render: (h, params) => {
            return h("div", [
              h("div", params.row.dealer_level_name),
              h("div", params.row.dealer_hide_level_name)
            ]);
          }
        },
        // {
        //   title: "状态",
        //   width: 174,
        //   render: (h, params) => {
        //     return h(
        //       "span",
        //       {
        //         class: {
        //           "table-error": Number(params.row.status) === 0,
        //           "table-success": Number(params.row.status) === 1
        //         }
        //       },
        //       Number(params.row.status) === 1 ? "启用" : "禁用"
        //     );
        //   }
        // },
        {
          title: "个人业绩",
          minWidth: 200,
          render: (h, params) => {
            return h("div", [h("div", "￥" + params.row.performance)]);
          }
        },
        {
          title: "下级经销商",
          align: "center",
          minWidth: 228,
          render: (h, params) => {
            return h("div", [
              h("div", [
                h(
                  "a",
                  {
                    class: {
                      "table-operation": true
                    },
                    on: {
                      click: () => {
                        this.$router.push({
                          path: "/member/detail",
                          query: { id: params.row.id, tab: 3 }
                        });
                      }
                    }
                  },
                  params.row.sub_dealer
                )
              ])
            ]);
          }
        }
      ],
      listData: [],
      total: 0,
      currentPage: 1,
      pageSize: 20,
      dealerLevels: []
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
    "value.levels": {
      handler(val) {
        this.dealerLevels = Object.assign([], val);
        this.$set(
          this.searchParams.find(item => item.key === "dealer_level"),
          "options",
          [{ id: -1, value: "全部" }].concat(
            this.dealerLevels
              .filter(n => !n.parent_id)
              .map(item => ({
                id: item.id,
                value: item.name
              }))
          )
        );
        this.onSearchOptionChange(this.searchData);
      }
    }
  },
  methods: {
    onSearchOptionChange(data, old) {
      if (!data) return;
      let hiddenItem = this.searchParams.find(
        item => item.key === "dealer_hide_level"
      );
      hiddenItem &&
        this.$set(
          hiddenItem,
          "options",
          [{ id: -1, value: "全部" }].concat(
            this.dealerLevels
              .filter(
                n =>
                  (data.dealer_level === -1 && n.parent_id) ||
                  n.parent_id === data.dealer_level
              )
              .map(item => ({
                id: item.id,
                value: item.name
              }))
          )
        );
      if (data.dealer_level !== (old && old.dealer_level)) {
        this.$set(data, "dealer_hide_level", -1);
      }
    },
    resetData() {
      this.currentPage = 1;
      this.listData = [];
      console.log(1111);
      this.searchData = Object.assign({}, searchData);
    },
    getHeadImg(url) {
      if (url) {
        if (!/^(http)/i.test(url)) {
          return this.$store.state.siteComdataPath + url;
        }
        return url;
      } else {
        return this.defaultImg;
      }
    },
    onPageChange(val) {
      this.currentPage = val;
      this.getList();
    },
    onPageSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.getList();
    },
    getList() {
      this.tableLoading = true;
      this.$httpPost(
        "/shop/admin/member/dealer/list",
        {
          member_id: this.$route.query.id,
          keyword: this.searchData.keyword,
          dealer_level:
            this.searchData.dealer_level === -1
              ? ""
              : this.searchData.dealer_level,
          dealer_hide_level:
            this.searchData.dealer_hide_level === -1
              ? ""
              : this.searchData.dealer_hide_level,
          page: this.currentPage,
          page_size: this.pageSize
        },
        res => {
          this.tableLoading = false;
          if (res.code === 200) {
            this.currentPage = res.data.current;
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
@border-color: #e9eaf2;
.member-detail-dealer {
  padding: 24px;
  color: #464c5b;
  // 头部信息样式
  .member-detail-dealer-head {
    display: flex;
    margin-bottom: 30px;
    .member-detail-dealer-head-left {
      width: 255px;
      height: 240px;
      box-sizing: border-box;
      text-align: center;
      padding-top: 20px;
      border: 1px solid @border-color;
      border-radius: 5px 0 0 5px;
      background-color: #fcfcfd;
      .member-detail-dealer-head-image {
        width: 63px;
        height: 63px;
        border-radius: 5px;
        margin: 0 auto 12px;
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
      }
      .member-detail-dealer-head-info {
        line-height: 22px;
        text-align: left;
        font-size: 13px;
        padding: 0 16px;
        color: #657180;
        & > div {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
    }
    .member-detail-dealer-head-right {
      display: flex;
      width: calc(100% - 255px);
      height: 240px;
      .member-detail-dealer-head-item {
        padding-left: 16px;
        border: 1px solid @border-color;
        border-left: none;
        /deep/.vertical-line-titlebar-wrapper {
          font-size: 14px;
          margin-bottom: 15px;
          margin-top: 10px;
        }
        &:nth-child(1) {
          width: 195px;
        }
        &:nth-child(2) {
          width: 294px;
        }
        &:nth-child(3) {
          flex: 1;
        }
        &:last-child {
          border-radius: 0 5px 5px 0;
        }
        .member-detail-dealer-head-item-content {
          padding: 0 14px;
          .member-detail-dealer-head-item-line {
            color: #657180;
            line-height: 28px;
            .notice-text {
              margin-top: -2px;
            }
          }
        }
      }
      .member-detail-dealer-head-item-flex {
        display: flex;
        & > div {
          min-width: 180px;
          margin-right: 20px;
          &:last-child {
            margin-right: 0;
            min-width: 166px;
          }
        }
      }
    }
  }
  .member-detail-dealer-content {
    // margin-top: 24px;
    // .member-detail-dealer-search {
    //   padding: 16px 16px 0;
    //   margin: 26px 0;
    //   border-radius: 5px;
    //   background-color: #f8f9fd;
    // }
    /deep/.page-style.ivu-page {
      text-align: right;
      line-height: 56px;
    }
  }
}
</style>
