<template>
  <div v-if="recommendData" style="padding-bottom: 50px">
    <div class="agent-reward-recommend-content">
      <warning-alert>
        <div>
          <p>1.绑定关系：A→B，A是B的直接推荐人。如果A是代理，当B成为代理时，A就是B的代理推荐人，且推荐奖的推荐人只能有一个；如果A不是代理，当B成为代理时，B没有代理推荐人。</p>
          <p>2.推荐奖：代理的直接下级，由会员升级为代理或是由低等级升到高等级时，之前的代理可能获取不到这条线的代理分红了，作为弥补，给之前的代理发放一笔一次性的推荐奖金；通过审核后将奖金发放到代理分红资金池。</p>
          <p>3.只有直接的代理推荐人才可以拿到推荐奖，间接的拿不到推荐奖，如：A→B→C→D，A是一级代理，B是二级代理，C是三级代理，D是会员；当D成为代理后，只有C（直接代理）能拿推荐奖，A,B拿不到。</p>
        </div>
      </warning-alert>
      <Form
        ref="formValidateRecommend"
        :label-width="140"
        :model="recommendData"
        :rules="ruleValidateRecommend"
      >
        <switch-titlebar
          style="margin-bottom: 20px;"
          v-model="recommendData.enable"
          title="是否开启推荐奖功能"
          :tipShow="!recommendData.baseSetting && recommendData.enable"
          tipText="请前往【代理设置>基础设置】开启团队分红功能后，推荐奖功能才生效。"
          @on-change="onAgentStatusChange"
        />
        <FormItem label="推荐奖金审核：" v-show="recommendData.enable">
          <RadioGroup v-model="recommendData.auto_check">
            <Radio :label="1">自动审核</Radio>
            <Radio :label="0">手动审核</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="奖金设置：" prop="commision" v-show="recommendData.enable">
          <div style="width: 700px;" class="agent-reward-table">
            <common-table
              :hasBorder="true"
              type="border"
              :columnsData="columnsData"
              :listData="agentList"
            ></common-table>
          </div>
          <div v-show="tipShow" class="agent-reward-recommend-tip">请输入获取奖金</div>
        </FormItem>
      </Form>
    </div>
    <!-- <foot-button
      @onSaveClick="saveRecommondData"
      :loading="saveLoading"
      perm="agent.config.operate"
    ></foot-button> -->
    <div class="footer">
      <Button
        type="primary"
        shape="circle"
        @click="saveRecommondData"
        :loading="saveLoading"
        perm="agent.config.operate"
      >保存</Button>
    </div>
  </div>
</template>
<script>
import warningAlert from "@/views/shop/components/alert/alert-warning";
import footButton from "@/views/shop/components/button/foot-button.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
// 初始数据
const levelTextName = ["一级代理", "二级代理", "三级代理"];
const levelName = ["low_level", "same_level", "normal"];
// 推荐和被推荐对应的等级关系
const lowerLevel = [[1, 2], [1, 3], [2, 3]];
const equalLevel = [[1, 1], [2, 2], [3, 3]];
const higherLevel = [[2, 1], [3, 2], [3, 1]];
const levelArray = [lowerLevel, equalLevel, higherLevel];
/**
 * 生成表格显示文字
 */
const createLevelText = index => {
  return {
    recommender1: levelTextName[levelArray[index][0][0] - 1],
    recommender2: levelTextName[levelArray[index][1][0] - 1],
    recommender3: levelTextName[levelArray[index][2][0] - 1],
    recommendee1: levelTextName[levelArray[index][0][1] - 1],
    recommendee2: levelTextName[levelArray[index][1][1] - 1],
    recommendee3: levelTextName[levelArray[index][2][1] - 1]
  };
};
export default {
  components: {
    warningAlert,
    commonTable,
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
      recommendData: null,
      columnsData: [
        {
          title: "推荐奖",
          align: "center",
          key: "name"
        },
        {
          title: "推荐人等级",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h("p", params.row.recommender1),
              h("p", params.row.recommender2),
              h("p", params.row.recommender3)
            ]);
          }
        },
        {
          title: "被推荐人等级",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h("p", params.row.recommendee1),
              h("p", params.row.recommendee2),
              h("p", params.row.recommendee3)
            ]);
          }
        },
        {
          title: "推荐人获取奖金(元)",
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              levelArray[params.index].map(item =>
                h(
                  "p",
                  {
                    class: {
                      "ivu-form-item-error": this.errorTip[
                        levelName[params.index] + "_" + item.join("_")
                      ]
                    }
                  },
                  [
                    h("InputNumber", {
                      props: {
                        precision: 2,
                        min: 0,
                        max: 9999999,
                        value: (() => {
                          let value = this.recommendData.commision[
                            levelName[params.index] + "_" + item.join("_")
                          ];
                          return value
                            ? typeof value.reward === "string"
                              ? Number(value.reward)
                              : value.reward
                            : null;
                        })()
                      },
                      class: "common-input-text-140",
                      on: {
                        "on-change": val => {
                          this.$set(
                            this.recommendData.commision,
                            levelName[params.index] + "_" + item.join("_"),
                            { reward: val }
                          );
                        }
                      }
                    })
                  ]
                )
              )
            );
          }
        }
      ],
      agentList: [
        {
          name: "下级推荐奖",
          ...createLevelText(0)
        },
        {
          name: "平级推荐奖",
          ...createLevelText(1)
        },
        {
          name: "越级推荐奖",
          ...createLevelText(2)
        }
      ],
      errorTip: {},
      tipShow: false,
      ruleValidateRecommend: {
        commision: [
          {
            required: true,
            trigger: "blur",
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
    Promise.all([this.getRewardRecommondInfo()])
      .catch(e => {
        this.$Message.error(e);
      })
      .finally(() => {
        this.$store.state.COMMON_loading = false;
      });
  },
  methods: {
    /**
     * 获取推荐奖设置数据
     */
    getRewardRecommondInfo() {
      return new Promise((resolve, reject) => {
        this.$httpGet("/shop/admin/agent/recommend/setting/info", null, res => {
          if (res.code === 200) {
            let data = res.data;
            if (!data.commision) {
              data.commision = {};
            }
            resolve();
            this.recommendData = res.data;
          } else {
            reject(res.msg);
          }
        });
      });
    },
    saveRecommondData() {
      if (!this.recommendData || !this.checkData()) {
        this.$Message.error("保存失败");
        return;
      }
      this.saveLoading = true;
      this.$httpPost(
        "/shop/admin/agent/recommend/setting/save",
        this.recommendData,
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
          this.$set(this.recommendData, "enable", 1);
          this.enableAgent = true;
          this.$Modal.confirm({
            title: "提示",
            content:
              "若关闭了代理的推荐奖功能，不会影响已经产生推荐奖，代理等级发生变化时将不会再产生新的推荐奖金，是否确定关闭？",
            onOk: () => {
              this.$set(this.recommendData, "enable", 0);
              this.tipShow = false;
            }
          });
        });
      }
    },
    checkData() {
      let status = true;
      if (!this.recommendData.enable) {
        return status;
      }
      levelArray.forEach((item, index) => {
        item.forEach(item1 => {
          let valueStatus =
            this.recommendData.commision[
              levelName[index] + "_" + item1.join("_")
            ] &&
            this.recommendData.commision[
              levelName[index] + "_" + item1.join("_")
            ].reward !== null;
          status && (status = valueStatus);
          // 报错检测
          this.$set(
            this.errorTip,
            levelName[index] + "_" + item1.join("_"),
            !valueStatus
          );
        });
      });
      this.tipShow = !status;
      return status;
    }
  }
};
</script>
<style lang="less" scoped>
.agent-reward-recommend-content {
  padding: 24px;
  /*height: calc(100vh - 120px);*/
  overflow: auto;
  /deep/.ivu-alert-warning {
    margin-bottom: 24px;
  }
  /deep/.ivu-form-item:last-child{
    margin-bottom:0 !important;
  }
  .agent-reward-table {
    /deep/.ivu-table-tbody {
      .ivu-table-cell {
        padding: 0;
        p {
          line-height: 48px;
          & + p {
            border-top: 1px solid #e8eaec;
          }
        }
      }
    }
  }
}
.agent-reward-recommend-tip {
  position: absolute;
  color: #f13500;
  font-size: 12px;
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
