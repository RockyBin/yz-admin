<template>
<div class="cloudstock-setting-withdraw">
  <div class="content">
    <Form ref="form" :label-width="140" :model="formData" :rules="rules">
      <div v-show="false" class="title-block">云仓收入提现设置
        <i-switch style="margin-left:14px;">
          <span slot="open">开</span>
          <span slot="close">关</span>
        </i-switch>
      </div>
      <vertical-line-titlebar style="margin-top:0" title="提现方式"></vertical-line-titlebar>
      <FormItem label="平台内提现：">
        <Checkbox v-model="formData.platform_type.balance" :true-value="1" :false-value="0">提现至余额</Checkbox>
        <more-message text="云仓收入提现到余额，不受以下的提现额度/费率/提现申请的限制"></more-message>
      </FormItem>
      <FormItem label="线上提现：">
        <more-message text="当开启了线上提现，必须填写支付接口数据，可前往<支付设置>设置。" style="margin-left:0px;margin-right:14px;"></more-message>
        <Checkbox v-model="formData.online_type.wxpay" :true-value="1" :false-value="0">微信钱包</Checkbox>
        <Checkbox v-model="formData.online_type.alipay" :true-value="1" :false-value="0">支付宝</Checkbox>
      </FormItem>
      <FormItem label="线下提现：">
        <Checkbox v-model="formData.offline_type.wx_qrcode" :true-value="1" :false-value="0">微信收款码</Checkbox>
        <Checkbox v-model="formData.offline_type.alipay_qrcode" :true-value="1" :false-value="0">支付宝收款码</Checkbox>
        <Checkbox v-model="formData.offline_type.alipay_account" :true-value="1" :false-value="0">支付宝账户</Checkbox>
        <Checkbox v-model="formData.offline_type.bank_account" :true-value="1" :false-value="0">银行账户</Checkbox>
      </FormItem>
      <div v-show="!allClosed">
        <vertical-line-titlebar title="提现额度"></vertical-line-titlebar>
        <FormItem style="margin-bottom:0!important" label="单笔提现额度：" class="ivu-form-item-required">
          <FormItem class="form-item-inner" prop="min_money">
            <InputNumber :min="1" :max="formData.online_type.wxpay ? 5000 : 9999999" :precision="0" v-model="formData.min_money" placeholder="请输入额度下限"/>
            </FormItem>
          <span style="color:#dcdee2;margin:0 5px;">—</span>
          <FormItem class="form-item-inner" prop="max_money">
            <InputNumber :min="1" :max="formData.online_type.wxpay ? 5000 : 9999999" :precision="0" v-model="formData.max_money" style="margin-right: 5px;" placeholder="请输入额度上限"/>元
          </FormItem>
          <more-message text="当开启了【线上微信钱包】提现时，单笔额度限制在5000元之内"></more-message>
        </FormItem>
        <FormItem prop="money"></FormItem>
        <FormItem label="手续费费率：">
          <InputNumber :min="0" :max="100" :precision="2" v-model="formData.poundage_rate" style="margin-right: 5px;" placeholder="请输入手续费率"/>%
          <more-message text="提现到第三方支付平台时，收取手续费，手续费不足0.01元，按照0.01收取。不能超过100%，设置为0则不收取手续费"></more-message>
        </FormItem>
        <FormItem label="提现申请：" class="ivu-form-item-required">
          <span style="margin-right:5px;">将在</span>
          <FormItem class="form-item-inner" prop="withdraw_workday">
            <InputNumber :min="1" :max="90" :precision="0" v-model="formData.withdraw_workday" placeholder="请输入处理时间"/>
          </FormItem>
          <span style="margin-left:5px;">个工作日内处理</span>
          <more-message text="设置范围为：1~90天"></more-message>
        </FormItem>
        <FormItem label="提现时间：">
          <RadioGroup v-model="formData.withdraw_date.date">
            <Radio :label="0">任意时间</Radio>
            <Radio :label="1">特定时间</Radio>
          </RadioGroup>
        </FormItem>
          <FormItem
            label="时间类型："
            v-show="formData.withdraw_date.date === 1"
          >
            <RadioGroup
              v-model="formData.withdraw_date.date_type"
              @on-change="onDatetypeSelectChange"
            >
              <Radio :label="0">每周</Radio>
              <Radio :label="1">每月</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem
            label="特定提现时间："
            v-show="formData.withdraw_date.date === 1"
            prop="withdraw_date.date_days"
          >
            <CheckboxGroup
              v-model="formData.withdraw_date.date_days"
              v-show="formData.withdraw_date.date_type === 0"
            >
              <Checkbox :label="1">周一</Checkbox>
              <Checkbox :label="2">周二</Checkbox>
              <Checkbox :label="3">周三</Checkbox
              ><Checkbox :label="4">周四</Checkbox>
              <Checkbox :label="5">周五</Checkbox
              ><Checkbox :label="6">周六</Checkbox>
              <Checkbox :label="0">周日</Checkbox>
            </CheckboxGroup>
            <customDatePicker
              v-model="formData.withdraw_date.date_days"
              v-show="formData.withdraw_date.date_type === 1"
              placeholder="请选择时间"
              confirm
            ></customDatePicker>
        </FormItem>
      </div>
    </Form>
  </div>
  <div class="footer">
    <Button type="primary" shape="circle" @click="saveSetting" perm="dealer.config.operate">保存</Button>
  </div>
</div>
</template>
<script>
import axios from "axios"
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import customDatePicker from "COMPONENTS/picker/date-picker/picker";
export default {
  components: {
    verticalLineTitlebar,
    customDatePicker,
    moreMessage
  },
  data() {
    let lock = false;
    const minValidator = (rule,value,callback) => {
      if(this.allClosed) {
        return callback()
      }
      this.$refs.form.validateField("money")
      if(!value || this.formData.max_money && value > this.formData.max_money) {
        return callback(" ")
      } else {
        if(!lock) {
          lock = true
          this.$refs.form.validateField("max_money")
        } else {
          lock = false
        }
        callback()
      }
    }
    const maxValidator = (rule,value,callback) => {
      if(this.allClosed) {
        return callback()
      }
      this.$refs.form.validateField("money")
      if(!value || this.formData.min_money && value < this.formData.min_money || this.formData.online_type.wxpay && value > 5000) {
        return callback(" ")
      } else {
        if(!lock){
          lock = true
          this.$refs.form.validateField("min_money")
        } else {
          lock = false
        }
        callback()
      }
    }
    const moneyValidator = (rule, value, callback) => {
      if(this.allClosed) {
        return callback()
      }
      if(!this.formData.min_money) {
        return callback("请输入提现额度下限")
      }
      if(!this.formData.max_money) {
        return callback("请输入提现额度上限")
      }
      if(this.formData.min_money > this.formData.max_money) {
        return callback("提现额度下限不能大于提现额度上限")
      }
      if(this.formData.online_type.wxpay && this.formData.max_money > 5000) {
        return callback("当前开启了【线上微信钱包】提现，单笔额度限制在5000元之内")
      }
      callback()
    }
    const workdayValidator = (rule,value,callback) => {
      if(this.allClosed) {
        return callback()
      }
      if(!value) {
        return callback("请输入处理时间")
      }
      callback()
    }
    return {
      lastDateStatus: 0,
      paySetting: {
        wxpay: 0,
        alipay: 0,
        wxpay_offline: 0,
        alipay_offline: 0,
        bankpay: 0
      },
      time: [],
      formData: {
        platform_type: {
          balance: 1
        },
        online_type: {
          wxpay: 1,
          alipay: 1
        },
        offline_type: {
          wx_qrcode: 1,
          alipay_qrcode: 1,
          alipay_account: 1,
          bank_account: 1
        },
        withdraw_date: {
          date: 0,
          date_type: 0,
          date_days: []
        },
        min_money: null,
        max_money: null,
        poundage_rate: null,
        withdraw_workday: null,
        withdraw_time: 0
      },
      old_withdraw_days: [],
      rules:{
        min_money: [{
          required: true,
          trigger: "blur",
          validator: minValidator
        }],
        max_money: [{
          required: true,
          trigger: "blur",
          validator: maxValidator
        }],
        money: [{
          validator: moneyValidator
        }],
        withdraw_workday: [{
          required: true,
          trigger: "blur",
          validator: workdayValidator
          // message: "请输入处理时间"
        }],
        "withdraw_date.date_days": [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!this.formData.withdraw_date.date || value.length) {
                return callback();
              }
              return callback(new Error("请选择提现时间"));
            },
            trigger: "change"
          }
        ]
      }
    }
  },
  computed:{
    allClosed() {
      return !(
        this.formData.online_type.wxpay ||
        this.formData.online_type.alipay ||
        this.formData.offline_type.wx_qrcode ||
        this.formData.offline_type.alipay_qrcode ||
        this.formData.offline_type.alipay_account ||
        this.formData.offline_type.bank_account
      )
    }
  },
  created() {
    this.getSetting()
  },
  methods: {
    onDatetypeSelectChange() {
      let old = this.formData.withdraw_date.date_days;
      this.$set(
        this.formData.withdraw_date,
        "date_days",
        this.old_withdraw_days
      );
      this.old_withdraw_days = old;
    },
    getSetting() {
      this.$store.state.COMMON_loading = true
      axios.get("/shop/admin/cloudstock/withdrawconfig/info").then(res => {
        if(res.code == 200) {
          this.formData.platform_type = JSON.parse(res.data.platform_type)
          this.formData.online_type = JSON.parse(res.data.online_type)
          this.formData.offline_type = JSON.parse(res.data.offline_type)
          this.formData.min_money = res.data.min_money;
          this.formData.max_money = res.data.max_money;
          if (res.data.withdraw_date) {
              this.formData.withdraw_date = Object.assign(
                {},
                this.formData.withdraw_date,
                JSON.parse(res.data.withdraw_date)
              );
          }
          this.formData.poundage_rate = Number(res.data.poundage_rate);
          this.formData.withdraw_workday = res.data.withdraw_workday;
          this.paySetting = res.data.pay_type;
        } else {
          this.$Message.error(res.msg)
        }
      }).catch(err => {
        this.$Message.error(err.message)
      }).finally(() => {
        this.$store.state.COMMON_loading = false
      })
    },
    saveSetting() {
      let data = {}
      data.platform_type = JSON.stringify(this.formData.platform_type)
      data.online_type = JSON.stringify(this.formData.online_type)
      data.offline_type = JSON.stringify(this.formData.offline_type)
      data.min_money = this.formData.min_money;
      data.max_money = this.formData.max_money;
      data.poundage_rate = this.formData.poundage_rate;
      data.withdraw_workday = this.formData.withdraw_workday;
      let withdraw_date = { ...this.formData.withdraw_date };
      if (withdraw_date.date === 0) {
        withdraw_date.date_days = [];
      }
      data.withdraw_date = JSON.stringify(withdraw_date);

      this.$refs.form.validate(valid => {
        if(valid) {
          this.$store.state.COMMON_loading = true
          axios.post("/shop/admin/cloudstock/withdrawconfig/edit",data).then(res => {
            if(res.code == 200) {
              this.$Message.success("保存成功")
            } else {
              this.$Message.error(res.msg)
            }
          }).catch(err => {
            this.$Message.error(err.message)
          }).finally(() => {
            this.$store.state.COMMON_loading = false
          })
        } else {
          this.$Message.error("保存失败")
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
  .cloudstock-setting-withdraw {
    .content {
      padding: 24px;
      height: calc(100vh - 120px);
      .title-block {
        height: 60px;
        line-height: 60px;
        background: #F5F6F7;
        font-size: 13px;
        font-weight: bold;
        border-radius: 3px;
        padding-left: 16px;
      }
      .form-item-inner {
        display: inline-block;
        margin-bottom: 0px !important;
      }
      /deep/.ivu-checkbox-wrapper {
        margin-right: 20px;
        &:last-of-type {
          margin: 0px;
        }
        .ivu-checkbox {
          margin-right: 5px;
        }
      }
      /deep/.ivu-radio-wrapper {
        margin-right: 20px;
      }
      /deep/.ivu-input-number {
        width: 160px;
      }
      /deep/.more-message {
        margin-left: 5px;
      }
      /deep/.vertical-line-titlebar-wrapper {
        margin: 24px 0 20px;
      }
    }
    .footer{
      height:50px;
      line-height:50px;
      text-align:center;
      border-top:1px solid #eee;
      .ivu-btn{
        width: 70px;
      }
    }
  }
</style>