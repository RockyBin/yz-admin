<template>
  <div class="agent-setting-base" v-if="baseData">
    <Form ref="formValidateBase" :label-width="140" :model="baseData" :rules="ruleValidateBase">
      <switch-titlebar
        style="margin: 0 0 20px;"
        v-model="enable"
        :true-value="true"
        :false-value="false"
        title="是否开启代理功能"
        @on-change="onAgentStatusChange"
      />
      <FormItem label="启用代理等级：" v-show="enable" prop="level" class="agent-setting-base-level">
        <CheckboxGroup v-model="agentLevel">
          <Checkbox :label="1">1级代理</Checkbox>
          <Checkbox :label="2">2级代理</Checkbox>
          <Checkbox :label="3">3级代理</Checkbox>
        </CheckboxGroup>
        <div class="agent-setting-tip">
          *当启用的代理等级发生变化，对应可以获取分红的代理商等级也跟着增加/减少，一级代理为最高代理级别。
          <br />例如：开启了2级代理，可以参与分红的等级只有一级代理和二级代理，三级代理还是存在系统中，但不参与分红。
        </div>
      </FormItem>
      <FormItem label="是否收取加盟费：" v-show="enable">
        <RadioGroup v-model="baseData.need_initial_fee">
          <Radio :label="1">是</Radio>
          <Radio :label="0">否</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="分红模式：" v-show="enable">
        <RadioGroup v-model="baseData.bonus_mode" @on-change="onAgentBonusModeChange">
          <Radio :label="0">固定分红</Radio>
          <more-message
            :maxWidth="374"
            style="margin-right: 20px;margin-left: -10px;"
            :text="'固定分红：代理订单分红规则为每个代理获取的分红是固定不变的。如：设置一级10%，二级7%，三级5%，则一级代理固定拿10%，\n二级代理固定拿7%，三级代理固定拿5%'"
          ></more-message>
          <Radio :label="1">逐级分红</Radio>
          <more-message
            :maxWidth="370"
            style="margin-left: -10px;"
            :text="'逐级分红：下级代理的分红比例不能超过上级的设置的分红比例，代理订单分红规则为逐级分红。\n如：设置一级10%，二级7%，三级5%，当有二级代理时，一级代理只能拿3%；当有三级代理时，二级只能拿2%，三级拿5%'"
          ></more-message>
        </RadioGroup>
      </FormItem>

      <FormItem class="inline-form-item" label="等级分红比例：" prop="commision[1]" v-show="enable">
        <div
          class="agent-setting-base-scale"
          :class="{'ivu-form-item-error': graduallyErrorIndex.includes(1)}"
        >
          <!-- <more-message style="margin-right: 12px;" text="请输入正数，只保留一位小数，值为0则为不分"></more-message> -->
          <span>一级代理</span>
          <InputNumber
            :max="100"
            :min="0"
            :step="1"
            :precision="3"
            v-model="baseData.commision[1]"
            class="common-input-text-120"
            placeholder="请输入分红比例"
          />
          <span>%</span>
        </div>
        <div class="agent-setting-tip" style="height: 5px;"></div>
        <!--<div-->
          <!--class="agent-setting-tip"-->
          <!--style="margin-left: 62px;"-->
        <!--&gt;{{baseData.bonus_mode ? "*分给一级代理的分红比例，这个比例包含二级代理比例" : "*分给一级代理的固定分红比例"}}</div>-->
      </FormItem>
      <FormItem
        class="inline-form-item-2"
        prop="initial_fee[1]"
        v-show="enable && baseData.need_initial_fee"
      >
        <div class="agent-setting-base-scale">
          <span>加盟费</span>
          <InputNumber
            :max="9999999"
            :min="0"
            :step="1"
            :precision="2"
            v-model="baseData.initial_fee[1]"
            class="common-input-text-120"
            placeholder="请输入加盟费"
          />
          <span>元</span>
        </div>
        <div class="agent-setting-tip" style="height: 5px;"></div>
      </FormItem>
      <div v-show="enable"
              class="agent-setting-tip agent-setting-tis"
      >{{baseData.bonus_mode ? "*分给一级代理的分红比例，这个比例包含二级代理比例" : "*分给一级代理的固定分红比例"}}</div>
      <div style="height:1px"></div>
      <FormItem class="inline-form-item" prop="commision[2]" v-show="enable">
        <div
          class="agent-setting-base-scale"
          :class="{'ivu-form-item-error': graduallyErrorIndex.includes(2)}"
        >
          <!-- <more-message style="margin-right: 12px;opacity:0;" text></more-message> -->
          <span>二级代理</span>
          <InputNumber
            :max="100"
            :min="0"
            :step="1"
            :precision="3"
            v-model="baseData.commision[2]"
            class="common-input-text-120"
            placeholder="请输入分红比例"
          />
          <span>%</span>
        </div>
        <div class="agent-setting-tip" style="height: 5px;"></div>
        <!--<div-->
          <!--class="agent-setting-tip"-->
          <!--style="margin-left: 62px;"-->
        <!--&gt;{{baseData.bonus_mode ? "*分给二级代理的分红比例，这个比例包含三级分红比例" : "*分给二级代理的固定分红比例"}}</div>-->
      </FormItem>
      <FormItem
        class="inline-form-item-2"
        prop="initial_fee[2]"
        v-show="enable && baseData.need_initial_fee"
      >
        <div class="agent-setting-base-scale">
          <span>加盟费</span>
          <InputNumber
            :max="9999999"
            :min="0"
            :step="1"
            :precision="2"
            v-model="baseData.initial_fee[2]"
            class="common-input-text-120"
            placeholder="请输入加盟费"
          />
          <span>元</span>
        </div>
        <div class="agent-setting-tip" style="height: 5px;"></div>
      </FormItem>
      <div v-show="enable"
              class="agent-setting-tip agent-setting-tis"
      >{{baseData.bonus_mode ? "*分给二级代理的分红比例，这个比例包含三级代理比例" : "*分给二级代理的固定分红比例"}}</div>
      <div style="height:1px"></div>
      <FormItem class="inline-form-item" prop="commision[3]" v-show="enable">
        <div class="agent-setting-base-scale">
          <!-- <more-message style="margin-right: 12px;opacity:0;" text></more-message> -->
          <span>三级代理</span>
          <InputNumber
            :max="100"
            :min="0"
            :step="1"
            :precision="3"
            v-model="baseData.commision[3]"
            class="common-input-text-120"
            placeholder="请输入分红比例"
          />
          <span>%</span>
        </div>
        <div class="agent-setting-tip" style="height: 5px;"></div>
        <!--<div class="agent-setting-tip" style="margin-left: 62px;">*分给三级代理的分红比例</div>-->
        <div
          style="margin-left: 0;margin-top: 20px;"
          v-show="graduallyErrorIndex.length"
          class="ivu-form-item-error-tip"
        >请输入正确的规则：一级代理 > 二级代理 > 三级代理</div>
      </FormItem>
      <FormItem
        class="inline-form-item-2"
        prop="initial_fee[3]"
        v-show="enable && baseData.need_initial_fee"
      >
        <div class="agent-setting-base-scale">
          <span>加盟费</span>
          <InputNumber
            :max="9999999"
            :min="0"
            :step="1"
            :precision="2"
            v-model="baseData.initial_fee[3]"
            class="common-input-text-120"
            placeholder="请输入加盟费"
          />
          <span>元</span>
        </div>
        <div class="agent-setting-tip" style="height: 5px;"></div>
      </FormItem>
      <div v-show="enable" class="agent-setting-tip agent-setting-tis">{{baseData.bonus_mode ? "*分给三级代理的分红比例" : "*分给三级代理的固定分红比例"}}</div>
      <FormItem label="分红发放节点：" v-show="enable" style="margin-top: 20px !important;">
        <more-message
          style="margin-right: 12px;"
          text="付款后，则<订单分红/销售奖返佣>的节点为订单成功付款后发放，维权期后则过了维权期才发放。"
        ></more-message>
        <RadioGroup v-model="baseData.commision_grant_time" @on-change="onCountPeriodChange">
          <Radio :label="0">付款后</Radio>
          <Radio :label="1">维权期后</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="分红计算基准：" v-show="enable">
        <RadioGroup v-model="baseData.commision_type">
          <Radio :label="0">按商品利润计算</Radio>
          <Radio :label="1">按商品实付销售价计算</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="代理分红内购：" v-show="enable">
        <more-message
          style="margin-right: 12px;"
          text="开启分红内购，代理商自己购买商品，享受分红。"
        ></more-message>
        <RadioGroup v-model="baseData.internal_purchase">
          <Radio :label="1">开启</Radio>
          <Radio :label="0">关闭</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="自购业绩：" v-show="enable">
        <RadioGroup v-model="baseData.internal_purchase_performance">
          <Radio :label="1">计算到代理订单业绩</Radio>
          <Radio :label="0">不计算到代理订单业绩</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="同时获取分销佣金：" v-show="enable && hasLicensePerm('ENABLE_DISTRIBUTION')">
        <more-message
          style="margin-right: 12px;"
          text="当代理同时也是分销商身份，允许时，既拿代理分红，又拿分销佣金；不允许时，只拿代理分红，不拿分销佣金。"
        ></more-message>
        <RadioGroup v-model="baseData.get_distribution_commision">
          <Radio :label="1">允许</Radio>
          <Radio :label="0">不允许</Radio>
        </RadioGroup>
      </FormItem>
    </Form>
    <!-- <foot-button
      @onSaveClick="saveBaseData"
      :loading="saveLoading"
      perm="agent.config.operate"
    ></foot-button> -->
    <div class="footer">
      <Button
        type="primary"
        shape="circle"
        @click="saveBaseData"
        :loading="saveLoading"
        perm="agent.config.operate"
      >保存</Button>
    </div>
  </div>
</template>
<script>
import footButton from "@/views/shop/components/button/foot-button.vue";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
export default {
  components: {
    footButton,
    moreMessage,
    switchTitlebar
  },
  computed: {
    enable: {
      set: (() => {
        let lastSelect = 3;
        return function(val) {
          if (val) {
            this.$set(this.baseData, "level", lastSelect);
          } else {
            lastSelect =
              this.baseData.level > 0 ? this.baseData.level : lastSelect;
            this.$set(this.baseData, "level", 0);
          }
        };
      })(),
      get() {
        return this.baseData.level !== 0;
      }
    },
    agentLevel: {
      set(val) {
        let level = -1;
        // 查找最近的值（中间不允许没选的）
        [1, 2, 3].every(item => {
          let status = val.includes(item);
          if (status) {
            level = item;
          }
          return status;
        });
        // 如果和原来的值一样（这种是因为选上二三级而前面没有选上的情况），则应该为最大值（因为每一次值都会改变）
        if (this.baseData.level === level) {
          level = Math.max(-1, ...val);
        }
        this.$set(this.baseData, "level", level);
      },
      get() {
        return new Array(this.baseData.level === -1 ? 0 : this.baseData.level)
          .fill(null)
          .map((item, index) => index + 1);
      }
    }
  },
  data() {
    return {
      saveLoading: false,
      baseData: null,
      graduallyErrorIndex: [], // 标识逐级分红不符合要求的代理等级分红
      ruleValidateBase: {
        level: [
          {
            trigger: "change",
            validator: (rule, value, callback) => {
              if (value !== -1) {
                return callback();
              }
              return callback(new Error("请选择启用的代理等级"));
            }
          }
        ],
        "commision[1]": [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              this.checkGraduallyData();
              if (value !== null) {
                return callback();
              }
              return callback(new Error("请输入分红比例"));
            }
          }
        ],
        "commision[2]": [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              this.checkGraduallyData();
              if (value !== null) {
                return callback();
              }
              return callback(new Error("请输入分红比例"));
            }
          }
        ],
        "commision[3]": [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              this.checkGraduallyData();
              if (value !== null) {
                return callback();
              }
              return callback(new Error("请输入分红比例"));
            }
          }
        ],
        "initial_fee[1]": [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (value !== null || !this.baseData.need_initial_fee) {
                return callback();
              }
              return callback(new Error("请输入加盟费"));
            }
          }
        ],
        "initial_fee[2]": [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (value !== null || !this.baseData.need_initial_fee) {
                return callback();
              }
              return callback(new Error("请输入加盟费"));
            }
          }
        ],
        "initial_fee[3]": [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (value !== null || !this.baseData.need_initial_fee) {
                return callback();
              }
              return callback(new Error("请输入加盟费"));
            }
          }
        ]
      }
    };
  },
  created() {
    this.$store.state.COMMON_loading = true;
    Promise.all([this.getBaseData()])
      .catch(e => {
        this.$Message.error(e);
      })
      .finally(() => {
        this.$store.state.COMMON_loading = false;
      });
  },
  methods: {
    /**
     * 检测逐级分红比例不符合要求的情况
     */
    checkGraduallyData() {
      this.graduallyErrorIndex = [];
      if (this.baseData.bonus_mode) {
        let value = Object.values(this.baseData.commision);
        // 检测是否有空值
        let status = value.findIndex(n => n === null) > -1;
        if (status) {
          return;
        }
        // 返回不符合要求的位置(如果三级为0则不参与逐级，二级任何值都可以，即三级不为0才需要判断二级是否符合逐级的条件，下同)
        if (
          this.baseData.commision[3] &&
          this.baseData.commision[2] <= this.baseData.commision[3]
        ) {
          this.graduallyErrorIndex.push(2);
        }
        if (
          (this.baseData.commision[3] &&
            this.baseData.commision[1] <= this.baseData.commision[3]) ||
          (this.baseData.commision[2] &&
            this.baseData.commision[1] <= this.baseData.commision[2])
        ) {
          this.graduallyErrorIndex.push(1);
        }
      }
    },
    /**
     * 获取基础数据
     */
    getBaseData() {
      return new Promise((resolve, reject) => {
        this.$httpGet("/shop/admin/agent/basesetting/info", null, res => {
          if (res.code === 200) {
            let data = res.data;
            if (!data.commision) {
              data.commision = {
                "1": null,
                "2": null,
                "3": null
              };
            }
            if (!data.initial_fee) {
              data.initial_fee = {
                "1": null,
                "2": null,
                "3": null
              };
            }
            resolve();
            this.baseData = res.data;
            console.log(res.data)
            this.$set(
              this.baseData,
              "need_initial_fee",
              (res.data && res.data.need_initial_fee) || 0
            );
          } else {
            reject(res.msg);
          }
        });
      });
    },
    /**
     * 保存基础数据
     */
    saveBaseData() {
      if (!this.baseData || !this.checkData()) {
        this.$Message.error("保存失败");
        return;
      }
      let data = Object.assign({}, this.baseData);
      delete data.aftersale_isopen;
      this.saveLoading = true;
      this.$httpPost("/shop/admin/agent/basesetting/edit", data, res => {
        this.saveLoading = false;
        if (res.code === 200) {
          this.$Message.success("保存成功");
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    onCountPeriodChange(val) {
      if (!this.baseData.aftersale_isopen && val === 1) {
        this.$Modal.confirm({
          title: "提示",
          okText: "前往设置",
          content:
            "前往【订单设置>售后设置】开启售后功能并设置维权期，即可使用维权期后的功能",
          onOk: () => {
            this.$router.push("/setting/mall/order");
          }
        });
        this.$nextTick(() => {
          this.$set(this.baseData, "commision_grant_time", 0);
        });
      }
    },
    onAgentStatusChange(val) {
      if (!val) {
        this.$nextTick(() => {
          this.enable = true;
          this.enableAgent = true;
          this.$Modal.confirm({
            title: "提示",
            content:
              "若关闭了代理分红功能，不影响历史订单分红、销售奖、推荐奖、业绩奖；但不会再产生新的相关分红；数据仍然保留；代理不能访问<代理中心>页面，是否确定关闭？",
            onOk: () => {
              this.enable = false;
              this.$refs["formValidateBase"].fields.forEach(el => {
                el.validateState = "";
              });
            }
          });
        });
      }
    },
    onAgentBonusModeChange(val) {
      this.$nextTick(() => {
        this.$set(this.baseData, "bonus_mode", val === 1 ? 0 : 1);
        this.$Modal.confirm({
          title: "提示",
          content:
            "切换分红模式时，将会清空商品已设置好的单品代理分红金额/比例，请谨慎设置！是否确定要切换？",
          onOk: () => {
            this.$set(this.baseData, "bonus_mode", val);
          }
        });
      });
    },
    checkData() {
      let status = true;
      // 不开启不需要验证数据
      if (!this.enable) {
        return status;
      }
      this.$refs["formValidateBase"].validate(valid => {
        status = valid;
      });
      if (this.baseData.bonus_mode && this.graduallyErrorIndex.length) {
        status = false;
      }
      return status;
    }
  }
};
</script>
<style lang="less" scoped>
.agent-setting-base {
  .agent-setting-tip {
    position: relative;
    /*width: 20px;*/
    line-height: 18px;
    font-size: 12px;
    color: #9ea4b1;
    white-space: nowrap;
  }
  .agent-setting-tis{
    margin-top: 5px;
    margin-left: 5px;
    display: inline-block;
  }
  /deep/.ivu-form {
    padding: 24px;
    height: calc(100vh - 120px);
    overflow: auto;

    .inline-form-item {
      display: inline-block;
      .ivu-form-item-error-tip {
        margin-left: 62px;
        top: unset;
        padding-top: 6px;
      }
      .agent-setting-tip {
        margin-bottom: -8px;
      }
    }

    .inline-form-item-2 {
      display: inline-block;

      .ivu-form-item-content {
        margin-left: 10px !important;
      }
      .agent-setting-tip {
        margin-bottom: -4px;
      }
      .ivu-form-item-error-tip {
        margin-left: 49px;
        top: unset;
        padding-top: 2px;
      }
    }
  }
  /deep/.agent-setting-base-level {
    .ivu-form-item-error-tip {
      top: 0;
      line-height: 32px;
      padding-top: 0;
      left: 236px;
    }
    .ivu-checkbox-group {
      font-size: 0;
      height: 32px;
    }
  }
  /deep/.agent-setting-base-scale {
    font-size: 0;
    & > span {
      font-size: 13px;
      vertical-align: middle;
      margin-right: 10px;
      & ~ span {
        margin-left: 10px;
      }
    }

    & + .ivu-form-item-error-tip {
      left: 62px;
    }

    .more-message {
      line-height: 30px;
    }
  }
  /deep/.ivu-form {
    .ivu-form-item-content {
      font-size: 0;
    }
    .ivu-form-error-tip {
      margin-left: 100px;
    }
    .common-input-text-120 {
      width: 120px;
      height: 32px;
    }
  }
  .footer {
    height: 50px;
    line-height: 50px;
    text-align: center;
    border-top: 1px solid #eee;
    button {
      width: 70px;
      height: 32px;
    }
  }
}
</style>
