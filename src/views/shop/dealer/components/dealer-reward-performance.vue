<template>
  <div
    class="dealer-reward-performance"
    style="padding-bottom: 50px"
    v-if="performanceData"
  >
    <div class="dealer-reward-performance-content">
      <warning-alert title="业绩奖说明：">
        <div>
          <p>
            1.经销商业绩是指经销商自购的云仓个人业绩，奖金计算方式：按固定金额即达到业绩后，奖金按固定金额发放；按比例即达到业绩后，奖金按实际业绩*比例发放。
          </p>
          <p>
            2.奖励规则：首先判断匹配到了哪些规则，然后从匹配到的规则中取出满足条件最高的规则，按这个规则发放奖励，只发一次。
          </p>
          <p>
            3.当触发到发放周期，系统自动完成周期内的业绩结算，通过审核后将奖金发放到经销商的资金池；当确定了发放周期后，不要随意更改，以免造成经济损失。
          </p>
        </div>
      </warning-alert>
      <Form :label-width="140">
        <switch-titlebar
          style="margin-bottom: 24px;"
          v-model="performanceData.enable"
          title="是否开启业绩奖功能"
          @on-change="onAgentStatusChange"
        />
        <FormItem label="奖金支付：" v-show="performanceData.enable">
          <div>
            <span>上级领导支付</span
            ><more-message
              :maxWidth="350"
              style="margin-left: 10px;"
              :text="'即当上级领导是公司时，则由公司支付奖金；\n当是经销商时，则由经销商支付奖金。'"
            ></more-message>
          </div>
        </FormItem>
        <FormItem label="发放对象：" v-show="performanceData.enable">
          <RadioGroup v-model="performanceData.payee">
            <Radio :label="0">所有经销商</Radio>
            <Radio :label="1">直接对接公司的经销商</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="公司审核：" v-show="performanceData.enable">
          <RadioGroup v-model="performanceData.auto_check">
            <Radio :label="1">自动审核通过</Radio>
            <Radio :label="0">手动审核</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="发放周期：" v-show="performanceData.enable">
          <RadioGroup v-model="performanceData.give_period">
            <Radio :label="0">按月度结算发放</Radio>
            <Radio :label="1">按季度结算发放</Radio>
            <Radio :label="2">按年度结算发放</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="奖励规则：" v-show="performanceData.enable">
          <div style="width: 700px;" class="dealer-reward-table">
            <add-more
              text="添加规则"
              @onAddMoreClick="onAddNewRuleClick"
            ></add-more>
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
      :width="604"
      @on-visible-change="onVerifyModalChange"
      @on-ok="onModalConfirmClick"
      class="dealer-reward-performance-modal"
    >
      <Form :label-width="72" :model="modalData" :rules="ruleValidateModal">
        <FormItem label="奖励方式：">
          <RadioGroup
            v-model="modalData.reward_type"
            @on-change="onRewardTypeChange"
          >
            <Radio :label="0">固定金额</Radio>
            <Radio :label="1">比例</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label=" 规则：" prop="target">
          <Select
            v-model="modalData.dealer_level"
            class="common-input-text-120"
            transfer-class-name="common-input-select-transfer"
            transfer
            :class="{ 'ivu-form-item-error': errorTip.level }"
          >
            <Option
              v-for="item in dealerLevelList"
              :value="item.id"
              :key="item.id"
              >{{ item.name }}</Option
            >
          </Select>
          <span :class="{ 'ivu-form-item-error': errorTip.target }">
            <span>业绩达</span>
            <Input v-model="target" class="common-input-text-120" />
          </span>
          <span
            :class="{
              'ivu-form-item-error': errorTip.reward,
              'dealer-reward-performance-modal-sigle':
                modalData.reward_type === 1
            }"
          >
            <span>奖励</span>
            <Input v-model="reward" class="common-input-text-120" />
          </span>
        </FormItem>
      </Form>
      <span class="dealer-reward-performance-modal-tip" v-show="errorTip.target"
        >请输入规则内容</span
      >
      <span
        class="dealer-reward-performance-modal-tip dealer-reward-performance-modal-tip-right"
        v-show="errorTip.reward"
        >请输入规则内容</span
      >
    </Modal>
    <div class="footer">
      <Button
        type="primary"
        shape="circle"
        @click="savePerformanceData"
        :loading="saveLoading"
        perm="dealer.config.operate"
        >保存</Button
      >
    </div>
  </div>
</template>
<script>
import warningAlert from "@/views/shop/components/alert/alert-warning";
import addMore from "@/views/shop/components/button/add-more.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
const modalData = {
  dealer_level: 1,
  target: "",
  reward_type: 0,
  reward: ""
};
const getNumber = (val, limit) => {
  // 保留的位数
  let value = limit
    ? val.replace(/[^0-9.]+/g, "").replace(/^\.+/, "")
    : val.replace(/[^0-9]+/g, "");
  let point = value.match(/\./g);
  // 得到纯数字的值
  let target =
    value && point && point.length > 1
      ? value.split(/\./)[0] + "." + value.split(/\./)[1]
      : value;

  // 根据小数个数截取字符串，否则保留原数据
  return target.split(".")[1] && target.split(".")[1].length > limit
    ? (
        Math.floor(target * Math.pow(10, limit)) / Math.pow(10, limit)
      ).toString()
    : target;
};
export default {
  components: {
    warningAlert,
    commonTable,
    switchTitlebar,
    moreMessage,
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
        let value = getNumber(val, 2);
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
        let value = getNumber(val, this.modalData.reward_type === 0 ? 2 : 3);
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
      dealerLevelObj: {},
      dealerLevelList: [],
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
          title: "代理等级",
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              this.dealerLevelObj[params.row.dealer_level]
                ? this.dealerLevelObj[params.row.dealer_level].name
                : ""
            );
          }
        },
        {
          title: "团队业绩目标",
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
                    }
                  }
                },
                "编辑"
              ),
              h(
                "span",
                {
                  style: {
                    color: "#3352D9",
                    margin: "0 10px"
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
      agentList: [],
      errorTip: {},
      oldTarget: "",
      oldReward: ""
    };
  },
  created() {
    this.$store.state.COMMON_loading = true;
    Promise.all([this.getRewardPerformanceInfo(), this.getDealerLevelList()])
      .catch(e => {
        this.$Message.error(e);
      })
      .finally(() => {
        this.$store.state.COMMON_loading = false;
      });
  },
  methods: {
    /**
     * 获取经销商等级
     */
    getDealerLevelList() {
      return new Promise((resolve, reject) => {
        this.$httpPost("/shop/admin/dealer/level/list", { is_hide: 0 }, res => {
          if (res.code === 200) {
            resolve();
            let list = res.data.list || [];
            let obj = {};
            list.forEach(n => (obj[n.id] = n));
            this.dealerLevelObj = obj;
            this.dealerLevelList = list;
          } else {
            reject(res.msg);
          }
        });
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
      if (!this.performanceData) {
        this.$Message.error("保存失败");
        return;
      }
      this.saveLoading = true;
      this.$httpPost(
        "/shop/admin/dealer/performance/setting/save",
        this.performanceData,
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
      this.modalRuleStatus = true;
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
        level: !this.modalData.dealer_level,
        target: !this.modalData.target,
        reward: !parseFloat(this.modalData.reward)
      };
      if (this.errorTip.level || this.errorTip.target || this.errorTip.reward) {
        this.$nextTick(() => {
          this.modalLoading = true;
        });
        return;
      }
      // 如果存在相同规则则报错
      if (
        this.performanceData.rules.find(
          (item, index) =>
            this.tableSelectIndex !== index &&
            item.dealer_level === this.modalData.dealer_level &&
            Number(item.target) === Number(this.modalData.target)
        )
      ) {
        this.$Message.error("已存在相同的规则，请重新设置");
        this.$nextTick(() => {
          this.modalLoading = true;
        });
        return;
      }
      // 关闭弹窗
      this.$nextTick(() => {
        this.modalLoading = true;
      });
      this.modalRuleStatus = false;
      // 更新数据
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
      // 防止屏幕卡的时候多次点击生成数据了
      this.modalData = Object.assign({}, modalData);
    }
  }
};
</script>
<style lang="less" scoped>
.dealer-reward-performance {
  /deep/.ivu-radio-wrapper {
    margin-right: 20px;
  }
}
.dealer-reward-performance-modal {
  /deep/.ivu-modal-body {
    padding: 20px 24px 30px;
    .ivu-form-item-label {
      padding: 9px 6px 10px 0;
      height: 32px;
    }
    .ivu-form-item-content {
      font-size: 0;
      & > span {
        & > span {
          padding: 0 10px 0 12px;
          font-size: 13px;
          vertical-align: middle;
        }
      }
      .ivu-radio-group {
        font-size: 0;
        .ivu-radio-group-item {
          margin-right: 26px;
        }
      }
      .ivu-input-wrapper {
        font-size: 13px;
        &:before {
          content: "￥";
          display: block;
          position: absolute;
          left: 6px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1;
        }
        input {
          padding: 0 7px 0 22px;
        }
      }
    }
    .dealer-reward-performance-modal-sigle {
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
    .dealer-reward-performance-modal-tip {
      position: absolute;
      font-size: 12px;
      color: #f13500;
      top: 160px;
      left: 278px;
      &.dealer-reward-performance-modal-tip-right {
        left: 446px;
      }
    }
  }
}
.dealer-reward-table {
  .add-more-btn {
    /deep/.ivu-btn-primary {
      margin-bottom: 16px;
    }
  }
  /deep/.ivu-table-wrapper .ivu-table-default table tbody tr {
    height: 48px;
  }
}
.dealer-reward-performance-content {
  padding: 24px;
  /*height: calc(100vh - 120px);*/
  overflow: auto;
  /deep/.ivu-alert-warning {
    margin-bottom: 24px;
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
