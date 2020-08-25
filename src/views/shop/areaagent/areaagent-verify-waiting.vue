<template>
  <div class="areagent-verify" v-show="!$store.state.COMMON_loading">
    <search-list :searchParams="searchParams" :onLine="true" :search-data="searchData" @on-change="onSearchSelectChange">
      <!--<Button @click="onPassAllClick" perm="distributor.review.operate">批量通过</Button>-->
      <!--<Button @click="onNotPassAllClick" perm="distributor.review.operate">批量拒绝</Button>-->
    </search-list>
    <common-table
        ref="areagentTable"
        v-if="iscurrent"
        :minWidth="1093"
        :loading="tableLoading"
        :columnsData="columnsData"
        @selectData="onGetSelectData"
        :listData="areagentListArray"
    ></common-table>
    <div class="bar-pager">
      <Page
          v-show="areagentListArray.length"
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
    <areagentVerifyModal v-model="isShowVerifyModal" :ids="VerifySelectID" :info="memberInfo"></areagentVerifyModal>
    <Modal
        v-model="modalVerifyStatus"
        title="批量拒绝"
        class="areagent-verify-change-modal"
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
  import areagentVerifyModal from "./components/areaagent-verify-modal.vue";
  import memberInfor from "@/views/shop/components/table/member-infor.vue";
  import cityData from "@/views/shop/components/cityDataThree";
  const getNewArea = list => {
    return list.map(item => {
      let item1 = { ...item };
      item1.id = item1.value;
      item1.value = item1.label;
      return item1;
    });
  };
  let province = getNewArea(cityData[0].provinceArr);
  const dropDownName = ["verify"];
  export default {
    components: {
      searchList,
      commonTable,
      areagentVerifyModal
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
        selectAreagentData: [], // 选中的分销商项
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
            key: "apply_area_type",
            name: "申请代理级别：",
            options: [
              { id: -1, value: "全部" },
              { id: 10, value: "省代" },
              { id: 9, value: "市代" },
              { id: 8, value: "区代" }
            ]
          },
          {
            type: 3,
            key: "province",
            combine: "agentarea",
            width: 140,
            name: "代理区域：",
            options: [{ id: -1, value: "所有省份" }, ...province]
          },
          {
            type: 3,
            key: "city",
            combine: "agentarea",
            width: 140,
            options: [{ id: -1, value: "所有城市" }]
          },
          {
            type: 3,
            key: "area",
            combine: "agentarea",
            width: 140,
            options: [{ id: -1, value: "所有区/县" }]
          },
          {
            type: 2,
            key: "applyTime",
            name: "申请区代时间："
          }
        ],
        // 搜索数据
        searchData: {
          keyword: this.$route.query.keyword || "",
          apply_area_type: -1,
          applyTime: {
            startTime: "",
            endTime: ""
          },
          province:-1,
          city:-1,
          area:-1,
        },
        // 渲染列表节点
        columnsData: [
          {
            title: "申请人信息",
            minWidth: 370,
            render: (h, params) => {
              return h(memberInfor, {
                props:{
                  id:Number(params.row.member_id),
                  headurl:this.padImgUrl(params.row.headurl) ||
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
            title: "申请级别/区域",
            minWidth: 249,
            key: "member_level_name",
            align: "left",
            render: (h, params) => {
              return h("div", [
                h("span", (params.row.apply_area_type==10?"省代":params.row.apply_area_type==9?"市代":params.row.apply_area_type==8?"区代":"")+"："),
                h(
                  "span",
                  params.row.apply_prov_text+(params.row.apply_city ? "-"+params.row.apply_city_text:"")+(params.row.apply_district ? "-"+params.row.apply_district_text:"")
                )
              ]);
            }
          },
          {
            title: "申请区代时间",
            minWidth: 180,
            align: "center",
            render: (h, params) => {
              return h(
                "div",
                params.row.created_at
                // params.row.created_at.replace(/-/g, "-")
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
            title: "状态",
            minWidth: 180,
            align: "center",
            render: (h, params) => {
              return h("div", [
                h(
                  "span",

                  {
                    class: {
                      "table-success": params.row.status === 1,
                      "table-error": params.row.status === -1,
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
            width: 180,
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
                        perm: "area.agent.apply.operate"
                      },
                      on: {
                        click: () => {
                          this.onDeleteAreagentClick(params.index);
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
                    perm: "area.agent.apply.operate"
                  },
                  on: {
                    click: () => {
                      this.VerifySelect = 1;
                      this.VerifySelectID = params.row.member_id;
                      this.memberInfo = params.row;
                      this.isShowVerifyModal = true;
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
                    perm: "area.agent.apply.view"
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
        ],
        areagentListArray: [],
        // 会员等级列表
        memberLevelData: []
      };
    },
    watch: {
      searchData: {
        handler() {
          this.currentPage = 1;
          this.getAreagentList();
        },
        deep: true
      }
    },
    // mounted() {
    //   this.$parent.$el.querySelector(".subjectWidth").style.minWidth = "1424px";
    // },
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
      loadPageData() {
        this.areagentListArray = [];
        this.$store.state.COMMON_loading = true;
        this.getAreagentList();
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
      getAreagentList() {
        let data = this.getSearchParams();
        return new Promise(resolve => {
          this.tableLoading = true;
          this.http({
            url: "/shop/admin/area/agent/apply/list",
            data,
            method: "POST"
          })
            .then(res => {
              this.tableLoading = false;
              if (res.code === 200) {
                this.areagentListArray = [];
                this.$nextTick(() => {
                  let areagentList = res.data.list || [];
                  // areagentList.forEach(item => {
                  //   item._expanded = false;
                  //   if (item.status != 0) {
                  //     item._disabled = true;
                  //   } else {
                  //     item._disabled = false;
                  //   }
                  // });
                  this.areagentListArray = areagentList;
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
        let data = {
          keyword: this.searchData.keyword,
          created_at_start: this.searchData.applyTime.startTime,
          created_at_end: this.searchData.applyTime.endTime,
          apply_prov:this.searchData.province==-1?null:this.searchData.province,
          apply_city:this.searchData.city==-1?null:this.searchData.city,
          apply_district:this.searchData.area==-1?null:this.searchData.area,
          page: this.currentPage,
          page_size: this.pageSize
        };
        if (this.searchData.apply_area_type !== -1) {
          data["apply_area_type"] = this.searchData.apply_area_type;
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
        if (this.selectAreagentData.length < 1) {
          this.$Message.error("请选择未审核的会员");
          return;
        }
        this.$Modal.confirm({
          title: "提示",
          content: "是否确定对所选的会员通过分销商审核？",
          loading: true,
          onOk: () => {
            // 删除有下级分销商的分销商
            this.VerifySelectID = this.selectAreagentData.map(
              item => item.member_id
            );
            this.VerifySelect = 1;
            this.verifyAreagent();
          }
        });
      },
      onNotPassAllClick() {
        if (this.selectAreagentData.length < 1) {
          this.$Message.error("请选择未审核的会员");
          return;
        }
        this.VerifySelectID = this.selectAreagentData.map(
          item => item.member_id
        );
        this.VerifySelect = -1;
        this.modalVerifyStatus = true;
      },
      /**
       * 获取选中项
       */
      onGetSelectData(val) {
        this.selectAreagentData = val.filter(item => item.status === 0);
      },
      /**
       * 分页改变重新拉取数据
       */
      onPageChange(val) {
        this.currentPage = val;
        this.getAreagentList();
      },
      onPageSizeChange(size) {
        this.pageSize = size;
        this.currentPage = 1;
        this.getAreagentList();
      },
      /**
       * 确定删除
       */
      onDeleteAreagentClick(index) {
        this.$Modal.confirm({
          loading: true,
          title: "删除",
          content: "确认删除该分销商审核记录？",
          okText: "删除",
          cancelText: "取消",
          onOk: () => {
            this.deleteAreagentVerify(
              this.distributorListArray[index].member_id
            );
            this.$Modal.remove();
          }
        });
      },
      /**
       * 删除分销商
       */
      deleteAreagentVerify(id) {
        this.$httpGet(
          "/shop/admin/distribution/distributor/deleteInReview",
          {
            id: id
          },
          res => {
            if (res.code === 200) {
              this.$Message.success("删除成功！");
              this.getAreagentList();
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
            this.verifyAreagent();
          } else {
            this.$Message.error("请输入拒绝原因");
            this.$nextTick(() => {
              this.modalVerifyLoading = true;
            });
          }
        });
      },
      //切换城市
      onSearchSelectChange(newData, oldData) {
        let provinceStatus = newData.province !== (oldData && oldData.province);
        let cityStatus = newData.city !== (oldData && oldData.city);
        // 如果是省或城市修改才需要改下拉框内容
        if (provinceStatus || cityStatus) {
          this.searchParams.forEach(item => {
            // 如果是修改了省才需要改市的选择
            if (provinceStatus && item.key === "city") {
              let options = [{ id: -1, value: "所有城市" }];
              let selectProvince = province.find(n => n.id === newData.province);
              if (selectProvince && selectProvince.children) {
                options.push(...getNewArea(selectProvince.children));
              }
              this.$set(item, "options", options);
              this.$set(newData, "city", -1);
              this.$set(newData, "area", -1);
            }
            // 不管是改省或市都需要更新市的选择
            if (cityStatus && item.key === "area") {
              let options = [{ id: -1, value: "所有区/县" }];
              let selectProvince = province.find(n => n.id === newData.province);
              if (selectProvince && selectProvince.children) {
                let selectCity = getNewArea(selectProvince.children).find(
                  n => n.id === newData.city
                );
                if (selectCity && selectCity.children) {
                  options.push(...getNewArea(selectCity.children));
                }
              }
              this.$set(item, "options", options);
              this.$set(newData, "area", -1);
            }
          });
        }
      },
      /**
       * 审核数据操作
       */
      verifyAreagent() {
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
              this.getAreagentList();
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
  .areagent-verify {
    padding: 24px 24px 0;
    height: calc(100vh - 120px);
    overflow: auto;
    /deep/.data-list-search {
      // padding: 16px 16px 2px;
      // margin-right: 0;
      // margin-bottom: 24px;
      // background-color: #f8f9fd;
      .data-list-search-item {
        /*&:nth-child(3) {*/
          /*.ivu-select-dropdown,*/
          /*.ivu-select {*/
            /*width: 100px;*/
          /*}*/
        /*}*/
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
  .areagent-verify-change-modal {
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
