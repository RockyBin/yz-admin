<template>
  <div v-if="recommendData" style="padding-bottom: 50px">
    <div class="dealer-reward-recommend-content">
      <warning-alert>
        <div>
          <p>
            1.绑定关系：A→B，A是B的直接推荐人。如果A是经销商，当B成为经销商时，A就是B的经销商推荐人，且推荐奖的推荐人只能有一个；如果A不是经销商，当B成为经销商时，B没有经销商推荐人。
          </p>
          <p>
            2.推荐奖：经销商的直推下级经销商升级后，之前的经销商可能获取不到这条线的订货差价了，作为弥补，给之前的经销商发放一笔一次性的推荐奖金。
          </p>
          <p>
            3.只有直接的经销商推荐人才可以拿到推荐奖，间接的拿不到推荐奖，如：A→B→C→D，A是高级经销商，B是中级经销商，C是低级经销商，D是会员；当D成为经销商后，只有C（直接推荐人）能拿推荐奖，A,B拿不到。
          </p>
        </div>
      </warning-alert>
      <Form :label-width="140">
        <switch-titlebar
          style="margin-bottom: 20px;"
          v-model="recommendData.enable"
          title="是否开启推荐奖功能"
          @on-change="onAgentStatusChange"
        />
        <FormItem label="平级/越级奖支付：" v-show="recommendData.enable">
          <RadioGroup v-model="recommendData.same_reward_payer">
            <Radio :label="0">公司支付</Radio>
            <Radio :label="1">被推荐人上级领导支付</Radio>
          </RadioGroup>
          <more-message
            :maxWidth="350"
            :text="
              '即当被推荐人上级是公司时，则由公司支付\n奖金；当是经销商时，则由经销商支付奖金。'
            "
          ></more-message>
        </FormItem>
        <FormItem label="下级奖金支付：" v-show="recommendData.enable">
          <div>
            <span>公司支付</span>
          </div>
        </FormItem>
        <FormItem label="公司审核：" v-show="recommendData.enable">
          <RadioGroup v-model="recommendData.auto_check">
            <Radio :label="1">自动审核通过</Radio>
            <Radio :label="0">手动审核</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="奖金设置：" v-show="recommendData.enable">
          <div style="width: 700px;" class="dealer-reward-table">
            <common-table
              :hasBorder="true"
              type="border"
              :columnsData="columnsData"
              :listData="dealerList"
            ></common-table>
          </div>
          <div v-show="tipShow" class="dealer-reward-recommend-tip">
            请输入获取奖金
          </div>
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
        perm="dealer.config.operate"
        >保存</Button
      >
    </div>
  </div>
</template>
<script>
import warningAlert from "@/views/shop/components/alert/alert-warning";
import commonTable from "@/views/shop/components/table/common-table.vue";
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
// 初始数据
const levelText = ["下级奖", "平级奖", "越级奖"];
export default {
  components: {
    warningAlert,
    commonTable,
    switchTitlebar,
    moreMessage
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
      dealerLevelList: [],
      columnsData: [
        {
          title: "推荐人等级",
          align: "center",
          key: "levelName"
        },
        {
          title: "被推荐人等级",
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              params.row.target.map(item => h("p", item.levelName))
            );
          }
        },
        {
          title: "推荐奖类别",
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              params.row.target.map(item =>
                h(
                  "p",
                  item.weight > params.row.weight
                    ? levelText[2]
                    : item.weight === params.row.weight
                    ? levelText[1]
                    : levelText[0]
                )
              )
            );
          }
        },
        {
          title: "推荐人获取奖金(元)",
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              params.row.target.map(item =>
                h("p", [
                  h("InputNumber", {
                    props: {
                      precision: 2,
                      min: 0,
                      max: 9999999.99,
                      value: (() => {
                        let value = this.recommendData.reward_rule[
                          params.row.id + "-" + item.id
                        ];
                        return value
                          ? typeof value.money === "string"
                            ? Number(value.money)
                            : value.money
                          : null;
                      })()
                    },
                    class: "common-input-text-140",
                    on: {
                      "on-change": val => {
                        this.$set(
                          this.recommendData.reward_rule,
                          params.row.id + "-" + item.id,
                          { money: val }
                        );
                      }
                    }
                  })
                ])
              )
            );
          }
        }
      ],
      dealerList: [],
      tipShow: false
    };
  },
  created() {
    this.$store.state.COMMON_loading = true;
    Promise.all([this.getRewardRecommondInfo(), this.getDealerLevelList()])
      .then(() => {
        this.dealerList = this.dealerLevelList.map(item => {
          return {
            id: item.id,
            levelName: item.name,
            weight: item.weight,
            target: this.dealerLevelList.map(item1 => ({
              id: item1.id,
              levelName: item1.name,
              weight: item1.weight,
              value: null
            }))
          };
        });
      })
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
            this.dealerLevelList = res.data.list || [];
          } else {
            reject(res.msg);
          }
        });
      });
    },
    /**
     * 获取推荐奖设置数据
     */
    getRewardRecommondInfo() {
      return new Promise((resolve, reject) => {
        this.$httpGet(
          "/shop/admin/dealer/recommend/setting/info",
          null,
          res => {
            if (res.code === 200) {
              resolve();
              this.recommendData = res.data;
              if (
                Object.prototype.toString.call(
                  this.recommendData.reward_rule
                ) === "[object Array]"
              ) {
                this.recommendData.reward_rule = {};
              }
            } else {
              reject(res.msg);
            }
          }
        );
      });
    },
    saveRecommondData() {
      if (!this.recommendData) {
        this.$Message.error("保存失败");
        return;
      }
      this.saveLoading = true;
      this.$httpPost(
        "/shop/admin/dealer/recommend/setting/save",
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
              "若关闭了推荐奖功能，不会影响已经产生的推荐奖；经销商升级后将不会产生新的推荐奖金，是否确定关闭？",
            onOk: () => {
              this.$set(this.recommendData, "enable", 0);
              this.tipShow = false;
            }
          });
        });
      }
    }
  }
};
</script>
<style lang="less" scoped>
.dealer-reward-recommend-content {
  padding: 24px;
  /*height: calc(100vh - 120px);*/
  overflow: auto;
  /deep/.ivu-alert-warning {
    margin-bottom: 24px;
  }
  /deep/.ivu-radio-wrapper {
    margin-right: 20px;
  }
  /deep/.ivu-form-item:last-child {
    margin-bottom: 0 !important;
  }
  .dealer-reward-table {
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
.dealer-reward-recommend-tip {
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
