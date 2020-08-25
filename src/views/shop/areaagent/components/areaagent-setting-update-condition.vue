<template>
  <div class="agent-setting-update-condition">
    <Collapse simple v-model="collapseSelectArray">
      <Panel v-if="hasLicensePerm('ENABLE_DISTRIBUTION')||hasLicensePerm('ENABLE_AGENT')" name="1" :hide-arrow="true">
        <div>
          <i
              class="iconfont icon-md-arrow-dropright"
              :class="{'agent-setting-update-transform': collapseSelectArray.includes('1')}"
          ></i>
          <span>身份 :</span>
        </div>
        <div slot="content">
          <template>
            <div
                class="agent-setting-update-condition-item"
                v-if="hasLicensePerm('ENABLE_AGENT')"
            >
              <span>自身代理商等级&nbsp;&nbsp;为</span>
              <tree-select
                  ref="agentLevel"
                  class="agent-setting-update-condition-input"
                  :data="agentLevelData"
                  placeholder="请选择代理商等级"
                  @on-check-change="onSelectDataChange(dataItem.agent, 'value', 'agentLevel')"
              ></tree-select>
              <RadioGroup v-model="dataItem.agent.logistic" style="margin-left: 16px;">
                <Radio label="or">或</Radio>
                <Radio label="and">与</Radio>
              </RadioGroup>
            </div>
            <div
                class="agent-setting-update-condition-item"
                v-if="hasLicensePerm('ENABLE_DISTRIBUTION')"
            >
              <span>自身分销商等级&nbsp;&nbsp;为</span>
              <tree-select
                  ref="distributorLevel"
                  class="agent-setting-update-condition-input"
                  :data="levelShowData"
                  placeholder="请选择分销商等级"
                  @on-check-change="onSelectDataChange(dataItem.distribution, 'value', 'distributorLevel')"
              ></tree-select>
              <RadioGroup v-model="dataItem.distribution.logistic" style="margin-left: 16px;">
                <Radio label="or">或</Radio>
                <Radio label="and">与</Radio>
              </RadioGroup>
            </div>
          </template>
        </div>
      </Panel>
    </Collapse>
  </div>
</template>
<script>
  import treeSelect from "@/views/shop/components/selector/class-tree-select.vue";
  import moreMessage from "@/views/shop/components/more-message/more-message.vue";
  export default {
    components: {
      treeSelect,
      moreMessage
    },
    props: {
      dataItem: {
        type: Object,
        default:null
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
        collapseSelectArray: ["1"],
        notInputStatus: false,
        distributorError: {},
      };
    },
    computed: {
      agentLevelData() {
        // 拿到需要选中的id
        // let selectID =
        //   this.dataItem.filter(item => item.type === 1)[0].value || "";
        let selectArray = this.dataItem.agent.value
          .filter(n => n)
          .map(n => parseInt(n));
        return [
          {
            title: "全部等级",
            expand: true,
            children: [
              {
                title: "一级代理",
                data: {
                  id: 1,
                  class_name: "一级代理"
                },
                checked: selectArray.includes(1)
              },
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
      },
      levelShowData() {
        // 拿到需要选中的id
        // let selectID =
        //   this.dataItem.filter(item => item.type === 2)[0].value || "";
        let selectArray = this.dataItem.distribution.value
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
        let selectList = this.$refs[ref].getCheckedNodes();
        let val = selectList
          .map(item => item.data.id)
          .filter(n => n !== -1);
        this.$set(item, key, val);
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
