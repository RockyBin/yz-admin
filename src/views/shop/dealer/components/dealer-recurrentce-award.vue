<template>
  <div v-if="recurrentData.site_id" style="padding-bottom: 50px">
    <div class="dealer-reward-recommend-content">
      <warning-alert>
        <div>
          <p>
           订货返现奖说明：
          </p>
          <p>
            1.订货返现奖：指经销商自己下云仓订单时，得到的返现金额，奖金返到经销商资金账户/余额账户。
          </p>
          <p>
            2. 奖金的计算基准以【商品实付金额】计算；奖金=商品实付金额*返现比例。
          </p>
        </div>
      </warning-alert>
      <Form :label-width="140">
        <switch-titlebar
          style="margin-bottom: 20px;"
          v-model="recurrentData.enable"
          title="是否开启订货返现奖功能"
          @on-change="onAgentStatusChange"
        />
        <FormItem label="返现奖金支付：" v-show="recurrentData.enable">
          <div>
            <span>公司支付</span>
          </div>
        </FormItem>
        <FormItem label="奖金发放对象：" v-show="recurrentData.enable">
          <div>
            <span>直接对接公司/从公司直接拿货的经销商</span>
          </div>
        </FormItem>
        <FormItem label="公司审核：" v-show="recurrentData.enable">
          <RadioGroup v-model="recurrentData.auto_check">
            <Radio :label="1">自动审核通过</Radio>
            <Radio :label="0">手动审核</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="奖金发放到：" v-show="recurrentData.enable">
          <RadioGroup v-model="recurrentData.auto_check">
            <Radio :label="1">经销商资金账户</Radio>
            <Radio :label="0">会员余额账户</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="奖金设置：" v-show="recurrentData.enable">
          <div style="width: 700px;" class="dealer-reward-table">
            <common-table
              :hasBorder="true"
              type="border"
              :columnsData="columnsData"
              :listData="recurrentData.reward_rule"
            ></common-table>
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
// import moreMessage from "@/views/shop/components/more-message/more-message.vue";
// 初始数据
export default {
  components: {
    warningAlert,
    commonTable,
    switchTitlebar
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
      recurrentData: {
        reward_rule:[],
        enable: 0,
        auto_check: 0,
        payer: 0,
        site_id: ''
      },
      columnsData: [
        {
          title: "经销商等级",
          key: "levelName",
          render: (h, params) => {
                return h("div",{
                  style:{
                    paddingLeft: '15px'
                  }
                },[
                   params.row.is_hide ? h("div",{style:{
                        display:"inline-block",
                        width:"12px",
                        height:"12px",
                        marginRight:"6px",
                        "border-bottom":"1px solid #ccc",
                        "border-left":"1px solid #ccc"
                    }}) : '',
                    h("span",params.row.name)
                ])
            }
        },
        {
          title: "首购-返现奖金(%)",
          align: "center",
          width:260,
          render: (h, params) => {
            return h(
              "InputNumber",
                {
                    props:{
                        min: 0,
                        max: 100,
                        precision:3,
                        value: params.row.first_rate === 0 ? null : params.row.first_rate
                    },
                    on:{
                      input:(value)=> {
                        this.recurrentData.reward_rule[params.index].first_rate = value === 0 || value == null ? null : value
                      }
                    },
                    style: {
                        width:"232px"
                    }
                }
            );
          }
        },
        {
          title: "复购-返现奖金(%)",
          align: "center",
          width:260,
          render: (h, params) => {
            return h(
                  "InputNumber",
                    {
                        props:{
                            min: 0,
                            max: 100,
                            precision:3,
                            value: params.row.rate === 0 ? null : params.row.rate
                        },
                         on:{
                          input:(value)=> {
                            this.recurrentData.reward_rule[params.index].rate = value === 0 || value == null ? null : value
                          }
                        },
                        style: {
                            width:"232px"
                        }
                    }
            );
          }
        }
      ]
    };
  },
  created() {
    this.$store.state.COMMON_loading = true;
    this.getRewardRecommondInfo()
  },
  methods: {
    /**
     * 获取返现奖设置数据
     */
    getRewardRecommondInfo() {
      return new Promise((resolve, reject) => {
        this.$httpGet(
          "/shop/admin/dealer/order/setting/info",
          null,
          res => {
            this.$store.state.COMMON_loading = false;
            if (res.code === 200) {
              resolve();
              this.recurrentData = res.data;
            } else {
              reject(res.msg);
            }
          }
        );
      });
    },
    saveRecommondData() {
      this.saveLoading = true;
      this.$httpPost(
        "/shop/admin/dealer/order/setting/save",
        this.recurrentData,
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
          this.$set(this.recurrentData, "enable", 1);
          this.$Modal.confirm({
            title: "提示",
            content:
              "若关闭了订货返现奖功能，不会影响已经产生的订货返现奖；经销商下单后不会产生新的订货返现奖金，是否确定关闭？",
            onOk: () => {
              this.$set(this.recurrentData, "enable", 0);
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
