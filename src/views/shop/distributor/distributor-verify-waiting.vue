<template>
  <div class="distributor-verify" v-show="!$store.state.COMMON_loading">
    <search-list :searchParams="searchParams" :onLine="true" :search-data="searchData">
      <Button @click="onPassAllClick" perm="distributor.review.operate">批量通过</Button>
      <Button @click="onNotPassAllClick" perm="distributor.review.operate">批量拒绝</Button>
    </search-list>
    <common-table
      ref="distributorTable"
      v-if="iscurrent"
      :minWidth="1093"
      :loading="tableLoading"
      :columnsData="columnsData"
      @selectData="onGetSelectData"
      :listData="distributorListArray"
    ></common-table>
    <div class="bar-pager">
      <Page
        v-show="distributorListArray.length"
        :total="total"
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
    <distributorVerifyModal v-model="isShowVerifyModal" :ids="VerifySelectID" :info="memberInfo"></distributorVerifyModal>
    <Modal
      v-model="modalVerifyStatus"
      title="批量拒绝"
      class="distributor-verify-change-modal"
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
        <FormItem label="审核：" v-show="!Array.isArray(VerifySelectID)">
          <RadioGroup v-model="VerifySelect" @on-change="$refs['modalValidate'].resetFields()">
            <Radio :label="1">
              <span>通过</span>
            </Radio>
            <Radio :label="-1">
              <span>不通过</span>
            </Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="拒绝原因：" prop="reason" v-show="VerifySelect === -1">
          <Input
            class="common-input-text-260"
            v-model="modalValidate.reason"
            :maxlength="20"
            placeholder="请输入拒绝原因"
            type="textarea"
          />
          <span class="suffix">{{modalValidate.reason.length}}/20</span>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import searchList from "@/views/shop/components/search/search-list.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import listExpand from "./components/distributor-verify-expand.vue";
import distributorVerifyModal from "./components/distributor-verify-modal.vue";
import memberInfor from "@/views/shop/components/table/member-infor.vue";
const dropDownName = ["verify"];
export default {
  components: {
    searchList,
    commonTable,
    memberInfor,
    distributorVerifyModal
  },
  props: {
    iscurrent: {
      type: Boolean
    }
  },
  data() {
    return {
      tableLoading: false, // 列表loading
      modalVerifyStatus: false, // 审核弹窗:多选
      isShowVerifyModal: false, //审核弹窗：单选
      modalVerifyLoading: true,
      condition: -1, // 申请条件
      selectDistributorData: [], // 选中的分销商项
      modalValidate: {
        reason: ""
      },
      ruleValidate: {
        reason: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (this.VerifySelect === -1 && !value.trim().length) {
                return callback(new Error(""));
              }
              return callback();
            },
            trigger: "blur"
          }
        ]
      },
      VerifySelect: 1,
      VerifySelectID: 0,
      memberInfo: null,
      // 分页数据
      total: 0,
      pageSize: 20,
      currentPage: 1,
      // 搜索初始化
      searchParams: [
        {
          type: 1,
          name: "",
          prefixIcon: "ios-search",
          key: "keyword",
          placeholder: "昵称/姓名/手机号"
        },
        {
          type: 3,
          key: "member_level",
          name: "会员等级：",
          options: [
            {
              id: -1,
              value: "全部"
            }
          ]
        },
        // {
        //   type: 3,
        //   key: "status",
        //   name: "审核状态：",
        //   options: [
        //     {
        //       id: -2,
        //       value: "全部"
        //     },
        //     {
        //       id: 0,
        //       value: "待审核"
        //     },
        //     {
        //       id: 1,
        //       value: "审核通过"
        //     },
        //     {
        //       id: -1,
        //       value: "审核不通过"
        //     }
        //   ]
        // },
        {
          type: 6,
          key: "dealType",
          min: 0,
          step: 1,
          precision: 0,
          options: [
            {
              id: 0,
              value: "交易次数"
            },
            {
              id: 1,
              value: "交易金额"
            }
          ]
        },
        // {
        //   type: 2,
        //   key: "registerTime",
        //   name: "注册时间："
        // },
        // {
        //   type: 2,
        //   key: "beingTime",
        //   name: "申请分销商时间："
        // },
        {
          type: 2,
          key: "applyTime",
          name: "申请分销商时间："
        }
      ],
      // 搜索数据
      searchData: {
        keyword: this.$route.query.keyword || "",
        member_level: -1,
        // status: this.$route.query.status === "0" ? 0 : -2,
        // registerTime: {
        //   startTime: "",
        //   endTime: ""
        // },
        // beingTime:{
        //   startTime: "",
        //   endTime: ""
        // },
        applyTime: {
          startTime: "",
          endTime: ""
        },
        dealType: {
          select: 0,
          startStep: null,
          endStep: null
        }
      },
      // 渲染列表节点
      columnsData: [
        {
          type: "selection",
          width: 40,
          align: "center"
        },
        {
          title: "申请人",
          minWidth: 202,
          render: (h, params) => {
              return h(memberInfor, {
                props:{
                    id:Number(params.row.member_id),
                    headurl:params.row.headurl ||
                        require("../images/head-portrait.png"),
                    nickname:params.row.nickname,
                    mobile:params.row.member_mobile,
                    name:params.row.name||'--'
                },
                attrs: {
                    perm: "member.detail.view"
                }
              });
          }
        },
        {
          title: "会员等级",
          minWidth: 120,
          key: "member_level_name",
          align: "center",
          render: (h, params) => {
            return h("div", params.row.member_level_name || "--");
          }
        },
        {
          title: "申请分销商时间",
          minWidth: 130,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              params.row.created_at.replace(/-/g, ".")
              // ? [
              //     h(
              //       "div",
              //       params.row.created_at.split(/\s/)[0].replace(/-/g, ".")
              //     ),
              //     h("div", params.row.created_at.split(/\s/)[1])
              //   ]
              // : "- - -"
            );
          }
        },
        {
          title: "交易情况",
          minWidth: 180,
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  display: "inline-block",
                  textAlign: "left"
                }
              },
              [
                // h("div", `付款：${params.row.member_buy_times || 0}次/￥${params.row.member_buy_money}`),
                // h("div", `成交：${params.row.member_deal_times || 0}次/￥${params.row.member_deal_money}`)
                h("div", `次数：${params.row.trade_time || 0}次`),
                h("div", `金额：￥${params.row.trade_money || 0}`)
              ]
            );
          }
        },
        {
          title: "状态",
          minWidth: 120,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "span",

                {
                  class: {
                    "table-success": params.row.status === 1,
                    "table-warning": params.row.status === -1,
                    "table-warning": params.row.status === 0
                  }
                },
                (() => {
                  if (params.row.status === 1) return "审核通过";
                  if (params.row.status === -1) return "审核不通过";
                  return "待审核";
                })()
              )
            ]);
          }
        },
        {
          title: "操作",
          align: "center",
          width: 120,
          render: (h, params) => {
            let detail = h(
              "span",
              {
                style: {
                  marginRight: "10px"
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
                      path: "/member/detail",
                      query: {
                        id: params.row.member_id,
                        tab: 0,
                        subTab: 1
                      }
                    });
                  }
                }
              },
              "查看详情"
            );
            let deleteItem = h(
              "div",
              {
                style: {
                  textAlign: "center",
                  display: "inline-block"
                }
              },
              [
                h(
                  "a",
                  {
                    class: {
                      "table-operation": true
                    },
                    attrs: {
                      perm: "distributor.review.operate"
                    },
                    on: {
                      click: () => {
                        this.onDeleteDistributorClick(params.index);
                      }
                    }
                  },
                  "删除"
                )
              ]
            );
            let more = h(
              "span",
              {
                style: {
                  display: "inline-block"
                },
                class: {
                  "table-operation": true
                },
                attrs: {
                  perm: "distributor.review.operate"
                },
                on: {
                  click: () => {
                    this.VerifySelect = 1;
                    this.VerifySelectID = params.row.member_id;
                    this.http({
                      url: "/shop/admin/distribution/distributor/reviewInfo",
                      params: { id: params.row.member_id }
                    }).then(res => {
                      if (res.code == 200) {
                        this.memberInfo = res.data;
                        this.isShowVerifyModal = true;
                      }
                    });
                  }
                }
              },
              "审核"
            );
            let reason = h(
              "span",
              {
                style: {
                  marginRight: "10px"
                },
                attrs: {
                  perm: "distributor.review.view"
                },
                class: {
                  "table-operation": true
                },
                on: {
                  click: () => {
                    this.$Modal.info({
                      title: "拒绝原因",
                      render: h => {
                        return h(
                          "div",
                          { style: { wordBreak: "break-all" } },
                          params.row.reject_reason
                        );
                      }
                    });
                  }
                }
              },
              "查看原因"
            );
            let line = h(
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
            );
            let showItem = [];
            if (params.row.status === 0) {
              showItem.push(detail);
              showItem.push(line);
              showItem.push(more);
            } else if (params.row.status === -1) {
              showItem.push(reason);
              showItem.push(line);
              showItem.push(deleteItem);
            } else if (params.row.status === 1) {
              showItem.push(detail);
              showItem.push(line);
              showItem.push(deleteItem);
            }
            return h("div", showItem);
          }
        },
        {
          type: "expand",
          width: 1,
          render: (h, params) => {
            return h(listExpand, {
              props: {
                id: params.row.member_id,
                selectID: params.row.parent_id || 0,
                levelData: this.memberLevelData
              },
              ref: "expand" + params.row.member_id
            });
          }
        }
      ],
      distributorListArray: [],
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
    distributorListArray(val) {
      if (val.filter(item => item._disabled).length === val.length) {
        this.$nextTick(() => {
          let selector = this.$refs["distributorTable"].$el.querySelector(
            ".ivu-table-header .ivu-table-cell-with-selection"
          );
          selector
            .querySelector("label")
            .classList.add("ivu-checkbox-wrapper-disabled");
          selector
            .querySelector("label>span")
            .classList.add("ivu-checkbox-disabled");
          selector.querySelector("input").setAttribute("disabled", "disabled");
        });
      } else {
        this.$nextTick(() => {
          let selector = this.$refs["distributorTable"].$el.querySelector(
            ".ivu-table-header .ivu-table-cell-with-selection"
          );
          selector
            .querySelector("label")
            .classList.remove("ivu-checkbox-wrapper-disabled");
          selector
            .querySelector("label>span")
            .classList.remove("ivu-checkbox-disabled");
          selector.querySelector("input").removeAttribute("disabled");
        });
      }
    }
  },
  // mounted() {
  //   this.$parent.$el.querySelector(".subjectWidth").style.minWidth = "1424px";
  // },
  methods: {
    loadPageData() {
      this.distributorListArray = [];
      this.$store.state.COMMON_loading = true;
      this.getMemberLevelList().then(() => {
        this.getDistributorList();
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
              this.searchParams
                .filter(item => item.key === "member_level")
                .forEach(item => {
                  this.$set(item, "options", [
                    ...item.options,
                    ...this.memberLevelData.map(item => {
                      return {
                        id: item.id,
                        value: item.name
                      };
                    })
                  ]);
                });
            } else {
              this.$Message.error(res.msg);
            }
            resolve();
          })
          .catch(e => {
            this.$store.state.COMMON_loading = false;
            this.$Message.error(e);
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
            this.tableLoading = false;
            if (res.code === 200) {
              this.distributorListArray = [];
              this.$nextTick(() => {
                let distributorList = res.data.data || [];
                distributorList.forEach(item => {
                  item._expanded = false;
                  if (item.status != 0) {
                    item._disabled = true;
                  } else {
                    item._disabled = false;
                  }
                });
                this.distributorListArray = distributorList;
                this.total = res.data.total;
                resolve();
              });
            } else {
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
        type: 1,
        keyword: this.searchData.keyword,
        // reg_time_start: this.searchData.registerTime.startTime,
        // reg_time_end: this.searchData.registerTime.endTime,
        // passed_time_start: this.searchData.beingTime.startTime,
        // passed_time_end: this.searchData.beingTime.endTime,
        // created_time_start: this.searchData.applyTime.startTime,
        // created_time_end: this.searchData.applyTime.endTime,
        apply_time_start: this.searchData.applyTime.startTime,
        apply_time_end: this.searchData.applyTime.endTime,
        page: this.currentPage,
        page_size: this.pageSize
      };
      let firstName = selectArray[this.searchData.dealType.select * 2];
      let lastName = selectArray[this.searchData.dealType.select * 2 + 1];
      data[firstName] = this.searchData.dealType.startStep;
      data[lastName] = this.searchData.dealType.endStep;
      if (this.searchData.member_level !== -1) {
        data["member_level"] = this.searchData.member_level;
      }
      data["status"] = 0; //写死的待审核
      // if (this.searchData.status !== -2) {
      //   data["status"] = this.searchData.status;
      // }
      return data;
    },
    /**
     * 全部审核
     */
    onPassAllClick() {
      if (this.selectDistributorData.length < 1) {
        this.$Message.error("请选择未审核的会员");
        return;
      }
      this.$Modal.confirm({
        title: "提示",
        content: "是否确定对所选的会员通过分销商审核？",
        loading: true,
        onOk: () => {
          // 删除有下级分销商的分销商
          this.VerifySelectID = this.selectDistributorData.map(
            item => item.member_id
          );
          this.VerifySelect = 1;
          this.verifyDistributor();
        }
      });
    },
    onNotPassAllClick() {
      if (this.selectDistributorData.length < 1) {
        this.$Message.error("请选择未审核的会员");
        return;
      }
      this.VerifySelectID = this.selectDistributorData.map(
        item => item.member_id
      );
      this.VerifySelect = -1;
      this.modalVerifyStatus = true;
    },
    /**
     * 获取选中项
     */
    onGetSelectData(val) {
      this.selectDistributorData = val.filter(item => item.status === 0);
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
     * 确定删除
     */
    onDeleteDistributorClick(index) {
      this.$Modal.confirm({
        loading: true,
        title: "删除",
        content: "确认删除该分销商审核记录？",
        okText: "删除",
        cancelText: "取消",
        onOk: () => {
          this.deleteDistributorVerify(
            this.distributorListArray[index].member_id
          );
          this.$Modal.remove();
        }
      });
    },
    /**
     * 删除分销商
     */
    deleteDistributorVerify(id) {
      this.$httpGet(
        "/shop/admin/distribution/distributor/deleteInReview",
        {
          id: id
        },
        res => {
          if (res.code === 200) {
            this.$Message.success("删除成功！");
            this.getDistributorList();
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    /**
     * 状态改变还原验证
     */
    onVerifyModalChange(status) {
      if (status) {
        this.$refs["modalValidate"].resetFields();
      }
    },
    /**
     * 审核弹窗选择
     */
    onVerifyComfirmClick() {
      this.modalVerifyLoading = false;
      this.$refs["modalValidate"].validate(valid => {
        if (valid) {
          this.verifyDistributor();
        } else {
          this.$Message.error("请输入拒绝原因");
          this.$nextTick(() => {
            this.modalVerifyLoading = true;
          });
        }
      });
    },
    /**
     * 审核数据操作
     */
    verifyDistributor() {
      let ids = Array.isArray(this.VerifySelectID)
        ? this.VerifySelectID
        : [this.VerifySelectID];
      let data = {
        ids: ids,
        status: this.VerifySelect
      };
      if (this.VerifySelect === -1) {
        data.reject_reason = this.modalValidate.reason;
      }
      this.modalVerifyLoading = true;
      this.$httpGet(
        "/shop/admin/distribution/distributor/review",
        data,
        res => {
          if (res.code === 200) {
            this.modalVerifyStatus = false;
            this.$Message.success("审核成功！");
            this.getDistributorList();
            this.selectDistributorData = [];
          } else {
            this.$Message.error(res.msg);
          }
          this.$Modal.remove();
        }
      );
    }
  }
  // beforeDestroy() {
  //   this.$parent.$el.querySelector(".subjectWidth").style.minWidth = "";
  // }
};
</script>

<style lang="less" scoped>
.distributor-verify {
  padding: 24px 24px 0;
  height: calc(100vh - 120px);
  overflow: auto;
  /deep/.data-list-search {
    // padding: 16px 16px 2px;
    // margin-right: 0;
    // margin-bottom: 24px;
    // background-color: #f8f9fd;
    .data-list-search-item {
      &:nth-child(3) {
        .ivu-select-dropdown,
        .ivu-select {
          width: 100px;
        }
      }
    }

    .data-list-search-item > span:not(.date-line) {
      width: auto;
    }
  }
  .ivu-table-wrapper {
    // padding-bottom: 80px;
    /*/deep/th:nth-child(2),*/
    /*/deep/td:nth-child(2) {*/
      /*.ivu-table-cell {*/
        /*padding-left: 0px;*/
      /*}*/
    /*}*/
    /deep/.ivu-table-tbody {
      tr > td:nth-child(7) {
        .ivu-table-cell {
          padding: 0px;
        }
      }
    }
    /deep/table {
      tr:not(.ivu-table-row) .ivu-table-expanded-cell {
        padding: 20px 1.74%;
      }

      tr.ivu-table-row td {
        &:last-child .ivu-table-cell {
          padding: 0;
          -webkit-line-clamp: unset;
        }
      }

      tr th:nth-child(n + 3) .ivu-table-cell {
        padding: 0;
      }

      tr td > div.ivu-table-cell-with-expand {
        display: none;
      }
    }
    /deep/.ivu-table-header {
      table {
        tr {
          th:nth-child(5) {
            .ivu-table-cell {
              padding-left: 14px;
            }
          }
        }
      }
    }
  }
}
.distributor-verify-change-modal {
  /deep/.ivu-modal-body {
    padding: 30px 30px 30px 24px;

    .ivu-form-item:last-child {
      margin-bottom: 0;
    }
  }
  /deep/.ivu-form-item-content {
    .suffix {
      position: absolute;
      bottom: 10px;
      right: 10px;
      font-size: 12px;
      line-height: 1;
      color: #9ea4b1;
    }
  }
  /deep/.ivu-input-wrapper {
    width: 100%;
    height: 100px;

    textarea {
      height: 100px;
      resize: none;
    }
  }
}
</style>
