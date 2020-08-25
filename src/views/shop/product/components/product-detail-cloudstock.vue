<template>
  <div class="product-detail-cloudstock">
    <Form ref="formValidateCloudstock" :model="value" :rules="ruleValidate" :label-width="100">
      <div class="product-detail-wrapper">
        <div class="product-detail-cloudstock-bar">云仓价格设置</div>
		<FormItem label="云仓订货：">
        <div class="product-detail-item">
          <span class="product-detail-verity" style="margin-right: 10px;display: inline-block;">商品是否参与云仓订货</span>
          <i-switch :true-value="1" :false-value="0" v-model="value.cloud_stock_status">
            <span slot="open">开</span>
            <span slot="close">关</span>
          </i-switch>
        </div>
       </FormItem>
        <FormItem label="云仓价格：" prop="cloudstockCommissionType" :show-message="false">
          <div class="product-detail-item product-detail-item-auto">
            <RadioGroup v-model="value.cloudstockCommissionType">
              <Radio :label="0">
                使用系统云仓折扣
                <a
                  href="javascript:;"
                  @click="onShowHideClick('rewardSystemTableShow')"
                  v-show="value.cloudstockCommissionType === 0"
                >{{rewardSystemTableShow ? '收起': '查看'}}</a>
              </Radio>
              <Radio :label="1">
                自定义云仓价
                <a
                  href="javascript:;"
                  @click="onShowHideClick('rewardCustomTableShow')"
                  v-show="value.cloudstockCommissionType === 1"
                >{{rewardCustomTableShow ? '收起': '编辑'}}</a>
              </Radio>
            </RadioGroup>
            <div style="font-size: 12px;color: rgb(158, 164, 177);line-height: initial;" v-show="rewardCommisionTableShow">*云仓价格=商品销售价x云仓折扣，请按照等级高低设置准确的极差价格，以免造成经销商的经济损失！</div>
          </div>
        </FormItem>
        <FormItem :label="value.multiSpecificationsStatus && rewardCommisionTableShow ? '规格明细：' : ''">
          <div>
            <div v-show="!value.multiSpecificationsStatus && rewardCommisionTableShow">
              
              <cloudstock-table
                ref="cloudstockTable"
                :hasSetting="value.cloudstockCommissionType === 1"
                :dealerConfig="dealerConfig"
                :sku="singleSku"
                :price="simpleAgentPrice"
              ></cloudstock-table>
            </div>
            <div v-show="value.multiSpecificationsStatus && rewardCommisionTableShow">
              <multi-cloudstock-table
                ref="multiCloudstockTable"
                :value="value"
                :commissionType="value.cloudstockCommissionType"
                :dealerConfig="dealerConfig"
                :setArray="setArray"
              ></multi-cloudstock-table>
            </div>
          </div>
        </FormItem>
      </div>
      <div class="product-detail-wrapper">
        <div class="product-detail-cloudstock-bar">
          销售奖设置<span
            class="product-detail-cloudstock-bar-info"
            v-if="
              dealerConfig.dealer_sale_reward_config &&
                !dealerConfig.dealer_sale_reward_config.enable
            "
          >
            <Icon type="md-alert" /><span
              >请前往【经销商设置>销售奖设置】开启后，销售奖返佣才生效。</span
            >
          </span>
        </div>
        <FormItem
          label="销售奖："
          prop="dealerSaleCommissionType"
          :show-message="false"
        >
          <div class="product-detail-item product-detail-item-auto">
            <RadioGroup v-model="value.dealerSaleCommissionType">
              <Radio :label="0">
                使用系统返佣
                <a
                  href="javascript:;"
                  @click="onShowHideClick('saleSystemTableShow')"
                  v-show="value.dealerSaleCommissionType === 0"
                >{{saleSystemTableShow ? '收起': '查看'}}</a>
              </Radio>
              <Radio :label="1">
                自定义返佣
                <a
                  href="javascript:;"
                  @click="onShowHideClick('saleCustomTableShow')"
                  v-show="value.dealerSaleCommissionType === 1"
                >{{saleCustomTableShow ? '收起': '编辑'}}</a>
              </Radio>
              <Radio :label="-1">
                不参与返佣
              </Radio>
            </RadioGroup>
            <div style="font-size: 12px;color: rgb(158, 164, 177);line-height: initial;" v-show="saleCommisionTableShow && value.dealerSaleCommissionType === 1">*自定义销售奖为【0】或为【空】时表示不设销售返佣奖金</div>
          </div>
        </FormItem>
        <FormItem :label="value.multiSpecificationsStatus && saleCommisionTableShow ? '规格明细：' : ''">
          <div>
            <div v-show="!value.multiSpecificationsStatus && saleCommisionTableShow">
              <dealer-sale-table
                :hasSetting="value.dealerSaleCommissionType === 1"
                :dealerConfig="dealerConfig"
                :sku="singleSku"
                :price="simpleAgentPrice"
              />
            </div>
            <div v-show="value.multiSpecificationsStatus && saleCommisionTableShow">
              <multi-dealer-sale-table
                :value="value"
                :commissionType="value.dealerSaleCommissionType"
                :dealerConfig="dealerConfig"
              />
            </div>
          </div>
        </FormItem>
      </div>
    </Form>
  </div>
</template>
<script>
import multiCloudstockTable from "./product-detail-table-multi-cloudstock";
import cloudstockTable from "./product-detail-table-cloudstock";
import dealerSaleTable from "./product-detail-table-dealer-sale";
import multiDealerSaleTable from "./product-detail-table-multi-dealer-sale";

export default {
  components: {
    multiCloudstockTable,
    cloudstockTable,
    dealerSaleTable,
    multiDealerSaleTable
  },
  props: {
    value: {
      type: Object,
      default() {
        return {};
      }
    },
    dealerConfig: {
      type: Object,
      default() {
        return {};
      }
    },
    setArray: {
      required: true
    },
    singleSku: {
      type: Object,
      default() {
        return {};
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
      ruleValidate: {
        cloudstockCommissionType: [
          {
            validator: (rule, value, callback) => {
              if (value !== 1) {
                return callback();
              }
              if (!this.value.multiSpecificationsStatus) {
                if (this.$refs["cloudstockTable"].checkData()) {
                  return callback();
                }
              } else {
                if (this.$refs["multiCloudstockTable"].checkData()) {
                  return callback();
                }
              }
              return callback(new Error(""));
            },
            trigger: "blur"
          }
        ]
      }
    };
  },
  computed: {
    simpleAgentPrice() {
      return typeof this.value.sellPrice === "number" ? this.value.sellPrice : null
    },
    rewardCommisionTableShow() {
      if (
        (!this.value.multiSpecificationsStatus || this.value.skuArray.length) &&
        this.value.cloudstockCommissionType !== -1
      ) {
        if (
          this.value.cloudstockCommissionType === 1 &&
          this.rewardCustomTableShow
        ) {
          return true;
        }
        if (
          this.value.cloudstockCommissionType === 0 &&
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
        this.value.dealerSaleCommissionType !== -1
      ) {
        if (this.value.dealerSaleCommissionType === 1 && this.saleCustomTableShow) {
          return true;
        }
        if (this.value.dealerSaleCommissionType === 0 && this.saleSystemTableShow) {
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
    }
  },
  methods: {
    // 单规格显示表格
    onShowHideClick(key) {
      this[key] = !this[key];
    }
  }
};
</script>
<style lang="less" scoped>
.product-detail-cloudstock {
  // padding: 24px 0;
  .product-detail-wrapper{
    margin-bottom:20px;
    // padding-bottom:4px;
    .product-detail-cloudstock-bar {
      height: 50px;
      line-height: 50px;
      padding-left: 12px;
      font-weight: bold;
      background-color: #f3f3f3;
      border-radius: 4px;
      .product-detail-cloudstock-bar-info {
        display: inline;
        margin-left: 16px;
        i {
          font-size: 16px;
          color: #FF9900;
          margin-right: 10px;
          margin-top: -1px;
        }
        span {
          color: #464C5B;
          font-size: 12px;
          vertical-align: middle;
        }
      }
    }
  }
  
}
</style>
