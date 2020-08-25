<template>
  <div class="finance-agent">
    <div class="finance-agent-content">
      <search-list
        :searchParams="searchParams"
        :search-data="searchData"
        :onLine="true"
      >
        <Button @click="onExportListDataClick" perm="agent.view">导出</Button>
      </search-list>
      <btn-group :data="tableTabsArray" v-model="tableTabsStatus"></btn-group>
      <!-- <Tabs type="card" v-model="tableTabsStatus">
        <TabPane v-for="(item, index) in tableTabs" :key="index" :label="item" />
      </Tabs>-->
      <common-table
        :minWidth="1093"
        :loading="tableLoading"
        :columnsData="columnsData"
        :listData="recommedList"
        @selectData="onSelectionChange"
      ></common-table>
      <div class="bar-pager">
        <Page
          :total="total"
          v-if="recommedList.length"
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
    <export-modal
      :tableListExportStatus="tableListExportStatus"
      @exportList="exportModalConfrimClick"
      @cancelExportList="tableListExportStatus = false"
    ></export-modal>
    <recommend-stock-verify-modal
      :verifyInfo="verifyInfo"
      v-model="isShowVerifyModal"
      @verify-success="onPageSizeChange(pageSize)"
    />
  </div>
</template>
<script>
import btnGroup from "@/views/shop/components/button/btn-group.vue";
import searchList from "@/views/shop/components/search/search-list.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import exportModal from "@/views/shop/components/export/export-modal.vue";
import commonFunction from "@/views/shop/components/common-function.js";
import memberInfor from "@/views/shop/components/table/member-infor.vue";
import recommendStockVerifyModal from "./finance-recommend-stock-verify-modal.vue"
// 生成搜索列表显示内容
const searchParams = [
  {
    type: 10,
    name: "",
    prefixIcon: "ios-search",
    key: "keyword",
    optionWidth: 80,
    optionKey: "keyword_type",
    placeholder: {
      1: "昵称/姓名/手机",
      2: "昵称/手机"
    },
    options: [{ id: 1, value: "得奖人" }, { id: 2, value: "付奖金人" }]
  },
  {
    type: 12,
    key: "level",
    width: 254,
    optionKey: "level_type",
    options: [{ id: -1, value: "全部" }],
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
    type: 3,
    key: "payer",
    name: "支付奖金：",
    options: [
      { id: -1, value: "全部" },
      { id: 0, value: "公司" },
      { id: 1, value: "经销商" }
    ]
  }
];

const tableTabsArray = ["全部", "待兑换", "待审核", "发放记录", "拒绝记录"];

// 创建搜索数据（必须在data里面创建）
const searchData = {
  keyword: "",
  keyword_type: 1,
  level: -1,
  level_type: 1,
  payer: -1
};
export default {
  components: {
    btnGroup,
    searchList,
    commonTable,
    exportModal,
    recommendStockVerifyModal
  },
  inject: ["yunzhiHome"],
  data() {
    const columnsData = [
      {
        type: "selection", // 开启checkbox
        width: 40,
        className: "finance-agent-selection",
        align: "center"
      },
      {
        title: "得奖推荐人信息",
        align: "left",
        minWidth: 229,
        render: (h, params) => {
          return h(
            memberInfor,
            {
              props: {
                id: Number(params.row.member_id),
                headurl:
                  this.padImgUrl(params.row.member_headurl) ||
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
                params.row.member_nickname
              ),
              h(
                "div",
                {
                  style: {
                    color: "#9ea7b4",
                    fontSize: "12px"
                  }
                },
                "姓名：" + (params.row.member_name || "--")
              ),
              h(
                "div",
                {
                  style: {
                    color: "#9ea7b4",
                    fontSize: "12px"
                  }
                },
                "手机：" + params.row.member_mobile
              ),
              h(
                "div",
                {
                  style: {
                    color: "#9ea7b4",
                    fontSize: "12px"
                  }
                },
                "ID：" + params.row.member_id
              )
            ]
          );
        }
      },
      {
        title: "推荐人等级",
        align: "center",
        minWidth: 148,
        render: (h, params) => {
          return h("div", params.row.member_dealer_level);
        }
      },
      {
        title: "被推荐人",
        align: "left",
        minWidth: 157,
        render: (h, params) => {
          return h("div", [
            h("div", params.row.sub_member_name),
            h("div", params.row.sub_member_mobile)
          ]);
        }
      },
      {
        title: "被推荐人等级",
        align: "center",
        minWidth: 148,
        render: (h, params) => {
          return h("div", params.row.sub_member_dealer_level);
        }
      },
      {
        title: "推荐奖金",
        align: "center",
        minWidth: 99,
        render: (h, params) => {
          return h("div", [
            h("span", "￥" + params.row.reward_money || "0.00")
          ]);
        }
      },
      {
        title: "支付奖金人信息",
        minWidth: 157,
        render: (h, params) => {
          return params.row.pay_member_id
            ? h("div", [
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
                  params.row.pay_member_name
                ),
                h("div", params.row.pay_member_mobile)
              ])
            : h("div", "公司");
        }
      },
      {
        title: "状态",
        align: "center",
        minWidth: 80,
        render: (h, params) => {
          return h(
            "div", {
              class:
                params.row.status === 3
                  ? "table-error"
                  : params.row.status === 2
                  ? "table-success"
                  : "table-warning"
            },
            params.row.status === 0
              ? "待兑换"
              : params.row.status === 1
              ? "待审核"
              : params.row.status === 2
              ? "已发放"
              : "已拒绝"
          );
        }
      },
      {
        title: "操作",
        align: "center",
        minWidth: 100,
        render: (h, params) => {
          return h("div", [
            h(
              "span",
              {
                class: {
                  "table-operation": true
                },
                attrs: {
                  perm:
                    params.row.status === 0 || params.row.status === 1 && params.row.pay_member_id == 0
                      ? "cloudstock.settle.operate"
                      : "cloudstock.settle.view"
                },
                on: {
                  click: () => {
                    if (params.row.status === 0) {
                      this.$Modal.confirm({
                        title: "提示",
                        loading: true,
                        render: (h) => {
                          return h("div", [
                            `确定要帮【${
                              params.row.member_nickname
                            }】兑换该笔推荐奖金`,
                            h(
                              "span",
                              {
                                style: {
                                  display: "inline-block"
                                }
                              },
                              `【 ¥${params.row.reward_money || "0.00"} 】`
                            ),
                            `吗？`
                          ]);
                        },
                        onOk: () => {
                          this.$httpPost(
                            "/shop/admin/dealer/reward/exchange",
                            {
                              id: params.row.id
                            },
                            res => {
                              this.$Modal.remove();
                              if (res.code === 200) {
                                this.$Message.success("兑换成功");
                                this.currentPage = 1;
                                this.getDataList();
                              } else {
                                this.$Message.error(res.msg);
                              }
                            }
                          );
                        }
                      });
                    } else {
                      this.isShowVerifyModal = true;
                      this.verifyInfo = params.row;
                    }
                  }
                }
              },
              params.row.status === 0
                ? "帮他兑换"
                : params.row.status === 1
                ? params.row.pay_member_id
                ? "查看"
                  : "审核"
                : params.row.status === 2
                ? "查看通过记录"
                : "查看拒绝记录"
            )
          ]);
        }
      }
    ];
    return {
      columnsData: columnsData,
      searchParams: searchParams,
      tableTabsStatus: 0,
      tableTabsArray,
      searchData: JSON.parse(JSON.stringify(searchData)),
      tableLoading: false,
      recommedList: [],
      levelDataObj: {},
      verifyInfo: {},
      isShowVerifyModal: false,
      total: 0,
      pageSize: 20,
      currentPage: 1,
      // 弹窗数据
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
      tableListExportStatus: false
    };
  },
  watch: {
    tableTabsStatus() {
      this.recommedList = [];
      this.selectTableData = [];
      this.currentPage = 1;
      this.total = 0;
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
  created() {
    this.getDealerLevelList();
    this.getDataList();
  },
  methods: {
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
    /**
     * 获取经销商等级列表
     */
    getDealerLevelList() {
      this.$store.state.COMMON_loading = true;
      this.$httpPost("/shop/admin/dealer/level/list", null, res => {
        this.$store.state.COMMON_loading = false;
        if (res.code === 200) {
          let levelData = res.data.list || [];
          this.searchParams
            .filter(item => item.key === "level")
            .forEach(item => {
              this.$set(item, "options", [
                {
                  id: -1,
                  value: "全部"
                },
                ...levelData.map(item => {
                  return {
                    id: item.id,
                    value: item.name
                  };
                })
              ]);
            });
          let levelDataObj = {};
          levelData.forEach(n => {
            levelDataObj[n.id] = n;
          });
          this.levelDataObj = levelDataObj;
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    onPageChange(val) {
      this.currentPage = val;
      this.recommedList = [];
      this.getDataList();
    },
    onPageSizeChange(size) {
      this.currentPage = 1;
      this.pageSize = size;
      this.recommedList = [];
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
      this.getRewardDataList();
    },
    getSearchData() {
      return {
        status: [-9, 0, 1, 2, 3][this.tableTabsStatus],
        keyword: this.searchData.keyword,
        keyword_type: this.searchData.keyword_type,
        level: this.searchData.level,
        level_type: this.searchData.level_type,
        payer: this.searchData.payer,
        page: this.currentPage,
        page_size: this.pageSize
      };
    },
    getRewardDataList() {
      this.$httpPost(
        "/shop/admin/dealer/recommend/reward/list",
        this.getSearchData(),
        res => {
          this.tableLoading = false;
          if (res.code === 200) {
            this.selectTableData = [];
            this.recommedList = res.data.list || [];
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
      let data = this.getSearchData();
      data.is_all = val;
      this.exprotData(data);
    },
    onExportListDataClick() {
      if (this.selectTableData.length === 0) {
        this.$Message.error("请选择要导出的内容");
        return;
      }
      if (this.recommedList.length > this.selectTableData.length) {
        let data = { ids: this.selectTableData.map(item => item.id) };
        this.exprotData(data);
      } else {
        this.tableListExportStatus = true;
      }
    },
    exprotData(data) {
      commonFunction.exportTable(
        data,
        this.http,
        "/shop/admin/dealer/recommend/reward/export"
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
            "/shop/admin/agent/recommend/reward/check",
            {
              id: this.memberInfo.id,
              status: this.verifySelect,
              reason: this.verifySelect === 1 ? "" : this.modalValidate.reason
            },
            res => {
              if (res.code === 200) {
                this.$Message.success("审核成功");
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
  .finance-agent-content {
    padding: 24px 24px 0;
  }
}
</style>
