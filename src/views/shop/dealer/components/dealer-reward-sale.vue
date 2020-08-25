<template>
  <div v-if="recommendData" style="padding-bottom: 50px">
    <div class="dealer-reward-recommend-content">
      <warning-alert>
        <div>
          <p>
            1.关系绑定说明：A→B，A是B的直接推荐人。如果A是经销商，当B成为经销商时，A就是B的经销商推荐人；如果A不是经销商，当B成为经销商时，B就没有经销商推荐人；如果A还不是经销商，当B成为经销商时后，A才发展成为经销商，这时A重新成为B的经销商推荐人。
          </p>
          <p>
            2.A→B，A是B的经销商推荐人。平级销售奖：A等级=B等级，当B下云仓进货订单时，A能拿到平级销售奖。越级销售奖：B等级＞A等级；当B下云仓进货订单时，A能拿到越级销售奖。
          </p>
          <p>
            3.销售奖金的计算基准以【商品实付金额】计算；奖金=商品实付金额*返佣比例
          </p>
        </div>
      </warning-alert>
      <Form :label-width="140">
        <switch-titlebar
          style="margin-bottom: 20px;"
          v-model="recommendData.enable"
          title="是否开启销售奖功能"
          @on-change="onAgentStatusChange"
        />
        <FormItem label="奖金支付：" v-show="recommendData.enable">
          <RadioGroup v-model="recommendData.payer">
            <Radio :label="0">公司支付</Radio>
            <Radio :label="1">被推荐人上级领导支付</Radio>
          </RadioGroup>
          <more-message
            :maxWidth="350"
            :text="'即当被推荐人上级是公司时，则由公司支付奖\n金；当是经销商时，则由经销商支付奖金。'"
          ></more-message>
        </FormItem>
        <FormItem label="公司审核：" v-show="recommendData.enable">
          <RadioGroup v-model="recommendData.auto_check">
            <Radio :label="1">自动审核通过</Radio>
            <Radio :label="0">手动审核</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem
          label="奖金设置："
          v-show="recommendData.enable"
        >
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
const levelText = ["平级奖", "越级奖"];
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
          title: "销售奖类别",
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              params.row.target.map(item =>
                h(
                  "p",
                  item.weight > params.row.weight
                    ? levelText[1]
                    : levelText[0]
                )
              )
            );
          }
        },
        {
          title: "推荐人获取订单返佣(%)",
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              params.row.target.map(item =>
                h("p", [
                  h("InputNumber", {
                    props: {
                      precision: 3,
                      min: 0,
                      max: 100,
                      value: (() => {
                        let value = this.recommendData.reward_rule[
                          params.row.id + "-" + item.id
                        ];
                        return value
                          ? typeof value.commission === "string"
                            ? Number(value.commission)
                            : value.commission
                          : null;
                      })()
                    },
                    class: "common-input-text-140",
                    on: {
                      "on-change": val => {
                        this.$set(
                          this.recommendData.reward_rule,
                          params.row.id + "-" + item.id,
                          { commission: val }
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
            target: this.dealerLevelList.filter(n => n.weight >= item.weight).map(item1 => ({
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
        this.$httpGet("/shop/admin/dealer/sale/setting/info", null, res => {
          if (res.code === 200) {
            resolve();
            this.recommendData = res.data;
            if (
              Object.prototype.toString.call(this.recommendData.reward_rule) ===
              "[object Array]"
            ) {
              this.recommendData.reward_rule = {};
            }
          } else {
            reject(res.msg);
          }
        });
      });
    },
    saveRecommondData() {
      if (!this.recommendData) {
        this.$Message.error("保存失败");
        return;
      }
      this.saveLoading = true;
      this.$httpPost(
        "/shop/admin/dealer/sale/setting/save",
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
              "若关闭了销售奖功能，不会影响已经产生的订单销售奖；经销商下单后不会产生新的销售返佣奖金，是否确定关闭？",
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
