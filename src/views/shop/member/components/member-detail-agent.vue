<template>
  <div class="member-detail-agent">
    <!-- 头部信息 -->
    <div class="member-detail-agent-head">
      <div class="member-detail-agent-head-left">
        <div
          class="member-detail-agent-head-image"
          :style="`background-image: url(${getHeadImg(value.headurl)});`"
        ></div>
        <div class="member-detail-agent-head-info">
          <div>昵称：{{value.nickname}}</div>
          <div>姓名：{{value.name||"--"}}</div>
          <div>会员ID：{{value.id}}</div>
          <div>手机号：{{value.mobile}}</div>
          <div>代理商等级：{{agentLevelText[value.agent_level - 1]}}</div>
        </div>
      </div>
      <div class="member-detail-agent-head-right">
        <div class="member-detail-agent-head-item">
          <titlebar title="代理团队人数概况"></titlebar>
          <div class="member-detail-agent-head-item-content">
            <div class="member-detail-agent-head-item-line">
              <span>团队总成员：</span>
              {{value.all_agent_total || "0"}}
              <more-message class="notice-text" :text="'团队总人数包括自己'"></more-message>
            </div>
            <div class="member-detail-agent-head-item-line" v-if="value.agent_level === 1">
              <span>二级代理人数：</span>
              {{value.level2_agent_count || "0"}}
            </div>
            <div class="member-detail-agent-head-item-line" v-if="value.agent_level <= 2">
              <span>三级代理人数：</span>
              {{value.level3_agent_count || "0"}}
            </div>
          </div>
        </div>
        <div class="member-detail-agent-head-item">
          <titlebar title="代理团队业绩概况"></titlebar>
          <div class="member-detail-agent-head-item-content">
            <div class="member-detail-agent-head-item-line">
              <span>业绩总笔数：</span>
              {{value.order_buy_times || 0}}笔
            </div>
            <div class="member-detail-agent-head-item-line">
              <span>业绩总金额：</span>
              ￥{{value.order_buy_money || "0.00"}}
            </div>
          </div>
        </div>
        <div class="member-detail-agent-head-item">
          <titlebar title="代理分红概况"></titlebar>
          <div class="member-detail-agent-head-item-content">
            <div class="member-detail-agent-head-item-flex">
              <div>
                <div class="member-detail-agent-head-item-line">
                  <span>分红总收益：</span>
                  ￥{{value.agent_commission_total}}
                </div>
                <div class="member-detail-agent-head-item-line">
                  <span>订单分红：</span>
                  ￥{{value.agent_commission_order}}
                </div>
                <div class="member-detail-agent-head-item-line">
                  <span>销售奖：</span>
                  ￥{{value.agent_commission_sale_reward}}
                </div>
                <div class="member-detail-agent-head-item-line">
                  <span>推荐奖：</span>
                  ￥{{value.agent_commission_recommend}}
                </div>
                <div class="member-detail-agent-head-item-line">
                  <span>业绩奖：</span>
                  ￥{{value.agent_commission_performance}}
                </div>
              </div>
              <div>
                <div class="member-detail-agent-head-item-line">
                  <span>可提现分红：</span>
                  ￥{{value.agent_commission_balance}}
                </div>
                <div class="member-detail-agent-head-item-line">
                  <span>预计到账分红：</span>
                  ￥{{value.agent_commission_unsettled}}
                </div>
                <div class="member-detail-agent-head-item-line">
                  <span>提现中分红：</span>
                  ￥{{value.agent_commission_check}}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="member-detail-agent-content">
      <div class="member-detail-agent-search">
        <search-list ref="searchList" :searchParams="searchParams" @getChangeLevel="getChangeLevel" :search-data="searchData" :onLine="true" />
      </div>

      <common-table
        :minWidth="962"
        v-if="tabIndex === 'agent' && Object.keys(value).length"
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
const agentLevelText = ["一级代理", "二级代理", "三级代理"];
import memberInfor from "@/views/shop/components/table/member-infor.vue";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
const searchData = {
  keyword: "",
  id_type: -1,
  distributor_level: -1,
  agent_level: -1,
  search_level: -1,
  search_level_type:"1",
};
const getAgentLevel = () => {
  let levelArray = [{ id: -1, value: "代理商全部等级" }];
  new Array(3).fill(null).forEach((item, index) => {
    levelArray.push({
      id: index + 1,
      value: agentLevelText[index]
    });
  });
  return levelArray;
};
const getDistributorLevel = (levelData = []) => {
  let levelArray = [{ id: -1, value: "分销商全部等级" }];
  levelData.forEach(item => {
    levelArray.push({
      id: item.id,
      value: item.name
    });
  });
  return levelArray;
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
    configInfo: {
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
          key: "id_type",
          placeholder: "请选择身份",
          options: [
            { id: -1, value: "全部身份" },
            { id: 0, value: "会员" },
            this.hasLicensePerm('ENABLE_DISTRIBUTION') 
            ? { id: 1, value: "分销商" } : null,
            this.hasLicensePerm("ENABLE_AGENT") ?
              { id: 2, value: "代理商" } : null,
            this.hasLicensePerm("ENABLE_CLOUDSTOCK") ?
              { id: 3, value: "经销商" } : null
          ].filter(item => item)
        },
        {
          type: 12,
          key: "search_level",
          optionKey: "search_level_type",
          options: [],
          optionsType: [
            {
              id: "1",
              value: "会员等级"
            },
            this.hasLicensePerm("ENABLE_DISTRIBUTION")
              ? {
                id: "2",
                value: "分销商等级"
              }
              : "",
            this.hasLicensePerm("ENABLE_AGENT")
              ? {
                id: "3",
                value: "代理商等级"
              }
              : "",
            this.hasLicensePerm("ENABLE_CLOUDSTOCK")
              ? {
                id: "4",
                value: "经销商等级"
              }
              : ""
          ].filter(item => item)
        },
        // this.hasLicensePerm('ENABLE_DISTRIBUTION')
        // ? {
        //   type: 3,
        //   key: "distributor_level",
        //   placeholder: "请选择分销商等级",
        //   options: getDistributorLevel()
        // } : null,
        // {
        //   type: 3,
        //   key: "agent_level",
        //   placeholder: "请选择代理商等级",
        //   options: getAgentLevel()
        // }
      ].filter(item => item),
      agentLevelText,
      searchData: Object.assign({}, searchData),
      tableLoading: false,
      columnsData: [
        {
          title: "会员信息",
          align: "left",
          minWidth: 220,
          render: (h, params) => {
              return h(memberInfor, {
                  props:{
                      id:Number(params.row.id),
                      headurl:this.getHeadImg(params.row.headurl),
                      nickname:params.row.nickname,
                      name:params.row.name||'--',
                      mobile:params.row.mobile
                  }
              });
          }
        },
        {
          title: "身份等级",
          align: "left",
          minWidth: 200,
          render: (h, params) => {
            // 会员当前等级
            let memberLevelItem = this.configInfo.member_level.find(
              item => item.id === params.row.member_level
            );
            // 分销当前等级
            let distributorLevelItem =
              this.configInfo.distribution_setting_level &&
              this.configInfo.distribution_level.find(
                item => item.id === params.row.distributor_level
              );
            // 经销当前等级
            let levels = Object.assign([], (this.configInfo && this.configInfo.dealer_level) || []);
            let dealerLevelItem =
              levels &&
              levels.filter(
                item => item.id === params.row.dealer_level
              );
            let paramsItem = [];
            paramsItem.push(
              h(
                "div",
                "会员：" + ((memberLevelItem && memberLevelItem.name) || "--")
              )
            );
            if (this.hasLicensePerm('ENABLE_DISTRIBUTION') && params.row.is_distributor > 0) {
              paramsItem.push(
                h("div", "分销商：" + (distributorLevelItem.name || "--"))
              );
            }
            if (this.hasLicensePerm("ENABLE_AGENT")&&params.row.agent_level) {
              paramsItem.push(
                h("div", "代理商：" + agentLevelText[params.row.agent_level - 1])
              );
            }
            if (this.hasLicensePerm("ENABLE_CLOUDSTOCK")&&params.row.dealer_level) {
              paramsItem.push(
                h("div", "经销商：" + (dealerLevelItem[0].name || "--"))
              );
            }
            return h("div", paramsItem);
          }
        },
        {
          title: "注册时间",
          align: "left",
          minWidth: 150,
          key: "created_at"
        },
        {
          title: "团队成员",
          align: "left",
          minWidth: 148,
          render: (h, params) => {
            let paramsItem = [];
            params.row.agent_level &&
              paramsItem.push([
                h("div", [
                  "总数：",
                  h(
                    "span",
                    {
                      style: {
                        color: "#4570EA",
                        textDecoration: "underline",
                        cursor: "pointer"
                      },
                      on: {
                        click: () => {
                          this.$router.push({
                            name: "memberDetail",
                            query: {
                              id: params.row.id,
                              tab: 2
                            }
                          });
                        }
                      }
                    },
                    params.row.sub_count_total
                  )
                ])
              ]);
            if (
              params.row.agent_level === 2 &&
              Number(params.row.sub_count_agent3)
            ) {
              paramsItem.push(
                h("div", "三级代理：" + params.row.sub_count_agent3)
              );
            }
            return h(
              "div",
              {
                style: {
                  marginLeft: paramsItem.length ? "" : "20px"
                }
              },
              paramsItem.length ? paramsItem : "--"
            );
          }
        },
        {
          align: "center",
          minWidth: 124,
          renderHeader: h => {
            return h("div", [
              h(
                "span",
                {
                  style: {
                    verticalAlign: "middle",
                    marginRight: "10px"
                  }
                },
                "分红贡献值"
              ),
              h(
                "Poptip",
                {
                  style: {
                    verticalAlign: "middle",
                    fontWeight: "initial"
                  },
                  props: {
                    trigger: "hover",
                    title: "分红贡献值",
                    transfer: true,
                    content: "该代理(包括其团队）/成员给上级贡献的分红",
                    placement: "top-end",
                    offset: 15
                  }
                },
                [
                  h("i", {
                    class: "iconfont icon-md-information-circl"
                  })
                ]
              )
            ]);
          },
          render: (h, params) => {
            return h("div", "￥" + params.row.sub_commission);
          }
        },
        {
          align: "center",
          minWidth: 120,
          renderHeader: h => {
            return h("div", [
              h(
                "span",
                {
                  style: {
                    verticalAlign: "middle",
                    marginRight: "10px"
                  }
                },
                "分红总收益"
              ),
              h(
                "Poptip",
                {
                  style: {
                    verticalAlign: "middle",
                    fontWeight: "initial"
                  },
                  props: {
                    trigger: "hover",
                    title: "佣金总收益",
                    transfer: true,
                    content: "该代理自身佣金总收益",
                    placement: "top-end",
                    offset: 15
                  }
                },
                [
                  h("i", {
                    class: "iconfont icon-md-information-circl"
                  })
                ]
              )
            ]);
          },
          render: (h, params) => {
            return h(
              "div",
              params.row.agent_level
                ? "￥" + params.row.agent_commission_total
                : "--"
            );
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
        this.getList();
      },
      deep: true
    },
    configInfo: {
      handler(val) {
        if (val) {
          this.searchParams = this.searchParams.filter(item => {
            if (item.key === "distributor_level") {
              item.options = getDistributorLevel(val.distribution_level);
            }
            return true;
          });
        }
      },
      immediate: true
    }
  },
  methods: {
    resetData() {
      this.currentPage = 1;
      this.listData = [];
      this.searchData = Object.assign({}, searchData);
    },
    //获取搜索列表所选等级
    getChangeLevel(val) {
      this.$httpGet(
        "/shop/admin/member/level/type/list",
        { type: val },
        res => {
          if (res.code === 200) {
            let arrs = [
              {
                id: -1,
                value: "全部"
              }
            ];
            for (let i = 0; i < res.data.length; i++) {
              arrs.push({
                id: res.data[i].id,
                value: res.data[i].name
              });
            }
            this.$set(this.searchParams[this.searchParams.length-1], "options", arrs);
            if (this.$refs["searchList"].searchDataCopy.search_level != -1) {
              this.$set(this.$refs["searchList"].searchDataCopy, "search_level", -1);
            }
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
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
        "/shop/admin/member/agent/list",
        {
          member_id: this.$route.query.id,
          keyword: this.searchData.keyword,
          id_type:
            this.searchData.id_type === -1 ? "" : this.searchData.id_type,
          distributor_level:
            this.searchData.distributor_level === -1
              ? ""
              : this.searchData.distributor_level,
          agent_level:
            this.searchData.agent_level === -1
              ? ""
              : this.searchData.agent_level,
          search_level:this.searchData.search_level,
          search_level_type:this.searchData.search_level_type,
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
  },
  mounted() {
    this.getChangeLevel(this.searchData.search_level_type);
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
      width: 200px;
      height: 221px;
      box-sizing: border-box;
      text-align: center;
      padding-top: 20px;
      border: 1px solid @border-color;
      border-radius: 5px 0 0 5px;
      background-color: #fcfcfd;
      .member-detail-agent-head-image {
        width: 63px;
        height: 63px;
        border-radius: 5px;
        margin: 0 auto 12px;
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
      }
      .member-detail-agent-head-info {
        line-height: 22px;
        text-align: left;
        font-size: 13px;
        padding: 0 20px;
        color: #657180;
        & > div {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
    }
    .member-detail-agent-head-right {
      display: flex;
      width: calc(100% - 200px);
      height: 221px;
      .member-detail-agent-head-item {
        padding-left: 16px;
        border: 1px solid @border-color;
        border-left: none;
        /deep/.vertical-line-titlebar-wrapper {
          font-size: 14px;
          margin-bottom: 15px;
          margin-top: 10px;
        }
        &:nth-child(1) {
          width: 210px;
        }
        &:nth-child(2) {
          width: 245px;
        }
        &:nth-child(3) {
          flex: 1;
        }
        &:last-child {
          border-radius: 0 5px 5px 0;
        }
        .member-detail-agent-head-item-content {
          padding: 0 14px;
          .member-detail-agent-head-item-line {
            color: #657180;
            line-height: 28px;
            // span {
            //   &:first-child {
            //     font-weight: bold;
            //   }
            // }
            .notice-text {
              margin-top: -2px;
            }
          }
        }
      }
      .member-detail-agent-head-item-flex {
        display: flex;
        & > div {
          width: 180px;
          margin-right: 16px;
        }
      }
    }
  }
  .member-detail-agent-content {
    // margin-top: 24px;
    // .member-detail-agent-search {
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
