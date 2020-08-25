<template>
  <div class="product-detail-commission">
    <Form
      ref="formValidateCommission"
      :model="value"
      :rules="ruleValidate"
      :label-width="100"
    >
      <div
        class="product-detail-wrapper"
        :class="{ 'product-detail-wrapper-open': barOpenStatus.distribute }"
        v-if="distributionNable"
      >
        <div
          class="product-detail-commission-bar"
          @click="onChangeBarClick('distribute')"
        >
          <i class="iconfont icon-md-arrow-dropright"></i>分销佣金设置
          <span
            class="product-detail-commission-bar-info"
            v-if="!value.distributionLevel"
          >
            <Icon type="md-alert" /><span>请前往【分销设置>基础设置】开启后，单品佣金才生效。</span>
          </span>
        </div>
        <FormItem
          label="分销佣金："
          prop="distributionCommissionType"
          :show-message="false"
          style="margin-bottom: 0 !important;"
        >
          <div class="product-detail-item product-detail-item-auto">
            <RadioGroup v-model="value.distributionCommissionType">
              <Radio :label="0">
                使用系统分销佣金
                <a
                  href="javascript:;"
                  v-show="value.distributionCommissionType === 0"
                  @click="onShowHideClick('commissionSystemTableShow')"
                  >{{ commissionSystemTableShow ? "收起" : "查看" }}</a
                >
              </Radio>
              <Radio
                :disabled="distributionCommissionList.length == 0"
                :label="1"
                :title="
                  distributionCommissionList.length == 0
                    ? '您没有设置分销等级，此选项禁用'
                    : ''
                "
              >
                自定义分销佣金
                <a
                  href="javascript:;"
                  v-show="value.distributionCommissionType === 1"
                  @click="onShowHideClick('commissionCustomTableShow')"
                  >{{ commissionCustomTableShow ? "收起" : "编辑" }}</a
                >
              </Radio>
              <Radio :label="-1">不参与分佣</Radio>
            </RadioGroup>
          </div>
        </FormItem>
        <FormItem style="margin-top: 0px !important;">
          <div>
            <div
              class="product-detail-newsline"
              style="margin-top: 2px;"
              v-show="value.distributionCommissionType !== -1"
            >
              最多可分佣
              <span style="color: red;padding: 0 5px;">{{
                maxCommisionShow
              }}</span
              >元
              <span
                style="color:#F73610;margin-left: 16px;"
                v-show="
                  !value.multiSpecificationsStatus &&
                    value.distributionCommissionType === 1 &&
                    commissionTableSetting.exceedTotalNum
                "
                >(一二三级佣金比例之和不能大于100%)</span
              >
            </div>
            <div
              style="width: 100%;overflow-x: auto;margin-top: 8px;"
              v-show="
                !value.multiSpecificationsStatus &&
                  distributionCommisionTableShow
              "
            >
              <commission-table
                v-model="value.distributionLevelType"
                ref="commissionTable"
                :price="simpleProfitPrice"
                :setting="commissionTableSetting"
                :tableFixed="
                  value.distributionCommissionType === 0 ? '' : 'left'
                "
                :listData="distributionCommissionList"
                :distributorLevel="value.distributionLevel"
                :hasSetting="value.distributionCommissionType === 1"
              />
            </div>
            <div
              v-show="
                value.multiSpecificationsStatus &&
                  distributionCommisionTableShow
              "
            >
              <multi-distribution-table
                :value="value"
                ref="multiCommissionTable"
                :commissionType="
                  value.distributionLevel > 0
                    ? value.distributionCommissionType
                    : -1
                "
                :setArray="setArray"
                :systemCommission="maxCommision"
              ></multi-distribution-table>
            </div>
          </div>
        </FormItem>
      </div>
      <div
        class="product-detail-wrapper"
        :class="{ 'product-detail-wrapper-open': barOpenStatus.agent }"
        v-if="agentNable"
      >
        <div
          class="product-detail-commission-bar"
          @click="onChangeBarClick('agent')"
        >
          <i class="iconfont icon-md-arrow-dropright"></i>代理分红设置<span
            class="product-detail-commission-bar-info"
            v-if="agentConfig.agent_base_config"
            v-show="
              !agentConfig.agent_base_config.level ||
                !agentConfig.agent_sale_reward_config.enable
            "
          >
            <Icon type="md-alert" /><span
              ><b v-if="!agentConfig.agent_base_config.level"
                >请前往【代理设置>基础设置】开启后，单品订单分红才生效。</b
              ><b
                v-if="
                  !agentConfig.agent_base_config.level ||
                    !agentConfig.agent_sale_reward_config.enable
                "
                >请前往【代理设置>销售奖设置】开启后，单品销售奖才生效。</b
              ></span
            >
          </span>
        </div>
        <FormItem
          label="订单分红："
          prop="rewardCommissionType"
          :show-message="false"
        >
          <div class="product-detail-item product-detail-item-auto">
            <RadioGroup v-model="value.rewardCommissionType">
              <Radio :label="0">
                使用系统分红
                <a
                  href="javascript:;"
                  @click="onShowHideClick('rewardSystemTableShow')"
                  v-show="value.rewardCommissionType === 0"
                  >{{ rewardSystemTableShow ? "收起" : "查看" }}</a
                >
              </Radio>
              <Radio :label="1">
                自定义分红
                <a
                  href="javascript:;"
                  @click="onShowHideClick('rewardCustomTableShow')"
                  v-show="value.rewardCommissionType === 1"
                  >{{ rewardCustomTableShow ? "收起" : "编辑" }}</a
                >
              </Radio>
              <Radio :label="-1">不参与分红</Radio>
            </RadioGroup>
            <div
              style="font-size: 12px;color: rgb(158, 164, 177);line-height:initial;"
              v-show="rewardCommisionTableShow"
            >
              当前分红基准：{{
                agentConfig.agent_base_config &&
                agentConfig.agent_base_config.commision_type
                  ? "按商品实付销售价计算"
                  : "按商品利润计算"
              }}；当前分红模式：{{
                agentConfig.agent_base_config &&
                agentConfig.agent_base_config.bonus_mode
                  ? "逐级分红"
                  : "固定分红"
              }}
            </div>
          </div>
        </FormItem>
        <FormItem
          style="margin-top: 0 !important;"
          v-show="rewardCommisionTableShow"
        >
          <div>
            <div
              v-show="
                !value.multiSpecificationsStatus && rewardCommisionTableShow
              "
            >
              <reward-table
                ref="rewardTable"
                :hasSetting="value.rewardCommissionType === 1"
                :agentConfig="agentConfig"
                :sku="singleSku"
                :price="simpleAgentPrice"
              ></reward-table>
            </div>
            <div
              v-show="
                value.multiSpecificationsStatus && rewardCommisionTableShow
              "
            >
              <multi-reward-table
                ref="multiRewardTable"
                :value="value"
                :commissionType="value.rewardCommissionType"
                :agentConfig="agentConfig"
                :setArray="setArray"
              ></multi-reward-table>
            </div>
          </div>
        </FormItem>
        <FormItem
          label="订单销售奖："
          prop="saleCommissionType"
          :show-message="false"
        >
          <div class="product-detail-item product-detail-item-auto">
            <RadioGroup v-model="value.saleCommissionType">
              <Radio :label="0">
                使用系统返佣
                <a
                  href="javascript:;"
                  @click="onShowHideClick('saleSystemTableShow')"
                  v-show="value.saleCommissionType === 0"
                  >{{ saleSystemTableShow ? "收起" : "查看" }}</a
                >
              </Radio>
              <Radio :label="1">
                自定义返佣
                <a
                  href="javascript:;"
                  @click="onShowHideClick('saleCustomTableShow')"
                  v-show="value.saleCommissionType === 1"
                  >{{ saleCustomTableShow ? "收起" : "编辑" }}</a
                >
              </Radio>
              <Radio :label="-1">不参与返佣</Radio>
            </RadioGroup>
            <div
              style="font-size: 12px;color: rgb(158, 164, 177);line-height:initial;"
              v-show="saleCommisionTableShow"
            >
              当前返佣基准：{{
                agentConfig.agent_sale_reward_config &&
                agentConfig.agent_sale_reward_config.commision_type
                  ? "按商品实付销售价计算"
                  : "按商品利润计算"
              }}
            </div>
          </div>
        </FormItem>
        <FormItem
          style="margin-top: 0 !important;"
          v-show="saleCommisionTableShow"
        >
          <div>
            <div
              v-show="
                !value.multiSpecificationsStatus && saleCommisionTableShow
              "
            >
              <sale-table
                ref="saleTable"
                :hasSetting="value.saleCommissionType === 1"
                :agentConfig="agentConfig"
                :sku="singleSku"
                :price="simpleAgentPrice"
              ></sale-table>
            </div>
            <div
              v-show="value.multiSpecificationsStatus && saleCommisionTableShow"
            >
              <multi-sale-table
                ref="multiSaleTable"
                :value="value"
                :commissionType="value.saleCommissionType"
                :agentConfig="agentConfig"
                :setArray="setArray"
              ></multi-sale-table>
            </div>
          </div>
        </FormItem>
      </div>
      <div
        class="product-detail-wrapper"
        :class="{ 'product-detail-wrapper-open': barOpenStatus.area }"
        v-if="regionalNable"
      >
        <div
          class="product-detail-commission-bar"
          @click="onChangeBarClick('area')"
        >
          <i class="iconfont icon-md-arrow-dropright"></i>区域返佣设置
          <span
            class="product-detail-commission-bar-info"
            v-if="areaagentConfig.setting && !areaagentConfig.setting.status"
          >
            <Icon type="md-alert" /><span>请前往【区代设置>基础设置】开启后，单品佣金才生效。</span>
          </span>
        </div>
        <FormItem
          label="区域返佣："
          prop="areaagentCommissionType"
          :show-message="false"
        >
          <div class="product-detail-item product-detail-item-auto">
            <RadioGroup v-model="value.areaagentCommissionType">
              <Radio :label="0">
                使用系统区域返佣
                <a
                  href="javascript:;"
                  @click="onShowHideClick('regionalSystemTableShow')"
                  v-show="value.areaagentCommissionType === 0"
                  >{{ regionalSystemTableShow ? "收起" : "查看" }}</a
                >
              </Radio>
              <Radio :label="1">
                自定义返佣
                <a
                  href="javascript:;"
                  @click="onShowHideClick('regionalCustomTableShow')"
                  v-show="value.areaagentCommissionType === 1"
                  >{{ regionalCustomTableShow ? "收起" : "编辑" }}</a
                >
              </Radio>
              <Radio :label="-1">不参与返佣</Radio>
            </RadioGroup>
            <div
              style="font-size: 12px;color: rgb(158, 164, 177);line-height:initial;"
              v-show="value.areaagentCommissionType !== -1"
            >
              *当前设置的区域返佣模式为【级差总拨比】模式；<br />
              *当前返佣基准：{{
                areaagentConfig.setting.commision_type === 1
                  ? "按商品实付销售价计算"
                  : "按商品利润计算"
              }}；
            </div>
          </div>
        </FormItem>
        <FormItem
          style="margin-top: 0 !important;"
          v-show="regionalCommisionTableShow"
        >
          <div>
            <div
              v-show="
                !value.multiSpecificationsStatus && regionalCommisionTableShow
              "
            >
              <regional-table
                ref="regionalTable"
                :price="simpleRegionalPrice"
                :sku="singleSku"
                :config="areaagentConfig"
                :hasSetting="value.areaagentCommissionType === 1"
              ></regional-table>
            </div>
            <div
              v-show="
                value.multiSpecificationsStatus && regionalCommisionTableShow
              "
            >
              <multi-regional-table
                :value="value"
                ref="multiRegionalTable"
                :commissionType="
                  value.distributionLevel > 0
                    ? value.areaagentCommissionType
                    : -1
                "
                :config="areaagentConfig"
                :setArray="setArray"
              ></multi-regional-table>
            </div>
          </div>
        </FormItem>
      </div>
    </Form>
  </div>
</template>
<script>
import commissionTable from "./product-detail-sku-commission-table";
import multiDistributionTable from "./product-detail-table-multi-distribution";
import multiRewardTable from "./product-detail-table-multi-reward";
import multiRegionalTable from "./product-detail-table-multi-regional";
import multiSaleTable from "./product-detail-table-multi-sale";
import rewardTable from "./product-detail-table-reward";
import regionalTable from "./product-detail-table-regional";
import saleTable from "./product-detail-table-sale";
export default {
  components: {
    commissionTable,
    multiDistributionTable,
    multiRewardTable,
    multiSaleTable,
    multiRegionalTable,
    rewardTable,
    regionalTable,
    saleTable
  },
  props: {
    value: {
      type: Object,
      default() {
        return {};
      }
    },
    agentConfig: {
      type: Object,
      default() {
        return {};
      }
    },
    areaagentConfig: {
      type: Object,
      default() {
        return {};
      }
    },
    setArray: {
      required: true
    },
    maxCommision: {
      default: 0,
      type: Number
    },
    singleSku: {
      type: Object,
      default() {
        return {};
      }
    },
    distributionCommissionList: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      commissionSystemTableShow: true,
      commissionCustomTableShow: true,
      rewardSystemTableShow: true,
      rewardCustomTableShow: true,
      saleSystemTableShow: true,
      saleCustomTableShow: true,
      regionalSystemTableShow: true,
      regionalCustomTableShow: true,
      distributionReady: false, // 标识分销是否渲染完（用于计算可得分销总佣金）
      barOpenStatus: {
        distribute: true,
        agent: true,
        area: true
      },
      ruleValidate: {
        distributionCommissionType: [
          {
            validator: (rule, value, callback) => {
              if (!this.distributionNable || value !== 1) {
                return callback();
              }
              if (!this.value.multiSpecificationsStatus) {
                if (this.$refs["commissionTable"].checkData()) {
                  return callback();
                }
              } else {
                if (this.$refs["multiCommissionTable"].checkData()) {
                  return callback();
                }
              }
              return callback(new Error(""));
            },
            trigger: "blur"
          }
        ],
        rewardCommissionType: [
          {
            validator: (rule, value, callback) => {
              if (!this.regionalNable || value !== 1) {
                return callback();
              }
              if (!this.value.multiSpecificationsStatus) {
                if (this.$refs["rewardTable"].checkData()) {
                  return callback();
                }
              } else {
                if (this.$refs["multiRewardTable"].checkData()) {
                  return callback();
                }
              }
              return callback(new Error(""));
            },
            trigger: "blur"
          }
        ],
        saleCommissionType: [
          {
            validator: (rule, value, callback) => {
              if (!this.agentNable || value !== 1) {
                return callback();
              }
              if (!this.value.multiSpecificationsStatus) {
                if (this.$refs["saleTable"].checkData()) {
                  return callback();
                }
              } else {
                if (this.$refs["multiSaleTable"].checkData()) {
                  return callback();
                }
              }
              return callback(new Error(""));
            },
            trigger: "blur"
          }
        ],
        areaagentCommissionType: [
          {
            validator: (rule, value, callback) => {
              if (!this.agentNable || value !== 1) {
                return callback();
              }
              if (!this.value.multiSpecificationsStatus) {
                if (this.$refs["regionalTable"].checkData()) {
                  return callback();
                }
              } else {
                if (this.$refs["multiRegionalTable"].checkData()) {
                  return callback();
                }
              }
              return callback(new Error(""));
            },
            trigger: "blur"
          }
        ]
      },
      commissionTableSetting: {
        exceedTotalNum: 0
      }
    };
  },
  watch: {
    "value.distributionLevel": {
      handler(val) {
        if (val) {
          this.distributionReady = false;
          this.$nextTick(() => {
            this.distributionReady = true;
          });
        }
      },
      immediate: true
    }
  },
  computed: {
    distributionNable() {
      return this.hasLicensePerm("ENABLE_DISTRIBUTION");
    },
    agentNable() {
      return this.hasLicensePerm("ENABLE_AGENT");
    },
    regionalNable() {
      return this.hasLicensePerm("ENABLE_AREA_AGENT");
    },
    // 单规格差价
    simpleProfitPrice() {
      return typeof this.value.supplyPrice === "number" &&
        typeof this.value.sellPrice === "number"
        ? Math.max(this.value.sellPrice - this.value.supplyPrice, 0)
        : null;
    },
    // 单规格总价
    simpleTotalPrice() {
      return typeof this.value.sellPrice === "number"
        ? this.value.sellPrice
        : null;
    },
    simpleRegionalPrice() {
      if (this.areaagentConfig.setting.commision_type === 1) {
        return this.simpleTotalPrice;
      } else {
        return this.simpleProfitPrice;
      }
    },
    simpleAgentPrice() {
      if (
        this.agentConfig.agent_base_config &&
        this.agentConfig.agent_base_config.commision_type
      ) {
        return this.simpleTotalPrice;
      } else {
        return this.simpleProfitPrice;
      }
    },
    distributionCommisionTableShow() {
      if (
        (!this.value.multiSpecificationsStatus || this.value.skuArray.length) &&
        this.value.distributionCommissionType !== -1
      ) {
        if (
          this.value.distributionCommissionType === 1 &&
          this.commissionCustomTableShow
        ) {
          return true;
        }
        if (
          this.value.distributionCommissionType === 0 &&
          this.commissionSystemTableShow
        ) {
          return true;
        }
      }
      return false;
    },
    rewardCommisionTableShow() {
      if (
        (!this.value.multiSpecificationsStatus || this.value.skuArray.length) &&
        this.value.rewardCommissionType !== -1
      ) {
        if (
          this.value.rewardCommissionType === 1 &&
          this.rewardCustomTableShow
        ) {
          return true;
        }
        if (
          this.value.rewardCommissionType === 0 &&
          this.rewardSystemTableShow
        ) {
          return true;
        }
      }
      return false;
    },
    saleCommisionTableShow() {
      if (
        (!this.value.multiSpecificationsStatus || this.value.skuArray.length) &&
        this.value.saleCommissionType !== -1
      ) {
        if (this.value.saleCommissionType === 1 && this.saleCustomTableShow) {
          return true;
        }
        if (this.value.saleCommissionType === 0 && this.saleSystemTableShow) {
          return true;
        }
      }
      return false;
    },
    regionalCommisionTableShow() {
      if (
        (!this.value.multiSpecificationsStatus || this.value.skuArray.length) &&
        this.value.areaagentCommissionType !== -1
      ) {
        if (
          this.value.areaagentCommissionType === 1 &&
          this.regionalCustomTableShow
        ) {
          return true;
        }
        if (
          this.value.areaagentCommissionType === 0 &&
          this.regionalSystemTableShow
        ) {
          return true;
        }
      }
      return false;
    },
    // 是否显示规格细明
    specificationsShow() {
      return (
        this.value.specificationsData.length &&
        this.value.specificationsData.filter(el => el.values.length).length
      );
    },
    // 最大分佣的佣金
    maxCommisionShow() {
      if (!this.distributionReady) {
        return (0).toFixed(2);
      }
      if (this.value.multiSpecificationsStatus) {
        if (this.specificationsShow) {
          let max = 0;
          this.value.skuArray.forEach(item => {
            let num = 0;
            let money = 0;
            if (item.price !== null && item.price !== "") {
              num = (item.price || 0) - (item.supply_price || 0);
            }

            if (this.value.distributionCommissionType === 1) {
              let val = this.getMaxCommission(item);
              if (
                item.commission_info &&
                item.commission_info.amountType === 0
              ) {
                money = (num * 100 * val) / 10000;
              } else {
                money = val;
              }
            } else {
              money = (num * 100 * this.maxCommision) / 10000;
            }

            max = money > max ? money : max;
          });
          return (Math.floor(max * 100) / 100).toFixed(2);
        } else {
          return (0).toFixed(2);
        }
      } else {
        if (this.value.sellPrice !== null && this.value.supplyPrice !== null) {
          let value = 0;
          if (this.value.distributionCommissionType === 1) {
            let maxCommision = this.$refs["commissionTable"].getMaxDiscount();
            if (this.value.distributionLevelType === 1) {
              value = maxCommision;
            } else {
              value =
                ((this.value.sellPrice - this.value.supplyPrice) *
                  100 *
                  maxCommision) /
                10000;
            }
          } else {
            value =
              ((this.value.sellPrice - this.value.supplyPrice) *
                100 *
                this.maxCommision) /
              10000;
          }
          let money = Math.floor(value * 100) / 100;
          if (money < 0 || isNaN(money)) money = 0;
          return money.toFixed(2);
        }
        return (0).toFixed(2);
      }
    }
  },
  methods: {
    onChangeBarClick(key) {
      this.$set(this.barOpenStatus, key, !this.barOpenStatus[key]);
    },
    // 单规格显示表格
    onShowHideClick(key) {
      this[key] = !this[key];
    },
    /**
     * 计算最大佣金比例
     */
    getMaxCommission(item) {
      if (!item.commission_info) {
        return 0;
      }
      if (!item.hasOwnProperty("maxCustomCommission")) {
        let fristMaxArray = [];
        let secondMaxArray = [];
        let thirdMaxArray = [];
        Object.keys(item.commission_info.rule).forEach(item1 => {
          fristMaxArray.push(
            item.commission_info.rule[item1].commission_rate[1] || null
          );
          secondMaxArray.push(
            item.commission_info.rule[item1].commission_rate[2] || null
          );
          thirdMaxArray.push(
            item.commission_info.rule[item1].commission_rate[3] || null
          );
        });
        let maxCommision = [
          0,
          Math.max(...fristMaxArray),
          Math.max(...secondMaxArray),
          Math.max(...thirdMaxArray)
        ]
          .slice(0, this.value.distributionLevel + 1)
          .reduce((a, b) => {
            return a + b;
          });
        this.$set(
          item,
          "maxCustomCommission",
          item.commission_info.amountType === 0
            ? maxCommision > 100
              ? 100
              : maxCommision
            : maxCommision
        );
      }
      return item.maxCustomCommission;
    }
  }
};
</script>
<style lang="less" scoped>
.product-detail-commission {
  // padding: 24px 0;
  .product-detail-wrapper {
    border: 1px solid #f3f3f3;
    border-radius: 4px;
    margin-bottom: 20px;
    // padding-bottom:4px;
    &.product-detail-wrapper-open {
      .product-detail-commission-bar {
        & > i {
          transform: rotate(90deg);
        }
      }
      /deep/.ivu-form-item {
        display: block;
      }
    }
    /deep/.ivu-form-item {
      display: none;
    }
    .product-detail-commission-bar {
      height: 50px;
      line-height: 50px;
      padding-left: 12px;
      font-weight: bold;
      background-color: #f3f3f3;
      cursor: pointer;
      & > i {
        display: inline-block;
        vertical-align: middle;
        margin-top: -4px;
        margin-right: 10px;
        transition: transform ease 0.5s;
        height: 16px;
        line-height: 16px;
      }
      .product-detail-commission-bar-info {
        display: inline;
        margin-left: 16px;
        i {
          font-size: 16px;
          color: #ff9900;
          margin-right: 10px;
          margin-top: -1px;
        }
        span {
          color: #464c5b;
          font-size: 12px;
          vertical-align: middle;
        }
      }
    }
  }
}
</style>
