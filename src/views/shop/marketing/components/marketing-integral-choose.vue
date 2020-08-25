<template>
  <div>
    <Modal
      v-model="isShowChooseMember"
      title="选择会员"
      width="500"
      :transition-names="['false']"
      class="choose-member height-model common-table-modal"
      :class="{'is-show-scroll':tableListLength === 0}"
      :mask-closable="false"
      @on-cancel="cancel"
    >
      <div class="member-container" style="margin: 0 0 15px">
        <i-input v-model="chooseMemberInput" placeholder="昵称/姓名/手机">
          <Select v-model="chooseMemberSelect" slot="prepend" style="width: 100px">
            <Option value="-1">全部会员</Option>
            <Option v-for="item in memberLevelList" :value="item.id" :key="item.id">{{item.name}}</Option>
          </Select>
          <Button slot="append" icon="ios-search" @click="onSearchButton" style="border:none"></Button>
        </i-input>
      </div>
      <Table
        stripe
        :columns="columnsList"
        :data="chooseMemberData.list"
        :loading="tablesLoading"
        style="margin: 0 0 20px;"
        @on-row-click="saveIndexData=$event"
      ></Table>
      <Page
        :total="choosepage.total"
        :page-size="choosepage.page_size"
        :current="choosepage.page"
        @on-change="changePage"
        @on-page-size-change="changePageSize"
        size="small"
        show-elevator
        style="margin: 0 14px;text-align:right"
      />
      <div slot="footer" style="text-align: right;position:relative">
        <template v-for="item in chooseMemberData.list">
          <div
            style="display: inline-block;position:absolute;left:0;top:8px;"
            :key="item.id"
            v-if="saveIndexData.id === item.id"
          >
            <div
              style="display:inline-block;width:300px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;text-align: left;font-size: 12px;"
            >已选：{{ saveIndexData.nickname }}</div>
          </div>
        </template>

        <Button type="text" @click="onChooseMember(1)">取消</Button>
        <Button type="primary" @click="onChooseMember(2)">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
export default {
  props: [
    "value",
    "chooseMemberData",
    "choosepage",
    "memberLevelList",
    "isShowChoose",
    "tablesLoading",
    "tableListLength"
  ],
  data() {
    return {
      id: 0,
      saveIndexData: {}, // 保存当前的选中的值
      indexs: "", // 当前选择的下标
      isShowChooseMember: false, // 是否显示模态框
      chooseMemberInput: "", // 会员名称或手机号
      chooseMemberSelect: "-1", // 会员等级
      columnsList: [
        {
          title: "会员信息",
          align: "left",
          width: 227,
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
                      padding: "12px 0",
                      lineHeight: "16px"
                    }
                  },
                  [
                    h("div", [
                      h(
                        "div",
                        {
                          style: {
                            overflow: "hidden",
                            "white-space": "nowrap",
                            "text-overflow": "ellipsis",
                            color: "#657180"
                          }
                        },
                        params.row.nickname
                      ),
                      h(
                        "div",
                        {
                          style: {
                            overflow: "hidden",
                            "white-space": "nowrap",
                            "text-overflow": "ellipsis",
                            color: "#9EA7B4"
                          }
                        },
                        "姓名：" + (params.row.name || "--")
                      ),
                      h(
                        "div",
                        {
                          style: {
                            color: "#9EA7B4"
                          }
                        },
                        "手机号：" + params.row.mobile
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
                    ])
                  ]
                )
              ]
            );
          }
        },
        {
          title: "会员等级",
          key: "level_name",
          // align: "center",
          width: 142,
          render: (h, params) => {
            return h("div", [
              h("div", params.row.level_name || "--"),
              params.row.status == 0 ? h("span", {class:"table-error"}, "封号") : null
            ])
          }
        },
        {
          title: " ",
          align: "center",
          width: 80,
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary"
                    // size: "small"
                  },
                  class: {
                    "select-member-style": true
                  },
                  style: {
                    display:
                      this.saveIndexData &&
                      this.saveIndexData.id == params.row.id
                        ? "none"
                        : ""
                  },
                  on: {
                    click: () => {
                      this.saveIndexData = params.row;
                    }
                  }
                },
                "选择"
              ),
              h(
                "Button",
                {
                  class: {
                    "primary-color-border": true,
                    "select-member-style": true
                  },
                  style: {
                    // width:"50px",
                    // height:"24px",
                    display:
                      this.saveIndexData &&
                      this.saveIndexData.id == params.row.id
                        ? "block"
                        : "none"
                  }
                },
                "已选择"
              )
            ]);
          }
        }
      ],
      radios: [
        {
          val: 0,
          name: 111
        },
        {
          val: 1,
          name: 222
        }
      ]
    };
  },
  watch: {
    isShowChoose: {
      handler(val) {
        if (!val) {
          this.indexs = "";
        }
      },
      deep: true
    },
    value: function(now) {
      this.isShowChooseMember = now;
    },
    isShowChooseMember: function(now) {
      this.$emit("input", now);
      if (now === false) {
        this.$emit("chooseMemberList");
      }
    }
  },
  methods: {
    formatURL(url) {
      return /^http/.test(url) ? url : this.$store.state.siteComdataPath + url;
    },
    // 分页的参数
    changePage(page) {
      this.$emit("changeChoosePage", {
        page: page,
        chooseMemberInput: this.chooseMemberInput,
        chooseMemberSelect: this.chooseMemberSelect
      });
    },
    // 选择分页
    changePageSize(pageSize) {
      this.$emit("changeChoosePageSize", {
        pageSize: pageSize,
        chooseMemberInput: this.chooseMemberInput,
        chooseMemberSelect: this.chooseMemberSelect
      });
    },
    // 搜索按钮
    onSearchButton() {
      this.$emit("searchButton", {
        chooseMemberInput: this.chooseMemberInput,
        chooseMemberSelect: this.chooseMemberSelect
      });
    },
    onChooseMember(num) {
      if (this.saveIndexData.id == null) {
        this.$Message.error("请选择会员");
        return;
      } else {
        if (num === 2) {
          if(this.saveIndexData.status == 0) {
            return this.$Message.error("该会员已被封号，请重新选择");
          }
          this.$emit("memberListData", this.saveIndexData);
        } else {
          this.saveIndexData = {};
          this.indexs = "";
          this.id = "";
        }
        this.isShowChooseMember = false;
      }
    },
    cancel() {
      this.saveIndexData = {};
      this.indexs = "";
      this.id = "";
    }
  }
};
</script>
<style lang="less" scoped>
.choose-member {
  /deep/.ivu-table-body {
    height: 315px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  /deep/.select-member-style {
    // position: absolute;
    // right: 0px;
    // top: 23px;
    display: none;
    width: 50px;
    height: 24px;
    border-radius: 5px;
    line-height: 1;
    padding: 0px;
    padding-bottom: 2px;
  }
  .select-member-style {
    display: none;
  }
  /deep/.ivu-table-row {
    height: 70px;
  }
  /deep/.ivu-table-row:hover {
    .select-member-style {
      display: inline-block;
    }
  }
  /deep/.selected-style .ivu-btn-default {
    border-color: #4a69f5;
    color: #4a69f5;
    background-color: #ffffff;
  }
  /deep/.ivu-table-stripe {
    .ivu-table-body {
      tr {
        td {
          font-size: 12px;
          color: #657180;
        }
      }
      tr:nth-child(2n) {
        td {
          background-color: #fff;
        }
      }
      tr:hover {
        td {
          background-color: #f8f9fd;
        }
      }
    }
  }

  .member-container {
    /deep/.ivu-select-dropdown {
      will-change: auto !important;
      text-align: left;
      width: 180px;
    }
  }
}
//弹窗样式
/deep/.ivu-modal-header {
  height: 44px;
}
/deep/.ivu-modal-body {
  .member-container {
    margin: 0px !important;
  }
  padding: 0 !important;
  .member-container {
    padding: 20px 24px 16px;
    > div {
      margin: 0 !important;
    }
  }
  .ivu-table-wrapper {
    margin: 0 24px !important;
    .ivu-table {
      width: 452px !important;
    }
  }
  /deep/.ivu-page {
    margin: 0 !important;
    padding: 0 24px;
    height: 54px;
    line-height: 54px;
    /deep/.ivu-page-options {
      margin-top: -4px;
    }
  }
  .modal-list-select-modal-fixed {
    position: absolute;
    bottom: 21px;
    left: 18px;
  }
}
/deep/.ivu-modal-footer {
  border-top: 1px solid #e8eaec;
  padding: 0 18px !important;
  height: 50px;
  line-height: 50px;
}
</style>
