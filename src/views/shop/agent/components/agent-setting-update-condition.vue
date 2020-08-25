<template>
  <div class="agent-setting-update-condition">
    <span style="position: absolute;top: 0;line-height: 40px;font-size: 12px;color:#ED4014;" :style="`left: calc((86 + 4) * ${agentUpdate.allowUpdateLevel.length}px + 6px);`" v-show="notInputStatus">必须填写任意一个条件</span>
    <Collapse simple v-model="collapseSelectArray">
      <Panel v-if="dataItem.filter(item => item.type === 1).length || hasLicensePerm('ENABLE_DISTRIBUTION')" name="1" :hide-arrow="true">
        <div>
          <i
            class="iconfont icon-md-arrow-dropright"
            :class="{'agent-setting-update-transform': collapseSelectArray.includes('1')}"
          ></i>
          <span>身份 :</span>
        </div>
        <div slot="content">
          <template v-for="item in dataItem">
            <div
              class="agent-setting-update-condition-item"
              :key="item.type"
              v-if="item.type === 1"
            >
              <span>自身代理等级&nbsp;&nbsp;为</span>
              <tree-select
                ref="agentLevel"
                class="agent-setting-update-condition-input"
                :data="agentLevelData"
                placeholder="请选择"
                @on-check-change="onSelectDataChange(item, 'value', 'agentLevel')"
              ></tree-select>
            </div>
            <div
              class="agent-setting-update-condition-item"
              :key="item.type"
              v-if="hasLicensePerm('ENABLE_DISTRIBUTION') && item.type === 2"
            >
              <span>自身分销商等级&nbsp;&nbsp;为</span>
              <tree-select
                ref="distributorLevel"
                class="agent-setting-update-condition-input"
                :data="levelShowData"
                placeholder="请选择"
                @on-check-change="onSelectDataChange(item, 'value', 'distributorLevel')"
              ></tree-select>
            </div>
          </template>
        </div>
      </Panel>
      <Panel name="2" :hide-arrow="true">
        <div>
          <i
            class="iconfont icon-md-arrow-dropright"
            :class="{'agent-setting-update-transform': collapseSelectArray.includes('2')}"
          ></i>
          <span>人数 :</span>
        </div>
        <div slot="content">
          <template v-for="item in dataItem">
            <div
              class="agent-setting-update-condition-item"
              :key="item.type"
              v-if="[3, 4, 7, 8, 18, 19].includes(item.type)"
            >
              <span>{{teamText[item.type]}}&nbsp;&nbsp;满</span>
              <InputNumber
                :min="0"
                :max="9999999"
                :precision="0"
                class="common-input-text-120"
                v-model="item.value"
              />
              <span class="agent-setting-update-condition-classifier">人</span>
              <more-message
                :maxWidth="320"
                style="margin-right: 20px;"
                :text="tooltipText[item.type]"
              ></more-message>
              <RadioGroup v-model="item.logistic">
                <Radio label="or">或</Radio>
                <Radio label="and">与</Radio>
              </RadioGroup>
              <span class="agent-setting-update-condition-desc" v-if="[3].includes(item.type)">（只对【代理商】升级有效）</span>
            </div>
            <div
              class="agent-setting-update-condition-item agent-setting-update-condition-item-extra"
              :key="item.type"
              v-if="hasLicensePerm('ENABLE_DISTRIBUTION') && [5, 6, 9].includes(item.type)"
            >
              <span>{{teamText[item.type]}}</span>
              <tree-select
                :ref="'levelTeam' + item.type"
                class="agent-setting-update-condition-input"
                :class="{'ivu-form-item-error': distributorError[item.type]}"
                :data="levelShowDataTeam(item.type)"
                placeholder="请选择"
                @on-check-change="onSelectDataChange(item.value,'distribution_level_id', 'levelTeam' + item.type)"
              ></tree-select>
              <span>等级分销商合计数量&nbsp;&nbsp;满</span>
              <InputNumber
                :min="0"
                :max="9999999"
                :precision="0"
                class="agent-setting-update-condition-input"
                v-model="item.value.member_count"
                @on-change="!$event && $set(distributorError, item.type, false)"
              />
              <span class="agent-setting-update-condition-classifier">人</span>
              <more-message
                style="margin-right: 20px;"
                :text="tooltipText[item.type]"
              ></more-message>
              <RadioGroup v-model="item.logistic">
                <Radio label="or">或</Radio>
                <Radio label="and">与</Radio>
              </RadioGroup>
              <span class="agent-setting-update-condition-desc" v-if="[9].includes(item.type)">（只对【代理商】升级有效）</span>
            </div>
          </template>
        </div>
      </Panel>
      <Panel name="3" :hide-arrow="true">
        <div>
          <i
            class="iconfont icon-md-arrow-dropright"
            :class="{'agent-setting-update-transform': collapseSelectArray.includes('3')}"
          ></i>
          <span>订单 :</span>
        </div>
        <div slot="content">
          <template v-for="item in dataItem">
            <div
              class="agent-setting-update-condition-item"
              v-if="[10, 11, 12, 13].includes(item.type)"
              :key="item.type"
            >
              <span>{{orderText[item.type]}}&nbsp;&nbsp;满</span>
              <InputNumber
                :min="0"
                :max="9999999"
                :precision="2"
                class="common-input-text-120"
                v-model="item.value"
              />
              <span class="agent-setting-update-condition-classifier">元</span>
              <more-message
                style="margin-right: 20px;"
                :text="tooltipText[item.type]"
              ></more-message>
              <RadioGroup v-model="item.logistic">
                <Radio label="or">或</Radio>
                <Radio label="and">与</Radio>
              </RadioGroup>
              <span class="agent-setting-update-condition-desc" v-if="[11, 12, 13].includes(item.type)">（只对【代理商】升级有效）</span>
            </div>
          </template>
        </div>
      </Panel>
      <Panel name="5" :hide-arrow="true">
        <div>
          <i
            class="iconfont icon-md-arrow-dropright"
            :class="{'agent-setting-update-transform': collapseSelectArray.includes('5')}"
          ></i>
          <span>充值 :</span>
        </div>
        <div slot="content">
          <template v-for="item in dataItem">
            <div
              class="agent-setting-update-condition-item"
              v-if="[21, 22].includes(item.type)"
              :key="item.type"
            >
              <span>{{rechargeText[item.type]}}&nbsp;&nbsp;满</span>
              <InputNumber
                :min="0"
                :max="9999999"
                :precision="2"
                class="common-input-text-120"
                v-model="item.value"
              />
              <span class="agent-setting-update-condition-classifier">元</span>
              <more-message
                style="margin-right: 20px;"
                :text="tooltipText[item.type]"
              ></more-message>
              <RadioGroup v-model="item.logistic">
                <Radio label="or">或</Radio>
                <Radio label="and">与</Radio>
              </RadioGroup>
            </div>
          </template>
        </div>
      </Panel>
      <Panel name="4" :hide-arrow="true">
        <div>
          <i
            class="iconfont icon-md-arrow-dropright"
            :class="{'agent-setting-update-transform': collapseSelectArray.includes('4')}"
          ></i>
          <span>商品 :</span>
        </div>
        <div slot="content">
          <div class="agent-setting-update-condition-item">
            <span style="width: 90px;">购买模式：</span>
            <RadioGroup v-model="buyType">
              <Radio :label="0">购买任意商品</Radio>
              <Radio :label="1">购买全部商品</Radio>
            </RadioGroup>
          </div>
          <div class="agent-setting-update-condition-item" style="margin-top: -8px;" v-show="buyAll.value">
            <span style="width: 125px;">自购以下全部商品</span>
            <more-message
              style="margin-right: 20px;"
              text="自购指定商品，每个商品自购数量至少为1个"
            ></more-message>
            <RadioGroup v-model="buyAllLogistic">
              <Radio label="or">或</Radio>
              <Radio label="and">与</Radio>
            </RadioGroup>
          </div>
          <template v-for="item in dataItem">
            <div
              class="agent-setting-update-condition-item"
              v-if="[14, 15, 16, 17].includes(item.type)"
              v-show="!buyAll.value"
              :key="item.type"
            >
              <span>{{shopText[item.type]}}&nbsp;&nbsp;满</span>
              <InputNumber
                :min="0"
                :max="9999999"
                :precision="0"
                class="common-input-text-120"
                v-model="item.value"
              />
              <span class="agent-setting-update-condition-classifier">件</span>
              <more-message
                style="margin-right: 20px;"
                :text="tooltipText[item.type]"
              ></more-message>
              <RadioGroup v-model="item.logistic">
                <Radio label="or">或</Radio>
                <Radio label="and">与</Radio>
              </RadioGroup>
              <span class="agent-setting-update-condition-desc" v-if="[15, 16, 17].includes(item.type)">（只对【代理商】升级有效）</span>
            </div>
          </template>
          <div
            class="agent-setting-update-condition-item agent-setting-update-condition-item-product"
            v-show="buyAll.value || productSetEaxit"
          >
            <span v-show="!buyAll.value" style="width: 132px;margin-right: 6px;">购买以下任意指定商品：</span>
            <span
              class="agent-setting-update-condition-product-tip"
              :style="buyAll.value ? 'left: 124px;' : ''"
              v-show="productTipShow"
            >必须添加一个商品</span>
            <slot></slot>
          </div>
        </div>
      </Panel>
      <Panel name="6" :hide-arrow="true" v-if="customCondition&&customCondition.length">
        <div>
          <i
            class="iconfont icon-md-arrow-dropright"
            :class="{'agent-setting-update-transform': collapseSelectArray.includes('5')}"
          ></i>
          <span>定制 :</span>
        </div>
        <div slot="content">
          <div
            class="agent-setting-update-condition-item"
            v-for="(item, index) in customCondition"
            :key="index"
          >
            <span style="width:300px;margin-right:20px;text-align:left;">{{item.desc}}</span>
            <Radio v-if="item.logistic=='or'" :value="true">或</Radio>
            <Radio v-else :value="true">与</Radio>
          </div>
        </div>
      </Panel>
    </Collapse>
  </div>
</template>
<script>
import treeSelect from "@/views/shop/components/selector/class-tree-select.vue";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
const teamText = {
  3: "团队成员数量",
  18: "直推一级代理人数",
  19: "直推二级代理人数",
  4: "直推三级代理人数",
  7: "直推成员人数",
  8: "间推成员人数",
  5: "直推",
  6: "间推",
  9: "团队"
};
const orderText = {
  13: "团队订单金额",
  10: "自购订单金额",
  11: "直推订单金额",
  12: "间推订单金额"
};
const rechargeText = {
    21: "累计充值金额",
    22: "一次性充值金额"
};
const shopText = {
  17: "团队指定商品",
  14: "自购指定商品",
  15: "直推指定商品",
  16: "间推指定商品"
};
const tooltipText =　{
  3: "团队内所有的成员的总数量，包括自己",
  18: "直推的下级成员中，【一级代理】人数，不包括自己",
  19: "直推的下级成员中，【二级代理】人数，不包括自己",
  4: "直推的下级成员中，【三级代理】人数，不包括自己",
  7: "所有直推成员人数，不包括自己",
  8: "所有间推的成员人数，不包括自己",
  9: "团队内，XX等级的分销商的总人数，包括自己",
  5: "所有直推的XX等级的分销商的总人数，不包括自己",
  6: "所有间推的XX等级的分销商的总人数，不包括自己",

  13: "团队内，所有成员下的订单总金额，包括自购",
  10: "所有自购的订单总金额",
  11: "团队内，所有直推成员下的订单总金额，不包括自购",
  12: "团队内，所有间推成员（除了直推外）下的订单\n总金额，不包括自购",

  21: "累计充值到余额账户的总金额，包括充值和转现，不包括提现到余额和充值赠送的金额",
  22: "一次性充值到余额账户的金额，包括充值和转现，不包括提现到余额和充值赠送的金额",

  17: "团队内，所有成员购买指定商品的总数量，包括自购",
  14: "自购指定商品的总数量",
  15: "团队内，所有直推成员购买指定商品的总数量，不包括自购",
  16: "团队内，所有间推成员（除了直推外）购买指定商品\n的总数量，不包括自购"
};
export default {
  components: {
    treeSelect,
    moreMessage
  },
  inject: ["agentUpdate"],
  props: {
    dataItem: {
      type: Array,
      default() {
        return [];
      }
    },
    customCondition: {
      type: Array,
      default() {
        return null;
      }
    },
    distributorLevel: {
      type: Array,
      default() {
        return [];
      }
    },
    agentLevel: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      productTipShow: false,
      collapseSelectArray: ["1", "2", "3", "5", "4", "6"],
      notInputStatus: false,
      distributorError: {},
      teamText,
      orderText,
      shopText,
      rechargeText,
      tooltipText
    };
  },
  computed: {
    buyAll() {
      return this.dataItem.find(item => item.type === 20);
    },
    buyType: {
      get() {
        return this.buyAll.value;
      },
      set(val) {
        this.$set(this.buyAll, "value", val);
      }
    },
    buyAllLogistic: {
      get() {
        return this.buyAll.logistic;
      },
      set(val) {
        this.$set(this.buyAll, "logistic", val);
      }
    },
    agentLevelData() {
      // 拿到需要选中的id
      let selectID =
        this.dataItem.filter(item => item.type === 1)[0].value || "";
      let selectArray = selectID
        .split(",")
        .filter(n => n)
        .map(n => parseInt(n));
      if (this.level === 1) {
        return [
          {
            title: "全部等级",
            expand: true,
            children: [
              {
                title: "二级代理",
                isDisabled: this.agentLevel < 2,
                data: {
                  id: 2,
                  class_name: "二级代理"
                },
                checked: selectArray.includes(2)
              },
              {
                title: "三级代理",
                isDisabled: this.agentLevel < 3,
                data: {
                  id: 3,
                  class_name: "三级代理"
                },
                checked: selectArray.includes(3)
              }
            ],
            data: {
              id: -1,
              class_name: "全部等级"
            }
          }
        ];
      } else {
        return [
          {
            title: "三级代理",
            isDisabled: this.agentLevel < 3,
            data: {
              id: 3,
              class_name: "三级代理"
            },
            children: [],
            checked: selectArray.includes(3)
          }
        ];
      }
    },
    levelShowData() {
      // 拿到需要选中的id
      let selectID =
        this.dataItem.filter(item => item.type === 2)[0].value || "";
      let selectArray = selectID
        .split(",")
        .filter(n => n)
        .map(n => parseInt(n));
      return [
        {
          title: "全部等级",
          children: this.distributorLevel.map(item => {
            return {
              title: item.name,
              isDisabled: !item.status,
              data: {
                id: item.id,
                class_name: item.name
              },
              checked: selectArray.includes(item.id)
            };
          }),
          expand: true,
          data: {
            id: -1,
            class_name: "全部等级"
          }
        }
      ];
    },
    levelShowDataTeam() {
      return (type) => {
        // 拿到需要选中的id
        let selectID =
          this.dataItem.filter(item => item.type === type)[0].value
            .distribution_level_id || "";
        let selectArray = selectID
          .split(",")
          .filter(n => n)
          .map(n => parseInt(n));
        return [
          {
            title: "全部等级",
            children: this.distributorLevel.map(item => {
              return {
                title: item.name,
                isDisabled: !item.status,
                data: {
                  id: item.id,
                  class_name: item.name
                },
                checked: selectArray.includes(item.id)
              };
            }),
            expand: true,
            data: {
              id: -1,
              class_name: "全部等级"
            }
          }
        ];
      }
    },
    /**
     * 检测是否有设置与商品相关的值
     */
    productSetEaxit() {
      return (
        this.dataItem.filter(
          item => [14, 15, 16, 17].includes(item.type) && item.value
        ).length > 0
      );
    }
  },
  methods: {
    /**
     * 改变数据的时候保存id到需要上传的数据中并触发computed更新
     */
    onSelectDataChange(item, key, ref) {
      let selectList = this.$refs[ref][0].getCheckedNodes();
      let val = selectList
        .map(item => item.data.id)
        .filter(n => n !== -1)
        .join(",");
      this.$set(item, key, val);
      if (key === "distribution_level_id") {
        this.$set(this.distributorError, ref.replace("levelTeam", ""), false);
      }
    },
    /**
     * 检测数据
     */
    checkData() {
      let status = true;  // 判断是否有没符合要求的（不符合要求为false）
      // 检测是否有值的
      this.productTipShow = false;
      let prosuctStatus = this.getProductStatus();
      let status1 = this.dataItem.filter(item => {
        // 如果选了购买所有商品则检查商品是否有填
        if (item.type == 20  && item.value) {
          status = status && prosuctStatus;
          this.productTipShow = !prosuctStatus;
          return true;
        }
        // 如果选了购买任意商品
        if ([14, 15, 16, 17].includes(item.type)) {
          if (!this.buyType && item.value) {
            status = status && prosuctStatus;
            this.productTipShow = !prosuctStatus;
            return true;
          }
          return false;
        }
        // 指定分销商购买满多少
        if([5, 6, 9].includes(item.type)) {
          let hasError = item.value.member_count && !item.value.distribution_level_id;
          status = status && !hasError;
          this.$set(this.distributorError, item.type, hasError);
          return item.value.member_count;
        }
        // 身份不用考虑在内
        if([1, 2].includes(item.type)) {
          return false;
        }
        // 其他输入框
        if (item.value) {
          return true;
        }
        return false;
      }).length
      this.notInputStatus = !status1;
      return status && status1;
    },
    /**
     * 检测是否有商品
     */
    getProductStatus() {
      return this.agentUpdate.updateData.agentLevel[this.level - 1].upgrade_condition
          .product_list &&
          this.agentUpdate.updateData.agentLevel[this.level - 1].upgrade_condition
            .product_list.length
    }
  }
};
</script>
<style lang="less" scoped>
@inputMarginRight: 5px;
.agent-setting-update-condition {
  /deep/.class-tree-select {
    .ivu-select-dropdown {
      width: 220px;
    }
  }
  /deep/.ivu-collapse {
    border: none;
    padding: 10px 0;
    .ivu-collapse-item {
      padding-bottom: 3px;
      border: none;
      background-color: #f5f6f7;
      & ~ .ivu-collapse-item {
        margin-top: 10px;
      }
      // 头部
      .ivu-collapse-header {
        width: 90px;
        height: 48px;
        line-height: 51px;
        padding-left: 8px;
        border-bottom: none;
        color: #464c5b;
        & > div {
          font-size: 0;
          i {
            display: inline-block;
            width: 32px;
            height: 34px;
            text-align: center;
            line-height: 34px;
            vertical-align: middle;
            transition: transform 0.2s ease-in-out;
            &.agent-setting-update-transform {
              transform: rotate(90deg);
            }
          }
          span {
            font-size: 14px;
            font-weight: bold;
            vertical-align: middle;
          }
        }
      }
      // 内容区
      .ivu-collapse-content {
        padding-left: 74px;
        background-color: #f5f6f7;
        .ivu-collapse-content-box {
          padding-bottom: 1px;
          .agent-setting-update-condition-item {
            position: relative;
            font-size: 0;
            padding-bottom: 20px;
            .agent-setting-update-condition-input {
              width: 156px;
            }
            &.agent-setting-update-condition-item-product {
              padding-left: 24px;
            }
            & > span {
              font-size: 12px;
              vertical-align: middle;
              &:first-child {
                display: inline-block;
                width: 115px;
                text-align: right;
                margin-right: 5px;
              }
            }
            // 单位处理
            .common-input-text-120 {
              margin-right: @inputMarginRight;
            }
            .agent-setting-update-condition-classifier {
              margin-right: 5px;
            }
            .agent-setting-update-condition-desc {
              color: #9EA7B4;
            }
            // 额外的多个输入框的
            &.agent-setting-update-condition-item-extra {
              & > span {
                &:first-child {
                  width: auto;
                }
              }
              .agent-setting-update-condition-input {
                margin-right: 5px;
                & ~ span {
                  margin-right: 5px;
                }
                & ~ .agent-setting-update-condition-input {
                  margin-right: @inputMarginRight;
                }
                .ivu-select-dropdown {
                  width: 210px;
                }
              }
            }
          }
          .agent-setting-update-condition-product-tip {
            position: absolute;
            left: 262px;
            top: 0px;
            color: #f73610;
            font-size: 12px !important;
          }
        }
      }
    }
  }
}
</style>
