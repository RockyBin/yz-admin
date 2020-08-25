<template>
  <div class="distributor-list" v-show="!$store.state.COMMON_loading">
    <verticalLineTitlebar>
      <h3 style="color:#464C5B;font-size:13px;">目前拥有：<span style="color:#FF9900;">{{total}}</span> 名分销商</h3>
    </verticalLineTitlebar>
    <div>
      <!--<Button-->
      <!--type="primary"-->
      <!--class="btn-add"-->
      <!--shape="circle"-->
      <!--@click="onAddDistributor"-->
      <!--icon="md-add"-->
      <!--perm="distributor.operate"-->
      <!--&gt;新增分销商</Button>-->
      <add-more :text="texts" @onAddMoreClick="onAddDistributor" perm="distributor.operate"></add-more>
      <search-list :searchParams="searchParams" :onLine="true" :search-data="searchData"></search-list>
      <common-table
        ref="distributorTable"
        :minWidth="1158"
        :loading="tableLoading"
        :columnsData="columnsData"
        :listData="distributorListArray"
      ></common-table>
      <div class="bar-pager">
        <Page
          v-show="distributorListArray.length"
          :total="total"
          :page-size="pageSize"
          show-elevator
          show-sizer
          :current="currentPage"
          @on-change="onPageChange"
          @on-page-size-change="onPageSizeChange"
          class="page-style"
          :transfer="true"
        />
      </div>
      <modal-member-select
        ref="newDistributorModal"
        title="新增分销商"
        levelTitle="分销商等级"
        v-model="newDistributorStatus"
        @onModalComfrimClick="onModalComfrimClick"
        @onSelectMemberClick="onSelectMemberClick"
        :selectData="memberSelectData"
        :levelData="distributorLevelData"
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
      <select-modal
        title="选择分销商"
        ref="distributorSelectModal"
        :width="986"
        :columns="distributorModalColumn"
        :searchData="distributorSearchData"
        :headList="distributorLevelData"
        :loading="distModalLoading"
        headName="name"
        :selectData="distributorSelectData"
        :tableData="tableDistributorData"
        placeholder="请输入昵称/手机号"
        v-model="selectModalStatus"
        @onModalCancel="onDistributorSelectCancel"
        @getList="onGetDistributorList"
        @onGetSelectData="onGetDistributorSelectData"
      ></select-modal>
      <Modal v-model="comfirmDeleteStatus" title="注意" width="430">
        <div style="padding: 0 8px;font-size: 13px;">取消当前分销商的分销商资格，其下级分销商是同步取消资格还是转移成为其他分销商下级？</div>
        <div slot="footer">
          <Button
            type="primary"
            style="width: auto;"
            long
            :loading="comfirmDeleteLoading1"
            :disable="comfirmDeleteLoading2"
            @click="deleteDistributorType(1)"
            perm="distributor.operate"
          >同步取消资格</Button>
          <Button
            type="primary"
            style="width: auto;"
            long
            :loading="comfirmDeleteLoading2"
            :disable="comfirmDeleteLoading1"
            @click="deleteDistributorType(2)"
            perm="distributor.operate"
          >转移上级</Button>
        </div>
      </Modal>
      <subordinate
        v-model="modalSubordinateStatus"
        :distributorData="distributorViewData"
        :selectID="subordinateSelectID"
      ></subordinate>
    </div>
  </div>
</template>
<script>
import searchList from "@/views/shop/components/search/search-list.vue";
import addMore from "COMPONENTS/button/add-more.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import selectModal from "@/views/shop/components/modal/modal-select-list.vue";
import modalMemberSelect from "@/views/shop/components/modal/modal-member-select";
import subordinate from "./components/distributor-list-modal-subordinate.vue";
import memberInfor from "@/views/shop/components/table/member-infor.vue";
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
export default {
  components: {
    searchList,
    commonTable,
    selectModal,
    modalMemberSelect,
    subordinate,
    addMore,
    verticalLineTitlebar
  },
  data() {
    return {
      tableLoading: false,
      newDistributorStatus: false,
      memberModalStatus: false,
      selectModalStatus: false,
      distModalLoading: true,
      comfirmDeleteStatus: false,
      comfirmDeleteLoading1: false,
      comfirmDeleteLoading2: false,
      modalSubordinateStatus: false,
      subordinateSelectID: 0,
      // 会员选择数据
      memberSelectData: null,
      texts: "新增分销商",
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
                      ? this.formatURL(params.row.headurl)
                      : "images/head-portrait.png"
                  }
                }),
                h(
                  "div",
                  {
                    style: {
                      width: "calc(100% - 50px)",
                        padding:"8px 0"
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
                                  fontSize: "12px"
                              }
                          },
                          params.row.name?"姓名："+ params.row.name : '姓名：--'
                      ),
                    h(
                      "div",
                      {
                        style: {
                          color: "#9EA7B4",
                          fontSize: "12px"
                        }
                      },
                      "手机：" + params.row.mobile || ""
                    ),
                    h(
                      "div",
                      {
                        style: {
                          color: "#9EA7B4",
                          fontSize: "12px"
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
                params.row.status == 0 ? h("span", {class:"table-error"}, "封号") : null
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
      tableMemberData: [],
      distributorViewData: [], // 查看下级会员时需要显示的自身数据
      // 分销商选择数据
      distributorSelectData: null, // 选择的分销商
      tableDistributorData: [],
      currentExpendIndex: "", // 当前展开的需要操作的分销商index
      distributorModalColumn: [
        {
          title: "分销商等级",
          align: "center",
          minWidth: 115,
          key: "distributor_level_name"
        },
        {
          title: "分销商信息",
          width: 180,
          render: (h, params) => {
            return h("div", [
              h("div", "ID：" + params.row.member_id),
              h(
                "Tooltip",
                {
                  props: {
                    content: params.row.nickname
                  },
                  style: {
                    width: "100%"
                  }
                },
                [
                  h(
                    "div",
                    {
                      style: {
                        "white-space": "nowrap",
                        overflow: "hidden",
                        "text-overflow": "ellipsis"
                      }
                    },
                    "昵称：" + params.row.nickname
                  )
                ]
              ),
              h("div", "手机号：" + (params.row.member_mobile || ""))
            ]);
          }
        },
        {
          title: "交易情况",
          align: "left",
          width: 175,
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  textAlign: "left",
                  display: "inline-block"
                }
              },
              [
                h(
                  "div",
                  `付款：${params.row.member_buy_times || 0}次/￥${params.row
                    .member_buy_money || 0}`
                ),
                h(
                  "div",
                  `成交：${params.row.member_deal_times || 0}次/￥${params.row
                    .member_deal_money || 0}`
                )
              ]
            );
          }
        },
        {
          title: "团队总数量",
          align: "center",
          width: 94,
          key: "total_team"
        },
        {
          title: "一级分销商数量",
          align: "center",
          width: 150,
          key: "directly_under_distributor",
          renderHeader: (h, params) => {
            return h(
              "div",
              {
                style: {
                  margin: "0 -5px"
                }
              },
              params.column.title
            );
          }
        },
        {
          title: "佣金总收益",
          align: "center",
          width: 130,
          render: (h, params) => {
            return h("div", "￥" + params.row.total_commission);
          }
        }
      ],
      distributorSearchData: {
        searchName: "",
        selectClass: 0,
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      // 分页数据
      total: 0,
      pageSize: 20,
      currentPage: 1,
      // 搜索初始化
      searchParams: [
        {
          type: 10,
          name: "",
          prefixIcon: "ios-search",
          key: "keyword",
          optionKey: "keyword_type",
            placeholder: {
                1:"昵称/姓名/手机号",
                2:"姓名/手机号"
            },
          options:[
            { id: 1, value: "会员" },
            { id: 2, value: "员工" }
          ]
        },
        {
          type: 3,
          key: "level",
          name: "分销商等级：",
          options: [{ id: -1, value: "全部" }]
        },
        // {
        //   type: 6,
        //   key: "dealType",
        //   // search_new_line: true,
        //   errorName: ["次数", "金额"],
        //   min: 0,
        //   step: 1,
        //   precision: 0,
        //   // options: [{ id: 2, value: "付款次数" }, { id: 3, value: "付款金额" },{ id: 0, value: "成交次数" }, { id: 1, value: "成交金额" }]
        //   options: [{ id: 0, value: "交易次数" }, { id: 1, value: "交易金额" }]
        // },
        {
          type: 3,
          key: "status",
          name: "状态：",
          options: [
            { id: -99, value: "全部" },
            { id: 1, value: "启用" },
            { id: -2, value: "禁用" }
          ]
        },
        {
          type: 2,
          key: "beingTime",
          // search_new_line: true,
          name: "成为分销商时间："
        }
      ],
      // 搜索数据
      searchData: {
        keyword_type: 1, //1会员，2员工
        keyword: this.$route.query.mobile || this.$route.params.keyword || "",
        status: 1,
        level: -1,
        // registerTime: {
        //   startTime: "",
        //   endTime: ""
        // },
        beingTime: {
          startTime: "",
          endTime: ""
        },
        // dealType: {
        //   select: 0,
        //   startStep: null,
        //   endStep: null
        // }
      },
      // 列表模板名称
      expandComponents: "expandDistributor",
      // 渲染列表节点
      columnsData: [
        {
          title: "分销商信息",
          minWidth: 226,
          render: (h, params) => {
            return h(memberInfor, {
              props:{
                  id:Number(params.row.member_id),
                  headurl:params.row.headurl ||
                      require("@/views/shop/images/head-portrait.png"),
                  nickname:params.row.nickname,
                  mobile:params.row.member_mobile,
                  name:params.row.name || '--'
              },
              attrs: {
                  perm: "member.detail.view"
              }
            }
            );
          }
        },
        {
          title: "分销商等级",
          minWidth: 148,
          key: "distributor_level_name",
          align: "left",
          render: (h, params) => {
            return h("div", params.row.distributor_level_name || "暂无");
          }
        },
        {
          title: "成为分销商时间",
          minWidth: 119,
          align: "center",
          render: (h, params) => {
            return params.row.passed_at
              ? h(
                  "div",
                  {
                    style: {
                      marginLeft: "-5px"
                    }
                  },
                  [
                    h(
                      "span",
                      {
                        style: {
                          display: "inline-block",
                          marginLeft: "5px"
                        }
                      },
                      params.row.passed_at.split(/\s/)[0]
                    ),
                    h("br"),
                    h(
                      "span",
                      {
                        style: {
                          display: "inline-block",
                          marginLeft: "5px"
                        }
                      },
                      params.row.passed_at.split(/\s/)[1]
                    )
                  ]
                )
              : h("div", "- - -");
          }
        },
        {
          title: "团队情况",
          minWidth: 140,
          className: "distributor-list-deal-time",
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  display: "inline-block",
                  "text-align": "left"
                }
              },
              [
                h("div", [
                  h("span", `团队总数量 ：`),
                  h(
                    "a",
                    {
                      style: {
                        "text-decoration": "underline",
                        color: "#3f66d3",
                        cursor: "pointer",
                      },
                      attrs: {
                        perm: "member.detail.view"
                      },
                      on: {
                        click: () => {
                          this.$router.push({
                            path: "/member/detail",
                            query: {
                              id: params.row.member_id,
                              tab: 1
                            }
                          });
                        }
                      }
                    },
                    params.row.total_team || 0
                  )
                ]),
                h("div", [
                  h("span", `一级分销商 ：`),
                  h(
                    "a",
                    {
                      style: {
                        "text-decoration": "underline",
                        color: "#3f66d3",
                        cursor: "pointer",
                      },
                      attrs: {
                        perm: "member.detail.view"
                      },
                      on: {
                        click: () => {
                          // this.subordinateSelectID = params.row.member_id;
                          // this.distributorViewData = [params.row];
                          // this.modalSubordinateStatus = true;
                          this.$router.push({
                            path: "/member/detail",
                            query: {
                              id: params.row.member_id,
                              tab: 1,
                              level: 1,
                              id_type: 1
                            }
                          });
                        }
                      }
                    },
                    params.row.directly_under_distributor || 0
                  )
                ])
              ]
            );
          }
        },
          {
              title: "所属员工",
              align: "left",
              minWidth: 153,
              render: (h, params) => {
                  return params.row.admin_name||params.row.admin_mobile? h("div", [
                      h(
                          "div",
                          params.row.admin_name
                      ),
                      h(
                          "div",
                          params.row.admin_mobile
                      )
                  ]):h("div","--");
              }
          },
        {
          title: "佣金总收益/可提现",
          minWidth: 150,
          render: (h, params) => {
            return h("div", [
              h("div", "总收益：￥" + params.row.total_commission || 0),
              h("div", "可提现：￥" + params.row.total_commission_balance)
            ]);
          }
        },
        {
          title: "状态",
          align: "center",
          minWidth: 70,
          render: (h, params) => {
            return h(
              "div",
              {
                class:
                  params.row.status === -2 ? "table-error" : "table-success"
              },
              params.row.status === -2 ? "禁用" : "启用"
            );
          }
        },
        {
          title: "操作",
          align: "left",
          minWidth: 152,
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  style: {
                    marginRight: "10px",
                    display: params.row.status == -2 ? "none" : ""
                  },
                  attrs: {
                    perm: "member.detail.view"
                  },
                  class: {
                    "table-operation": true
                  },
                  on: {
                    click: () => {
                      this.$router.push({
                        path: "/member/detail",
                        query: {
                          id: params.row.member_id,
                          tab: 1
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
                    perm: "distributor.operate"
                  },
                  style: {
                    display: params.row.status == 1 ? "" : "none"
                  },
                  on: {
                    click: () => {
                      this.deActive(params.index);
                    }
                  }
                },
                "取消资格"
              ),
              h(
                "span",
                {
                  class: {
                    "table-operation": true
                  },
                  attrs: {
                    perm: "distributor.operate"
                  },
                  style: {
                    display: params.row.status == -2 ? "" : "none"
                  },
                  on: {
                    click: () => {
                      this.reActive(params.index);
                    }
                  }
                },
                "恢复资格"
              )
              /*
              h(
                "span",
                {
                  style: {
                    marginRight: "10px"
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
                    perm: "distributor.operate"
                  },
                  on: {
                    click: () => {
                      this.onDeleteDistributorClick(params.index);
                    }
                  }
                },
                "删除"
              )*/
            ]);
          }
        }
      ],
      // 选中的详情
      rowIndex: 0,
      // 详情数据
      detailsData: {},
      distributorListArray: [],
      // 分销等级列表
      distributorLevelData: [],
      // 会员等级列表
      memberLevelData: []
    };
  },
  watch: {
    searchData: {
      handler() {
        this.currentPage = 1;
        this.getDistributorList();
      },
      deep: true
    },
    newDistributorStatus(val) {
      if (val) {
        this.resetModalData();
      }
    },
    selectModalStatus(val) {
      if (val) {
        this.$refs["distributorSelectModal"].resetData();
      }
    }
  },
  computed: {
    distributorUrl() {
      return (
        "/shop/admin/distribution/distributor/list?type=2&no_member_id=" +
        (this.currentExpendIndex !== "" &&
        this.distributorListArray[this.currentExpendIndex]
          ? this.distributorListArray[this.currentExpendIndex].member_id
          : 0)
      );
    }
  },
  created() {
    this.$store.state.COMMON_loading = true;
    console.log(this.$route)
    Promise.all([
      this.getDistributorLevelList(),
      this.getMemberLevelList()
    ]).then(() => {
      this.getDistributorList();
    });
  },
  // mounted() {
  //   this.$parent.$el.querySelector(".subjectWidth").style.minWidth = "1380px";
  // },
  methods: {
    formatURL(url) {
      return /^http/.test(url) ? url : this.$store.state.siteComdataPath + url;
    },
    /**
     * 获取分销商等级列表
     */
    getDistributorLevelList() {
      return new Promise(resolve => {
        this.http({
          url: "/shop/admin/distribution/level/list"
        })
          .then(res => {
            if (res.code !== 200) {
              this.$store.state.COMMON_loading = false;
              this.$Message.error(res.msg);
              return;
            }
            let levelData = res.data || [];
            this.distributorLevelData = levelData.filter(item => item.status);
            this.searchParams
              .filter(item => item.key === "level")
              .forEach(item => {
                this.$set(item, "options", [
                  ...item.options,
                  ...levelData.map(item => {
                    return {
                      id: item.id,
                      value: item.name
                    };
                  })
                ]);
              });
            resolve();
          })
          .catch(e => {
            this.$Message.error(e);
            this.$store.state.COMMON_loading = false;
          });
      });
    },
    /**
     * 获取会员等级列表
     */
    getMemberLevelList() {
      return new Promise(resolve => {
        this.http({
          url: "/shop/admin/member/level/list"
        })
          .then(res => {
            if (res.code === 200) {
              this.memberLevelData = res.data.list || [];
            } else {
              this.$Message.error(res.msg);
            }
            resolve();
          })
          .catch(e => {
            this.$Message.error(e);
            this.$store.state.COMMON_loading = false;
          });
      });
    },
    /**
     * 获取分销商列表
     */
    getDistributorList() {
      let data = this.getSearchParams();
      return new Promise(resolve => {
        this.tableLoading = true;
        this.http({
          url: "/shop/admin/distribution/distributor/list",
          data,
          method: "POST"
        })
          .then(res => {
            if (res.code === 200) {
              this.distributorListArray = [];
              this.$nextTick(() => {
                let distributorList = res.data.data || [];
                distributorList.forEach(item => (item._expanded = false));
                this.distributorListArray = distributorList;
                this.total = res.data.total;
                this.tableLoading = false;
                resolve();
              });
            } else {
              this.tableLoading = false;
              this.$Message.error(res.msg);
            }
          })
          .catch(e => {
            this.$Message.error(e);
          })
          .finally(() => {
            this.$store.state.COMMON_loading = false;
          });
      });
    },
    /**
     * 获取列表搜条件
     */
    getSearchParams() {
      let selectArray = [
        "trade_time_min",
        "trade_time_max",
        "trade_money_min",
        "trade_money_max"
        // "deal_times_min",
        // "deal_times_max",
        // "deal_money_min",
        // "deal_money_max",
        // "buy_times_min",
        // "buy_times_max",
        // "buy_money_min",
        // "buy_money_max",
      ];
      let data = {
        keyword_type: this.searchData.keyword_type,
        keyword: this.searchData.keyword,
        // reg_time_start: this.searchData.registerTime.startTime,
        // reg_time_end: this.searchData.registerTime.endTime,
        status:
          this.searchData.status === -99 ? [1, -2] : [this.searchData.status],
        passed_time_start: this.searchData.beingTime.startTime,
        passed_time_end: this.searchData.beingTime.endTime,
        page: this.currentPage,
        page_size: this.pageSize
      };
      // let firstName = selectArray[this.searchData.dealType.select * 2];
      // let lastName = selectArray[this.searchData.dealType.select * 2 + 1];
      // if (this.searchData.dealType.startStep != null) {
      //   data[firstName] = this.searchData.dealType.startStep;
      // }
      // if (this.searchData.dealType.endStep != null) {
      //   data[lastName] = this.searchData.dealType.endStep;
      // }

      if (this.searchData.level !== -1) {
        data["level"] = this.searchData.level;
      }
      return data;
    },
    /**
     * 分页改变重新拉取数据
     */
    onPageChange(val) {
      this.currentPage = val;
      this.getDistributorList();
    },
    onPageSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.getDistributorList();
    },
    /**
     * 删除分销商
     */
    onDeleteDistributorClick(index) {
      this.$Modal.confirm({
        title: "提示",
        content:
          "除非必要，请不要随意删除分销商！删除后，分销商资料不可恢复，同时会取消该分销商资格，是否确定删除？",
        loading: true,
        onOk: () => {
          // 删除有下级分销商的分销商
          if (this.distributorListArray[index].directly_under_distributor > 0) {
            this.onComfirmDeleteDirectly(index);
            this.$Modal.remove();
            return;
          }
          this.deletDistributorData({
            id: this.distributorListArray[index].member_id
          });
        }
      });
    },
    /**
     * 分销商取消资格
     */
    deActive(index) {
      var subtotal = 0;
      this.$httpGet(
        "/shop/admin/distribution/distributor/info",
        { type: 2, id: this.distributorListArray[index].member_id },
        res => {
          if (res.code === 200) {
            subtotal = res.data.base_info.subordinate_distributor;
            var tips =
              "是否确定取消【" +
              this.distributorListArray[index].nickname +
              "】的分销商资格？";
            if (subtotal)
              tips =
                "该分销商共有下级分销商" +
                subtotal +
                "人，取消【" +
                this.distributorListArray[index].nickname +
                "】的分销资格后，仅取消该分销商资格，不会影响其他分销商的资格。是否确定要取消？";
            this.$Modal.confirm({
              title: "提示",
              content: tips,
              loading: true,
              onOk: () => {
                this.deActiveData({
                  id: this.distributorListArray[index].member_id
                });
              }
            });
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    /**
     * 分销商恢复资格
     */
    reActive(index) {
      this.$Modal.confirm({
        title: "提示",
        content:
          "是否确定恢复【" +
          this.distributorListArray[index].nickname +
          "】的分销商资格？",
        loading: true,
        onOk: () => {
          this.reActiveData({
            id: this.distributorListArray[index].member_id
          });
        }
      });
    },
    /**
     * 确认是否删除
     */
    onComfirmDeleteDirectly(index) {
      this.currentExpendIndex = index;
      this.comfirmDeleteStatus = true;
    },
    /**
     * 删除分销商方式
     */
    deleteDistributorType(flag) {
      if (flag === 1) {
        this.comfirmDeleteLoading1 = true;
        let data = {
          id: this.distributorListArray[this.currentExpendIndex].member_id,
          sub_op_type: 1
        };
        this.transDistributor(data, true);
      } else if (flag === 2) {
        this.comfirmDeleteLoading2 = true;
        this.distributorSelectData = null;
        this.selectModalStatus = true;
      }
    },
    /**
     * 转移分销商
     */
    transDistributor(data, status) {
      this.$httpGet(
        "/shop/admin/distribution/distributor/dispose/sub",
        data,
        res => {
          if (res.code === 200) {
            // 同步取消
            if (data.sub_op_type === 1) {
              this.deletDistributorData({
                id: data.id
              }).then(() => {
                this.selectModalStatus = false;
              });
            } else {
              this.$Message.success("转移成功");
              this.getDistributorList();
              this.comfirmDeleteLoading1 = false;
              this.selectModalStatus = false;
            }
          } else {
            this.$Message.error(res.msg);
            this.comfirmDeleteLoading1 = false;
          }
          this.comfirmDeleteLoading2 = false;
          this.comfirmDeleteStatus = false;
          this.distModalLoading = false;
          this.$nextTick(() => {
            this.distModalLoading = true;
          });
        }
      );
    },
    /**
     * 删除分销商数据
     */
    deletDistributorData(data) {
      return new Promise(resolve => {
        this.$httpGet(
          "/shop/admin/distribution/distributor/delete",
          data,
          res => {
            this.$Modal.remove();
            resolve();
            if (res.code === 200) {
              this.$Message.success("删除成功");
              this.getDistributorList();
            } else {
              this.$Message.error(res.msg);
            }
          }
        );
      });
    },
    /**
     * 取消分销商资格接口
     */
    deActiveData(data) {
      return new Promise(resolve => {
        this.$httpGet(
          "/shop/admin/distribution/distributor/deactive",
          data,
          res => {
            this.$Modal.remove();
            resolve();
            if (res.code === 200) {
              this.$Message.success("取消成功");
              this.getDistributorList();
            } else {
              this.$Message.error(res.msg);
            }
          }
        );
      });
    },
    /**
     * 恢复分销商资格接口
     */
    reActiveData(data) {
      return new Promise(resolve => {
        this.$httpGet(
          "/shop/admin/distribution/distributor/reactive",
          data,
          res => {
            this.$Modal.remove();
            resolve();
            if (res.code === 200) {
              this.$Message.success("恢复成功");
              this.getDistributorList();
            } else {
              this.$Message.error(res.msg);
            }
          }
        );
      });
    },
    /**
     * 新增分销商
     */
    onAddDistributor() {
      this.newDistributorStatus = true;
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
        distributor_status: -98
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
    // 取消选择分销商
    onDistributorSelectCancel() {
      if (this.comfirmDeleteLoading2) {
        this.comfirmDeleteLoading2 = false;
      }
    },
    /**
     * 获取要选择的上级分销商列表
     */
    onGetDistributorList(searchData) {
      this.distributorSearchData = searchData;
      let data = {
        keyword: searchData.searchName,
        page: searchData.currentPage,
        page_size: searchData.pageSize,
        status: 1
      };
      if (searchData.selectClass !== 0) {
        data.level = searchData.selectClass;
      }
      this.http({
        url: this.distributorUrl,
        method: "POST",
        data
      }).then(res => {
        if (res.code === 200) {
          let listData = res.data.data || [];
          this.tableDistributorData = listData.map(item => {
            item.id = item.member_id;
            return item;
          });
          this.distributorSearchData.currentPage = Number(res.data.current);
          this.distributorSearchData.pageSize = Number(res.data.page_size);
          this.distributorSearchData.total = Number(res.data.total);
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    /**
     * 获取分销商选择ID
     */
    onGetDistributorSelectData(selectData) {
      if (!selectData) {
        return;
      }
      // 转移上级分销商
      if (this.comfirmDeleteLoading2) {
        let data = {
          id: this.distributorListArray[this.currentExpendIndex].member_id,
          sub_op_type: 2,
          trans_to: selectData.id
        };
        this.transDistributor(data);
        return;
      }
      let oldParent = this.distributorListArray[this.currentExpendIndex]
        .parent_id;
      // 修改上级分销商的
      this.$httpGet(
        "/shop/admin/distribution/distributor/edit",
        {
          id: this.distributorListArray[this.currentExpendIndex].member_id,
          parent_id: selectData.id
        },
        res => {
          this.selectModalStatus = false;
          if (res.code === 200) {
            this.distributorListArray[this.currentExpendIndex].parent_id =
              selectData.id;
            this.$refs["distributorTable"].$refs["selection"].$refs[
              "tbody"
            ].$refs[
              "expand" +
                this.distributorListArray[this.currentExpendIndex].member_id
            ].getDistributorInfo();
            this.distributorListArray.forEach(item => {
              let changeNum = 0;
              if (item.member_id === selectData.id) {
                changeNum = 1;
              }
              if (item.member_id === oldParent) {
                changeNum = -1;
              }
              if (changeNum) {
                this.$set(
                  item,
                  "directly_under_distributor",
                  item.directly_under_distributor + changeNum
                );
                this.$set(item, "total_team", item.total_team + changeNum);
              }
            });
            this.$Message.success("修改成功");
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    /**
     * 选择会员
     */
    onSelectMemberClick() {
      this.memberModalStatus = true;
    },
    addNewErrorCallback() {
      this.$Message.error("请通知会员绑定手机号才能新增身份");
      this.$refs.newDistributorModal.modalLoading = false;
      this.$nextTick(() => {
        this.$refs.newDistributorModal.modalLoading = true;
      });
    },
    /**
     * 新增分销商
     */
    onModalComfrimClick(data) {
      if (!/^\d{11}$/.test(this.memberSelectData.mobile)) {
        this.addNewErrorCallback();
        return;
      }
      this.http({
        url: "/shop/admin/distribution/distributor/add",
        method: "POST",
        data: data
      }).then((res) => {
        if(res.code == 511) {
          this.newDistributorStatus = false;
          this.$Modal.confirm({
            title: "提示",
            content: res.data.status == -2 
              ? `你所添加的分销商【${this.memberSelectData.nickname}】已是分销商身份，但处于【禁用】状态，可前往<分销商列表>对会员恢复分销商资格。` 
              : `你所添加的分销商【${this.memberSelectData.nickname}】，已经提交了分销商申请，可前往<分销商审核-待审核>对会员进行分销商审核处理。`,
            okText: "前往处理",
            onOk: () => {
              if(res.data.status == -2) {  //禁用/取消资格
                this.searchData.keyword = this.memberSelectData.mobile;
                this.searchData.status = -99;
                this.getDistributorList();
              } else {  //res.data.status == 0 待审核
                this.$router.push({
                  name: "distributorVerify",
                  query: {
                    tab: 0,
                    keyword: this.memberSelectData.mobile
                  }
                })
              }
            }
          })
        } else if (res.code === 200) {
          this.$Message.success("添加成功！");
          this.newDistributorStatus = false;
          this.getDistributorList();
        } else if (res.code === 459) {
          this.addNewErrorCallback();
        } else {
          this.$Message.success(res.msg);
          this.newDistributorStatus = false;
        }
      });
    },
    /**
     * 重置会员数据
     */
    resetModalData() {
      this.memberSelectData = null;
      this.$refs["newDistributorModal"].resetData();
      this.$refs["memberSelectModal"].resetData();
    }
  }
  // beforeDestroy() {
  //   this.$parent.$el.querySelector(".subjectWidth").style.minWidth = "";
  // }
};
</script>
<style lang="less" scoped>
.distributor-list {
  padding: 24px;
  height: 100%;
  overflow: auto;
  .vertical-line-titlebar-wrapper {
    height:50px;
    line-height:50px;
    margin:-24px -24px 24px;
    padding-left:24px;
    border-bottom:1px solid #eee;
  }
  .add-more-btn {
    /deep/.ivu-btn-primary {
      width: 100px;
    }
  }
  /deep/.data-list-search {
    // padding: 16px 16px 2px;
    // margin-right: 0;
    // margin-bottom: 24px;
    // background-color: #f8f9fd;

    .data-list-search-item {
      &:nth-child(2) {
        .ivu-select-item {
          width: 210px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      &:nth-child(3) {
        .ivu-select {
          width: 100px;
        }
      }
      & > span:not(.date-line) {
        width: auto;
      }
    }
  }
  .ivu-table-wrapper {
    // padding-bottom: 80px;
    /deep/table {
      tr:not(.ivu-table-row) .ivu-table-expanded-cell {
        padding: 20px 1.74%;
        background: #f8f9fd;
      }
      tr.ivu-table-row td {
        &.distributor-list-deal-time .ivu-table-cell {
          display: block;
        }
        &:last-child .ivu-table-cell {
          padding: 0;
        }
      }
      tr th:nth-child(1) .ivu-table-cell {
        padding: 0;
      }
      tr td > div.ivu-table-cell-with-expand {
        display: none;
      }
      // .ivu-table-row {
      //   position: relative;
      // }
    }
  }
}
/deep/.common-table-noborder .ivu-table-cell {
  padding: 0 !important;
  margin-left: 14px;
}
/deep/.ivu-page {
  /deep/.ivu-page-options {
    margin-top: -4px;
  }
}
</style>
