<template>
  <div class="finance-agent" v-show="!$store.state.COMMON_loading">
    <Tabs v-model="tabChangeFlag" :animated="false" class="finance-agent-head-tab">
      <TabPane :label="() => {return $createElement('div', `分红结算`)}" :name="tabChangeArray[0]"></TabPane>
      <TabPane :label="() => {return $createElement('div', `销售奖结算`)}" :name="tabChangeArray[1]"></TabPane>
      <TabPane :label="() => {return $createElement('div', `推荐奖结算`)}" :name="tabChangeArray[2]"></TabPane>
      <TabPane :label="() => {return $createElement('div', `业绩奖结算`)}" :name="tabChangeArray[3]"></TabPane>
      <TabPane :label="() => {return $createElement('div', `额外奖励结算`)}" :name="tabChangeArray[4]" v-if="hasLicensePerm('ENABLE_GRATITUDE_AWARD')"></TabPane>
    </Tabs>
    <div class="finance-agent-content">
      <search-list :searchParams="searchParams" :search-data="searchData" :onLine="true">
        <Button @click="onExportListDataClick" perm="agent.commission.view">导出</Button>
      </search-list>
      <btn-group :data="tableTabs" v-model="tableTabsStatus"></btn-group>
      <!-- <Tabs type="card" v-model="tableTabsStatus">
        <TabPane v-for="(item, index) in tableTabs" :key="index" :label="item" />
      </Tabs>-->
      <common-table
        :hasBorder="true"
        :minWidth="1093"
        :loading="tableLoading"
        :columnsData="columnsData"
        :listData="agentList"
        @selectData="onSelectionChange"
      ></common-table>
      <div class="bar-pager">
        <Page
          :total="total"
          v-if="agentList.length"
          :page-size="pageSize"
          show-sizer
          :current="currentPage"
          @on-change="onPageChange"
          @on-page-size-change="onPageSizeChange"
          show-elevator
          :transfer="true"
        />
      </div>
    </div>
    <Modal
      v-model="modalVerifyStatus"
      :title="memberInfo ? '审核' : '批量拒绝'"
      class="finance-agent-change-modal"
      :width="390"
      :loading="modalVerifyLoading"
      @on-visible-change="onVerifyModalChange"
      @on-ok="onVerifyComfirmClick"
    >
      <Form
        ref="modalValidate"
        :model="modalValidate"
        :show-message="false"
        :rules="ruleValidate"
        :label-width="90"
      >
        <FormItem label="审核：" v-show="memberInfo">
          <RadioGroup v-model="verifySelect" @on-change="onModalRadioChange">
            <Radio :label="1" style="margin-right: 26px;">
              <span>通过</span>
            </Radio>
            <Radio :label="-1">
              <span>不通过</span>
            </Radio>
          </RadioGroup>
        </FormItem>

        <FormItem label="拒绝原因：" prop="reason" v-show="verifySelect === -1 || !memberInfo">
          <Input
            class="common-input-text-260"
            placeholder="请输入拒绝原因"
            :maxlength="20"
            v-model="modalValidate.reason"
            type="textarea"
          />
          <div class="finance-agent-audit-modal-textarea-num">{{modalValidate.reason.length}}/20</div>
        </FormItem>
        <FormItem
          :label="modalShowIndex === 2 ? '推荐奖金：' : '业绩奖金：'"
          class="finance-agent-audit-modal-item"
          v-show="memberInfo"
        >
          <div v-if="memberInfo">¥{{memberInfo.reward_money}}</div>
        </FormItem>
        <FormItem label="发放至：" class="finance-agent-audit-modal-item" v-show="memberInfo&&verifySelect==1">
          <div>分红帐户</div>
        </FormItem>
        <div class="finance-agent-audit-modal-info" v-if="memberInfo">
          <div class="finance-agent-audit-modal-info-title">得奖代理商信息</div>
          <div class="finance-agent-audit-modal-info-content">
            <div class="finance-agent-audit-modal-info-img">
              <img
                :src="memberInfo.member_headurl ? getHeadImg(memberInfo.member_headurl) : require('../images/head-portrait.png')"
              />
            </div>
            <div class="finance-agent-audit-modal-info-message">
              <member-infor
                :id="memberInfo.member_id"
                :nickname="memberInfo.member_nickname"
                :mobile="memberInfo.member_mobile"
                :name="memberInfo.member_name || '--'"
              ></member-infor>
            </div>
          </div>
        </div>
      </Form>
    </Modal>
    <export-modal
      :tableListExportStatus="tableListExportStatus"
      @exportList="exportModalConfrimClick"
      @cancelExportList="tableListExportStatus = false"
    ></export-modal>
  </div>
</template>
<script>
import btnGroup from "@/views/shop/components/button/btn-group.vue";
import searchList from "@/views/shop/components/search/search-list.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import exportModal from "@/views/shop/components/export/export-modal.vue";
import commonFunction from "@/views/shop/components/common-function.js";
import memberInfor from "@/views/shop/components/table/member-infor.vue";
const tabNameArray = ["reward", "sale", "recommend", "performance"];
if(window.hasLicensePerm('ENABLE_GRATITUDE_AWARD')) {
  tabNameArray.push("gratitude");
}
// 生成搜索列表显示内容
const searchParamsReward = [
  {
    type: 9,
    name: "",
    prefixIcon: "ios-search",
    key: "keyword",
    placeholder: "订单号"
  },
  {
    type: 2,
    key: "beingTime",
    name: "下单时间："
  }
];
const searchParamsPerformance = [
  {
    type: 1,
    name: "",
    prefixIcon: "ios-search",
    key: "keyword",
    placeholder: "昵称/姓名/手机"
  },
  {
    type: 3,
    key: "level",
    name: "代理等级：",
    options: [
      { id: -1, value: "全部" },
      { id: 1, value: "一级代理" },
      { id: 2, value: "二级代理" },
      { id: 3, value: "三级代理" }
    ]
  }
];

const tableTabsArray = [
  ["全部", "预计发放分红", "已发放分红", "失效分红"],
  ["全部", "预计发放返佣", "已发放返佣", "失效返佣"],
  ["待审核", "已发放记录", "拒绝记录"],
  ["待审核", "已发放记录", "拒绝记录"]
];
if(window.hasLicensePerm('ENABLE_GRATITUDE_AWARD')) {
  tableTabsArray.push(["全部", "预计发放返佣", "已发放返佣", "失效返佣"]);
}
const searchParamsRecommend = [
  {
    type: 10,
    name: "",
    prefixIcon: "ios-search",
    key: "keyword",
    optionWidth: 80,
    optionKey: "keyword_type",
    placeholder: "昵称/姓名/手机",
    options: [{ id: 1, value: "推荐人" }, { id: 2, value: "被推荐人" }]
  },
  {
    type: 12,
    key: "level",
    width: 254,
    optionKey: "level_type",
    options: [
      { id: -1, value: "全部" },
      { id: 1, value: "一级代理" },
      { id: 2, value: "二级代理" },
      { id: 3, value: "三级代理" }
    ],
    optionsType: [
      {
        id: 1,
        value: "推荐人等级"
      },
      {
        id: 2,
        value: "被推荐人等级"
      }
    ]
  },
  {
    type: 2,
    key: "beingTime",
    name: "推荐升级时间："
  }
];

const createTimeColumn = key => {
  return (h, params) => {
    return h(
      "div",
      {
        style: {
          margin: "0 -3px"
        }
      },
      params.row[key]
        ? [
            h(
              "div",
              {
                style: {
                  display: "inline-block",
                  margin: "0 3px"
                }
              },
              params.row[key].split(/\s/)[0]
            ),
            h(
              "div",
              {
                style: {
                  display: "inline-block"
                }
              },
              params.row[key].split(/\s/)[1]
            )
          ]
        : "- - -"
    );
  };
};
const createMoneyColumn = (key, title) => {
  return {
    title: title,
    align: "center",
    render: (h, params) => {
      return h("div", [h("span", "￥" + params.row[key] || 0)]);
    }
  };
};
// 创建搜索数据（必须在data里面创建）
const searchData = {
  keyword: "",
  keyword_type: 1,
  level: -1,
  level_type: 1,
  beingTime: {
    startTime: "",
    endTime: ""
  }
};
export default {
  components: {
    btnGroup,
    searchList,
    commonTable,
    exportModal,
    memberInfor
  },
  inject: ["yunzhiHome"],
  data() {
    const createHeadColumn = (keys = {
      member_id: "member_id",
      member_name: "member_name",
      member_nickname: "member_nickname",
      member_mobile: "member_mobile",
      member_headurl: "member_headurl"
    }) => {
      return (h, params) => {
        return h(
          memberInfor,
          {
            props: {
              id: Number(params.row[keys.member_id]),
              headurl:
                this.padImgUrl(params.row[keys.member_headurl]) ||
                "images/head-portrait.png"
            },
            attrs: {
              perm: "member.detail.view"
            }
          },
          [
            h(
              "div",
              {
                class: "one-hide"
              },
              params.row[keys.member_nickname]
            ),
            h(
              "div",
              {
                style: {
                  color: "#9ea7b4",
                  fontSize: "12px",
                },
                class: "one-hide"
              },
              "姓名：" + (params.row[keys.member_name] || "--")
            ),
            h(
              "div",
              {
                style: {
                  color: "#9ea7b4",
                  fontSize: "12px"
                }
              },
              "手机：" + params.row[keys.member_mobile]
            ),
            h(
              "div",
              {
                style: {
                  color: "#9ea7b4",
                  fontSize: "12px"
                }
              },
              "ID：" + params.row[keys.member_id]
            )
          ]
        );
      };
    };
    const columnsDataReward = [
      {
        type: "selection", // 开启checkbox
        width: 40,
        className: "finance-agent-selection",
        align: "center"
      },
      {
        title: "订单号",
        key: "order_id",
        render: (h, params) => {
          return h(
            "div",
            {
              style: {
                cursor: "pointer"
              },
              on: {
                click: () => {
                  this.$router.push({
                    name: "orderShopDetail",
                    query: {
                      id: params.row.order_id
                    }
                  });
                }
              }
            },
            params.row.order_id
          );
        }
      },
      createMoneyColumn("order_money", "订单金额"),
      {
        align: "center",
        renderHeader: h => {
          return h(
            "div",
            this.tabChangeArray[0] === this.tabChangeFlag
              ? "订单分红"
              : "销售返佣"
          );
        },
        render: (h, params) => {
          return h("div", [
            h("span", "￥" + (params.row.total_commission || "0.00"))
          ]);
        }
      },
      {
        key: "commision",
        width: 300,
        renderHeader: h => {
          return h(
            "div",
            this.tabChangeArray[0] === this.tabChangeFlag
              ? "代理级别分红"
              : "得奖代理商信息"
          );
        },
        render: (h, params) => {
          return this.tabChangeFlag == this.tabChangeArray[0]
            ? h(
                "div",
                {
                  style: {
                    lineHeight: "19px"
                  }
                },
                params.row.total_commission_val == 0
                  ? "--"
                  : [
                      params.row.agent_order_commision.map(item =>
                        h(
                          "div",
                          {
                            style: {
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              "-webkit-line-clamp": 1,
                              "-webkit-box-orient": "vertical"
                            }
                          },
                          ["一级", "二级", "三级"][item.agent_level - 1] +
                            "：¥" +
                            (item.money || "0.00") +
                            " / " +
                            item.nickname
                        )
                      )
                    ]
              )
            : h(
                "div",
                params.row.agent_sale_reward_commision.map(item => {
                  var arr = ['越级奖','一级平级奖','二级平级奖','三级平级奖'];
                  return h("div", {
                    style: {
                      "overflow": "hidden",
                      "text-overflow": "ellipsis",
                      "display": "-webkit-box",
                      "-webkit-line-clamp": 1,
                      "-webkit-box-orient": "vertical"
                    }
                  }, `${item.is_lowlevel ? arr[0] : arr[item.agent_level]}：￥${item.money} / ${item.nickname}`)
                })
              );
        }
      },
      {
        title: "下单时间",
        align: "center",
        render: createTimeColumn("created_at")
      },
      {
        title: "发放状态",
        align: "center",
        render: (h, params) => {
          return h("div", [
            h(
              "span",

              {
                class: {
                  "table-success": params.row.finance_status === 1,
                  "table-error": params.row.finance_status === 2,
                  "table-warning": params.row.finance_status === 0
                }
              },
              (() => {
                if (params.row.finance_status === 1) return "已发放";
                if (params.row.finance_status === 2) return "失效";
                return "预计发放";
              })()
            )
          ]);
        }
      }
    ];
    const columnStatus = {
      title: "状态",
      align: "center",
      render: (h, params) => {
        return h("div", [
          h(
            "span",

            {
              class: {
                "form-success": params.row.status === 1,
                "status-fail": params.row.status === -1
              }
            },
            (() => {
              if (params.row.status === 1) return "已发放";
              if (params.row.status === -1) return "已拒绝";
              return "";
            })()
          )
        ]);
      }
    };
    const columnOparate = {
      title: "操作",
      align: "center",
      width: 140,
      render: (h, params) => {
        return h("div", [
          h(
            "span",
            {
              class: {
                "table-operation": true
              },
              attrs: {
                perm: params.row.status === 0 ? "agent.operate" : "agent.view"
              },
              on: {
                click: () => {
                  if (params.row.status === 0) {
                    this.modalShowIndex = this.tabIndex;
                    this.memberInfo = this.agentList[params.index];
                    this.modalVerifyStatus = true;
                  } else {
                    this.$Modal.info({
                      title: "拒绝原因",
                      render: h => {
                        return h(
                          "div",
                          { style: { wordBreak: "break-all" } },
                          params.row.reason
                        );
                      }
                    });
                  }
                }
              }
            },
            params.row.status === 0 ? "审核" : "查看原因"
          )
        ]);
      }
    };
    const columnsDataRecommend = [
      {
        type: "selection", // 开启checkbox
        width: 40,
        className: "finance-agent-selection",
        align: "center"
      },
      {
        title: "推荐人/得奖代理商信息",
        align: "left",
        render: createHeadColumn()
      },
      {
        title: "推荐人等级",
        align: "center",
        render: (h, params) => {
          return h("div", params.row.member_agent_level_text);
        }
      },
      createMoneyColumn("reward_money", "推荐奖金"),
      {
        title: "被推荐人",
        align: "left",
        render: (h, params) => {
          return h(
            "div",
            {
              attrs: {
                perm: "member.detail.view"
              },
              style: {
                cursor: "pointer"
              },
              on: {
                click: () => {
                  this.$router.push({
                    name: "memberDetail",
                    query: {
                      id: params.row.sub_member_id
                    }
                  });
                }
              }
            },
            [
              h("div", "昵称：" + params.row.sub_member_nickname),
              h("div", "姓名：" + (params.row.sub_member_name || "--")),
              h("div", "手机：" + params.row.sub_member_mobile)
            ]
          );
        }
      },
      {
        title: "被推荐人等级",
        align: "center",
        render: (h, params) => {
          return h("div", params.row.sub_member_agent_level_text);
        }
      },
      {
        title: "推荐升级时间",
        align: "center",
        render: createTimeColumn("created_at")
      }
    ];
    const columnsDataPerformance = [
      {
        type: "selection", // 开启checkbox
        width: 40,
        className: "finance-agent-selection",
        align: "center"
      },
      {
        title: "得奖代理商信息",
        align: "left",
        render: createHeadColumn()
      },
      {
        title: "代理等级",
        align: "center",
        render: (h, params) => {
          return h("div", params.row.member_agent_level_text);
        }
      },
      createMoneyColumn("performance_money", "业绩统计"),
      createMoneyColumn("reward_money", "业绩奖金"),
      {
        title: "统计业绩周期",
        align: "center",
        render: (h, params) => {
          return h("div", [
            h(
              "div",
              {
                style: {
                  display: "inline-block",
                  margin: "0 3px"
                }
              },
              params.row.period_start && params.row.period_start.split(/\s/)[0]
            ),
            h(
              "div",
              {
                style: {
                  display: "inline-block"
                }
              },
              params.row.period_end && params.row.period_end.split(/\s/)[0]
            )
          ]);
        }
      }
    ];
    const columnsDataGratitude = [
      {
        type: "selection", // 开启checkbox
        width: 40,
        className: "finance-agent-selection",
        align: "center"
      },
      {
        title: "得奖人信息",
        align: "left",
        minWidth: 160,
        render: createHeadColumn({
          member_id: "reward_member_id",
          member_name: "reward_member_name",
          member_nickname: "reward_member_nickname",
          member_mobile: "reward_member_mobile",
          member_headurl: "reward_member_headurl"
        })
      },
      {
        title: "奖金",
        align: "center",
        key: "reward_money",
        render: (h, params) => {
          return h("div", "感恩奖：¥" + params.row.reward_money);
        }
      },
      createMoneyColumn("money", "订单金额"),
      {
        title: "支付奖金人信息",
        align: "left",
        minWidth: 160,
        render: createHeadColumn({
          member_id: "pay_reward_member_id",
          member_name: "pay_reward_member_name",
          member_nickname: "pay_reward_member_nickname",
          member_mobile: "pay_reward_member_mobile",
          member_headurl: "pay_reward_member_headurl"
        })
      },
      {
        align: "center",
        key: "order_id",
        renderHeader: (h) => {
          return h("div", {}, [
            h("div", "关联订单号"),
            h("div", "下单时间")
          ]);
        },
        render: (h, params) => {
          return h("div", {}, [
            h("div", {
              style: {
                cursor: "pointer"
              },
              on: {
                click: () => {
                  this.$router.push({
                    name: "orderShopDetail",
                    query: {
                      id: params.row.order_id
                    }
                  });
                }
              }
            }, params.row.order_id),
            h("div", params.row.order_created_at)
          ]);
        }
      },
      {
        title: "发放状态",
        align: "center",
        render: (h, params) => {
          return h("div", [
            h(
              "span",

              {
                class: {
                  "table-success": params.row.status === 2,
                  "table-error": params.row.status === 3,
                  "table-warning": params.row.status === 1
                }
              },
              (() => {
                if (params.row.status === 2) return "已发放";
                if (params.row.status === 3) return "失效";
                return "预计发放";
              })()
            )
          ]);
        }
      }
    ];
    const columnsDataRecommendArray = [
      [...columnsDataRecommend].concat([columnOparate]),
      [...columnsDataRecommend].concat([columnStatus]),
      [...columnsDataRecommend].concat([columnStatus, columnOparate])
    ];
    const columnsDataPerformanceArray = [
      [...columnsDataPerformance].concat([columnOparate]),
      [...columnsDataPerformance].concat([columnStatus]),
      [...columnsDataPerformance].concat([columnStatus, columnOparate])
    ];
    const tab = tabNameArray[this.$route.query.tab] ? this.$route.query.tab : 0;
    return {
      tabChangeArray: tabNameArray,
      tabChangeFlag: tabNameArray[tab],
      columnsDataRecommendArray,
      columnsDataPerformanceArray,
      columnsArray: [
        columnsDataReward.map(item => {
          let itemData = Object.assign({}, item);
          // 给指定项添加最小宽度，其他项给平均宽度
          if (item.key === "commision") {
            itemData.minWidth = 230;
          } else {
            if (!itemData.width) {
              itemData.minWidth = 164;
            }
          }
          return itemData;
        }),
        columnsDataReward,
        columnsDataRecommendArray[0],
        columnsDataPerformanceArray[0],
        this.hasLicensePerm('ENABLE_GRATITUDE_AWARD') ? columnsDataGratitude : null
      ].filter(item => item),
      searchParamsArray: [
        searchParamsReward,
        searchParamsReward.map(n => {
          if (n.key === "keyword") {
            return Object.assign({}, n, {
              type: 1,
              placeholder: "订单号/昵称"
            });
          }
          return n;
        }),
        searchParamsRecommend,
        searchParamsPerformance,
        this.hasLicensePerm('ENABLE_GRATITUDE_AWARD') ? searchParamsReward.map(n => {
          if (n.key === "keyword") {
            return Object.assign({}, n, {
              type: 1,
              placeholder: "订单号/手机/姓名/昵称"
            });
          }
          return n;
        }) : null
      ].filter(item => item),
      tableTabsStatus: tableTabsArray[tab][this.$route.query.index]
        ? this.$route.query.index
        : 0,
      tableTabsArray,
      searchData: Object.assign({}, JSON.parse(JSON.stringify(searchData))),
      tableLoading: false,
      agentList: [],
      total: 0,
      pageSize: 20,
      currentPage: 1,
      // 弹窗数据
      modalVerifyStatus: false,
      modalVerifyLoading: true,
      memberInfo: null,
      modalValidate: {
        reason: ""
      },
      verifySelect: 1,
      ruleValidate: {
        reason: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (
                (!this.memberInfo || this.verifySelect === -1) &&
                !value.trim().length
              ) {
                return callback(new Error(""));
              }
              return callback();
            },
            trigger: "blur"
          }
        ]
      },
      selectTableData: [], // 选中的数据
      tableListExportStatus: false,
      modalShowIndex: 2, // 2为显示奖励，3为显示业绩
      getListStatus: false // 标识是否存在多次请求数据
    };
  },
  watch: {
    tabChangeFlag() {
      this.$router.replace({
        name: "financeAgent",
        query: {
          tab: this.tabIndex,
          index: this.tableTabsStatus
        }
      });
      if (this.tableTabsStatus !== 0) {
        this.getListStatus = true;
        this.tableTabsStatus = 0; // 这个有可能触发拉取数据，需要用到getListStatus标识
      } else {
        // 如果没有改变tableTabsStatus, 需要手动切换表格
        this.updateTableTabsColumn();
      }
      this.agentList = [];
      this.selectTableData = [];
      this.currentPage = 1;
      this.total = 0;
      this.searchData = Object.assign(
        {},
        JSON.parse(JSON.stringify(searchData))
      ); // 这个触发拉取数据
      console.log(this.searchParams)
    },
    tableTabsStatus(val) {
      this.$router.replace({
        name: "financeAgent",
        query: {
          tab: this.tabIndex,
          index: val
        }
      });
      this.agentList = [];
      this.selectTableData = [];
      this.currentPage = 1;
      this.total = 0;
      this.updateTableTabsColumn();
      if (this.getListStatus === true) {
        this.getListStatus = false;
        return;
      }
      this.getDataList();
    },
    searchData: {
      handler() {
        this.currentPage = 1;
        this.getDataList();
      },
      deep: true
    }
  },
  computed: {
    tabIndex() {
      return tabNameArray.findIndex(n => n === this.tabChangeFlag);
    },
    /**
     * 根据不同页面显示不同内容
     */
    columnsData() {
      return this.columnsArray[this.tabIndex];
    },
    searchParams() {
      return this.searchParamsArray[this.tabIndex];
    },
    tableTabs() {
      return tableTabsArray[this.tabIndex];
    }
  },
  created() {
    this.$store.state.COMMON_loading = true;
    this.getDataList();
  },
  methods: {
    updateTableTabsColumn() {
      this.tabIndex === 2 &&
        this.columnsArray.splice(
          2,
          1,
          this.columnsDataRecommendArray[this.tableTabsStatus]
        );
      this.tabIndex === 3 &&
        this.columnsArray.splice(
          3,
          1,
          this.columnsDataPerformanceArray[this.tableTabsStatus]
        );
    },
    padImgUrl(url) {
      if (!url) {
        return;
      }
      if (/^http/i.test(url)) {
        return url;
      } else {
        return this.$store.state.siteComdataPath + url;
      }
    },
    onPageChange(val) {
      this.currentPage = val;
      this.agentList = [];
      this.getDataList();
    },
    onPageSizeChange(size) {
      this.currentPage = 1;
      this.pageSize = size;
      this.agentList = [];
      this.getDataList();
    },
    getHeadImg(url) {
      if (!/^(http)/i.test(url)) {
        url = this.$store.state.siteComdataPath + url;
      }
      return url;
    },
    /**
     * 获取列表数据
     */
    getDataList() {
      this.tableLoading = true;
      switch (this.tabChangeArray.findIndex(n => n === this.tabChangeFlag)) {
        case 0:
          this.getRewardDataList();
          break;
        case 1:
          this.getSaleDataList();
          break;
        case 2:
          this.getRecommendDataList();
          break;
        case 3:
          this.getPerformanceDataList();
          break;
        case 4:
          this.getGratitudeDataList();
          break;
        default:
          break;
      }
    },
    getSearchData(index) {
      let data = null;
      switch (index) {
        case 0:
          data = {
            status: [-1, 0, 1, 2][this.tableTabsStatus],
            keyword: this.searchData.keyword,
            created_at_min: this.searchData.beingTime.startTime,
            created_at_max: this.searchData.beingTime.endTime,
            page: this.currentPage,
            page_size: this.pageSize
          };
          break;
        case 1:
          data = {
            status: [-1, 0, 1, 2][this.tableTabsStatus],
            keyword: this.searchData.keyword,
            created_at_min: this.searchData.beingTime.startTime,
            created_at_max: this.searchData.beingTime.endTime,
            page: this.currentPage,
            page_size: this.pageSize
          };
          break;
        case 2:
          data = {
            status: [0, 1, -1][this.tableTabsStatus],
            keyword: this.searchData.keyword,
            keyword_type: this.searchData.keyword_type,
            level: this.searchData.level,
            level_type: this.searchData.level_type,
            created_at_min: this.searchData.beingTime.startTime,
            created_at_max: this.searchData.beingTime.endTime,
            page: this.currentPage,
            page_size: this.pageSize
          };
          break;
        case 3:
          data = {
            status: [0, 1, -1][this.tableTabsStatus],
            keyword: this.searchData.keyword,
            member_agent_level: this.searchData.level,
            page: this.currentPage,
            page_size: this.pageSize
          };
          break;
       case 4:
          data = {
            status: [undefined, 1, 2, 3][this.tableTabsStatus],
            keyword: this.searchData.keyword,
            created_start: this.searchData.beingTime.startTime,
            created_end: this.searchData.beingTime.endTime,
            page: this.currentPage,
            page_size: this.pageSize
          };
          break;
        default:
          break;
      }
      return data;
    },
    getRewardDataList() {
      this.$httpPost(
        "/shop/admin/agent/ordercommision/list",
        this.getSearchData(0),
        res => {
          this.$store.state.COMMON_loading = false;
          this.tableLoading = false;
          if (res.code === 200) {
            this.selectTableData = [];
            this.agentList = res.data.list || [];
            this.currentPage = res.data.current;
            this.total = res.data.total;
            this.successCallBack();
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    getSaleDataList() {
      this.$httpPost(
        "/shop/admin/agent/salereward/list",
        this.getSearchData(1),
        res => {
          this.$store.state.COMMON_loading = false;
          this.tableLoading = false;
          if (res.code === 200) {
            this.selectTableData = [];
            this.agentList = res.data.list || [];
            this.currentPage = res.data.current;
            this.total = res.data.total;
            this.successCallBack();
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    getRecommendDataList() {
      this.$httpPost(
        "/shop/admin/agent/recommend/reward/list",
        this.getSearchData(2),
        res => {
          this.$store.state.COMMON_loading = false;
          this.tableLoading = false;
          if (res.code === 200) {
            this.selectTableData = [];
            this.agentList = res.data.list || [];
            this.currentPage = res.data.current;
            this.total = res.data.total;
            this.successCallBack();
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    getPerformanceDataList() {
      this.$httpPost(
        "/shop/admin/agent/performance/reward/list",
        this.getSearchData(3),
        res => {
          this.$store.state.COMMON_loading = false;
          this.tableLoading = false;
          if (res.code === 200) {
            this.selectTableData = [];
            this.agentList = res.data.list || [];
            this.currentPage = res.data.current;
            this.total = res.data.total;
            this.successCallBack();
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    getGratitudeDataList() {
      this.$httpPost(
        "/shop/admin/agent/other/reward/list",
        this.getSearchData(4),
        res => {
          this.$store.state.COMMON_loading = false;
          this.tableLoading = false;
          if (res.code === 200) {
            this.selectTableData = [];
            this.agentList = res.data.list || [];
            this.currentPage = res.data.current;
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
    },
    onSelectionChange(selectData) {
      this.selectTableData = selectData;
    },
    /**
     *  导出数据
     * params val: 0为当前页，1为所有
     */
    exportModalConfrimClick(val) {
      this.tableListExportStatus = false;
      let data = this.getSearchData(this.tabIndex);
      if(this.tabIndex == 4) {
        data.show_all = val;
      } else {
        data.is_all = val;
      }
      this.exprotData(data);
    },
    onExportListDataClick() {
      if (this.selectTableData.length === 0) {
        this.$Message.error("请选择要导出的内容");
        return;
      }
      if (this.agentList.length > this.selectTableData.length) {
        let data = { ids: this.selectTableData.map(item => this.tabIndex == 4 ? item.id : item.order_id) };
        this.exprotData(data);
      } else {
        this.tableListExportStatus = true;
      }
    },
    exprotData(data) {
      commonFunction.exportTable(
        data,
        this.http,
        [
          "/shop/admin/agent/ordercommision/export",
          "/shop/admin/agent/salereward/export",
          "/shop/admin/agent/recommend/reward/export",
          "/shop/admin/agent/performance/reward/export",
          "/shop/admin/agent/other/reward/export"
        ][this.tabIndex]
      );
    },
    /**
     * 状态改变还原验证
     */
    onVerifyModalChange(status) {
      if (status) {
        this.$refs["modalValidate"].resetFields();
        this.verifySelect = 1;
      }
    },
    onModalRadioChange() {
      this.$refs["modalValidate"].fields.forEach(el => {
        el.validateState = "";
      });
    },
    onVerifyComfirmClick() {
      this.$refs["modalValidate"].validate(valid => {
        if (valid) {
          this.$httpPost(
            this.modalShowIndex === 2
              ? "/shop/admin/agent/recommend/reward/check"
              : "/shop/admin/agent/performance/reward/check",
            {
              id: this.memberInfo.id,
              status: this.verifySelect,
              reason: this.verifySelect === 1 ? "" : this.modalValidate.reason
            },
            res => {
              if (res.code === 200) {
                this.$Message.success("审核成功");
                this.modalVerifyStatus = false;
                this.currentPage = 1;
                this.getDataList();
              } else {
                this.$Message.error(res.msg);
                this.modalVerifyLoading = false;
                this.$nextTick(() => {
                  this.modalVerifyLoading = true;
                });
              }
            }
          );
        } else {
          this.modalVerifyLoading = false;
          this.$nextTick(() => {
            this.modalVerifyLoading = true;
          });
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.finance-agent {
  .finance-agent-head-tab.ivu-tabs {
    /deep/.ivu-tabs-bar {
      margin-bottom: 0;
      padding: 0 24px;
    }
  }
  .finance-agent-content {
    padding: 24px 24px 0;
    height: calc(100vh - 120px);
    overflow: auto;
    /deep/.ivu-table-wrapper {
      th:nth-child(2),
      td:nth-child(2) {
          width: 20%;
      }
      /deep/.ivu-table-header {
        .ivu-table-column-center,
        .ivu-table-column-left,
        th {
          border-bottom: 1px solid #e8eaec;
        }
      }
    }
    /deep/.ivu-tabs {
      z-index: 2;
      margin-bottom: -1px;
      .ivu-tabs-bar {
        margin-bottom: 16px;
        .ivu-tabs-tab {
          min-width: 80px;
          text-align: center;
          font-size: 13px;
          line-height: 21px;
          background: #f4f6f8;
        }
        .ivu-tabs-tab-active {
          font-weight: bold;
          color: #4b5ff0;
          background: white;
          border-color: #dcdee2 !important;
        }
        // .ivu-tabs-nav-container {
        //   .ivu-tabs-tab {
        //     background-color: #fff;
        //     &.ivu-tabs-tab-active {
        //       color: #fff;
        //       border-color: #4570ea;
        //       background-color: #4570ea;
        //     }
        //   }
        //   &:focus .ivu-tabs-tab-focused {
        //     border-color: #4570ea !important;
        //     outline: none;
        //   }
        // }
      }
    }
  }
  /deep/.finance-agent-selection {
    border-right: none;
  }
  // /deep/.data-list-search {
  //   padding: 16px 16px 2px;
  //   margin-right: 0;
  //   margin-bottom: 24px;
  //   background-color: #f8f9fd;
  // }
}
// 审核弹窗
.finance-agent-change-modal {
  /deep/.ivu-modal-body {
    padding: 20px 24px 30px;
    .finance-agent-audit-modal-info {
      height: 113px;
      padding: 16px;
      box-sizing: border-box;
      border-radius: 5px;
      background-color: #f5f6f7;
      .finance-agent-audit-modal-info-title {
        font-size: 13px;
        line-height: 13px;
        font-weight: bold;
      }
      .finance-agent-audit-modal-info-content {
        position: relative;
        height: 48px;
        margin-top: 20px;
        .finance-agent-audit-modal-info-img {
          margin-right: 16px;
          img {
            height: 48px;
            width: 48px;
            display: block;
            border-radius: 5px;
          }
        }
        .finance-agent-audit-modal-info-message {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          left: 64px;
          margin-top: -1px;
          width: calc(100% - 74px);
        }
      }
    }
    .ivu-form-item {
      margin-bottom: 20px;
      .ivu-form-item-label {
        height: 32px;
      }
      &.finance-agent-audit-modal-item .ivu-form-item-content {
        font-size: 13px;
      }
      .ivu-form-item-content {
        font-size: 0;
        .ivu-radio-group {
          font-size: 0;
        }
      }
    }
    .ivu-input-wrapper {
      width: 100%;
      height: 50px;
      textarea {
        height: 50px;
        resize: none;
      }
    }
    .finance-agent-audit-modal-textarea-num {
      position: absolute;
      font-size: 12px;
      line-height: 12px;
      color: #9ea4b1;
      right: 10px;
      bottom: 6px;
    }
  }
}
</style>
