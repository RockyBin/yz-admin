<template>
  <div class="agent-list" v-show="!$store.state.COMMON_loading">
    <verticalLineTitlebar>
      <h3 style="color:#464C5B;font-size:13px;">目前拥有：<span style="color:#FF9900;">{{total}}</span> 名代理商</h3>
    </verticalLineTitlebar>
    <div class="agent-list-header">
      <add-more text="新增代理商" @onAddMoreClick="onAddNewAgentClick" perm="agent.operate"></add-more>
      <!--<Button-->
      <!--class="btn-add"-->
      <!--type="primary"-->
      <!--shape="circle"-->
      <!--icon="md-add"-->
      <!--@click="onAddNewAgentClick"-->
      <!--perm="agent.operate"-->
      <!--&gt;新增代理</Button>-->
      <!-- <Button @click="$router.push({name: 'agentStatistics'})">
        <i class="iconfont icon-tongji"></i> 业绩统计
      </Button>-->
    </div>
    <search-list :searchParams="searchParams" :search-data="searchData" :onLine="true">
      <!-- <Button perm="agent.view">导出</Button> -->
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
    <modal-member-select
      ref="modalMemberSelect"
      title="新增代理"
      levelTitle="代理等级"
      v-model="modalMemberSelectStatus"
      @onModalComfrimClick="onModalComfrimClick"
      @onSelectMemberClick="onSelectMemberClick"
      :selectData="memberSelectData"
      :levelData="agentLevelData"
    ></modal-member-select>
    <select-modal
      title="选择会员"
      ref="memberSelectModal"
      :width="500"
      optionsText="全部会员"
      :columns="memberModalColumn"
      :searchData="memberSearchData"
      :headList="memberLevelData"
      headName="name"
      :selectData="memberSelectData"
      :tableData="tableMemberData"
      placeholder="昵称/姓名/手机号"
      v-model="memberModalStatus"
      @getList="onGetMemberList"
      @onGetSelectData="onGetMemberSelectData"
    ></select-modal>
  </div>
</template>
<script>
  import searchList from "@/views/shop/components/search/search-list.vue";
  import addMore from "@/views/shop/components/button/add-more.vue";
  import commonTable from "@/views/shop/components/table/common-table.vue";
  import modalMemberSelect from "@/views/shop/components/modal/modal-member-select.vue";
  import selectModal from "@/views/shop/components/modal/modal-select-list.vue";
  import memberInfor from "@/views/shop/components/table/member-infor.vue";
  import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";

  const levelName = ["一级代理", "二级代理", "三级代理"];
  export default {
    components: {
      searchList,
      commonTable,
      modalMemberSelect,
      selectModal,
      addMore,
      verticalLineTitlebar
    },
    inject: ["yunzhiHome"],
    data() {
      return {
        total: 0,
        pageSize: 20,
        currentPage: 1,
        searchParams: [
          {
            type: 10,
            name: "",
            prefixIcon: "ios-search",
            key: "keyword",
            optionKey: "keyword_type",
            placeholder: {
              1: "昵称/姓名/手机号",
              2: "姓名/手机号"
            },
            options: [
              {id: 1, value: "会员"},
              {id: 2, value: "员工"}
            ]
          },
          {
            type: 3,
            key: "level",
            name: "代理等级：",
            options: [
              {id: -1, value: "全部"},
              {id: 1, value: levelName[0]},
              {id: 2, value: levelName[1]},
              {id: 3, value: levelName[2]}
            ]
          },
          {
            type: 2,
            key: "beingTime",
            name: "成为代理时间："
          },
          {
            type: 3,
            key: "status",
            name: "状态：",
            options: [
              {id: -99, value: "全部"},
              {id: 1, value: "启用"},
              {id: -2, value: "禁用"}
            ]
          }
        ],
        tableLoading: false,
        searchData: {
          keyword_type: 1,
          keyword: this.$route.query.mobile || this.$route.params.keyword || "",
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
            title: "代理商信息",
            minWidth: 226,
            render: (h, params) => {
              return h(memberInfor, {
                props: {
                  id: Number(params.row.member_id),
                  headurl: this.padImgUrl(params.row.headurl) ||
                    "images/head-portrait.png",
                  nickname: params.row.nickname,
                  mobile: params.row.mobile,
                  name: params.row.name || "--"
                },
                attrs: {
                  perm: "member.detail.view"
                }
              });
            }
          },
          {
            title: "代理等级",
            minWidth: 90,
            render: (h, params) => {
              return h(
                "div",
                levelName[params.row.agent_apply_level - 1] || "--"
              );
            }
          },
          {
            title: "团队情况",
            minWidth: 131,
            render: (h, params) => {
              if (params.row.status == -2) {
                return h("div", "--");
              } else {
                return h("div", [
                  ...new Array(3 - params.row.agent_apply_level)
                    .fill(null)
                    .map(
                      (item, index) => params.row.agent_apply_level + index + 1
                    )
                    .filter(item => parseInt(params.row["agent_total" + item]))
                    .map(item =>
                      h(
                        "div",
                        levelName[item - 1] +
                        "：" +
                        params.row["agent_total" + item]
                      )
                    ),
                  h("div", "团队总成员：" + params.row.agent_total)
                ]);
              }
            }
          },
          {
            title: "分红总收益 / 可提现",
            minWidth: 150,
            render: (h, params) => {
              return h("div", [
                h("span", "总收益：￥" + params.row.agent_commission), h("br"),
                h("span", "可提现：￥" + params.row.agent_commission_balance)
              ]);
            }
          },
          {
            title: "上级领导",
            minWidth: 110,
            render: (h, params) => {
              if (params.row.status == -2) {
                return h("div", "--");
              } else {
                return params.row.agent_parent_id
                  ? h(
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
                              id: params.row.agent_parent_id
                            }
                          });
                        }
                      }
                    },
                    [
                      h("div", params.row.parent_nickname),
                      h("div", params.row.parent_mobile)
                    ]
                  )
                  : h("div", "总店");
              }
            }
          },
          {
            title: "所属员工",
            align: "left",
            minWidth: 110,
            render: (h, params) => {
              return params.row.admin_name || params.row.admin_mobile ? h("div", [
                h(
                  "div",
                  params.row.admin_name
                ),
                h(
                  "div",
                  params.row.admin_mobile
                )
              ]) : h("div", "--");
            }
          },
          {
            title: "成为代理时间",
            minWidth: 120,
            align: "center",
            render: (h, params) => {
              return h(
                "div",
                {
                  style: {
                    margin: "0 -3px"
                  }
                },
                params.row.passed_at
                  ? [
                    h(
                      "div",
                      {
                        style: {
                          display: "inline-block",
                          margin: "0 3px"
                        }
                      },
                      params.row.passed_at.split(/\s/)[0]
                    ),
                    h("br"),
                    h(
                      "div",
                      {
                        style: {
                          display: "inline-block"
                        }
                      },
                      params.row.passed_at.split(/\s/)[1]
                    )
                  ]
                  : "- - -"
              );
            }
          },
          {
            key: "status",
            title: "状态",
            width: 70,
            align: "center",
            render: (h, p) => {
              return h(
                "span",
                {
                  class: p.row.status == -2 ? "table-error" : "table-success"
                },
                p.row.status == -2 ? "禁用" : "启用"
              );
            }
          },
          {
            title: "操作",
            width: 152,
            render: (h, params) => {
              return h("div", [
                h(
                  "span",
                  {
                    style: {
                      marginRight: "10px",
                      display: params.row.status == -2 ? "none" : ""
                    },
                    class: {
                      "table-operation": true
                    },
                    attrs: {
                      perm: "member.detail.view"
                    },
                    on: {
                      click: () => {
                        this.$router.push({
                          name: "memberDetail",
                          query: {
                            id: params.row.member_id,
                            tab: 2
                          }
                        });
                      }
                    }
                  },
                  "查看详情"
                ),
                h(
                  "span",
                  {
                    style: {
                      marginRight: "10px",
                      display: params.row.status == -2 ? "none" : ""
                    },
                    class: {
                      "table-operation": true
                    }
                  },
                  "|"
                ),
                h(
                  "span",
                  {
                    class: {
                      "table-operation": true
                    },
                    attrs: {
                      perm: "agent.operate"
                    },
                    on: {
                      click: () => {
                        this.$nextTick(() => {
                          this.enableAgent = true;
                          var content = "";
                          if (params.row.status == -2) {
                            content = `是否确定恢复【${params.row.nickname}】的代理资格？`;
                          } else {
                            content = `取消该代理资格，不会影响其下级代理，是否确定取消【${params.row.nickname}】的代理资格？`;
                          }
                          this.$Modal.confirm({
                            title: "提示",
                            content: content,
                            onOk: () => {
                              this.$httpPost(
                                params.row.status == -2
                                  ? "/shop/admin/agent/resume"
                                  : "/shop/admin/agent/cancel",
                                {member_id: params.row.member_id},
                                res => {
                                  if (res.code === 200) {
                                    this.$Message.success(
                                      params.row.status == -2
                                        ? "恢复成功"
                                        : "取消成功"
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
                  params.row.status == -2 ? "恢复资格" : "取消资格"
                )
              ]);
            }
          }
        ],
        agentList: [],
        modalMemberSelectStatus: false,
        memberSelectData: null,
        agentLevelData: [],
        memberModalColumn: [
          {
            title: "会员信息",
            minWidth: 227,
            render: (h, params) => {
              return h(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center"
                  }
                },
                [
                  h("img", {
                    style: {
                      width: "40px",
                      height: "40px",
                      borderRadius: "4px",
                      marginRight: "14px"
                    },
                    attrs: {
                      src: params.row.headurl
                        ? this.padImgUrl(params.row.headurl)
                        : "images/head-portrait.png"
                    }
                  }),
                  h(
                    "div",
                    {
                      style: {
                        width: "calc(100% - 50px)",
                        "padding": "8px 0"
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
                            overflow: "hidden",
                            "text-overflow": "ellipsis",
                            "white-space": "nowrap",
                            color: "#9EA7B4",
                          }
                        },
                        params.row.name ? "姓名：" + params.row.name : '姓名：--'
                      ),
                      h(
                        "div",
                        {
                          style: {
                            color: "#9EA7B4"
                          }
                        },
                        "手机：" + params.row.mobile || ""
                      ),
                      h(
                        "div",
                        {
                          style: {
                            color: "#9EA7B4"
                          }
                        },
                        "ID：" + params.row.id
                      )
                    ]
                  )
                ]
              );
            }
          },
          {
            title: "会员等级",
            width: 142,
            key: "level_name",
            align: "center",
            render: (h, params) => {
              return h(
                "div",
                [
                  h("div", params.row.level > 0 ? params.row.level_name : "--"),
                  params.row.status == 0 ? h("span", {class: "table-error"}, "封号") : null
                ]
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
        memberLevelData: [],
        tableMemberData: [],
        memberModalStatus: false
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
    created() {
      this.$store.state.COMMON_loading = true;
      this.getMemberLevel().then(() => {
        this.getList();
      });
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
       * 获取代理列表
       */
      getList() {
        this.tableLoading = true;
        this.$httpPost(
          "/shop/admin/agent/list",
          {
            page: this.currentPage,
            page_size: this.pageSize,
            keyword: this.searchData.keyword,
            keyword_type: this.searchData.keyword_type,
            status: this.searchData.status,
            agent_apply_level:
              this.searchData.level === -1 ? "" : this.searchData.level,
            passed_at_start: this.searchData.beingTime.startTime,
            passed_at_end: this.searchData.beingTime.endTime
          },
          res => {
            this.$store.state.COMMON_loading = false;
            this.tableLoading = false;
            if (res.code === 200) {
              this.agentList = res.data.list;
              this.currentPage = res.data.current;
              this.total = res.data.total;
              this.pageSize = res.data.page_size;
              if (!this.agentLevelData.length) {
                this.agentLevelData = new Array(res.data.level)
                  .fill(null)
                  .map((item, index) => {
                    return {
                      id: index + 1,
                      name: levelName[index]
                    };
                  });
              }
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
       * 新增代理
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
       * 新增代理确认
       */
      onModalComfrimClick(data) {
        if (!/^\d{11}$/.test(this.memberSelectData.mobile)) {
          this.addNewErrorCallback();
          return;
        }
        this.addAgent({
          member_id: data.member_id,
          agent_apply_level: data.level
        });
      },
      addAgent(data) {
        this.$httpPost("/shop/admin/agent/add", data, res => {
          if (res.code === 200) {
            this.$Message.success("添加成功");
            this.modalMemberSelectStatus = false;
            this.onPageSizeChange(this.pageSize);
          } else if (res.code === 459) {
            this.addNewErrorCallback();
          } else if (res.code === 511) {
            this.modalMemberSelectStatus = false;
            this.$Modal.confirm({
              title: "提示",
              content: res.data.status == -2
                ? `你所添加的代理【${this.memberSelectData.nickname}】已是代理身份，但处于【禁用】状态，可前往<代理列表>对会员恢复代理资格。`
                : `你所添加的代理【${this.memberSelectData.nickname}】，已经提交了代理申请，可前往<代理审核-待审核>对会员进行代理审核处理。`,
              okText: "前往处理",
              onOk: () => {
                if (res.data.status == -2) {  //禁用/取消资格
                  this.searchData.keyword = this.memberSelectData.mobile;
                  this.searchData.status = -99;
                  // this.memberSelectData = null;
                  this.getList()
                } else {  //res.data.status == 0 待审核
                  this.$router.push({
                    name: "agentVerify",
                    query: {
                      tab: 0,
                      keyword: this.memberSelectData.mobile
                    }
                  })
                }

              }
            })
          } else {
            this.modalMemberSelectStatus = false;
            this.$Message.error(res.msg);
          }
        });
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
       * 获取会员列表
       */
      onGetMemberList(searchData) {
        this.memberSearchData = searchData;
        let data = {
          keyword: searchData.searchName,
          page: searchData.currentPage,
          page_size: searchData.pageSize,
          is_agent: 0
        };
        if (searchData.selectClass) {
          data.level = searchData.selectClass;
        }
        this.http({
          url: "/shop/admin/member/list",
          method: "POST",
          data
        }).then(res => {
          if (res.code === 200) {
            this.tableMemberData = res.data.list || [];
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
        if (data && data.status == 0) {
          return this.$Message.error("该会员已被封号，请重新选择");
        }
        this.memberSelectData = data;
        this.memberModalStatus = false;
      }
    }
  };
</script>
<style lang="less" scoped>
  /deep/ .ivu-table-default {
    /deep/ .ivu-table-default {
      table thead tr th {
        text-align: center;
      }
    }
  }

  .agent-list {
    padding: 24px 24px 0;

    .vertical-line-titlebar-wrapper {
      height: 50px;
      line-height: 50px;
      margin: -24px -24px 24px;
      padding-left: 24px;
      border-bottom: 1px solid #eee;
    }

    .agent-list-header {
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

    /deep/ .ivu-table-wrapper {
      /deep/ .ivu-table-row {
        & > td {
          &:nth-child(7) {
            .ivu-table-cell {
              padding: 0px;
            }
          }
        }
      }
    }
  }

  /deep/ .ivu-page {
    /deep/ .ivu-page-options {
      margin-top: -4px;
    }
  }

  /deep/ .common-table-noborder .ivu-table-cell {
    padding: 0 !important;
    margin-left: 14px;
  }
</style>