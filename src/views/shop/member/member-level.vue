<template>
  <div class="member">
    <div>
      <verticalLineTitlebar title="升级条件" />
      <Form ref="formData" :model="formData">
        <div class="padding-form">
          <FormItem label="计算方式：">
            <more-message
              :text="'付费后：成功下单并完成支付的订单金额\n维权期后：订单过维权期后的订单金额'"
              :maxWidth="258"
              placement="bottom"
            ></more-message>
            <RadioGroup
              v-model="formData.upgrade_condition"
              @on-change="radioChange"
              class="common-ml-8"
              perm="member.level.operate"
            >
              <Radio :label="0" class="common-mr-24">付费后</Radio>
              <Radio :label="1">维权期后</Radio>
            </RadioGroup>
          </FormItem>
        </div>
      </Form>
      <add-more text="新增会员等级" @onAddMoreClick="onAddMoreClick" perm="member.level.operate"></add-more>
      <common-table :minWidth="1156" :columnsData="memberColumns" :listData="memberList"></common-table>
    </div>
    <Modal
      :title="title"
      v-model="isShowModal"
      :ok-text="text"
      width="430"
      class="modal-padding"
      @on-ok="onChangeStatus(acceptData.status, acceptData.index, title)"
    >
      <p v-html="textContainer" style="font-size: 13px"></p>
    </Modal>
    <Modal
      title="转移会员"
      v-model="isTransferMember"
      :loading="modalTransferLoading"
      ok-text="确定转移"
      width="430"
      class="modal-padding"
      @on-visible-change="
        $refs['formValidate'] && $refs['formValidate'].resetFields()
      "
      @on-ok="onChangeMember"
    >
      <div class="modal-head">
        <div>
          <label>当前等级：</label>
          <label>{{ acceptData.name }}</label>
        </div>
        <div>
          <label>拥有会员：</label>
          <label>{{ acceptData.member_count }} 人</label>
        </div>
      </div>
      <div style="margin-bottom: 23px;">
        <Form ref="formValidate" :model="acceptData" :rules="ruleValidate">
          <FormItem prop="target" label="目标等级：" :show-message="false">
            <Select v-model="acceptData.target" class="common-input-text-260" transfer>
              <template v-for="(item, index) in memberList">
                <Option
                  :value="item.id"
                  :key="index"
                  v-if="acceptData.weight !== item.weight && item.status === 1"
                >{{ item.name }}</Option>
              </template>
            </Select>
          </FormItem>
        </Form>
      </div>
    </Modal>
  </div>
</template>

<script>
import addMore from "@/views/shop/components/button/add-more.vue";
import moreMessage from "COMPONENTS/more-message/more-message";
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
import commonTable from "@/views/shop/components/table/common-table.vue";
import logicOrAnd from "@/views/shop/components/logic/logic-or-and.vue";
export default {
  components: { addMore, verticalLineTitlebar, moreMessage, commonTable },
  data() {
    return {
      tableLoading: false,
      formData: {
        upgrade_condition: ""
      },
      modalTransferLoading: true,
      aftersale_isopen: 1, //订单设置--售后设置是否开启
      text: "", // 按钮名称
      title: "", // 弹框标题
      acceptData: {
        member_count: 0,
        weight: 3,
        target: null,
        index: 1,
        status: 1,
        id: 1,
        name: ""
      }, // 接受禁用传来的参数
      ruleValidate: {
        target: [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (value) {
                return callback();
              } else {
                return callback(new Error(""));
              }
            }
          }
        ]
      },
      changeId: "", // 保存传入修改时的id
      textContainer: "", // 弹框文本内容
      modify: false, // 默认 false 添加 true 修改
      isShowModal: false, // 默认不显示弹框
      isTransferMember: false, // 默认不显示转移会员弹框
      memberColumns: [
        {
          title: "等级权重",
          key: "weight",
          minWidth: 130,
          align: "center"
        },
        {
          title: "等级名称",
          key: "name",
          align: "center",
          minWidth: 150,
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  "text-overflow": "ellipsis",
                  display: "-webkit-box",
                  "-webkit-line-clamp": 2,
                  "-webkit-box-orient": "vertical"
                }
              },
              [
                params.row.name,
                Number(params.row.weight) === 0
                  ? h(
                      "span",
                      {
                        class: "table-warning",
                        style: "margin-left: 8px;"
                      },
                      "默认"
                    )
                  : ""
              ]
            );
          }
        },
        {
          title: "折扣",
          align: "center",
          minWidth: 160,
          render: (h, params) => {
            return h("span", params.row.discount > 0 ? params.row.discount + "%" : "0");
          }
        },
        {
          title: "升级条件",
          key: "condition_text",
          align: "center",
          minWidth: 250,
          renderHeader: (h, index) => {
            return h(
              "div",
              {
                style: {
                  display: "inline-block",
                  "line-height": "32px"
                }
              },
              [
                h("span", "升级条件"),
                h(moreMessage, {
                  style: {
                    "font-weight": "lighter",
                    "margin-left": "5px"
                  },
                  props: {
                    text: "不设升级条件则表示将没有会员可以升级到该等级。"
                  }
                })
              ]
            );
          },
          render: (h, params) => {
              if (params.row.weight){
                  return h(
                      "div",
                      params.row.condition_text[0].or.length||params.row.condition_text[0].and.length
                          ? [
                              h(
                                  "Tooltip",
                                  {
                                      props: {
                                          content:
                                              params.row.condition_text[0].or.join(
                                                  "\x20\x20或\x20\x20"
                                              ) +
                                              (params.row.condition_text[0].or.length &&
                                              params.row.condition_text[0].and.length
                                                  ? "\x20\x20与\x20\x20"
                                                  : "") +
                                              params.row.condition_text[0].and.join(
                                                  "\x20\x20与\x20\x20"
                                              ),
                                          transfer: true
                                      }
                                  },
                                  [
                                      h(logicOrAnd, {
                                          style: {
                                              overflow: "hidden",
                                              "text-overflow": "ellipsis",
                                              display: "-webkit-box",
                                              "-webkit-line-clamp": 3,
                                              "-webkit-box-orient": "vertical"
                                          },
                                          props: {
                                              logic: params.row.condition_text[0]
                                          }
                                      })
                                  ]
                              )
                          ]
                          :"不自动升级"
                  );
              } else{
                  return h("div","--")
              }
          }
        },
        {
          title: "使用情况",
          align: "center",
          minWidth: 180,
          render: (h, params) => {
            return h("span", params.row.member_count?params.row.member_count+"人":"0");
          }
        },
        {
          title: "状态",
          key: "status",
          width: 120,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              {
                class: {
                  "table-error": Number(params.row.status) === 0,
                  "table-success": Number(params.row.status) === 1
                }
              },
              Number(params.row.status) === 1 ? "启用" : "禁用"
            );
          }
        },
        {
          title: "操作",
          key: "operation",
          width: 168,
          render: (h, params) => {
            let btn = h(
              "span",
              {
                props: {
                  type: "error",
                  size: "small"
                },
                attrs: {
                  perm: "member.level.operate"
                },
                class: {
                  "table-operation": true
                },
                on: {
                  click: () => {
                    if (params.row.status === 0) {
                      let isHttpGet = true;
                      this.memberList.forEach((item, index) => {
                        if (
                          params.row.weight === item.weight &&
                          params.index !== index &&
                          item.status === 1
                        ) {
                          this.$Modal.error({
                            title: "启用失败",
                            content:
                              "当前已存在一样等级权重的会员等级,请先修改相关等级权重"
                          });
                          isHttpGet = false;
                        }
                      });

                      if (isHttpGet) {
                        this.$httpGet(
                          "/shop/admin/member/level/status",
                          { id: params.row.id, status: 1 },
                          res => {
                            if (res.code === 200) {
                              this.$Message.success("启用成功");
                              this.getList();
                            } else {
                              this.$Modal.error({
                                title: "启用失败",
                                content: res.msg
                              });
                            }
                          }
                        );
                      }
                    } else {
                      if (params.row.member_count < 1) {
                        this.$Modal.confirm({
                          title: "提示",
                          content:
                            "当前会员等级下还没有任何会员，是否确定禁用【" +
                            params.row.name +
                            "】等级？",
                          loading: true,
                          onOk: () => {
                            this.$httpGet(
                              "/shop/admin/member/level/status",
                              { id: params.row.id, status: 0 },
                              res => {
                                this.$Modal.remove();
                                if (res.code === 200) {
                                  this.$Message.success("禁用成功");
                                  this.getList();
                                } else {
                                  this.$Modal.error({
                                    title: "禁用失败",
                                    content: res.msg
                                  });
                                }
                              }
                            );
                          }
                        });
                      } else {
                        this.isShowModal = true;
                        this.text = "前往转移";
                        this.title = "注意";
                        this.acceptData.name = params.row.name;
                        this.acceptData.weight = params.row.weight;
                        this.acceptData.target = null;
                        this.acceptData.member_count = params.row.member_count;
                        this.acceptData.status = params.row.status;
                        this.acceptData.index = params.index;
                        this.acceptData.id = params.row.id;
                        this.textContainer =
                          "当前会员等级【" +
                          params.row.name +
                          "】，拥有 " +
                          '<span class="color-error">' +
                          params.row.member_count +
                          "</span>" +
                          " 个会员。如继续进行禁用操作，需先将这些会员转移到其他等级。";
                      }
                    }
                  }
                }
              },
              Number(params.row.status) === 1 ? "禁用" : "启用"
            );
            let line = h(
              "span",
              {
                props: {
                  type: "error",
                  size: "small"
                },
                class: {
                  "table-operation": true
                },
                style: {
                  marginLeft: "10px",
                  marginRight: "10px"
                }
              },
              "|"
            );
            let edit = h(
              "span",
              {
                props: {
                  type: "error",
                  size: "small"
                },
                attrs: {
                  perm: "distributor.level.operate"
                },
                class: {
                  "table-operation": true
                },
                on: {
                  click: () => {
                    this.isShowModal = true;
                    this.text = "前往修改";
                    this.title = "修改";
                    this.textContainer =
                      "修改会员等级。修改权重、名称、折扣都会影响新旧用户。修改升级条件，仅影响新用户。则新用户升级到当前等级需按照新升级条件进行";
                    this.changeId = params.row.id;
                  }
                }
              },
              "修改"
            );
            let del = h(
              "span",
              {
                props: {
                  type: "error",
                  size: "small"
                },
                attrs: {
                  perm: "distributor.level.operate"
                },
                class: {
                  "table-operation": true
                },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: "提示",
                      content:
                        "是否确定删除该会员等级【" + params.row.name + "】？",
                      loading: true,
                      onOk: () => {
                        this.$httpGet(
                          "/shop/admin/member/level/delete",
                          { id: params.row.id },
                          res => {
                            if (res.code === 200) {
                              this.$Message.success("删除成功");
                              this.getList();
                            } else {
                              this.$Modal.error({
                                title: "删除失败",
                                content: res.msg
                              });
                            }
                            this.$Modal.remove();
                          }
                        );
                      }
                    });
                  }
                }
              },
              "删除"
            );
            return h(
              "div",
              Number(params.row.weight) === 0
                ? [edit]
                : Number(params.row.status) === 1
                ? [btn, line, edit]
                : [btn, line, edit, line, del]
            );
          }
        }
      ],
      memberList: [], // 列表数据
      member_counts: 0, // 记录成员下的会员数量
      levelList: [] // 等级权重列表
    };
  },
  methods: {
    // 修改
    showAddPage(id) {
      this.$router.push({
        name: "memberLevelEdit",
        query: {
          id: id
        }
      });
    },
    // 展示确认转移弹框
    onChangeStatus(status, index, title) {
      if (title === "注意") {
        this.isShowModal = false;
        this.isTransferMember = true;
      } else {
        this.showAddPage(this.changeId);
      }
    },
    // 转移下级会员
    onChangeMember() {
      this.$refs["formValidate"].validate(valid => {
        if (valid) {
          this.$httpGet(
            "/shop/admin/member/level/transfer",
            { source: this.acceptData.id, target: this.acceptData.target },
            res => {
              this.isTransferMember = false;
              if (res.code === 200) {
                this.$Message.success("转移成功");
                this.getList();
              } else {
                this.$Message.error(res.msg);
              }
            }
          );
        } else {
          this.$Message.error("请选择目标等级");
          this.modalTransferLoading = false;
          this.$nextTick(() => {
            this.modalTransferLoading = true;
          });
        }
      });
    },
    // 点击添加按钮显示添加界面
    onAddMoreClick() {
      this.modify = false;
      this.$router.push({
        name: "memberLevelContainer"
      });
    },
    // 获取列表数据
    getList() {
      this.tableLoading = true;
      this.$httpGet("/shop/admin/member/level/list", "", res => {
        if (res.code === 200) {
          this.$store.state.COMMON_loading = false;
          this.tableLoading = false;
          this.memberList = res.data.list;
          this.member_counts = this.memberList.member_count;
          for (let i = 0; i < 100; i++) {
            let obj = {};
            obj.value = i;
            this.levelList.push(obj);
          }
          // 处理生成的数据是否被禁用
          this.memberList.forEach(el => {
            let or = [];
            let and = [];
            let conditionText = [];
            el.condition.filter(v => {
              if (v.logistic == "or") {
                or.push(v.name);
              } else if (v.logistic == "and") {
                and.push(v.name);
              }
            });
            conditionText.push({ or, and });
            if (conditionText.length) {
              el.condition_text = conditionText;
            } else {
              el.condition_text = "";
            }
          });
          this.levelList.forEach(item => {
            this.memberList.forEach(el => {
              // 是否被禁用
              if (el.status === 1 && el.weight === item.value) {
                item.status = 1;
              }
            });
          });
        }
      });
    },
    // 获取升级条件
    getUpgradeConditions() {
      this.$httpGet("/shop/admin/member/config/info", "", res => {
        if (res.code === 200) {
          this.formData.upgrade_condition = res.data.level_upgrade_period;
          this.aftersale_isopen = res.data.aftersale_isopen;
        }
      });
    },
    // 升级条件发生改变
    radioChange() {
      if (!this.aftersale_isopen && this.formData.upgrade_condition == 1) {
        this.$nextTick(() => {
          this.formData.upgrade_condition = 0;
        });
        this.$Modal.confirm({
          title: "提示",
          okText: "前往设置",
          content:
            "前往【订单设置>售后设置】开启售后功能并设置维权期，即可使用维权期后的功能",
          onOk: () => {
            this.$router.push("/setting/mall/order");
          }
        });
        return;
      }
      this.$httpGet(
        "/shop/admin/member/config/save",
        { level_upgrade_period: this.formData.upgrade_condition },
        res => {
          if (res.code === 200) {
            this.$Message.success("升级条件改变成功");
          }
        }
      );
    }
  },
  mounted() {
    this.$store.state.COMMON_loading = true;
    this.getList();
    this.getUpgradeConditions();
  }
};
</script>

<style lang="less" scoped>
.member {
  padding: 24px 24px 0;
  text-align: left;
  height: 100%;
  overflow: auto;
  .member-table {
    // margin-top: 24px;
    margin-bottom: 24px;
    /deep/.ivu-table-overflowX {
      overflow-x: hidden;
    }
  }
  .add-more-btn {
    /deep/.ivu-btn-primary {
      padding: 5px 15px 6px;
      width: auto;
    }
  }
  .padding-form {
    margin: 24px 30px;
    padding: 0px;
    /deep/.ivu-form-item {
      margin-bottom: 0 !important;
      .ivu-form-item-label {
        padding: 10px 4px 10px 0;
      }
    }
  }
  /deep/.ivu-modal-confirm-head {
    .ivu-modal-confirm-head-icon {
      display: none;
    }
  }
}
.modal-padding {
  // padding: 5px;
  font-size: 13px;
  /deep/.modal-head {
    padding: 16px;
    background: #f8f9fd;
    margin-bottom: 24px;
    div {
      height: 32px;
      line-height: 32px;
    }
  }
  /deep/.ivu-modal {
    .ivu-modal-body {
      padding: 20px;
    }
  }
  /deep/.ivu-select-item {
    width: 260px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.discount-input {
  width: 120px;
  margin: 0 8px;
}
.consumption-money {
  width: 160px;
  margin: 0 10px;
}
// 公共css
.level-common {
  min-height: 62px;
  padding-left: 42px;
}
.star-common {
  font-size: 20px;
  color: #f73610;
  vertical-align: -webkit-baseline-middle;
}
.margin-common {
  margin: 0 3px 0 7px;
}
.consumptions {
  padding-left: 128px;
  min-height: 50px;
}
.min-width {
  width: 240px;
}
</style>
