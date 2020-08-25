<template>
  <div class="dealer-list" v-show="!$store.state.COMMON_loading">
    <verticalLineTitlebar>
      <h3 style="color:#464C5B;font-size:13px;">目前拥有：<span style="color:#FF9900;">{{total}}</span> 名经销商</h3>
    </verticalLineTitlebar>
    <div class="dealer-list-header">
      <add-more
        text="新增经销商"
        @onAddMoreClick="onAddNewAgentClick"
        perm="dealer.operate"
      ></add-more>
    </div>
    <search-list
      :searchParams="searchParams"
      :search-data="searchData"
      :onLine="true"
      @on-change="onSearchOptionChange"
    ></search-list>
    <common-table
      :minWidth="1093"
      :loading="tableLoading"
      :columnsData="columnsData"
      :listData="dealerList"
    ></common-table>
    <div class="bar-pager">
      <Page
        :total="total"
        v-show="dealerList.length"
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
      title="新增经销商"
      levelTitle="经销商等级"
      v-model="modalMemberSelectStatus"
      :levelData="
        dealerLevelData
          .filter(n => !n.parent_id)
          .map(n => {
            n.disabled = !n.status;
            return n;
          })
      "
      @onModalComfrimClick="onModalComfrimClick"
      @onSelectMemberClick="onSelectMemberClick"
      :selectData="memberSelectData"
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
    <error-modal
      v-model="errorModalStatus"
      :hideCancel="false"
      :width="412"
      :loading="modalErrorLoading"
      @on-ok="onErrorModalConfirm"
    >
      <div>
        <div>
          经销商【{{
            this.currentRow && this.currentRow.nickname
          }}】的等级已被禁用或删除，请重新选择等级后，恢复经销商资格。
        </div>
        <Form
          ref="modalErrorValidate"
          :model="modalErrorValidate"
          :rules="modalErrorRuleValidate"
          :label-width="84"
          style="margin-right: -6px;"
        >
          <FormItem
            label="经销商等级:"
            prop="level"
            style="margin-top: 20px !important;margin-bottom: 20px !important;"
          >
            <Select
              v-model="modalErrorValidate.level"
              placeholder="请选择"
              transfer
              style="vertical-align: top;"
            >
              <Option
                v-for="item in dealerLevelData.filter(n => !n.parent_id)"
                :key="item.id"
                :value="item.id"
                :disabled="!item.status"
                >{{ item.name }}</Option
              >
            </Select>
          </FormItem>
        </Form>
      </div>
    </error-modal>
  </div>
</template>
<script>
import searchList from "@/views/shop/components/search/search-list.vue";
import addMore from "COMPONENTS/button/add-more.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import modalMemberSelect from "@/views/shop/components/modal/modal-member-select";
import errorModal from "@/views/shop/components/modal/modal-error.vue";
import selectModal from "@/views/shop/components/modal/modal-select-list.vue";
import memberInfor from "@/views/shop/components/table/member-infor.vue";
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";

const dropDownName = ["qualification", "detail"];

const searchData = {
  keyword_type: 1,
  keyword: "",
  level: -1,
  hidden_level: -1,
  status: 1,
  beingTime: {
    startTime: "",
    endTime: ""
  }
};
export default {
  components: {
    searchList,
    commonTable,
    modalMemberSelect,
    errorModal,
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
      currentRow: null,
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
          name: "经销商等级：",
          options: [{ id: -1, value: "全部" }]
        },
        ...(this.hasLicensePerm("ENABLE_DEALER_HIDE_LEVEL")
          ? [
              {
                type: 3,
                key: "hidden_level",
                name: "隐藏等级：",
                options: [{ id: -1, value: "全部" }]
              }
            ]
          : []),
        {
          type: 3,
          key: "status",
          name: "状态：",
          options: [
            { id: -1, value: "全部" },
            { id: 1, value: "启用" },
            { id: -2, value: "禁用" }
          ]
        },
        {
          type: 2,
          key: "beingTime",
          name: "成为经销商时间："
        }
      ],
      tableLoading: false,
      searchData: JSON.parse(JSON.stringify(searchData)),
      columnsData: [
        {
          title: "经销商信息",
          minWidth: 226,
          render: (h, params) => {
            return h(memberInfor, {
              props: {
                id: Number(params.row.member_id),
                headurl: params.row.headurl || "images/head-portrait.png",
                nickname: params.row.nickname,
                mobile: params.row.mobile,
                  name:params.row.name||'--'
              },
              attrs: {
                perm: "member.detail.view"
              }
            });
          }
        },
        {
          title: "经销商等级",
          minWidth: 130,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              params.row.status === -2
                ? [
                    h("div", params.row.cancel_dealer_level_name || "--"),
                    h("div", params.row.cancel_dealer_level_hide_name)
                  ]
                : [
                    h("div", params.row.dealer_level_name || "--"),
                    h("div", params.row.dealer_hide_level_name)
                  ]
            );
          }
        },
        {
          title: "上级领导",
          minWidth: 131,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              params.row.dealer_parent_id
                ? [
                    h("div", params.row.parent_nickname),
                    h("div", params.row.parent_mobile)
                  ]
                : "总店"
            );
          }
        },
        {
          title: "下级经销商",
          minWidth: 100,
          align: "center",
          render: (h, params) => {
            return params.row.status === 1
              ? h(
                  "div",
                  {
                    class: {
                      "table-operation": true
                    },
                    on: {
                      click: () => {
                        this.$router.push({
                          name: "memberDetail",
                          query: { id: params.row.member_id, tab: 3 }
                        });
                      }
                    }
                  },
                  params.row.dealer_total
                )
              : h("div", "--");
          }
        },
          {
              title: "所属员工",
              align: "left",
              minWidth: 130,
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
          title: "个人业绩",
          minWidth: 100,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              "￥" + (params.row.performance_reward_count || "0.00")
            );
          }
        },
        {
          title: "成为经销商时间",
          minWidth: 119,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              params.row.passed_at
                ? [
                    h(
                      "div",
                      params.row.passed_at.split(/\s/)[0].replace(/-/g, ".")
                    ),
                    h("div", params.row.passed_at.split(/\s/)[1])
                  ]
                : "- - -"
            );
          }
        },
        {
          title: "状态",
          align: "center",
          minWidth: 70,
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  class:
                    params.row.status === 1 ? "table-success" : "table-error"
                },
                params.row.status === 1 ? "启用" : "禁用"
              )
            ]);
          }
        },
        {
          title: "操作",
          align: "center",
          minWidth: 152,
          render: (h, params) => {
            let createDropdownItem = function(name, text, perm) {
              return h(
                "DropdownItem",
                {
                  props: {
                    name: name
                  },
                  style: {
                    padding: "3px 0"
                  },
                  attrs: {
                    class: "ivu-dropdown-item primary-hover-font-bg",
                    perm: perm + ""
                  }
                },
                text
              );
            };
            let dropTimer = null;
            let dropdown = h(
              "Dropdown",
              {
                props: {
                  trigger: "click",
                  transfer: true
                },
                style: {
                  display: "inline"
                },
                on: {
                  "on-click": name => {
                    this.onDropDownClick(name, params);
                  },
                  "on-visible-change": visible => {
                    this.isdropDownVisible = visible;
                    this.currentRow = params.row;

                    // 在关闭下拉显示的时候会有一瞬间的跳动，需要手动等待动画结束时隐藏一下
                    window.clearTimeout(dropTimer);
                    if (!visible) {
                      dropTimer = window.setTimeout(() => {
                        dropdown.componentInstance.$refs["drop"].$el &&
                          (dropdown.componentInstance.$refs[
                            "drop"
                          ].$el.style.display = "none");
                      }, 300);
                    }
                  }
                }
              },
              [
                h(
                  "span",
                  {
                    class: {
                      "table-operation": true
                    }
                  },
                  [
                    "更多",
                    h("Icon", {
                      props: {
                        type:
                          this.isdropDownVisible &&
                          this.currentRow == params.row
                            ? "ios-arrow-up"
                            : "ios-arrow-down"
                      }
                    })
                  ]
                ),
                h(
                  "DropdownMenu",
                  {
                    slot: "list",
                    style: { minWidth: "74px", margin: "-5px 0" }
                  },
                  [
                    createDropdownItem(
                      dropDownName[0],
                      params.row.status === 1 ? "取消资格" : "恢复资格",
                      "dealer.operate"
                    ),
                    createDropdownItem(
                      dropDownName[1],
                      "结算详情",
                      "dealer.view"
                    )
                  ]
                )
              ]
            );
            this.$nextTick(() => {
              dropdown.child.$refs.reference.style.display = "inline";
            });
            return h("div", [
              h(
                "span",
                {
                  class: {
                    "table-operation": true
                  },
                  attrs: {
                    perm: "dealer.view"
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
              dropdown
            ]);
          }
        }
      ],
      dealerList: [],
      modalMemberSelectStatus: false,
      memberSelectData: null,
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
                                  fontSize: "13px"
                              }
                          },
                          params.row.name?"姓名："+ params.row.name : '姓名：--'
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
          align: "center",
          render: (h, params) => {
            return h("div", [
              h("div", params.row.level_name || "--"),
              params.row.status == 0 ? h("span", {class:"table-error"}, "封号") : null
            ])
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
      dealerLevelData: [],
      tableMemberData: [],
      errorModalStatus: false,
      modalErrorLoading: true,
      modalErrorValidate: {
        level: null
      },
      modalErrorRuleValidate: {
        level: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!value) {
                return callback(new Error("请选择等级"));
              }
              return callback();
            },
            trigger: "blur"
          }
        ]
      },
      memberModalStatus: false,
      modalCheckShow: false,
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
    },
    errorModalStatus(val) {
      if (!val) {
        this.$refs.modalErrorValidate.resetFields();
      }
    }
  },
  created() {
    this.$store.state.COMMON_loading = true;
    let keyword = this.$route.query.mobile || this.$route.params.keyword;
    if (keyword) {
      this.searchData.keyword = keyword;
    }
    Promise.all([this.getDealerLevelList(), this.getMemberLevel()]).then(() => {
      this.getList();
    });
  },
  methods: {
    onSearchOptionChange(data, old) {
      if (!data) return;
      let hiddenItem = this.searchParams.find(
        item => item.key === "hidden_level"
      );
      hiddenItem &&
        this.$set(
          hiddenItem,
          "options",
          [{ id: -1, value: "全部" }].concat(
            this.dealerLevelData
              .filter(
                n =>
                  (data.level === -1 && n.parent_id) ||
                  n.parent_id === data.level
              )
              .map(item => ({
                id: item.id,
                value: item.name
              }))
          )
        );
      if (data.level !== (old && old.level)) {
        this.$set(data, "hidden_level", -1);
      }
    },
    /**
     * 下拉选择操作
     */
    onDropDownClick(name, params) {
      switch (name) {
        case dropDownName[0]:
          if (params.row.status === 1) {
            this.$Modal.confirm({
              title: "提示",
              loading: true,
              render: h => {
                return h(
                  "div",
                  `取消该经销商资格不会影响其下级的经销商资格，\n是否确定取消【${params.row.nickname}】的经销商资格？`
                );
              },
              onOk: () => {
                this.changeDealerStatus({
                  member_id: params.row.member_id
                });
              }
            });
          } else {
            this.recoverStatus(params);
          }
          break;
        case dropDownName[1]:
          this.$router.push({
            name: "cloudstockSettlementDetail",
            query: {
              id: params.row.member_id
            }
          });
          break;
        default:
          break;
      }
    },
    /**
     * 恢复资格
     */
    recoverStatus(params) {
      if (
        this.dealerLevelData
          .filter(n => n.status)
          .find(n => n.id === params.row.cancel_history_dealer_level)
      ) {
        this.$Modal.confirm({
          title: "提示",
          loading: true,
          render: h => {
            return h(
              "div",
              `是否确定要恢复【${params.row.nickname}】的经销商资格吗？`
            );
          },
          onOk: () => {
            this.changeDealerStatus({
              member_id: params.row.member_id,
              dealer_level: params.row.cancel_history_dealer_level,       
              dealer_hide_level: params.row.cancel_history_dealer_hide_level
            });
          }
        });
      } else {
        this.errorModalStatus = true;
      }
    },
    /**
     * 获取经销商等级
     */
    getDealerLevelList() {
      return new Promise(resolve => {
        this.$httpPost("/shop/admin/dealer/level/list", { get_all: 1 }, res => {
          if (res.code === 200) {
            let listData = res.data.list || [];
            let hiddenObj = {};
            let hiddenData = [];
            // 筛选出基础等级的
            let showData = listData
              .filter(n => {
                let status = !n.parent_id;
                // 如果有上级则区分出来
                if (!status) {
                  if (hiddenObj[n.parent_id]) {
                    hiddenObj[n.parent_id].push(n);
                  } else {
                    hiddenObj[n.parent_id] = [n];
                  }
                }
                return status;
              })
              .sort((a, b) => b.weight - a.weight);
            // 根据基础等级的顺序筛选出隐藏等级的
            showData.forEach(n => {
              if (hiddenObj[n.id]) {
                hiddenData.push(
                  ...hiddenObj[n.id].sort((a, b) => b.weight - a.weight)
                );
              }
            });
            this.dealerLevelData = [].concat(showData, hiddenData);
            this.$set(
              this.searchParams.find(item => item.key === "level"),
              "options",
              [{ id: -1, value: "全部" }].concat(
                this.dealerLevelData
                  .filter(n => !n.parent_id)
                  .map(item => ({
                    id: item.id,
                    value: item.name
                  }))
              )
            );
            this.onSearchOptionChange(this.searchData);
            resolve();
          } else {
            this.$store.state.COMMON_loading = false;
            this.$Message.error(res.msg);
          }
        });
      });
    },
    /**
     * 提示弹窗
     */
    onErrorModalConfirm() {
      this.$refs.modalErrorValidate.validate(valid => {
        if (valid) {
          this.changeDealerStatus({
            member_id: this.currentRow.member_id,
            dealer_level: this.modalErrorValidate.level
          });
        } else {
          this.modalErrorLoading = false;
          this.$nextTick(() => {
            this.modalErrorLoading = true;
          });
        }
      });
    },
    /**
     * 修改经销商状态
     */
    changeDealerStatus(data) {
      this.$httpPost(
        this.currentRow.status === 1
          ? "/shop/admin/dealer/cancel"
          : "/shop/admin/dealer/resume",
        data,
        res => {
          this.$Modal.remove();
          this.errorModalStatus = false;
          if (res.code === 200) {
            this.$Message.success(
              this.currentRow.status === 1 ? "取消成功" : "恢复成功"
            );
            this.currentPage = 1;
            this.getList();
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
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
        "/shop/admin/dealer/list",
        {
          page: this.currentPage,
          page_size: this.pageSize,
          keyword: this.searchData.keyword,
          keyword_type: this.searchData.keyword_type,
          status: this.searchData.status === -1 ? "" : this.searchData.status,
          dealer_level:
            this.searchData.hidden_level === -1 && this.searchData.level !== -1
              ? this.searchData.level
              : "",
          dealer_hide_level:
            this.searchData.hidden_level === -1
              ? ""
              : this.searchData.hidden_level,
          passed_at_start: this.searchData.beingTime.startTime,
          passed_at_end: this.searchData.beingTime.endTime
        },
        res => {
          this.$store.state.COMMON_loading = false;
          this.tableLoading = false;
          if (res.code === 200) {
            this.dealerList = res.data.list;
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
        "/shop/admin/dealer/add",
        {
          member_id: data.member_id,
          dealer_apply_level: data.level
        },
        res => {
          this.modalMemberSelectStatus = false;
          if (res.code == 200) {
            this.$Message.success("新增成功");
            this.onPageSizeChange(this.pageSize);
          } else if (res.code === 502) {
            this.$Modal.confirm({
              title: "提示",
              okText: "前往处理",
              render: h => {
                return h(
                  "div",
                  `你所添加的经销商【${this.memberSelectData.nickname}】，已经提交了经销商申请，可前往<经销商审核-待审核>对会员进行经销商审核处理。`
                );
              },
              onOk: () => {
                // 跳转到申请
                this.$router.push({
                  name: "dealerVerify",
                  query: {
                    keyword: this.memberSelectData.nickname
                  }
                });
              }
            });
          } else if (res.code === 504) {
            this.$Modal.confirm({
              title: "提示",
              okText: "前往处理",
              render: h => {
                return h(
                  "div",
                  `你所添加的经销商【${this.memberSelectData.nickname}】已是经销商身份，但处于【禁用】状态，可前往<经销商列表>对会员恢复经销商资格。`
                );
              },
              onOk: () => {
                // 还原搜索条件，精准到禁用昵称查询
                this.searchData = Object.assign(
                  {},
                  JSON.parse(JSON.stringify(searchData)),
                  { keyword: this.memberSelectData.nickname, status: -2 }
                );
              }
            });
          } else if (res.code === 459) {
            this.addNewErrorCallback();
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
        is_dealer: 0,
        keyword: searchData.searchName,
        page: searchData.currentPage,
        page_size: searchData.pageSize
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
          let list = res.data.list || [];
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
.dealer-list {
  padding: 24px 24px 0;
  .vertical-line-titlebar-wrapper {
    height:50px;
    line-height:50px;
    margin:-24px -24px 24px;
    padding-left:24px;
    border-bottom:1px solid #eee;
  }
  .dealer-list-header {
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
