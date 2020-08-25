<template>
  <div class="dealer-performance-award" style="padding-bottom: 50px;" v-if="performanceData">
    <div class="dealer-performance-award-content">
      <warning-alert title="业绩奖说明：">
        <div>
          <p>1. 经销商业绩是指经销商自己订购的云仓个人业绩，业绩奖金是指公司发放给直接对接公司的经销商的奖金。</p>
          <p>2. 奖励规则：首先判断匹配到了哪些规则，然后从匹配到的规则中取出满足条件最高的规则，按这个规则发放奖励，只发一次。</p>
          <p>3. 当触发到发放周期，系统自动完成周期内的业绩结算，通过审核后将奖金发放到经销商的资金池；当确定了发放周期后，不要随意更改，以免造成经济损失。</p>
          <p>4. 奖金计算：按固定金额即达到业绩后，奖金按固定金额发放；按比例即达到业绩后，奖金按实际业绩*比例发放。</p>
        </div>
      </warning-alert>
      <Form
        ref="formValidatePerformance"
        :label-width="140"
        :model="performanceData"
        :rules="ruleValidatePerformance"
      >
        <switch-titlebar
          style="margin-bottom: 24px;"
          v-model="performanceData.enable"
          title="是否开启业绩奖功能"
          @on-change="onAgentStatusChange"
        />
        <FormItem label="业绩奖金审核：" v-show="performanceData.enable">
          <RadioGroup v-model="performanceData.auto_check">
            <Radio :label="1">自动审核</Radio>
            <Radio :label="0">手动审核</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="结算发放周期：" v-show="performanceData.enable">
          <RadioGroup v-model="performanceData.give_period">
            <Radio :label="0">按月度结算发放</Radio>
            <Radio :label="1">按季度结算发放</Radio>
            <Radio :label="2">按年度结算发放</Radio>
          </RadioGroup>
        </FormItem>
        <!--<FormItem label="发放对象：" v-show="performanceData.enable">-->
        <!--<RadioGroup v-model="performanceData.give_dealer_level">-->
        <!--<Radio :label="0">仅发放给团队的最高级别的经销商</Radio>-->
        <!--&lt;!&ndash;<Radio :label="1">发放所有经销商</Radio>&ndash;&gt;-->
        <!--</RadioGroup>-->
        <!--</FormItem>-->
        <FormItem label="奖励规则：" prop="rules" v-show="performanceData.enable">
          <div style="width: 700px;" class="dealer-performance-award-table">
            <add-more text="新增规则" @onAddMoreClick="onAddNewRuleClick"></add-more>
            <!--<Button-->
            <!--type="primary"-->
            <!--shape="circle"-->
            <!--icon="md-add"-->
            <!--style="margin-bottom: 16px;"-->
            <!--@click="onAddNewRuleClick"-->
            <!--&gt;添加规则</Button>-->
            <common-table
              :hasBorder="true"
              type="border"
              :columnsData="columnsData"
              :listData="performanceData.rules"
            ></common-table>
          </div>
        </FormItem>
      </Form>
    </div>
    <Modal
      v-model="modalRuleStatus"
      :loading="modalLoading"
      :title="tableSelectIndex === null ? '添加规则' : '修改规则'"
      :width="596"
      @on-visible-change="onVerifyModalChange"
      @on-ok="onModalConfirmClick"
      class="dealer-performance-award-modal"
    >
      <Form :label-width="72" :model="modalData" :rules="ruleValidateModal">
        <FormItem label="奖励方式：">
          <RadioGroup v-model="modalData.reward_type" @on-change="onRewardTypeChange">
            <Radio :label="0">固定金额</Radio>
            <Radio :label="1">比例</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label=" 规则：" prop="target">
          <Select v-model="modalData.dealer_level" :class="{'ivu-form-item-error': showErrorTip}" class="common-input-text">
            <Option :value="item.id" v-for="(item,index) in dealerLevel">{{item.name}}</Option>
          </Select>
          <span>
            <span style="padding-left: 11px;">业绩达</span>
            <Input :class="{'ivu-form-item-error': errorTip.target||showErrorTip}" v-model="target" class="common-input-text-120" />
            <span>元，奖励</span>
            <Input :class="{'ivu-form-item-error': errorTip.reward}" v-model="reward" class="common-input-text-120" />
            <span v-if="!modalData.reward_type">元</span>
            <span v-else>%</span>
          </span>
        </FormItem>
      </Form>
      <span
        class="dealer-performance-award-modal-tip dealer-performance-award-modal-left"
        v-show="showErrorTip"
      >已存在相同的规则，请重新设置</span>
      <span class="dealer-performance-award-modal-tip" v-show="errorTip.target">请输入规则内容</span>
      <span
        class="dealer-performance-award-modal-tip dealer-performance-award-modal-tip-right"
        v-show="errorTip.reward"
      >请输入规则内容</span>
    </Modal>
    <!-- <foot-button
          @onSaveClick="savePerformanceData"
          :loading="saveLoading"
          perm="agent.config.operate"
    ></foot-button>-->
    <div class="footer">
      <Button
        type="primary"
        shape="circle"
        @click="savePerformanceData"
        :loading="saveLoading"
        perm="dealer.config.operate"
      >保存</Button>
    </div>
  </div>
</template>
<script>
import warningAlert from "@/views/shop/components/alert/alert-warning";
import footButton from "@/views/shop/components/button/foot-button.vue";
import addMore from "@/views/shop/components/button/add-more.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
const modalData = {
  dealer_level: 0,
  level_name: "",
  target: "",
  reward_type: 0,
  reward: ""
};
const getNumber = (val, limit) => {
  // 保留的位数
  // let reg = /^([1-9][0-9]*)+(.[0-9]{1,2})?$/;
  let value = limit
    ? val.replace(/[^0-9.]+/g, "").replace(/^\.+/, "")
    : val.replace(/[^0-9]+/g, "");
  let point = value.match(/\./g);
  // 得到纯数字的值
  let target =
    value && (point && point.length > 1)
      ? value.split(/\./)[0] + "." + value.split(/\./)[1]
      : value;
  let numbers;
  if (target.indexOf(0) == 0 && target.indexOf(".") == -1) {
    if (target.length > 1) {
      numbers = target.substr(1);
    } else {
      numbers = target;
    }
  } else {
    numbers = target;
  }
  // 根据小数个数截取字符串，否则保留原数据
  return target.split(".")[1] && target.split(".")[1].length > limit
    ? (Math.floor(target * 100) / 100).toString()
    : numbers;
  // return val.replace(reg);
};
export default {
  components: {
    warningAlert,
    commonTable,
    switchTitlebar,
    moreMessage,
    footButton,
    addMore
  },
  props: {
    value: {
      type: Object,
      default() {
        return null;
      }
    }
  },
  computed: {
    target: {
      get() {
        return this.modalData.target;
      },
      set(val) {
        let value = getNumber(val, this.modalData.reward_type === 0 ? 2 : 2);
        // 需要修改值才会触发get更新（防止前后数字一样的情况不更新input）
        this.$set(this.modalData, "target", val);
        this.$nextTick(() => {
          this.$set(
            this.modalData,
            "target",
            // 根据小数个数截取字符串，否则保留原数据
            value
          );
        });
      }
    },
    reward: {
      get() {
        return this.modalData.reward;
      },
      set(val) {
        let value = getNumber(val, this.modalData.reward_type === 0 ? 2 : 2);
        // 需要修改值才会触发get更新（防止前后数字一样的情况不更新input）
        this.$set(this.modalData, "reward", val);
        this.$nextTick(() => {
          this.$set(
            this.modalData,
            "reward",
            // 根据小数个数截取字符串，否则保留原数据
            this.modalData.reward_type === 1 && value > 100 ? "100" : value
          );
        });
      }
    }
  },
  data() {
    return {
      saveLoading: false,
      performanceData: null,
      modalRuleStatus: false,
      modalLoading: true,
      showErrorTip: false,
      modalData: Object.assign({}, modalData),
      tableSelectIndex: null,
      ruleValidateModal: {
        target: [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              return callback();
            }
          }
        ]
      },
      columnsData: [
        {
          title: "经销商等级",
          align: "center",
          render: (h, params) => {
            return h("div", params.row.level_name);
          }
        },
        {
          title: "业绩目标",
          align: "center",
          render: (h, params) => {
            return h("div", "¥" + params.row.target);
          }
        },
        {
          title: "奖励金额/比例",
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              params.row.reward_type
                ? params.row.reward + "%"
                : "¥" + params.row.reward
            );
          }
        },
        {
          title: "操作",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  style: {
                    marginRight: "14px"
                  },
                  class: {
                    "table-operation": true
                  },
                  on: {
                    click: () => {
                      this.modalData = Object.assign(
                        {},
                        this.performanceData.rules[params.index],
                        {
                          target: Number(
                            this.performanceData.rules[params.index].target
                          ),
                          reward: Number(
                            this.performanceData.rules[params.index].reward
                          )
                        }
                      );
                      this.tableSelectIndex = params.index;
                      this.modalRuleStatus = true;
                      this.showErrorTip = false;
                    }
                  }
                },
                "编辑"
              ),
              h("span", { style: { marginRight: "14px" } }, "|"),
              h(
                "span",
                {
                  class: {
                    "table-operation": true
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: "提示",
                        content: "该规则已生效，是否确定删除？",
                        onOk: () => {
                          this.performanceData.rules.splice(params.index, 1);
                        }
                      });
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      dealerLevel: [],
      ruleValidatePerformance: {
        rules: [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (value.length) {
                return callback();
              } else {
                return callback("至少添加一条规则");
              }
            }
          }
        ]
      },
      errorTip: {},
      oldTarget: "",
      oldReward: ""
    };
  },
  created() {
    this.$store.state.COMMON_loading = true;
    Promise.all([this.getRewardPerformanceInfo(), this.getdealerLevelList()])
      .catch(e => {
        this.$Message.error(e);
      })
      .finally(() => {
        this.$store.state.COMMON_loading = false;
      });
  },
  methods: {
    /**
     * 获取经销商等级列表
     */
    getdealerLevelList() {
      this.$httpPost("/shop/admin/dealer/level/list", { get_all: 1 }, res => {
        this.$store.state.COMMON_loading = false;
        if (res.code === 200) {
          this.dealerLevel = res.data.list || [];
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    /**
     * 获取业绩奖设置数据
     */
    getRewardPerformanceInfo() {
      return new Promise((resolve, reject) => {
        this.$httpGet(
          "/shop/admin/dealer/performance/setting/info",
          null,
          res => {
            if (res.code === 200) {
              let data = res.data;
              resolve();
              this.performanceData = res.data;
            } else {
              reject(res.msg);
            }
          }
        );
      });
    },
    savePerformanceData() {
      if (!this.performanceData || !this.checkData()) {
        this.$Message.error("保存失败");
        return;
      }
      let data = Object.assign({}, this.performanceData);
      delete data.aftersale_isopen;
      this.saveLoading = true;
      this.$httpPost(
        "/shop/admin/dealer/performance/setting/save",
        data,
        res => {
          this.saveLoading = false;
          if (res.code === 200) {
            this.$Message.success("保存成功");
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    onAgentStatusChange(val) {
      if (!val) {
        this.$nextTick(() => {
          this.$set(this.performanceData, "enable", 1);
          this.$Modal.confirm({
            title: "提示",
            content:
              "若关闭了业绩奖功能，不会影响已经发放的业绩奖金；经销商下单业绩照常统计，但不会触发发放业绩奖金，是否确定关闭？",
            onOk: () => {
              this.$set(this.performanceData, "enable", 0);
              this.$refs["formValidatePerformance"].fields.forEach(el => {
                el.validateState = "";
              });
              this.errorTip = {};
            }
          });
        });
      }
    },
    /**
     * 弹窗选择类型改变
     */
    onRewardTypeChange() {
      // 保存旧数据用于下次切换时显示
      let oldTarget = this.target;
      let oldReward = this.reward;
      this.target = this.oldTarget;
      this.reward = this.oldReward;
      this.oldTarget = oldTarget;
      this.oldReward = oldReward;
    },
    /**
     * 添加新规则
     */
    onAddNewRuleClick() {
      this.tableSelectIndex = null;
      this.modalData = Object.assign({}, modalData);
      this.modalData.dealer_level = this.dealerLevel
        ? this.dealerLevel[0].id
        : 1;
      this.modalRuleStatus = true;
      this.showErrorTip = false;
    },
    /**
     * 状态改变还原验证
     */
    onVerifyModalChange(status) {
      if (status) {
        this.errorTip = {};
        this.oldTarget = "";
        this.oldReward = "";
      }
    },
    /**
     * 弹窗保存数据
     */
    onModalConfirmClick() {
      this.modalLoading = false;
      // 如果任意一个为空则报错
      this.errorTip = {
        target: !this.modalData.target,
        reward: !parseFloat(this.modalData.reward)
      };
      if (this.errorTip.target || this.errorTip.reward) {
        this.$nextTick(() => {
          this.modalLoading = true;
        });
        return;
      }
      // 如果存在相同规则则报错
      if (
        this.performanceData.rules.find(
          (item, index) =>
            this.tableSelectIndex !== index &&item.dealer_level === this.modalData.dealer_level &&
            Number(item.target) === Number(this.modalData.target)
        )
      ) {
        this.showErrorTip = true;
        this.$nextTick(() => {
          this.modalLoading = true;
        });
        return;
      } else {
        this.showErrorTip = false;
      }
      // 关闭弹窗
      this.$nextTick(() => {
        this.modalLoading = true;
      });
      this.modalRuleStatus = false;
      // 更新数据
      this.dealerLevel.forEach(el => {
        if (el.id == this.modalData.dealer_level) {
          this.modalData.level_name = el.name;
        }
      });
      let data = Object.assign({}, this.modalData, {
        target: Number(this.modalData.target).toFixed(2),
        reward: this.modalData.reward_type
          ? Number(this.modalData.reward)
          : Number(this.modalData.reward).toFixed(2)
      });
      if (this.tableSelectIndex !== null) {
        this.performanceData.rules.splice(this.tableSelectIndex, 1, data);
      } else {
        this.performanceData.rules.unshift(data);
      }
      this.$refs["formValidatePerformance"].fields.forEach(el => {
        el.validateState = "";
      });
      // 防止屏幕卡的时候多次点击生成数据了
      this.modalData = Object.assign({}, modalData);
    },
    /**
     * 检测数据
     */
    checkData() {
      let status = true;
      if (!this.performanceData.enable) {
        return status;
      }
      this.$refs["formValidatePerformance"].validate(valid => {
        status = valid;
      });
      return status;
    }
  }
};
</script>
<style lang="less" scoped>
.dealer-performance-award-modal {
  .common-input-text {
    width: 140px;
    margin-right: 5px;
    /deep/.ivu-select-selection {
      color: #333;
    }
  }
  /deep/.ivu-modal-close {
    .ivu-icon-ios-close {
      color: #000;
    }
  }
  /deep/.ivu-modal-header {
    padding: 13px 0 12px 16px;
    .ivu-modal-header-inner {
      font-size: 14px;
    }
  }
  /deep/.ivu-modal-body {
    padding: 25px 24px 42px;
    .ivu-form-item-label {
      padding: 9px 6px 10px 0;
      height: 32px;
      &::before {
        margin-right: 0;
      }
    }
    /deep/.ivu-form-item-label {
      padding-top: 12px !important;
      color: #657180;
    }
    .ivu-form-item-content {
      font-size: 0;
      & > span {
        & > span {
          padding-right: 5px;
          padding-left: 5px;
          font-size: 12px;
          vertical-align: middle;
          color: #657180;
        }
      }
      .ivu-radio-group {
        .ivu-radio-wrapper {
          margin-right: 20px;
          color: #657180;
          .ivu-radio {
            margin-right: 5px;
          }
        }
      }
      .ivu-input-wrapper {
        font-size: 12px;
        width: 78px;
        input {
          padding: 8px 7px;
          color: #657180;
        }
      }
    }
    .dealer-performance-award-modal-sigle {
      .ivu-input-wrapper {
        &:before {
          content: "%";
          left: auto;
          right: 6px;
        }
        input {
          padding: 0 22px 0 7px;
        }
      }
    }
    .dealer-performance-award-modal-tip {
      position: absolute;
      font-size: 12px;
      color: #f13500;
      top: 162px;
      left: 292px;
      &.dealer-performance-award-modal-tip-right {
        left: 428px;
      }
      &.dealer-performance-award-modal-left {
        left: 96px;
      }
    }
  }
}
.dealer-performance-award-table {
  .add-more-btn {
    /deep/.ivu-btn-primary {
      margin-bottom: 20px;
    }
  }
  /deep/.ivu-table-wrapper .ivu-table-default table tbody tr {
    height: 48px;
  }
}
.dealer-performance-award-content {
  padding: 24px;
  /*height: calc(100vh - 120px);*/
  overflow: auto;
  /deep/.ivu-alert-warning {
    margin-bottom: 24px;
  }
  /deep/.ivu-form-item {
    .ivu-form-item-label {
      color: #657180;
    }
    .ivu-form-item-content {
      .ivu-form-item-error-tip {
        margin-top: 4px;
      }
    }
  }
  .ivu-radio-group {
    .ivu-radio-wrapper {
      margin-right: 20px;
      color: #657180;
      /deep/.ivu-radio {
        margin-right: 5px;
      }
    }
  }
}
.footer {
  position: fixed;
  bottom: 10px;
  height: 50px;
  line-height: 50px;
  width: calc(100% - 260px);
  background-color: #fff;
  text-align: center;
  border-top: 1px solid #eee;
  z-index: 100;
  button {
    width: 70px;
    height: 32px;
  }
}
</style>
