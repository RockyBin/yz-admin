<template>
  <div class="member-detail-agent">
    <!-- 头部信息 -->
    <div class="member-detail-agent-head">
      <div class="member-detail-agent-head-left">
        <div
          class="member-detail-agent-head-image"
          :style="`background-image: url(${value.headurl?getHeadImg(value.headurl):'images/head-portrait.png'});`"
        ></div>
        <div class="member-detail-agent-head-info">
          <div>昵称：{{value.nickname||"--"}}</div>
          <div>姓名：{{value.name||"--"}}</div>
          <div>会员ID：{{value.id}}</div>
          <div>手机号：{{value.mobile}}</div>
          <div v-if="value.is_distributor&&hasLicensePerm('ENABLE_DISTRIBUTION')">分销商等级：{{getLevel(value.distributor_level,2)}}</div>
          <div v-else>会员等级：{{getLevel(value.level,1)}}</div>
        </div>
      </div>
      <div v-if="value&&value.is_distributor&&hasLicensePerm('ENABLE_DISTRIBUTION')" class="member-detail-agent-head-right">
        <div class="member-detail-agent-head-item">
          <titlebar title="分销团队人数概况"></titlebar>
          <div class="member-detail-agent-head-item-content">
            <div class="member-detail-agent-head-item-line">
              <span>团队总人数：</span>
              {{value.total || 0}}（分销商{{value.distributor_total || 0}}/会员{{value.total - value.distributor_total - 1}}）
              <more-message class="notice-text" :text="'团队总人数包括自己'"></more-message>
            </div>
            <div class="member-detail-agent-head-item-line">
              <span>一级分销团队：</span>
              {{value.level1_num || 0}}（分销商{{value.level1_distributor_num || 0}}/会员{{value.level1_num - value.level1_distributor_num}}）
            </div>
            <div class="member-detail-agent-head-item-line">
              <span>二级分销团队：</span>
              {{value.level2_num || 0}}（分销商{{value.level2_distributor_num || 0}}/会员{{value.level2_num - value.level2_distributor_num}}）
            </div>
            <div class="member-detail-agent-head-item-line">
              <span>三级分销团队：</span>
              {{value.level3_num || 0}}（分销商{{value.level3_distributor_num || 0}}/会员{{value.level3_num - value.level3_distributor_num}}）
            </div>
          </div>
        </div>
        <div class="member-detail-agent-head-item">
          <titlebar title="分销团队业绩概况"></titlebar>（笔数/金额）
          <div class="member-detail-agent-head-item-content">
            <div class="member-detail-agent-head-item-line">
              <span>团队总业绩：</span>
              {{value.order_buy_times || 0}}笔/￥{{value.order_buy_money || '0.00'}}
            </div>
            <div class="member-detail-agent-head-item-line">
              <span>一级团队业绩：</span>
              {{value.level1_order_buy_times || 0}}笔/￥{{value.level1_order_buy_money || '0.00'}}
            </div>
            <div class="member-detail-agent-head-item-line">
              <span>二级团队业绩：</span>
              {{value.level2_order_buy_times || 0}}笔/￥{{value.level2_order_buy_money || '0.00'}}
            </div>
            <div class="member-detail-agent-head-item-line">
              <span>三级团队业绩：</span>
              {{value.level3_order_buy_times || 0}}笔/￥{{value.level3_order_buy_money || '0.00'}}
            </div>
            <div class="member-detail-agent-head-item-line">
              <span>自购分销业绩：</span>
              {{value.self_purchase_order_buy_times || 0}}笔/￥{{value.self_purchase_order_buy_money || '0.00'}}
            </div>
          </div>
        </div>
        <div class="member-detail-agent-head-item">
          <titlebar title="分销佣金概况"></titlebar>
          <div class="member-detail-agent-head-item-content">
            <div class="member-detail-agent-head-item-line">
              <span>佣金总收益：</span>
              ￥{{value.commission_total || '0.00'}}
            </div>
            <div class="member-detail-agent-head-item-line">
              <span>可提现佣金：</span>
              ￥{{value.commission_balance || '0.00'}}
            </div>
            <div class="member-detail-agent-head-item-line">
              <span>预计到账佣金：</span>
              ￥{{value.commission_unsettled || '0.00'}}
            </div>
            <div class="member-detail-agent-head-item-line">
              <span>提现中佣金：</span>
              ￥{{value.commission_check || '0.00'}}
            </div>
          </div>
        </div>
      </div>
      <div v-else class="member-detail-agent-head-right">
        <div class="member-detail-agent-head-item not-distributor">
          <titlebar title="直推下级"></titlebar>
          <div class="member-detail-agent-head-item-content">
            <div class="member-detail-agent-head-item-line" style="margin-top:60px">
              <span>直推下级总人数：</span>
              {{value && value.total || 0}}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="member-detail-agent-content">
      <search-list ref="searchList" :searchParams="searchParams" @getChangeLevel="getChangeLevel" :search-data="searchData" :onLine="true" />
      <common-table
        :minWidth="1093"
        v-if="tabIndex === 'distributor' && Object.keys(value).length"
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
import memberInfor from "@/views/shop/components/table/member-infor.vue";
const agentLevelText = ["一级代理", "二级代理", "三级代理"];
const initialSearchData = {
  keyword: "",
  id_type: -1, //身份 0 会员 1 分销商
  level: -1, //层级 1 2 3
  distributor_level: -1,
  search_level: -1,
  search_level_type:"1",
  registerTime: {
    startTime: "",
    endTime: ""
  },
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
  props: ["value", "configInfo", "tabIndex"],
  inject: ["yunzhiHome"],
  data() {
    return {
      baseSearchParams: [
        {
          type: 1,
          name: "",
          prefixIcon: "ios-search",
          key: "keyword",
          placeholder: "会员昵称/手机号"
        },
        this.hasLicensePerm("ENABLE_DISTRIBUTION") ? {
          type: 3,
          key: "level",
          name: "",
          placeholder: "请选择层级关系",
          options: [
            { id: -1, value: "全部层级" },
            { id: 1, value: "第一层级" },
            { id: 2, value: "第二层级" },
            { id: 3, value: "第三层级" }
          ]
        } : null,
        {
          type: 3,
          key: "id_type",
          name: "",
          options: [
            { id: -1, value: "全部身份" },
            { id: 0, value: "会员" },
            this.hasLicensePerm("ENABLE_DISTRIBUTION") ? 
            { id: 1, value: "分销商" } : null,
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
        // {
        //   type: 3,
        //   key: "member_level",
        //   name: "",
        //   options: [{ id: -1, value: "会员全部等级" }]
        // },
        // this.hasLicensePerm("ENABLE_DISTRIBUTION") ? {
        //   type: 3,
        //   key: "distributor_level",
        //   name: "",
        //   options: [{ id: -1, value: "分销商全部等级" }]
        // } : null
        // {
        //   type: 2,
        //   key: "registerTime",
        //   name: "注册时间："
        // },
        // {
        //   type: 2,
        //   key: "beingTime",
        //   name: "成为分销商时间："
        // }
      ].filter(item => item),
      searchData: JSON.parse(JSON.stringify(initialSearchData)),
      tableLoading: false,
      baseColumns: [
        {
          title: "会员信息",
          align: "left",
          render: (h, params) => {
              return h(memberInfor, {
                  props:{
                      id:Number(params.row.id),
                      headurl:params.row.headurl
                          ? this.getHeadImg(params.row.headurl)
                          : require("@/views/shop/images/head-portrait.png"),
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
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  style: { display: "block" }
                },
                "会员：" + this.getLevel(params.row.member_level, 1)
              ),
              this.hasLicensePerm("ENABLE_DISTRIBUTION")
                ? h(
                "span",
                {
                  style: { display: "block" }
                },
                params.row.is_distributor > 0
                  ? "分销商：" + this.getLevel(params.row.distributor_level, 2)
                  : ""
                )
                : null,
              this.hasLicensePerm("ENABLE_AGENT")
                ? h(
                "span",
                {
                  style: { display: "block" }
                },
                params.row.agent_level > 0
                  ? "代理商：" + agentLevelText[params.row.agent_level - 1]
                  : ""
                )
                : null,
              this.hasLicensePerm("ENABLE_CLOUDSTOCK")
                ? h(
                "span",
                {
                  style: { display: "block" }
                },
                params.row.dealer_level > 0
                  ? "经销商：" + this.getLevel(params.row.dealer_level, 4)
                  : ""
                )
                : null
            ]);
          }
        },
        {
          title: "注册时间",
          align: "left",
          key: "created_at"
        },
        this.hasLicensePerm('ENABLE_DISTRIBUTION') ? {
          title: "成为分销商时间",
          align: "left",
          key: "passed_at",
          render: (h, params) => {
            return h(
              "span",
              params.row.is_distributor ? params.row.passed_at : "--"
            );
          }
        } : null,
        {
          title: "直推下级",
          align: "left",
          render: (h, params) => {
            return h("div", [
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
                            tab: 1,
                            level: params.row.is_distributor ? 1 : -1
                          }
                        });
                      }
                    }
                  },
                  params.row.sub_count_total
                )
              ]),
              params.row.is_distributor && this.hasLicensePerm('ENABLE_DISTRIBUTION')
                ? h("div", "分销商：" + params.row.sub_count_distributor)
                : undefined,
              params.row.is_distributor
                ? h(
                    "div",
                    "会员：" +
                      (params.row.sub_count_total -
                        params.row.sub_count_distributor)
                  )
                : undefined
            ]);
          }
        }
      ].filter(item => item),
      agentLevelText,
      extendColumns: [
        {
          align: "center",
          renderHeader: h => {
            return h("div", [
              h("span", "佣金贡献值"),
              h(moreMessage, {
                style: {
                  verticalAlign: "middle",
                  fontWeight: "normal",
                  marginLeft: "5px"
                },
                props: {
                  text:
                    "该分销商的团队（包括当前分销商）给上级分销商贡献的佣金；该会员给上级分销商贡献的佣金。"
                }
              })
            ]);
          },
          render: (h, params) => {
            return h("div", "￥" + params.row.sub_commission);
          }
        },
        {
          align: "center",
          renderHeader: h => {
            return h("div", [
              h("span", "分销佣金总收益"),
              h(moreMessage, {
                style: {
                  verticalAlign: "middle",
                  fontWeight: "normal",
                  marginLeft: "5px"
                },
                props: {
                  text: "该分销商自身佣金总收益"
                }
              })
            ]);
          },
          render: (h, params) => {
            return h(
              "div",
              params.row.is_distributor
                ? "￥" + params.row.commission_total
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
    configInfo(value) {
      // let field1 = this.baseSearchParams.find(item => {
      //   return item.key == "distributor_level";
      // });
      // let field2 = this.baseSearchParams.find(item => {
      //   return item.key == "member_level";
      // });
      let field3 = this.baseSearchParams.find(item => {
        return item.key == "id_type";
      });
      // let field4 = this.baseSearchParams.find(item => {
      //   return item.key == "dealer_level";
      // });
      // if (value && field1) {
      //   value.distribution_level.forEach(item => {
      //     field1.options.push({
      //       id: item.id,
      //       value: item.name
      //     });
      //   });
      // }
      // if (value && field2) {
      //   value.member_level.forEach(item => {
      //     field2.options.push({
      //       id: item.id,
      //       value: item.name
      //     });
      //   });
      // }
      // if (value && field4) {
      //   value.dealer_level.forEach(item => {
      //     field2.options.push({
      //       id: item.id,
      //       value: item.name
      //     });
      //   });
      // }
      if (value && field3) {
        if (value.distribution_setting_level == 0) {
          field3.options.splice(2, 1);
        }
        if (value.agent_level == 0) {
          field3.options.splice(3, 1);
        }
      }
    }
  },
  computed: {
    columnsData() {
      if (this.value && this.value.is_distributor && this.hasLicensePerm('ENABLE_DISTRIBUTION')) {
        let columns = this.baseColumns.concat(this.extendColumns);
        let cloumnsWidth = [224, 194, 150, 150, 120, 120, 150];
        for (let i = 0; i < columns.length; i++) {
          columns[i].minWidth = cloumnsWidth[i];
        }
        return columns;
      }
      return this.baseColumns;
    },
    dis_data() {
      let data = {};
      if (this.configInfo) {
        this.configInfo.distribution_level.forEach(item => {
          data[item.id] = item;
        });
      }
      return data;
    },
    mem_data() {
      let data = {};
      if (this.configInfo) {
        this.configInfo.member_level.forEach(item => {
          data[item.id] = item;
        });
      }
      return data;
    },
    dea_data() {
      let data = {};
      let levels = Object.assign([], (this.configInfo && this.configInfo.dealer_level) || []);
      levels.filter(item => {
        data[item.id] = item;
      });
      return data;
    },
    searchParams() {
      let searchParams = [...this.baseSearchParams];
      if (this.value && this.value.is_distributor) {
        return searchParams.filter(field => {
          return true;
        });
      } else {
        return searchParams.filter(field => {
          return field.key != "level";
        });
      }
    }
  },
  methods: {
    resetData() {
      this.currentPage = 1;
      this.listData = [];
      this.searchData = JSON.parse(JSON.stringify(initialSearchData));
      this.searchData.level = this.$route.query.level || -1;
      this.searchData.id_type =
        this.$route.query.id_type != undefined ? this.$route.query.id_type : -1;
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
    getLevel(id, type) {
      let level = (type==1 ? this.mem_data[id] : type==2?this.dis_data[id]:this.dea_data[id]);
      if (level) {
        return level.name;
      } else {
        return "--";
      }
    },
    getHeadImg(url) {
      if (!/^(http)/i.test(url)) {
        url = this.$store.state.siteComdataPath + url;
      }
      return url;
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
        "/shop/admin/member/distributor/list",
        {
          member_id: this.$route.query.id,
          keyword: this.searchData.keyword,
          id_type:
            this.searchData.id_type == -1 ? null : this.searchData.id_type, //身份 0 会员 1 分销商
          level: this.searchData.level == -1 ? null : this.searchData.level, //层级 1 2 3
          distributor_level:
            this.searchData.distributor_level == -1
              ? null
              : this.searchData.distributor_level,
          search_level:this.searchData.search_level,
          search_level_type:this.searchData.search_level_type,
          created_at_start: this.searchData.registerTime.startTime,
          created_at_end: this.searchData.registerTime.endTime,
          passed_at_start: this.searchData.beingTime.startTime,
          passed_at_end: this.searchData.beingTime.endTime,
          page: this.currentPage,
          page_size: this.pageSize
        },
        res => {
          this.tableLoading = false;
          if (res.code == 200) {
            this.listData = res.data.list;
            this.total = res.data.total;
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
        display: inline-block;
        width: 100%;
        padding: 0 20px;
        line-height: 22px;
        text-align: left;
        font-size: 13px;
        color: #657180;
        & > div {
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
    .member-detail-agent-head-right {
      display: flex;
      width: calc(100% - 200px);
      height: 221px;
      /deep/.vertical-line-titlebar-wrapper {
        font-size: 14px;
        margin-bottom: 10px;
      }
      .member-detail-agent-head-item {
        padding: 10px 16px;
        border: 1px solid @border-color;
        border-left: none;
        flex: 1;
        &.not-distributor {
          width: 270px;
          flex: none;
        }
        &:nth-child(2) {
          /deep/.vertical-line-titlebar-wrapper {
            display: inline-block;
          }
        }
        &:last-child {
          border-radius: 0 5px 5px 0;
        }
        .member-detail-agent-head-item-content {
          padding: 0 14px;
          .member-detail-agent-head-item-line {
            line-height: 28px;
            color: #657180;
            // & > span {
            //   font-weight: bold;
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
          width: 210px;
          margin-right: 16px;
        }
      }
    }
  }
  .member-detail-agent-content {
    // /deep/.data-list-search {
    //   margin: 24px 0 24px 0;
    //   padding: 16px 16px 0;
    //   background: #f8f9fd;
    // }
    /deep/.page-style.ivu-page {
      text-align: right;
      line-height: 56px;
    }
  }
}
</style>
