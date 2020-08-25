<template>
  <div class="agent-setting-update" v-if="updateData">
    <Form
      ref="formValidateUpdate"
      :label-width="160"
      :model="updateData"
      :rules="ruleValidateUpdate"
    >
      <switch-titlebar
        style="margin-bottom: 24px;"
        v-model="updateData.agentUpgrade.status"
        title="是否开启升级功能"
        :tipShow="!updateData.baseSetting && updateData.agentUpgrade.status"
        tipText="请前往【代理设置>基础设置】开启团队分红功能后，升级功能才生效。"
        @on-change="onAgentStatusChange"
      />
      <FormItem label="等级升级节点：" v-show="updateData.agentUpgrade.status">
        <RadioGroup
          v-model="updateData.agentUpgrade.order_valid_condition"
          @on-change="onCountPeriodChange"
        >
          <more-message
            :maxWidth="293"
            style="margin-right: 10px;"
            text="付款后，成功下单并完成支付的订单达到条件触发升级；维权期后，维权期后的订单达到条件触发升级；"
          ></more-message>
          <Radio :label="0">付款后</Radio>
          <Radio :label="1">维权期后</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="是否允许会员自动升级：" v-show="updateData.agentUpgrade.status">
        <RadioGroup v-model="updateData.agentUpgrade.auto_upgrade">
          <Radio :label="1">是</Radio>
          <Radio :label="0">否</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem
        label="允许升级等级："
        prop="agentUpgrade.order_valid_condition"
        v-show="updateData.agentUpgrade.status"
      >
        <CheckboxGroup v-model="allowUpdateLevel">
          <Checkbox
            :label="item.level"
            v-for="item in updateData.agentLevel"
            :key="item.id"
          >{{agentLevelText[item.level - 1]}}</Checkbox>
        </CheckboxGroup>
      </FormItem>
      <FormItem
        label="升级条件："
        prop="agentLevel"
        class="agent-setting-condition"
        v-show="updateData.agentUpgrade.status && allowUpdateLevel.length"
        :class="{'agent-setting-condition-one': allowUpdateLevel.includes(1), 'agent-setting-condition-two': allowUpdateLevel.includes(2), 'agent-setting-condition-three': allowUpdateLevel.includes(3)}"
      >
        <Tabs type="card" :animated="false" v-model="tabSelect">
          <TabPane
            v-for="(item, index) in updateData.agentLevel"
            :label="agentLevelText[item.level - 1]"
            :key="index"
            tab="condition"
          >
            <update-condition
              ref="updateCondition"
              :level="item.level"
              :agentLevel="updateData.enabledAgentLevel"
              :distributorLevel="distributorLevel"
              :dataItem="item.upgrade_condition.upgrade"
              :customCondition="item.plugin_upgrade_conditon"
            >
              <add-more text="添加商品" @onAddMoreClick="onAddProductClick"></add-more>
              <!--<Button type="primary" style="padding: 5px 13px;" shape="circle" icon="md-add" @click="onAddProductClick">添加商品</Button>-->
              <div>
                <div style="width: 700px;" v-show="productSelectData.length">
                  <common-table
                    :columnsData="productSelectTableColumn"
                    :listData="productSelectData"
                    type="border"
                  ></common-table>
                </div>
              </div>
            </update-condition>
          </TabPane>
        </Tabs>
      </FormItem>
    </Form>
    <product-list-modal
      @onGetProductInfo="onGetProductInfo"
      v-model="modalStatus"
      :productIds="productIds"
    ></product-list-modal>
    <!-- <foot-button @onSaveClick="saveUpdateData" :loading="saveLoading" perm="agent.config.operate"></foot-button> -->
    <div class="footer">
      <Button
        type="primary"
        shape="circle"
        @click="saveUpdateData"
        :loading="saveLoading"
        perm="agent.config.operate"
      >保存</Button>
    </div>
  </div>
</template>
<script>
import commonTable from "@/views/shop/components/table/common-table.vue";
import footButton from "@/views/shop/components/button/foot-button.vue";
import addMore from "@/views/shop/components/button/add-more.vue";
import productListModal from "@/views/shop/store/design/components/product-list.vue";
import updateCondition from "./agent-setting-update-condition";
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
const agentLevelText = ["一级代理", "二级代理", "三级代理"];
const upgradeData = {
  // 代理商等级升级条件
  AgentLevelUpgradeCondition_SelfAgentLevel: 1, //自身代理等级
  AgentLevelUpgradeCondition_SelfDistributionLevel: 2, //自身分销商等级

  AgentLevelUpgradeCondition_AgentTeamMember: 3, //团队成员
  AgentLevelUpgradeCondition_RecommendOneLevelAgentNum: 18, // 直推一级代理人数
  AgentLevelUpgradeCondition_RecommendTwoLevelAgentNum: 19, // 直推二级代理人数
  AgentLevelUpgradeCondition_RecommendThreeLevelAgentNum: 4, // 直推三级代理人数
  AgentLevelUpgradeCondition_DirectlyMember: 7, //直推成员人数
  AgentLevelUpgradeCondition_IndirectMember: 8, //间推成员人数
  AgentLevelUpgradeCondition_TeamArbitrarilyLevelDistributionMember: 9, //团队中任意等级分销商合计数量
  AgentLevelUpgradeCondition_DirectlyDistributionMember: 5, //直推分销商人数
  AgentLevelUpgradeCondition_IndirectDistributionMember: 6, //间推分销商人数

  AgentLevelUpgradeCondition_TeamOrderMoney: 13, //团队订单金额
  AgentLevelUpgradeCondition_SelfOrderMoney: 10, //自购订单金额
  AgentLevelUpgradeCondition_DirectlyOrderMoney: 11, //直推订单金额
  AgentLevelUpgradeCondition_IndirectOrderMoney: 12, //间推订单金额

  AgentLevelUpgradeCondition_AccumulateRechargeAmount: 21, //累计充值金额
  AgentLevelUpgradeCondition_OneTimeRechargeAmount: 22, //一次性充值金额

  AgentLevelUpgradeCondition_TeamBuyDesignatedProduct: 17, //团队指定商品
  AgentLevelUpgradeCondition_SelfBuyDesignatedProduct: 14, //自购指定商品
  AgentLevelUpgradeCondition_DirectlyBuyDesignatedProduct: 15, //直推指定商品
  AgentLevelUpgradeCondition_IndirectBuyDesignatedProduct: 16, //间推指定商品
  UpgradeConditionSelfBuyAllDesignatedProduct: 20
};
export default {
  components: {
    commonTable,
    productListModal,
    updateCondition,
    switchTitlebar,
    moreMessage,
    footButton,
    addMore
  },
  provide() {
    return {
      agentUpdate: this
    };
  },
  data() {
    return {
      saveLoading: false,
      modalStatus: false,
      tabSelect: 0,
      updateData: null,
      distributorLevel: [],
      agentLevelText,
      productSelectTableColumn: [
        {
          title: "商品信息",
          width: 250,
          render: (h, params) => {
            let status = params.row.status === 1;
            return h("div", {}, [
              h(
                "div",
                {
                  style: {
                    display: "inline-block",
                    marginRight: "8px",
                    verticalAlign: "middle"
                    // border: "1px solid #eeeeee"
                  }
                },
                [
                  h("img", {
                    attrs: {
                      src:
                        params.row.small_images.split(",").length &&
                        this.$store.state.siteComdataPath +
                          params.row.small_images.split(",")[0]
                    },
                    style: {
                      height: "40px",
                      width: "40px",
                      display: "block",
                      objectFit: "contain"
                    }
                  })
                ]
              ),
              h(
                "div",
                {
                  style: {
                    display: "inline-block",
                    verticalAlign: "middle",
                    width: status ? "calc(100% - 48px)" : "calc(100% - 108px)",
                    textAlign: "left",
                    lineHeight: "initial",
                    "font-size": "0"
                  }
                },
                [
                  h(
                    "Tooltip",
                    {
                      style: {
                        width: "100%"
                      },
                      props: {
                        content: params.row.name,
                        maxWidth: 300,
                        transfer: true,
                        placement: "top"
                      }
                    },
                    [
                      h(
                        "div",
                        {
                          style: {
                            display: "-webkit-inline-box",
                            "-webkit-line-clamp": 2,
                            "-webkit-box-orient": "vertical",
                            overflow: "hidden",
                            lineHeight: "21px",
                            "font-size": "12px"
                          }
                        },
                        params.row.name
                      )
                    ]
                  )
                ]
              ),
              status
                ? ""
                : h(
                    "div",
                    {
                      class: "table-error",
                      style: {
                        "vertical-align": "middle",
                        "margin-left": "10px",
                        "margin-right": "-4px"
                      }
                    },
                    params.row.status === 0 ? "已下架" : "已删除"
                  )
            ]);
          }
        },
        {
          title: "商品分类",
          width: 150,
          align: "center",
          render: (h, params) => {
            let classObj = {};
            let classArray = params.row.product_class || params.row.class || [];
            classArray.forEach(item => {
              classObj[item.id] = true;
            });
            let text = classArray
              .filter(item => !classObj[item.parent_id])
              .map(item => item.class_name)
              .join(",");
            return h("div", { style: {"line-height": "initial"} }, params.row.status === -9 ? "--" : (text || ""));
          }
        },
        {
          title: "销售价",
          align: "center",
          render: (h, params) => {
            return h("div", {}, params.row.status === -9 ? "--" : ("￥" + params.row.price));
          }
        },
        {
          title: "操作",
          align: "center",
          render: (h, params) => {
            return h("div", [
              params.row.status === -9 ? "" : h(
                "a",
                {
                  class: {
                    "table-operation": true
                  },
                  style: {
                    marginRight: "14px"
                  },
                  on: {
                    click: () => {
                      this.$router.push({
                        name: "productDetail",
                        query: {
                          id: params.row.id
                        }
                      });
                    }
                  }
                },
                "查看详情"
              ),
              h(
                "a",
                {
                  class: {
                    "table-operation": true
                  },
                  on: {
                    click: () => {
                      this.productSelectData.splice(params.index, 1);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      ruleValidateUpdate: {
        "agentUpgrade.order_valid_condition": [
          {
            required: true,
            trigger: "change",
            validator: (rule, value, callback) => {
              if (this.allowUpdateLevel.length) {
                return callback();
              }
              return callback(new Error("至少选择一个级别"));
            }
          }
        ],
        agentLevel: [
          {
            required: true,
            trigger: "none",
            validator: (rule, value, callback) => {
              return callback();
            }
          }
        ]
      }
    };
  },
  created() {
    this.$store.state.COMMON_loading = true;
    Promise.all([this.getDistributorLevel(), this.getUpdateData()])
      .catch(e => {
        this.$Message.error(e);
      })
      .finally(() => {
        this.$store.state.COMMON_loading = false;
      });
  },
  computed: {
    allowUpdateLevel: {
      get() {
        return this.updateData.agentLevel
          .filter(item => {
            return !!item.upgrade_condition.status;
          })
          .map(item => item.level);
      },
      set(val) {
        this.updateData.agentLevel.forEach(item => {
          let oldData = item.upgrade_condition;
          this.$set(
            item,
            "upgrade_condition",
            Object.assign({}, oldData, {
              status: val.includes(item.level) ? 1 : 0
            })
          );
        });
        // 如果tab没选中显示的那个则重新选择一下
        if (val.length && !val.includes(this.tabSelect + 1)) {
          this.tabSelect = val[0] - 1;
        }
      }
    },
    productSelectData() {
      return (
        this.updateData.agentLevel[this.tabSelect].upgrade_condition
          .product_list || []
      );
    },
    productIds() {
      return this.productSelectData.map(item => item.id);
    }
  },
  methods: {
    getDistributorLevel() {
      return new Promise((resolve, reject) => {
        this.$httpGet("/shop/admin/distribution/level/list", null, res => {
          if (res.code === 200) {
            resolve();
            this.distributorLevel = res.data || [];
          } else {
            reject(res.msg);
          }
        });
      });
    },
    /**
     * 获取升级数据
     */
    getUpdateData() {
      return new Promise((resolve, reject) => {
        this.$httpGet("/shop/admin/agent/upgrade/info", null, res => {
          if (res.code === 200) {
            let data = res.data;
            data.agentLevel.forEach(item => {
              // 没有upgrade_condition数据的时候新建数据
              if (!item.upgrade_condition) {
                item.upgrade_condition = this.getNewUpgradeCondition(
                  item.level
                );
              } else {
                this.sortUpgradeData(item);
              }
            });
            data.agentLevel.sort((m, n) => m.level - n.level);
            let current = data.agentLevel.find(n => n.upgrade_condition.status);
            current && (this.tabSelect = current.level - 1);
            resolve();
            this.updateData = res.data;
          } else {
            reject(res.msg);
          }
        });
      });
    },
    /**
     * 按照设计稿顺序输出
     */
    sortUpgradeData(dataArray) {
        let upgradeLength;
        if (dataArray.level === 3){
            upgradeLength = Object.values(upgradeData).length-1
        } else{
            upgradeLength = Object.values(upgradeData).length
        }
        if (upgradeLength > dataArray.upgrade_condition.upgrade.length){
            let res = dataArray.upgrade_condition.upgrade.map(item => item.type)
            Object.values(upgradeData)
                .map((item, index) => {
                    if (dataArray.level === 3){
                        if (item!=1&&!res.includes(item)) {
                            dataArray.upgrade_condition.upgrade.push({
                                type:item,
                                value:null,
                                logistic:"or"
                            })
                        }
                    } else{
                        if (!res.includes(item)) {
                            dataArray.upgrade_condition.upgrade.push({
                                type:item,
                                value:null,
                                logistic:"or"
                            })
                        }
                    }
                })
        }
      let data = {};
      dataArray.upgrade_condition.upgrade.forEach(item => {
        data[item.type] = item;
      });
      dataArray.upgrade_condition.upgrade = [];
      Object.values(upgradeData).forEach(item => {
        // 防止3级出现自身代理等级
        if (dataArray.level === 3 && item === 1) {
          return;
        }
        data[item] && dataArray.upgrade_condition.upgrade.push(data[item]);
      });
    },
    /**
     * 生成upgrade_condition数据
     */
    getNewUpgradeCondition(level) {
      return {
        status: 1,
        upgrade: Object.values(upgradeData)
          .filter(item => {
            // 三级代理去掉自身代理等级设置
            if (level === 3 && item === 1) {
              return false;
            }
            return true;
          })
          .map((item, index) => {
            return {
              type: item,
              value: [5, 6, 9].includes(item)
                ? {
                    distribution_level_id: null,
                    member_count: null
                  }
                : item === 20
                ? 0
                : null,
              logistic: [1, 2].includes(item) ? "and" : "or"
            };
          })
      };
    },
    /**
     * 保存升级数据
     */
    saveUpdateData() {
      if (!this.updateData || !this.checkData()) {
        this.$Message.error("保存失败");
        return;
      }
      this.saveLoading = true;

      let data = this.dealUpdateData();
      this.$httpPost("/shop/admin/agent/upgrade/edit", data, res => {
        this.saveLoading = false;
        if (res.code === 200) {
          this.$Message.success("保存成功");
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    /**
     *  整理需要上传的数据
     */
    dealUpdateData() {
      let data = JSON.parse(JSON.stringify(this.updateData));
      data.agentLevel = data.agentLevel.map(item => {
        item.upgrade_condition = Object.assign({}, item.upgrade_condition);
        let upgrade_condition = item.upgrade_condition;
        // 整理商品列表
        upgrade_condition.product_id = (upgrade_condition.product_list || [])
          .map(item => item.id)
          .join();
        delete upgrade_condition.product_list;
        // 整理商品选项数据
        let dataArray = [];
        let status = false;
        upgrade_condition.upgrade.forEach(item => {
          if ([14, 15, 16, 17].includes(item.type) && item.value) {
            dataArray.push(item);
          }
          if (item.type === 20) {
            status = item.value;
          } else {
            // 清除输入框数值为0的情况
            if (item.value === 0) {
              item.value = null;
            }
            if (item.value && item.value.member_count === 0) {
              item.value.member_count = null;
            }
          }
        });
        // 如果购买全部商品，则把任意商品选项数据清空
        if (status) {
          dataArray.forEach(n => (n.value = null));
        }
        return item;
      });
      return data;
    },
    onCountPeriodChange(val) {
      if (!this.updateData.aftersale_isopen && val === 1) {
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
          this.$set(this.updateData.agentUpgrade, "order_valid_condition", 0);
        });
      }
    },
    onAgentStatusChange(val) {
      if (!val) {
        this.$nextTick(() => {
          this.$set(this.updateData.agentUpgrade, "status", 1);
          this.$Modal.confirm({
            title: "提示",
            content:
              "若关闭了代理的升级功能，系统将不再自动根据设置的条件升级代理等级，只能通过后台手动修改代理的等级，是否确定关闭？",
            onOk: () => {
              this.$set(this.updateData.agentUpgrade, "status", 0);
              this.$refs["formValidateUpdate"].fields.forEach(el => {
                el.validateState = "";
              });
              this.$refs["updateCondition"].forEach(item => {
                item.teamTipShow = false;
                item.productTipShow = false;
              });
            }
          });
        });
      }
    },
    onAddProductClick() {
      this.modalStatus = true;
    },
    onGetProductInfo(val) {
      this.$refs["updateCondition"][this.tabSelect].productTipShow = false;
      this.$set(
        this.updateData.agentLevel[this.tabSelect].upgrade_condition,
        "product_list",
        val.concat(
          this.updateData.agentLevel[this.tabSelect].upgrade_condition
            .product_list || []
        )
      );
    },
    checkData() {
      // 标识验证是否正确
      let status = true;
      if (!this.updateData.agentUpgrade.status) {
        return status;
      }
      this.$refs["formValidateUpdate"].validate(valid => {
        status = valid;
      });
      let errorArray = [];
      this.$refs["updateCondition"].forEach((item, index) => {
        if (this.allowUpdateLevel.includes(index + 1)) {
          // 该代理等级设置是否正确
          let status1 = item.checkData();
          status && (status = status1);
          if (!status1) {
            errorArray.push(index);
          }
        }
      });
      // 如果报错不在当前tab页则定位到报错页
      if (errorArray.length && !errorArray.includes(this.tabSelect)) {
        this.tabSelect = errorArray[0];
      }
      return status;
    }
  }
};
</script>
<style lang="less" scoped>
.agent-setting-update {
  /deep/.ivu-form {
    padding: 24px;
    height: calc(100vh - 122px);
    overflow: auto;
  }
  /deep/.btn-add {
    margin-bottom: 0;
  }
  .agent-setting-status {
    height: 70px;
    padding: 19px 16px;
    border-radius: 5px;
    background: #f8f9fd;
  }
  .ivu-table-wrapper {
    margin-top: 20px;
  }
  .agent-setting-condition {
    &.agent-setting-condition-one {
      /deep/.ivu-tabs {
        .ivu-tabs-bar {
          .ivu-tabs-nav-container {
            .ivu-tabs-tab:nth-child(2) {
              display: inline-block;
            }
          }
        }
      }
    }
    &.agent-setting-condition-two {
      /deep/.ivu-tabs {
        .ivu-tabs-bar {
          .ivu-tabs-nav-container {
            .ivu-tabs-tab:nth-child(3) {
              display: inline-block;
            }
          }
        }
      }
    }
    &.agent-setting-condition-three {
      /deep/.ivu-tabs {
        .ivu-tabs-bar {
          .ivu-tabs-nav-container {
            .ivu-tabs-tab:nth-child(4) {
              display: inline-block;
            }
          }
        }
      }
    }
    /deep/.ivu-tabs {
      width: 900px;
      .ivu-tabs-bar {
        margin-bottom: 0;
        padding-left: 0 !important;
        .ivu-tabs-nav-container {
          height: 40px;
          .ivu-tabs-tab {
            display: none;
            height: 39px;
            padding: 9px 14px;
            &.ivu-tabs-tab-active {
              height: 40px;
              font-weight: bold;
              color: #2c3e50 !important;
            }
          }
        }
      }
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
