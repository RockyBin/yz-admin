<template>
  <div class="mall-container">
    <thirdMenu :list="thirdMenu"/>
    <div class="container">
      <Tabs v-model="currentTab" :animated="false">
        <TabPane v-for="tapItem in tapList" :key="tapItem.name" :name="tapItem.name" :label="tapItem.label">
          <alert-warning>
            <p>自定义名称的替换仅影响客户端，当不设置时展示默认名称。</p>
          </alert-warning>
          <Form class="word-list" :label-width="160">
            <div class="word-item-container">
              <div class="word-item-container-left">
                <FormItem v-for="(groupItem, groupItemIndex) in tapItem.groupList" :key="groupItemIndex" :label="groupItem.label + '：'" class="word-item">
                  <Input v-model="formData[groupItem.name].value" :placeholder="formData[groupItem.name].default"
                        :maxlength="groupItem.maxLength" class="common-input-text-210">
                    <span slot="suffix">{{(formData[groupItem.name].value + '').length}}/{{groupItem.maxLength}}</span>
                  </Input>
                  <span v-if="!formData[groupItem.name]">{{groupItem.name}}</span>
                </FormItem>
              </div>
              <div class="word-item-container-right">
                <div class="case-container">
                  <div class="case-title">示例图：</div>
                  <div class="case-list">
                    <span class="case-item" v-for="(caseItem, caseItemIndex) in tapItem.caseList" :key="caseItemIndex">
                      <img :src="caseItem" class="case-item-image" :class="{'case-item-split':caseItemIndex>0}">
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Form>
        </TabPane>
      </Tabs>
      <div class="footer">
        <Button shape="circle" type="primary" @click="onSaveStart" perm="word.operate">保存并启用</Button>
      </div>
    </div>
  </div>
</template>
<script>
import footButton from "COMPONENTS/button/foot-button.vue";
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import thirdMenuData from "./components/third-menu-for-setting-mall";
import alertWarning from "@/views/shop/components/alert/alert-warning.vue"
export default {
  components: {
    footButton,
    thirdMenu,
    alertWarning
  },
  data() {
    return {
      thirdMenu: [],
      formKeys: [
        "balance",
        "commission",
        "coupon",
        "distributor",
        "distribution",
        "member",
        "point",
        "my_balance",
        "my_point",
        "my_distribution",
        "my_commission",
        "my_team",
        "my_distributor",
        "my_member",
        "distribution_center",
        "commission_balance",
        "commission_history",
        "commission_blocked",
        "commission_invalid",
        "commission_withdraw_ing",
        "team_member_level_1",
        "team_member_level_2",
        "team_member_level_3",
        "team_distributor_level_1",
        "team_distributor_level_2",
        "team_distributor_level_3",
        "team_level_1",
        "team_level_2",
        "team_level_3",
        "team_info_level_1",
        "team_info_level_2",
        "team_info_level_3",
        "team_info",
        "team_info_self_purchase",
        "agent_reward",
        "team_agent_reward",
        "my_agent_reward",
        "agent_reward_balance",
        "agent_reward_history",
        "agent_reward_blocked",
        "agent_reward_invalid",
        "agent_reward_withdraw_ing",
        "team_agent",
        "team_agent_member",
        "my_team_agent",
        "team_agent_level_1",
        "team_agent_level_2",
        "team_agent_level_3",
        "team_agent_performance",
        "team_agent_sale_reward",
        "team_agent_recommend_reward",
        "team_agent_performance_reward",
      ],
      formData: {},
      currentTab: "member",
      agentModule: {
        name: "agent",
        label: "代理模块",
        caseList: [
          "images/word/case_agent_1.png",
          "images/word/case_agent_2.png"
        ],
        groupList: [
          {
            label: "代理中心",
            name: "team_agent_reward",
            maxLength: 6
          },
          {
            label: "我的分红",
            name: "my_agent_reward",
            maxLength: 6
          },
          {
            label: "可提现分红",
            name: "agent_reward_balance",
            maxLength: 6
          },
          {
            label: "累计到账分红",
            name: "agent_reward_history",
            maxLength: 6
          },
          {
            label: "预计到账分红",
            name: "agent_reward_blocked",
            maxLength: 6
          },
          {
            label: "无效分红",
            name: "agent_reward_invalid",
            maxLength: 6
          },
          {
            label: "提现中",
            name: "agent_reward_withdraw_ing",
            maxLength: 6
          },
          {
            label: "分红",
            name: "agent_reward",
            maxLength: 2
          },
          {
            label: "团队成员",
            name: "my_team_agent",
            maxLength: 6
          },
          {
            label: "一级代理",
            name: "team_agent_level_1",
            maxLength: 6
          },
          {
            label: "二级代理",
            name: "team_agent_level_2",
            maxLength: 6
          },
          {
            label: "三级代理",
            name: "team_agent_level_3",
            maxLength: 6
          },
          {
            label: "成员",
            name: "team_agent_member",
            maxLength: 4
          },
          {
            label: "代理",
            name: "team_agent",
            maxLength: 4
          },
          {
            label: "团队业绩",
            name: "team_agent_performance",
            maxLength: 6
          },
          {
            label: "销售奖",
            name: "team_agent_sale_reward",
            maxLength: 6
          },
          {
            label: "推荐奖",
            name: "team_agent_recommend_reward",
            maxLength: 6
          },
          {
            label: "业绩奖",
            name: "team_agent_performance_reward",
            maxLength: 6
          },
        ]
      },
      distributionModule:{
        name: "distribution",
        label: "分销模块",
        caseList: [
          "images/word/case_distribution_1.png",
          "images/word/case_distribution_2.png"
        ],
        groupList: [
          {
            label: "分销中心",
            name: "distribution_center",
            maxLength: 6
          },
          {
            label: "我的佣金",
            name: "my_commission",
            maxLength: 6
          },
          {
            label: "可提现佣金",
            name: "commission_balance",
            maxLength: 6
          },
          {
            label: "累计到账佣金",
            name: "commission_history",
            maxLength: 6
          },
          {
            label: "预计到账佣金",
            name: "commission_blocked",
            maxLength: 6
          },
          {
            label: "无效佣金",
            name: "commission_invalid",
            maxLength: 6
          },
          {
            label: "提现中",
            name: "commission_withdraw_ing",
            maxLength: 6
          },
          {
            label: "佣金",
            name: "commission",
            maxLength: 2
          },
          {
            label: "我的团队",
            name: "my_team",
            maxLength: 6
          },
          {
            label: "我的分销商",
            name: "my_distributor",
            maxLength: 6
          },
          {
            label: "分销商",
            name: "distributor",
            maxLength: 4
          },
          {
            label: "分销",
            name: "distribution",
            maxLength: 4
          },
          {
            label: "我的会员",
            name: "my_member",
            maxLength: 6
          },
          {
            label: "会员",
            name: "member",
            maxLength: 4
          },
          {
            label: "一级分销商",
            name: "team_distributor_level_1",
            maxLength: 6
          },
          {
            label: "二级分销商",
            name: "team_distributor_level_2",
            maxLength: 6
          },
          {
            label: "三级分销商",
            name: "team_distributor_level_3",
            maxLength: 6
          },
          {
            label: "一级会员",
            name: "team_member_level_1",
            maxLength: 6
          },
          {
            label: "二级会员",
            name: "team_member_level_2",
            maxLength: 6
          },
          {
            label: "三级会员",
            name: "team_member_level_3",
            maxLength: 6
          },
          {
            label: "一级分销团队",
            name: "team_level_1",
            maxLength: 6
          },
          {
            label: "二级分销团队",
            name: "team_level_2",
            maxLength: 6
          },
          {
            label: "三级分销团队",
            name: "team_level_3",
            maxLength: 6
          },
          {
            label: "一级分销情况",
            name: "team_info_level_1",
            maxLength: 6
          },
          {
            label: "二级分销情况",
            name: "team_info_level_2",
            maxLength: 6
          },
          {
            label: "三级分销情况",
            name: "team_info_level_3",
            maxLength: 6
          },
          {
            label: "团队情况",
            name: "team_info",
            maxLength: 6
          },
          {
            label: "自购分销情况",
            name: "team_info_self_purchase",
            maxLength: 6
          }
        ]
      },
      tapList: [
        {
          name: "member",
          label: "会员模块",
          caseList: [
            "images/word/case_member_1.png",
            "images/word/case_member_2.png"
          ],
          groupList: [
            {
              label: "我的余额",
              name: "my_balance",
              maxLength: 6
            },
            {
              label: "余额",
              name: "balance",
              maxLength: 4
            },
            {
              label: "我的积分",
              name: "my_point",
              maxLength: 6
            },
            {
              label: "优惠券",
              name: "coupon",
              maxLength: 4
            }
          ]
        },
        {
          name: "market",
          label: "营销工具",
          caseList: [
            "images/word/case_market_1.png",
            "images/word/case_market_2.png"
          ],
          groupList: [
            {
              label: "我的积分",
              name: "my_point",
              maxLength: 6
            },
            {
              label: "积分",
              name: "point",
              maxLength: 4
            },
            {
              label: "优惠券",
              name: "coupon",
              maxLength: 4
            }
          ]
        }
      ]
    };
  },
  methods: {
    // 初始化数据
    init() {
      // 加载菜单
      this.thirdMenu = thirdMenuData.getThirdMenu();
      // 舒适化数据结构
      let formDataList = {};
      for (let index in this.formKeys) {
        formDataList[this.formKeys[index]] = {
          value: "",
          default: ""
        };
      }
      this.formData = formDataList;
    },
    // 获取数据
    getData() {
      this.$store.state.COMMON_loading = true;
      this.$httpGet("/shop/admin/word/info", "", res => {
        this.$store.state.COMMON_loading = false;
        if (res.code === 200) {
          let formDataList = res.data.lang.cn["shop-front"];
          for (let key in formDataList) {
            if (this.formData.hasOwnProperty(key)) {
              this.formData[key].value = formDataList[key].value;
              this.formData[key].default = formDataList[key].default;
            }
          }
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    // 提交数据
    onSaveStart() {
      if (!this.$store.state.COMMON_loading) {
        let dataSubmit = {};
        for (let key in this.formData) {
          dataSubmit[key] = this.formData[key].value;
        }
        this.$store.state.COMMON_loading = true;
        this.$httpGet("/shop/admin/word/save", dataSubmit, res => {
          this.$store.state.COMMON_loading = false;
          if (res.code === 200) {
            this.$Message.success("保存成功");
            this.getData();
          } else {
            this.$Message.error("保存失败");
          }
        });
      }
    }
  },
  created() {
    this.init();
    
    if (this.hasLicensePerm('ENABLE_DISTRIBUTION')) {
      this.tapList.splice(1, 0, this.distributionModule);
      this.tapList[0].groupList.push({
        label: "分销中心",
        name: "distribution_center",
        maxLength: 6
      })
    }
    if (this.hasLicensePerm('ENABLE_AGENT')) {
      this.tapList.splice(2, 0, this.agentModule);
      this.tapList[0].groupList.push({
        label: "代理中心",
        name: "team_agent_reward",
        maxLength: 6
      })
    }
  },
  mounted() {
    this.getData();
  }
};
</script>
<style lang="less" scoped>
.mall-container {
  position: absolute;
  width: 100%;
  background: #f2f4fd;
  display: flex;
  .container {
    background: white;
    overflow-y: auto;
    flex: 1;
    .margin-select-bottom-form {
      margin-bottom: 14px;
    }
    .word-list {
      .word-item-container {
        display: flex;
        .word-item-container-left {
          .word-item {
            .multiple-item {
              margin-top: 12px;
            }
          }
        }
        .word-item-container-right {
          flex: 1;
          min-width: 675px;
          .case-container {
            padding: 20px 40px 30px 40px;
            margin-left: 50px;
            border: 1px solid #e5e5e5;
            background-color: #f9fbfd;
            .case-title {
              font-size: 14px;
              font-weight: bold;
              color: #464c5b;
              letter-spacing: 1px;
            }
            .case-list {
              margin-top: 20px;
              .case-item {
                .case-item-split {
                  margin-left: 40px;
                }
                .case-item-image {
                  width: 250px;
                }
              }
            }
          }
        }
      }
    }
    /deep/.ivu-tabs {
      height: calc(100vh - 120px);
      overflow: auto;
      .ivu-tabs-bar {
        padding-left: 24px;
      }
      .ivu-tabs-content {
        padding: 24px;
      }
    }
    
    /deep/ .ivu-input-suffix {
      right: 5px;
      line-height: 32px;
    }
    /deep/ .ivu-alert {
      margin-bottom: 24px;
    }
    // /deep/ .ivu-alert-warning {
    //   padding: 18px 58px;
    // }
    // /deep/ .ivu-alert-icon {
    //   left: 25px;
    //   top: 22px;
    //   .ivu-icon {
    //     font-size: 18px;
    //   }
    // }
    // /deep/ .ivu-alert-message {
    //   font-size: 13px;
    //   line-height: 25px;
    // }
  }
}
.footer{
  height: 50px;
  line-height: 50px;
  text-align: center;
  border-top: 1px solid #eee;
  background: white;
  button{
    width: 100px;
  }
}
</style>