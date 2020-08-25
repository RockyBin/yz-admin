<template>
  <div class="supplier-base-setting">
    <alert-warning title="供应商模式：" style="margin-bottom:24px;">
      <p>1. 供应商和平台形成合作关系后，供应商的商品在平台进行售卖，商品的售卖价格和成本价由平台决定，供应商与平台按商品的供货价进行结算。</p>
      <p>2. 供应商商品涉及到商品的分佣（例如分销分佣、代理分红、区域返佣）和商品的优惠（比如：会员价、优惠券、积分）等，都由平台承担；平台一旦开启了供应商商品的分佣模式和商品优惠，请务必核算好供应商商品的成本，避免造成亏本。</p>
    </alert-warning>
    <div class="supplier-base-content">
      <Form
        ref="formValidate"
        :model="formValidate"
        :rules="ruleValidateSale"
        :label-width="195"
        label-position="right"
      >
        <FormItem label="供应商订单结算账期：" required>
          <div style="display:flex">
            <span>订单完成&nbsp;&nbsp;</span>
            <FormItem prop="settlement_period">
              <InputNumber
                class="supplier-input"
                :min="0"
                :max="365"
                :precision="0"
                v-model="formValidate.settlement_period"
                placeholder="请输入账期"
              ></InputNumber>&nbsp;&nbsp;
            </FormItem>
            <span>天后，自动与供应商结算货款。</span>
          </div>
          <p class="supplier-account-text">*当没有设置售后维权，订单完成时间为确定收货后；当系统设置售后维权，订单完成时间为维权期结束。</p>
        </FormItem>
        <FormItem label="供应商商品默认值设置：" required>
          <div style="display:flex;paddingBottom:20px">
            <span>销售价=供货价&nbsp;&nbsp;x</span>&nbsp;&nbsp;
            <FormItem prop="sale_price_percent">
              <InputNumber
                :max="9999999.999"
                :min="0"
                :precision="3"
                :step="1"
                class="supplier-input"
                placeholder="请输入供货价公式"
                v-model="formValidate.sale_price_percent"
              ></InputNumber>&nbsp;%
            </FormItem>
          </div>
          <div style="display:flex;paddingBottom:20px">
            <span>成本价=供货价&nbsp;&nbsp;x</span>&nbsp;&nbsp;
            <FormItem prop="cost_price_percent">
              <InputNumber
                :max="9999999.999"
                :min="0"
                :precision="3"
                :step="1"
                class="supplier-input"
                placeholder="请输入成本价公式"
                v-model="formValidate.cost_price_percent"
              ></InputNumber>&nbsp;%
            </FormItem>
          </div>
          <p class="supplier-account-text">*该系统默认值仅是新增商品的初始默认值，如需设置单品的销售价，请到商品单品设置。</p>
        </FormItem>
        <FormItem v-show="false" label="供应商修改供货价需重新审核：">
           <div class="supplier-check">
              <i-switch v-model="formValidate.open_verify_again" class="supplier-right">
                <span slot="open">开</span>
                <span slot="close">关</span>
              </i-switch>
              <div class="supplier-check-text">
                  *开启后，供应商一旦修改了商品供货价，该商品将会被下架，并需要平台重新审核上架；但不是否开启改功能，
                  供应商修改供货价后，为了防止平台出现亏损，系统都会根据系统设置的默认公式重新刷新销售价和成本价。
              </div>
          </div>
        </FormItem>
        <FormItem label="供应商商品参与分销分佣：" v-if="hasLicensePerm('ENABLE_DISTRIBUTION')">
          <i-switch v-model="formValidate.open_distribution" class="supplier-right" @on-change="onSwitchChange($event,'open_distribution')">
            <span slot="open">开</span>
            <span slot="close">关</span>
          </i-switch>
          <span class="supplier-account-text">*开启后，供应商的商品允许参与分销分佣（跟随商品设置的分销佣金规则）</span>
        </FormItem>
        <FormItem label="供应商商品参与代理分红：" v-if="hasLicensePerm('ENABLE_AGENT')">
          <i-switch v-model="formValidate.open_agent" class="supplier-right" @on-change="onSwitchChange($event,'open_agent')">
            <span slot="open">开</span>
            <span slot="close">关</span>
          </i-switch>
          <span class="supplier-account-text">*开启后，供应商的商品允许参与代理分红（跟随商品设置的代理分红和销售返佣规则）</span>
        </FormItem>
        <FormItem label="供应商商品参与区域返佣：" v-if="hasLicensePerm('ENABLE_AREA_AGENT')">
          <i-switch v-model="formValidate.open_area_agent" class="supplier-right" @on-change="onSwitchChange($event,'open_area_agent')">
            <span slot="open">开</span>
            <span slot="close">关</span>
          </i-switch>
          <span class="supplier-account-text">*开启后，供应商的商品允许参与区域返佣（跟随商品设置的区域代理返佣规则）</span>
        </FormItem>
        <FormItem label="供应商商品参与积分：">
          <i-switch v-model="formValidate.open_point" class="supplier-right" @on-change="onSwitchChange($event,'open_point')">
            <span slot="open">开</span>
            <span slot="close">关</span>
          </i-switch>
          <span class="supplier-account-text">*开启后，供应商的商品允许使用积分抵扣（跟随商品设置的积分抵扣规则）</span>
        </FormItem>
        <FormItem label="供应商商品参与优惠券：">
          <i-switch v-model="formValidate.open_coupon" class="supplier-right" @on-change="onSwitchChange($event,'open_coupon')">
            <span slot="open">开</span>
            <span slot="close">关</span>
          </i-switch>
          <span class="supplier-account-text">*开启后，供应商的商品允许使用优惠券。</span>
        </FormItem>
        <FormItem label="供应商商品参与会员价：">
          <i-switch v-model="formValidate.open_member_price" class="supplier-right" @on-change="onSwitchChange($event,'open_member_price')">
            <span slot="open">开</span>
            <span slot="close">关</span>
          </i-switch>
          <span class="supplier-account-text">*开启后，供应商的商品允许使用会员价（跟随商品设置的会员价规则）</span>
        </FormItem>
      </Form>
    </div>
    <foot-button
      @onSaveClick="onSaveClick"
      :loading="loadingStatus"
      perm="supplier.config.operate"
    ></foot-button>
  </div>
</template>

<script>
import footButton from "@/views/shop/components/button/foot-button.vue";
import alertWarning from "@/views/shop/components/alert/alert-warning.vue"
export default {
  components: {
    footButton,
    alertWarning
  },
  data() {
    return {
      formValidate: {
        site_id: "",
        settlement_period: 0, //结算账期
        sale_price_percent: 0, //供货价
        cost_price_percent: 0, //成本价
        open_verify_again: true,//重新审核
        open_member_price: false, //会员价
        open_point: false, //积分
        open_coupon: false, //优惠卷
        open_distribution: false, //分销分佣
        open_agent: false, //代理分红
        open_area_agent: false //区代返佣
      },
      ruleValidateSale: {
        settlement_period: [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (value === 0 || value) {
                return callback();
              }
              return callback(new Error("请输入账期"));
            }
          }
        ],
        sale_price_percent: [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (value) {
                return callback();
              }
              return callback(new Error("请输入供货价公式"));
            }
          }
        ],
        cost_price_percent: [
          {
            required: true,
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (value) {
                return callback();
              }
              return callback(new Error("请输入成本价公式"));
            }
          }
        ]
      },
      loadingStatus: false
    };
  },
  created () {
     this.$store.state.COMMON_loading = true;
    this.getBaseSetting()
  },
  methods: {
    onSwitchChange(value, key) {
      var msgs = {
        open_distribution: "开启供应商商品参与分销分佣后，请注意对商品分销分佣进行成本核算，是否确定要开启参与分销分佣？",
        open_agent: "开启供应商商品参与代理分红后，请注意对商品代理分红进行成本核算，建议代理分红基准设置为【利润分红】模式；是否确定要开启参与代理分红？",
        open_area_agent: "开启供应商商品参与区域返佣后，请注意对商品区域返佣进行成本核算，建议区域返佣基准设置为【利润返佣】模式；是否确定要开启参与区域返佣？",
        open_point: "开启后供应商商品参与商城积分，请注意对商品进行成本核算，是否确定要开启参与商城积分？",
        open_coupon: "开启后供应商商品参与商城优惠券，请注意对商品进行成本核算，是否确定要开启参与商城优惠券？",
        open_member_price: "开启后供应商商品参与商城会员价，请注意对商品进行成本核算，是否确定要开启参与商城会员价？"
      };
      if(value) {
        this.$nextTick(() => {
          this.formValidate[key] = false;
          this.$Modal.confirm({
            title: "提示",
            content: msgs[key],
            onOk: () => {
              this.formValidate[key] = true;
            }
          })
        })
      }
    },
    onSaveClick() {
        this.loadingStatus = true
        let data = Object.assign({},this.formValidate)
        data.open_verify_again = Number(data.open_verify_again)
        data.open_member_price = Number(data.open_member_price)
        data.open_point = Number(data.open_point)
        data.open_coupon = Number(data.open_coupon)
        data.open_distribution = Number(data.open_distribution)
        data.open_agent = Number(data.open_agent)
        data.open_area_agent = Number(data.open_area_agent)
        this.$refs["formValidate"].validate(valid => {
          if (valid) {
            this.$httpGet("/shop/admin/supplier/basesetting/edit", data ,res => {
              this.loadingStatus = false
                if(res.code == 200) {
                   this.$nextTick(() => {
                      this.$Message.success("保存成功");
                   })
                }
            })
          } else {
            this.loadingStatus = false
            this.$Message.error("保存失败");
          }
        });
    },
     getBaseSetting () {
      this.$httpGet("/shop/admin/supplier/basesetting/info",null,res => {
         this.$store.state.COMMON_loading = false;
         if(res.code === 200) {
            this.$nextTick(() => {
              this.formValidate.settlement_period =Number(res.data.settlement_period)
              this.formValidate.sale_price_percent = Number(res.data.sale_price_percent)
              this.formValidate.cost_price_percent =  Number(res.data.cost_price_percent)
              this.formValidate.open_verify_again = Boolean(res.data.open_verify_again)
              this.formValidate.open_member_price = Boolean(res.data.open_member_price)
              this.formValidate.open_point = Boolean(res.data.open_point)
              this.formValidate.open_coupon = Boolean(res.data.open_coupon)
              this.formValidate.open_distribution = Boolean(res.data.open_distribution)
              this.formValidate.open_agent = Boolean(res.data.open_agent)
              this.formValidate.open_area_agent = Boolean(res.data.open_area_agent)
              this.formValidate.site_id = res.data.site_id
            })
         }else {
           this.$Message.error(res.msg)
         }
      })
    }
  }
};
</script>

<style lang="less" scoped>
.supplier-base-setting {
  padding: 24px;
  .supplier-base-content {
    .supplier-input {
      width: 158px;
    }
    .supplier-check {
      display: flex;
      align-items: center;
      &-text {
        width: 596px;
        font-size: 12px;
        color:#9ea4b1 ;
        line-height: 18px;
        word-wrap:break-word;
        word-break:break-all;
      }
    }
    .supplier-account-text {
      font-size: 12px;
      font-family: Microsoft YaHei, Microsoft YaHei-Regular;
      font-weight: 400;
      text-align: left;
      color: #9ea4b1;
      margin-top: -5px;
    }
    .supplier-right {
      margin-right: 16px;
    }
  }
}
</style>