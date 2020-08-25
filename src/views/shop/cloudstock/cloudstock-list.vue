<template>
  <div class="cloudstock-list" v-show="!$store.state.COMMON_loading">
    <div class="cloudstock-list-header">
      <!--<Button-->
        <!--class="btn-add"-->
        <!--type="primary"-->
        <!--shape="circle"-->
        <!--icon="md-add"-->
        <!--@click="onAddNewAgentClick"-->
        <!--perm="cloudstock.operate"-->
      <!--&gt;新增云仓</Button>-->
      <add-more :text="texts" @onAddMoreClick="onAddNewAgentClick" perm="cloudstock.operate"></add-more>
      <!-- <Button @click="$router.push({name: 'agentStatistics'})">
        <i class="iconfont icon-tongji"></i> 业绩统计
      </Button>-->
    </div>
    <search-list :searchParams="searchParams" :search-data="searchData" :onLine="true">
      <!-- <Button perm="cloudstock.view">导出</Button> -->
    </search-list>
    <common-table
      :minWidth="1093"
      :loading="tableLoading"
      :columnsData="columnsData"
      :listData="agentList"
    ></common-table>
    <div class="bar-pager">
      <Page
        :total="total"
        v-show="agentList.length"
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
    <modal-agent-select
      ref="modalMemberSelect"
      v-model="modalMemberSelectStatus"
      @onModalComfrimClick="onModalComfrimClick"
      @onSelectMemberClick="onSelectMemberClick"
      :selectData="memberSelectData"
    ></modal-agent-select>
    <select-modal
      title="选择经销商"
      ref="memberSelectModal"
      :width="500"
      optionsText="全部经销商"
      :columns="memberModalColumn"
      :searchData="memberSearchData"
      :headList="agentLevelData"
      headName="name"
      :selectData="memberSelectData"
      :tableData="tableMemberData"
      placeholder="请输入会员昵称或手机号"
      v-model="memberModalStatus"
      @getList="onGetMemberList"
      @onGetSelectData="onGetMemberSelectData"
    ></select-modal>
    <error-modal v-model="errorModalStatus" @on-ok="onErrorModalConfirm">
      <div style="font-size: 12px;line-height: initial;">
        <div
          v-if="stockNotEnough == errorList.length"
          style="margin-bottom: 17px;"
        >赠送的部分商品库存不足，无法同步开通云仓！</div>
        <div v-else-if="stockNotEnough == 0" style="margin-bottom: 17px;">赠送的部分商品已下架/已删除，无法同步开通云仓！</div>
        <div v-else style="margin-bottom: 17px;">赠送的部分商品库存不足/已下架/已删除，无法同步开通云仓！</div>
        <div style="max-height: 440px;overflow: auto;border: 1px solid #DCDEE2;">
          <table cellspacing="0" cellpadding="0" border="0">
            <tr style="height: 70px;" v-for="(item, index) in errorList" :key="item.id">
              <td
                style="width: 288px;padding: 0 14px;border-right: 1px solid #DCDEE2;"
                :style="index === errorList.length - 1? '' : 'border-bottom:1px solid #DCDEE2'"
              >
                <img
                  :src="$store.state.siteComdataPath + item.small_images"
                  style="width: 40px;height: 40px;object-fit: contain;margin-right: 10px; border-radius: 5px;vertical-align: middle;"
                />
                <div
                  style="width: calc(100% - 50px);display: inline-block;vertical-align: middle;min-height: 40px;"
                >
                  <div
                    style="overflow: hidden;text-overflow: ellipsis;display: -webkit-box;-webkit-line-clamp: 2;-webkit-box-orient: vertical;word-break:break-all;"
                  >{{item.name}}</div>
                  <div
                    v-if="item.sku_name && item.sku_name.length"
                    style="color: #9EA7B4;margin-top: 4px;"
                  >{{yzArrayToString(item.sku_name)}}</div>
                </div>
              </td>
              <td
                style="width: 120px;text-align: center;padding: 0 14px;"
                :style="([-9, 0].includes(item.status) ? 'color:#ED4014;' : '')  +  (index === errorList.length - 1 ? '' : 'border-bottom:1px solid #DCDEE2;')"
              >
                {{item.status === -9
                ? "已删除"
                : item.status === 0
                ? "已下架"
                : `缺货：${Math.abs(item.not_enough_num)}件`}}
              </td>
            </tr>
          </table>
        </div>
        <div
          style="position: absolute;bottom: 14px;left: 70px;line-height: 32px;"
          :style="!errorList.filter(item => ![-9, 0].includes(item.status)).length ? '': 'display: none'"
        >
          <Checkbox v-model="modalCheckStatus">忽略已下架/已删除的商品</Checkbox>
        </div>
      </div>
    </error-modal>
  </div>
</template>
<script>
import searchList from "@/views/shop/components/search/search-list.vue";
import addMore from "COMPONENTS/button/add-more.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import modalAgentSelect from "./components/modal-agent-select";
import selectModal from "@/views/shop/components/modal/modal-select-list.vue";
import errorModal from "@/views/shop/components/modal/modal-error.vue";
import memberInfor from "@/views/shop/components/table/member-infor.vue";
const levelName = ["一级经销商", "二级经销商", "三级经销商"];
const cloudstockName = ["一级云仓", "二级云仓", "三级云仓"];
export default {
  components: {
    searchList,
    commonTable,
    modalAgentSelect,
    selectModal,
    errorModal,
      addMore
  },
  inject: ["yunzhiHome"],
  data() {
    return {
      total: 0,
      pageSize: 20,
      currentPage: 1,
      agent_level: 0,
        texts:'新增云仓',
      searchParams: [
        {
          type: 1,
          name: "",
          prefixIcon: "ios-search",
          key: "keyword",
          placeholder: "手机/昵称"
        },
        {
          type: 3,
          key: "level",
          name: "等级：",
          options: [
            { id: -1, value: "全部" },
            { id: 1, value: levelName[0] },
            { id: 2, value: levelName[1] },
            { id: 3, value: levelName[2] }
          ]
        },
        {
          type: 3,
          key: "status",
          name: "状态：",
          options: [
            { id: -1, value: "全部" },
            { id: 1, value: "开启" },
            { id: 0, value: "关闭" }
          ]
        },
        {
          type: 2,
          key: "beingTime",
          name: "创建云仓时间："
        }
      ],
      tableLoading: false,
      searchData: {
        keyword: "",
        level: -1,
        status: 1,
        beingTime: {
          startTime: "",
          endTime: ""
        }
      },
      columnsData: [
        // {
        //   type: "selection", // 开启checkbox
        //   width: 40,
        //   align: "center"
        // },
        {
          title: "云仓信息",
          minWidth: 274,
          render: (h, params) => {
              return h(memberInfor, {
                  props:{
                      id:Number(params.row.member_id),
                      headurl:params.row.headurl || "images/head-portrait.png",
                      nickname:params.row.nickname,
                      mobile:params.row.mobile
                  },
                  attrs: {
                      perm: "member.detail.view"
                  }
              });
          }
        },
        {
          title: "身份等级/云仓等级",
          minWidth: 138,
          align: "left",
          render: (h, params) => {
            return h("div", [
              h(
                "div",
                "经销商：" + (levelName[params.row.agent_level - 1] || "--")
              ),
              h(
                "div",
                "云仓：" + (cloudstockName[params.row.agent_level - 1] || "--")
              )
            ]);
          }
        },
        {
          title: "云仓收入",
          minWidth: 99,
          align: "left",
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  class: {
                    "table-operation": true
                  },
                  on: {
                    click: () => {
                      this.$router.push({
                        name: "cloudstockSettlementDetail",
                        query: {
                          id: params.row.member_id
                        }
                      });
                    }
                  }
                },
                "￥" + params.row.money
              )
            ]);
          }
        },
        {
          title: "创建云仓时间",
          minWidth: 146,
          align: "left",
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  margin: "0 -3px"
                }
              },
              params.row.created_at
                ? [
                    h(
                      "div",
                      {
                        style: {
                          display: "inline-block",
                          margin: "0 3px"
                        }
                      },
                      params.row.created_at.split(/\s/)[0].replace(/-/g, ".")
                    ),
                    h(
                      "div",
                      {
                        style: {
                          display: "inline-block"
                        }
                      },
                      params.row.created_at.split(/\s/)[1]
                    )
                  ]
                : "- - -"
            );
          }
        },
        {
          title: "状态",
          align: "left",
          minWidth: 68,
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  class:
                    params.row.status === 1 ? "table-success" : "table-error"
                },
                params.row.status === 1 ? "开启" : "关闭"
              )
            ]);
          }
        },
        {
          title: "操作",
          align: "center",
          minWidth: 147,
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  class: {
                    "table-operation": true
                  },
                  attrs: {
                    perm: "cloudstock.view"
                  },
                  on: {
                    click: () => {
                      this.$router.push({
                        name: "cloudstockStockDetail",
                        query: {
                          id: params.row.member_id
                        }
                      });
                    }
                  }
                },
                "库存详情"
              ),
              h("span", { style: { color: "#3352D9", margin: "0 10px" } }, "|"),
              h(
                "span",
                {
                  class: {
                    "table-operation": true
                  },
                  attrs: {
                    perm: "cloudstock.operate"
                  },
                  on: {
                    click: () => {
                      this.$nextTick(() => {
                        this.enableAgent = true;
                        let text =
                          "该经销商商的经销商资格已被取消，不能开启云仓功能。";
                        if (params.row.agent_level) {
                          text = params.row.status
                            ? "关闭云仓功能后，该经销商商的云仓将不能再出货赚取差价，是否确定关闭其云仓？"
                            : "开启云仓功能后，该经销商商的云仓将可以出货赚取差价，是否确定开启其云仓？";
                        }
                        this.$Modal.confirm({
                          title: "提示",
                          render: h => {
                            let renHtml = h("div", text);

                            if (
                              !params.row.agent_level &&
                              renHtml.context.$el
                            ) {
                              this.$nextTick(() => {
                                renHtml.context.$el
                                  .querySelector(
                                    ".ivu-modal-confirm-footer .ivu-btn"
                                  )
                                  .remove();
                              });
                            }
                            return renHtml;
                          },
                          onOk: () => {
                            params.row.agent_level &&
                              this.$httpPost(
                                "/shop/admin/cloudstock/setstatus",
                                {
                                  member_id: params.row.member_id,
                                  status: params.row.status ? 0 : 1
                                },
                                res => {
                                  if (res.code === 200) {
                                    this.$Message.success(
                                      params.row.status
                                        ? "关闭成功"
                                        : "开启成功"
                                    );
                                    this.currentPage = 1;
                                    this.getList();
                                  } else {
                                    this.$Message.error(res.msg);
                                  }
                                }
                              );
                          }
                        });
                      });
                    }
                  }
                },
                params.row.status ? "关闭云仓" : "开启云仓"
              )
            ]);
          }
        }
      ],
      agentList: [],
      modalMemberSelectStatus: false,
      memberSelectData: null,
      memberModalColumn: [
        {
          title: "经销商信息",
          minWidth: 227,
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                }
              },
              [
                h("img", {
                  style: {
                    width: "40px",
                    height: "40px",
                    borderRadius: "4px",
                    marginRight: "14px",
                  },
                  attrs: {
                    src: params.row.headurl ? this.formatURL(params.row.headurl) : "images/head-portrait.png"
                  }
                }),
                h(
                  "div",
                  {
                    style: {
                      width: "calc(100% - 50px)"
                    }
                  },
                  [
                    h(
                      "div",
                      {
                        style: {
                          overflow: "hidden",
                          "text-overflow": "ellipsis",
                          "white-space": "nowrap",
                          color: "#657180",
                          fontSize: "13px"
                        }
                      },
                      params.row.nickname
                    ),
                    h(
                      "div",
                      {
                        style: {
                          color: "#9EA7B4"
                        }
                      },
                      "手机号：" + params.row.mobile || ""
                    ),
                    h(
                      "div",
                      {
                        style: {
                          color: "#9EA7B4"
                        }
                      },
                      "ID：" + params.row.member_id
                    )
                  ]
                )
              ]
            );
          }
        },
        {
          title: "经销商等级",
          width: 142,
          key: "level_name",
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              levelName[params.row.agent_apply_level - 1] || "--"
            );
          }
        }
      ],
      memberSearchData: {
        searchName: "",
        selectClass: 0,
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      tableMemberData: [],
      memberModalStatus: false,
      errorModalStatus: false,
      errorModalLoading: true,
      errorList: [],
      modalCheckShow: false,
      modalCheckStatus: false,
      tableData: null
    };
  },
  watch: {
    searchData: {
      handler() {
        this.currentPage = 1;
        this.getList();
      },
      deep: true
    }
  },
  computed: {
    stockNotEnough() {
      return this.errorList.filter(
        item => item.status != 0 && item.status != -9
      ).length;
    },
    agentLevelData() {
      return new Array(this.agent_level).fill(1).map((n, index) => {
        return {
          id: index + 1,
          name: levelName[index]
        };
      });
    }
  },
  created() {
    this.$store.state.COMMON_loading = true;
    this.getMemberLevel().then(() => {
      this.getList();
    });
  },
  methods: {
    formatURL(url) {
      return /^http/.test(url) ? url : this.$store.state.siteComdataPath + url;
    },
    onPageChange(page) {
      this.currentPage = page;
      this.getList();
    },
    onPageSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.getList();
    },
    getMemberLevel() {
      return new Promise(resolve => {
        this.$httpGet("/shop/admin/member/level/list", null, res => {
          if (res.code === 200) {
            this.memberLevelData = (res.data.list || []).filter(
              item => item.status
            );
            resolve();
          } else {
            this.$store.state.COMMON_loading = false;
            this.$Message.error(res.msg);
          }
        });
      });
    },
    /**
     * 获取经销商列表
     */
    getList() {
      this.tableLoading = true;
      this.$httpPost(
        "/shop/admin/cloudstock/list",
        {
          page: this.currentPage,
          page_size: this.pageSize,
          keyword: this.searchData.keyword,
          status: this.searchData.status,
          level: this.searchData.level === -1 ? "" : this.searchData.level,
          created_at_min: this.searchData.beingTime.startTime,
          created_at_max: this.searchData.beingTime.endTime
        },
        res => {
          this.$store.state.COMMON_loading = false;
          this.tableLoading = false;
          if (res.code === 200) {
            this.agentList = res.data.list;
            this.currentPage = res.data.current;
            this.total = res.data.total;
            this.pageSize = res.data.page_size;
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
    /**
     * 新增经销商
     */
    onAddNewAgentClick() {
      this.modalMemberSelectStatus = true;
      this.resetModalData();
    },
    addNewErrorCallback() {
      this.$Message.error("请通知会员绑定手机号才能新增身份");
      this.$refs.modalMemberSelect.modalLoading = false;
      this.$nextTick(() => {
        this.$refs.modalMemberSelect.modalLoading = true;
      });
    },
    /**
     * 新增经销商确认
     */
    onModalComfrimClick(data) {
      if (!/^\d{11}$/.test(this.memberSelectData.mobile)) {
        this.addNewErrorCallback();
        return;
      }
      this.$httpPost(
        "shop/admin/cloudstock/check",
        {
          member_id: data.member_id
        },
        res => {
          if (res.code == 200) {
            data.ignore = 0;
            this.addRepositoryData(data);
          } else if (res.code == 501) {
            this.modalMemberSelectStatus = false;
            this.tableData = data;
            this.renderErrorModal(res.data.cloud_stock_fail_product);
          } else if (res.code === 459) {
            this.addNewErrorCallback();
          } else {
            this.$Message.error(res.msg);
            this.modalMemberSelectStatus = false;
          }
        }
      );
    },
    renderErrorModal(dataList) {
      this.modalCheckShow = !dataList.filter(
        item => ![-9, 0].includes(item.status)
      ).length;
      this.errorList = dataList;
      this.errorModalStatus = true;
    },
    onErrorModalConfirm() {
      if (this.modalCheckShow && this.modalCheckStatus) {
        this.tableData.ignore = 1;
        this.addRepositoryData(this.tableData);
      } else {
        this.errorModalStatus = false;
      }
    },
    addRepositoryData(data) {
      this.$httpPost(
        "/shop/admin/cloudstock/add",
        {
          member_id: data.member_id,
          agent_level: data.level,
          ignore_no_sell: data.ignore
        },
        res => {
          this.errorModalStatus = false;
          this.modalMemberSelectStatus = false;
          if (res.code === 200) {
            this.$Message.success("添加成功");
            this.onPageSizeChange(this.pageSize);
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    /**
     * 弹出会员选择弹窗
     */
    onSelectMemberClick() {
      this.memberModalStatus = true;
    },
    /**
     * 重置会员数据
     */
    resetModalData() {
      this.memberSelectData = null;
      this.$refs["modalMemberSelect"].resetData();
      this.$refs["memberSelectModal"].resetData();
    },
    /**
     * 获取经销商列表
     */
    onGetMemberList(searchData) {
      this.memberSearchData = searchData;
      let data = {
        keyword: searchData.searchName,
        page: searchData.currentPage,
        page_size: searchData.pageSize,
        show_agent_no_cloudstock: 1
      };
      if (searchData.selectClass) {
        data.level = searchData.selectClass;
      }
      this.http({
        url: "/shop/admin/cloudstock/agent/list",
        method: "POST",
        data
      }).then(res => {
        if (res.code === 200) {
          let list = res.data.list || [];
          list.forEach(item => {
            item.id = item.member_id;
          });
          this.agent_level = res.data.level;
          this.tableMemberData = list;
          this.memberSearchData.currentPage = Number(res.data.current);
          this.memberSearchData.pageSize = Number(res.data.page_size);
          this.memberSearchData.total = Number(res.data.total);
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    /**
     * 获取会员选择ID
     */
    onGetMemberSelectData(data) {
      if(data && data.status == 0) {
        return this.$Message.error("该会员已被封号，请重新选择");
      }
      this.memberSelectData = data;
      this.memberModalStatus = false;
    }
  }
};
</script>
<style lang="less" scoped>
.cloudstock-list {
  padding: 24px 24px 0;
  .cloudstock-list-header {
    // padding: 24px 0;
    button {
      height: 34px;
      &.ivu-btn-default {
        float: right;
        i {
          font-size: 14px;
          color: #4570ea;
          margin-right: 5px;
        }
      }
    }
  }
}
/deep/.ivu-page {
  /deep/.ivu-page-options {
    margin-top: -4px;
  }
}
</style>