<template>
  <div>
    <Modal
      class="height-model"
      :value="isShowCoupons"
      title="发放优惠券"
      width="500"
      :transition-names="['false']"
      :mask-closable="false"
      @on-cancel="onCancelCoupons"
      @on-ok="onConfirmCoupon"
    >
      <div class="container">
        <div>
          <label class="common-mr-12">发放对象:</label>
          <RadioGroup v-model="distributedObject">
            <Radio v-for="(item, index) in radioData" :label="item.val" :key="index">{{ item.name }}</Radio>
          </RadioGroup>
        </div>
        <div v-if="distributedObject === 1" class="checkbox-style">
          <CheckboxGroup v-model="memberLevel">
            <template v-for="(item, index) in levelList.level_data.list">
              <Checkbox
                v-if="item.status === 1"
                :label="item.id"
                :key="index"
                style="display:block"
              >{{ item.name }}</Checkbox>
            </template>
          </CheckboxGroup>
        </div>
        <div v-if="distributedObject === 2" style="margin-bottom: -24px;">
          <marketing-intetral-choose-list
            :columnsList="columnsList"
            :dataList="levelList.member_data"
            :memberLevelList="memberLevelList"
            :isInit="isShowCoupons"
            :tablesLoading="tablesLoading"
            @on-row-click="saveIndexData = $event"
            @searchButton="searchButton"
            @pagingCapabilities="pagingCapabilities"
          ></marketing-intetral-choose-list>
        </div>
      </div>
      <div
        class="footer-name"
        v-if="distributedObject === 2 && saveIndexData.nickname"
      >
        <label>已选：</label>
        <label>{{ saveIndexData.nickname }}</label>
      </div>
      <div slot="footer">
        <Button type="text" @click="onCancelCoupons">取消</Button>
        <Button type="primary" @click="onConfirmCoupon" :loading="loading"
          >确定</Button
        >
      </div>
    </Modal>
  </div>
</template>
<script>
import marketingIntetralChooseList from "./marketing-integral-choose-list.vue";
export default {
  components: { marketingIntetralChooseList },
  props: {
    tablesLoading: {
      type: Boolean,
      default: false
    },
    isShowCoupons: {
      type: Boolean,
      default: false
    },
    levelList: {
      type: Object,
      default() {
        return {};
      }
    },
    loading: {
      type: Boolean,
      default: false
    },
    memberLevelList: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  watch: {
    isShowCoupons(value) {
      if (!value) {
        this.memberID = 0;
        this.distributedObject = 0;
        this.indexs = "";
        this.saveIndexData = {};
        this.memberLevel = [];
        this.dataList = [];
      }
    }
  },
  data() {
    return {
      memberID: 0,
      distributedObject: 0, // 保存发放对象的值
      indexs: "", // 当前选择的下标
      saveIndexData: {}, // 保存当前的选中的值
      memberLevel: [],
      radioData: [
        // 发放对象
        {
          val: 0,
          name: "所有对象"
        },
        {
          val: 1,
          name: "会员等级"
        },
        {
          val: 2,
          name: "指定会员"
        }
      ],
      columnsList: [
        {
          title: "会员信息",
          align: "left",
          width: 217,
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
                            color: "#657180",
                            fontSize: "12px"
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
                            color: "#9EA7B4",
                            fontSize: "12px"
                          }
                        },
                        "姓名：" + (params.row.name || "--")
                      ),
                      h(
                        "div",
                        {
                          style: {
                            color: "#9EA7B4",
                            fontSize: "12px"
                          }
                        },
                        "手机号：" + params.row.mobile
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
          width: 148,
          render: (h, params) => {
            return h("div", [
              h("div", params.row.level ? params.row.level_name : "--"),
              params.row.status == 0 ? h("span", {class:"table-error"}, "封号") : null
            ])
          }
        },
        {
          title: " ",
          align: "center",
          width: 84,
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary"
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
      dataList: []
    };
  },
  methods: {
    formatURL(url) {
      return /^http/.test(url) ? url : this.$store.state.siteComdataPath + url;
    },
    // 翻页功能
    pagingCapabilities(val) {
      this.$emit("pageManage", val);
    },
    // 搜索功能
    searchButton(val) {
      this.$emit("searchMemberButton", val);
    },
    // 取消按钮
    onCancelCoupons() {
      this.$emit("changeCancelCoupons");
      this.saveIndexData = {};
    },
    // 确认按钮
    onConfirmCoupon() {
      let obj = {
        member_id: "",
        level_id: "",
        type: this.distributedObject
      };
      // 指定会员等级
      if (this.distributedObject === 1) {
        if (!this.memberLevel.length) {
          this.$Message.error("请选择会员等级");
          return;
        }
        obj.level_id = this.memberLevel.join(",");
      }
      // 指定会员
      if (this.distributedObject === 2) {
        if (this.saveIndexData.id == null) {
          this.$Message.error("请选择会员");
          return;
        }
        if (this.saveIndexData.status == 0) {
          return this.$Message.error("该会员已被封号，请重新选择");
        }
        obj.member_id = this.saveIndexData.id;
      }
      this.$emit("changeConfirmCoupons", obj);
    },
    chooseMember() {
      this.$emit("chooseMemberButton");
    }
  }
};
</script>
<style lang="less" scoped>
/deep/.ivu-modal {
  height: 646px;
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
.container {
  height: 490px;
  padding: 24px;
  position: relative;
  overflow: auto;
  div:first-child {
    label {
      font-size: 13px;
      vertical-align: bottom;
    }
  }
  .checkbox-style {
    width: 270px;
    padding: 16px 16px 0;
    margin-left: 68px;
    margin-top: 16px;
    background: rgba(247, 247, 247, 1);
    overflow-y: auto;
    height: 404px;
  }
  /deep/.ivu-checkbox-wrapper {
    margin-bottom: 14px;
  }
  /deep/.ivu-radio-wrapper {
    margin-right: 24px;
  }
}
.footer-name {
  position: absolute;
  left: 12px;
  bottom: 13px;
  width: calc(100% - 150px);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
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
    padding: 20px 0 16px;
    > div {
      margin: 0 !important;
    }
  }
  .ivu-table-wrapper {
    margin: 0 !important;
    .ivu-table {
      width: 452px !important;
    }
    .ivu-table-default {
      height: 347px;
    }
  }
  /deep/.ivu-page {
    margin: 0 !important;
    padding: 0 24px;
    height: 54px;
    line-height: 54px;
    margin-bottom: -8px;
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
