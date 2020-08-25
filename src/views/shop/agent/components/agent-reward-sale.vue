<template>
  <div class="agent-reward-sale" v-if="saleData">
    <div class="agent-reward-sale-content">
      <warning-alert>
        <div>
          <p>1.关系绑定说明：A→B，A是B的推荐人。如果A是代理，当B成为代理时，A就是B的代理推荐人；如果A不是代理，当B成为代理时，B就没有代理推荐人；如果A还不是代理，当B成为代理时后，A才发展成为代理，这时A重新成为B的代理推荐人。</p>
          <p>2.平级销售奖：A→B，A是B的代理推荐人。当A和B的代理级别一样；当B或者B的下级会员下单时，A都能拿到平级销售奖。</p>
          <p>3.越级销售奖：A→B，A是B的代理推荐人。当B的代理级别大于A；当B或者B的下级会员下单时，A都能拿到越级销售奖。</p>
        </div>
      </warning-alert>
      <Form ref="formValidateSale" :label-width="140" :model="saleData" :rules="ruleValidateSale">
        <switch-titlebar
          style="margin-bottom: 20px;"
          v-model="saleData.enable"
          title="是否开启销售奖功能"
          :tipShow="!saleData.baseSetting && saleData.enable"
          tipText="请前往【代理设置>基础设置】开启团队分红功能后，销售奖功能才生效。"
          @on-change="onAgentStatusChange"
        />
        <FormItem label="返佣计算基准：" v-show="saleData.enable">
          <RadioGroup v-model="saleData.commision_type">
            <Radio :label="0">按商品利润计算</Radio>
            <Radio :label="1">按商品实付销售价计算</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="返佣代理关系：" v-show="saleData.enable">
          <RadioGroup v-model="saleData.commision_relations">
            <Radio :label="0" style="margin-right:10px;">只分直推的平级/越级代理商</Radio>
            <more-message style="margin-right:20px;" text="例如1：二级A-->二级B-->购买者C，当C购买时，只有B直推的A可以获取平级/越级销售奖；<br>例如2：二级D-->普通会员E-->二级F-->购买者G，当G购买时，F间推的D不可以获取平级/越级销售奖"></more-message>
            <Radio :label="1" style="margin-right:10px;">分给最近（包括直推/间推）的平级/越级代理商</Radio>
            <more-message text="例如1：二级A-->二级B-->购买者C，当C购买时，B直推的A可以获取平级/越级销售奖；<br>例如2：二级D-->普通会员E-->二级F-->购买者G，当G购买时，F间推的D也可以获取平级/越级销售奖"></more-message>
          </RadioGroup>
        </FormItem>
        <FormItem label="返佣代理人数：" v-show="saleData.enable">
          <RadioGroup v-model="saleData.commision_people_num">
            <Radio :label="0" style="margin-right:10px;">只分一个平级/越级代理商</Radio>
            <more-message style="margin-right:20px;" text="例如：一级A-->一级B-->二级C-->二级D-->三级E--三级F--购买者G，当G购买时，只有F直推的E可以获取平级/越级销售奖，代理C、A不能获取销售奖"></more-message>
            <Radio :label="1" style="margin-right:10px;">最多分三个平级/越级代理商</Radio>
            <more-message text="例如：一级A-->一级B-->二级C-->二级D-->三级E--三级F--购买者G，当G购买时，代理E、C、A都可以获取平级/越级销售奖"></more-message>
          </RadioGroup>
        </FormItem>
        <FormItem label="返佣比例设置：" prop="commision[1]" v-show="saleData.enable">
          <div class="agent-reward-sale-scale">
            <span>一级平级销售奖返佣比例</span>
            <InputNumber
              :max="100"
              :min="0"
              :step="1"
              :precision="1"
              v-model="saleData.commision[1]"
              class="common-input-text-160"
              placeholder="请输入返佣比例"
            />
            <span>%</span>
            <more-message text="请输入正数，只保留一位小数，值为0代表不分佣。"></more-message>
          </div>
        </FormItem>
        <FormItem prop="commision[2]" v-show="saleData.enable">
          <div class="agent-reward-sale-scale">
            <span>二级平级销售奖返佣比例</span>
            <InputNumber
              :max="100"
              :min="0"
              :step="1"
              :precision="1"
              v-model="saleData.commision[2]"
              class="common-input-text-160"
              placeholder="请输入返佣比例"
            />
            <span>%</span>
          </div>
        </FormItem>
        <FormItem prop="commision[3]" v-show="saleData.enable">
          <div class="agent-reward-sale-scale">
            <span>三级平级销售奖返佣比例</span>
            <InputNumber
              :max="100"
              :min="0"
              :step="1"
              :precision="1"
              v-model="saleData.commision[3]"
              class="common-input-text-160"
              placeholder="请输入返佣比例"
            />
            <span>%</span>
          </div>
        </FormItem>
        <FormItem prop="lowcommision" v-show="saleData.enable">
          <div class="agent-reward-sale-scale">
            <span>越级销售奖返佣比例</span>
            <InputNumber
              :max="100"
              :min="0"
              :step="1"
              :precision="1"
              v-model="saleData.lowcommision"
              class="common-input-text-160"
              placeholder="请输入返佣比例"
            />
            <span>%</span>
          </div>
        </FormItem>
      </Form>
    </div>
    <!-- <foot-button
      @onSaveClick="saveSaleData"
      :loading="saveLoading"
      perm="agent.config.operate"
    ></foot-button> -->
    <div class="footer">
      <Button type="primary" shape="circle" @click="saveSaleData" :loading="saveLoading" perm="agent.config.operate">保存</Button>
    </div>
  </div>
</template>
<script>
import warningAlert from "@/views/shop/components/alert/alert-warning";
import footButton from "@/views/shop/components/button/foot-button.vue";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
export default {
  components: {
    warningAlert,
    moreMessage,
    switchTitlebar,
      footButton
  },
  props: {
    value: {
      type: Object,
      default() {
        return null;
      }
    }
  },
  data() {
    return {
      saveLoading: false,
      saleData: null,
      ruleValidateSale: {
        "commision[1]": [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (value !== null) {
                return callback();
              }
              return callback(new Error("请输入返佣比例"));
            }
          }
        ],
        "commision[2]": [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (value !== null) {
                return callback();
              }
              return callback(new Error("请输入返佣比例"));
            }
          }
        ],
        "commision[3]": [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (value !== null) {
                return callback();
              }
              return callback(new Error("请输入返佣比例"));
            }
          }
        ],
        lowcommision: [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (value !== null) {
                return callback();
              }
              return callback(new Error("请输入返佣比例"));
            }
          }
        ]
      }
    };
  },
  created() {
    this.$store.state.COMMON_loading = true;
    Promise.all([this.getRewardSaleInfo()])
      .catch(e => {
        this.$Message.error(e);
      })
      .finally(() => {
        this.$store.state.COMMON_loading = false;
      });
  },
  methods: {
    /**
     * 获取销售奖设置数据
     */
    getRewardSaleInfo() {
      return new Promise((resolve, reject) => {
        this.$httpGet("/shop/admin/agent/salerewardsetting/info", null, res => {
          if (res.code === 200) {
            let data = res.data;
            if (!data.commision) {
              data.commision = {
                "1": null,
                "2": null,
                "3": null
              };
            }
            resolve();
            this.saleData = res.data;
          } else {
            reject(res.msg);
          }
        });
      });
    },
    saveSaleData() {
      if (!this.saleData || !this.checkData()) {
        this.$Message.error("保存失败");
        return;
      }
      this.saveLoading = true;
      this.$httpPost(
        "/shop/admin/agent/salerewardsetting/edit",
        this.saleData,
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
          this.$set(this.saleData, "enable", 1);
          this.$Modal.confirm({
            title: "提示",
            content:
              "若关闭了代理的销售奖功能，不会影响已经产生的订单销售返佣奖，会员下单将不会产生新的销售返佣奖，是否确定关闭？",
            onOk: () => {
              this.$set(this.saleData, "enable", 0);
              this.$refs["formValidateSale"].fields.forEach(el => {
                el.validateState = "";
              });
            }
          });
        });
      }
    },
    checkData() {
      let status = true;
      if (!this.saleData.enable) {
        return status;
      }
      this.$refs["formValidateSale"].validate(valid => {
        status = valid;
      });
      return status;
    }
  }
};
</script>
<style lang="less" scoped>
.agent-reward-sale {
  .agent-reward-sale-content {
    padding: 24px;
    height: calc(100vh - 120px);
    overflow: auto;
    /deep/.ivu-alert-warning {
      margin-bottom: 24px;
    }
  }
  /deep/.agent-reward-sale-scale {
    font-size: 0;
    & > span {
      font-size: 13px;
      vertical-align: middle;
      margin-right: 10px;
      &:first-child {
        display: inline-block;
        width: 145px;
        text-align: right;
      }
      & ~ span {
        margin-left: 10px;
      }
    }
    & + .ivu-form-item-error-tip {
      left: 155px;
    }

    .more-message {
      line-height: 30px;
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
