<template>
  <div class="mall-container">
    <thirdMenu :list="thirdMenu" />
    <div class="container">
      <div class="padding-wrapper">
        <alert-warning title="提现说明：" style="margin-bottom:24px;">
          <p>1. 线上提现到微信钱包：从微信的运营资金的对公账户直接把钱打到用户的微信钱包； 线上提现到支付宝：从支付宝的对公账户直接把钱打到用户的支付宝账号。</p>
          <p>2. 当开启了线上提现，必须填写对应的支付接口配置，可前往<a class="table-operation" href="#/setting/mall/pay">&lt;支付设置&gt;</a>设置。</p>
          <p>3. 线下提现：指商家通过线下的方式手动给用户打款。</p>
        </alert-warning>
        <Form
          ref="formValidateBase"
          :model="formValidate"
          :rules="ruleValidateBase"
          :label-width="130"
          :show-message="true"
        >
          <switch-titlebar
            style="margin-bottom: 20px;"
            v-model="balanceSwitch"
            :true-value="true"
            :false-value="false"
            hasBorder
            title="是否开启余额提现功能"
            @on-change="onGetSwitchChange.apply(this,['balance_type','balance_check',...arguments])"
          >
            <FormItem label class="first-item no-margin-left" style="margin-bottom:0px;">
              <div class="product-detail-item">
                <CheckboxGroup
                  v-if="balanceSwitch"
                  v-model="formValidate.balance_check"
                  @on-change="onGetChange.apply(this, ['balance_type','balance_check',...arguments])"
                  class="type-cg"
                >
                  <div style="margin-bottom:20px;">
                    <span class="checkbox-title">线上提现：</span>
                    <Checkbox label="wxpay" @click.native="checkStatus('balance_check','wxpay',$event)">
                      <span>微信钱包</span>
                    </Checkbox>
                    <!--暂时先把支付宝隐藏-->
                    <Checkbox
                      label="alipay"
                      @click.native="checkStatus('balance_check','alipay',$event)"
                    >
                      <span>支付宝</span>
                    </Checkbox>
                  </div>
                  <div style="">
                    <span class="checkbox-title">线下提现：</span>
                    <Checkbox label="wx_qrcode">
                      <span>微信收款码</span>
                    </Checkbox>
                    <Checkbox label="alipay_qrcode">
                      <span>支付宝收款码</span>
                    </Checkbox>
                    <Checkbox label="alipay_account">
                      <span>支付宝账户</span>
                    </Checkbox>
                    <Checkbox label="bank_account">
                      <span>银行账户</span>
                    </Checkbox>
                  </div>
                </CheckboxGroup>
              </div>
            </FormItem>
          </switch-titlebar>
          <switch-titlebar
            style="margin-bottom: 20px;"
            v-show="hasLicensePerm('ENABLE_DISTRIBUTION')||hasLicensePerm('ENABLE_AGENT')||hasLicensePerm('ENABLE_AREA_AGENT')"
            v-model="commissionSwitch"
            :true-value="true"
            :false-value="false"
            hasBorder
            :disabled="false"
            title="是否开启佣金提现功能"
            @on-change="onGetSwitchChange.apply(this,['commission_type','commission_check',...arguments])"
          >
            <FormItem label style="margin-bottom:0px;" class="no-margin-left">
              <div class="product-detail-item">
                <CheckboxGroup
                  v-if="commissionSwitch"
                  v-model="formValidate.commission_check"
                  @on-change="onGetChange.apply(this, ['commission_type','commission_check',...arguments])"
                  class="type-cg"
                >
                  <div style="margin-bottom:20px;">
                    <span class="checkbox-title">平台内提现：</span>
                    <Checkbox label="balance">
                      <span>提现至余额</span>
                    </Checkbox>
                    <more-message :text="content[4]" style="margin-left:-12px;margin-right:20px"></more-message>
                  </div>
                  <div style="margin-bottom:20px;">
                    <span class="checkbox-title">线上提现：</span>
                    <Checkbox
                      label="wxpay"
                      @click.native="checkStatus('commission_check','wxpay',$event)"
                    >
                      <span>微信钱包</span>
                    </Checkbox>
                    <!--暂时先把支付宝隐藏-->
                    <Checkbox
                      label="alipay"
                      @click.native="checkStatus('commission_check','alipay',$event)"
                    >
                      <span>支付宝</span>
                    </Checkbox>
                  </div>
                  <div style="">
                    <span class="checkbox-title">线下提现：</span>
                    <Checkbox label="wx_qrcode">
                      <span>微信收款码</span>
                    </Checkbox>
                    <Checkbox label="alipay_qrcode">
                      <span>支付宝收款码</span>
                    </Checkbox>
                    <Checkbox label="alipay_account">
                      <span>支付宝账户</span>
                    </Checkbox>
                    <Checkbox label="bank_account">
                      <span>银行账户</span>
                    </Checkbox>
                  </div>
                </CheckboxGroup>
              </div>
            </FormItem>
          </switch-titlebar>
          <switch-titlebar
            style="margin-bottom: 0px;"
            v-show="showWithdraw"
            hasBorder
            :value="true"
            :switchShow="false"
            title="提现额度"
          >
            <div>
              <FormItem label="单笔提现额度：" prop="min_money" class="margin-bottom-form">
                <div class="product-detail-item">
                  <InputNumber
                    :precision="0"
                    class="common-input-text-160"
                    v-model.trim="formValidate.min_money"
                    :min="1"
                    :max="9999999"
                  ></InputNumber>
                  <span class="line"></span>
                  <InputNumber
                    :precision="0"
                    class="common-input-text-160"
                    v-model.trim="formValidate.max_money"
                    :max="balanceSwitch&&formValidate.balance_check.indexOf('wxpay') != -1||commissionSwitch&&formValidate.commission_check.indexOf('wxpay') != -1?5000:9999999"
                  ></InputNumber>
                  <span class="unit">元</span>
                  <more-message :text="content[1]" class="prompt"></more-message>
                </div>
              </FormItem>
              <FormItem
                label="收取手续费途径："
                prop="handlingFees"
                class="un-start margin-bottom-form"
                style="display:none"
              >
                <div class="product-detail-item">
                  <Checkbox label="twitter" :value="true">
                    <span class="radi-txt" style="color: #333">账户余额提现到第三方支付</span>
                  </Checkbox>
                  <div
                    style="width:100%;height:100%;top:0;position:absolute;z-index:99;cursor:not-allowed;"
                    class="mask"
                  ></div>
                </div>
              </FormItem>
              <FormItem label="手续费费率：" class="un-start margin-bottom-form">
                <div class="product-detail-item">
                  <InputNumber
                    class="common-input-text-160"
                    v-model.trim="formValidate.poundage_rate"
                    :min="0"
                    :max="100"
                    @on-change="onChangePoundage_rate"
                    placeholder="请输入手续费费率"
                  ></InputNumber>
                  <span class="unit">%</span>
                </div>
                <more-message :text="content[2]" class="prompt"></more-message>
              </FormItem>

              <FormItem label="提现申请：" prop="withdraw_workday" class="offset-tip margin-bottom-form">
                <div class="product-detail-item">
                  <span class="inline-text" style="margin-right:6px;">将在</span>
                  <Input
                    v-model.trim="formValidate.withdraw_workday"
                    class="common-input-text-160"
                    placeholder="请输入天数"
                  />
                  <span class="inline-text" style="margin-left:6px;">个工作日内处理</span>
                </div>
                <more-message :text="content[3]" class="prompt"></more-message>
              </FormItem>
              <FormItem label="提现时间：" class="un-start margin-bottom-form">
                <RadioGroup v-model="formValidate.withdraw_date.date">
                  <Radio :label="0">任意时间</Radio>
                  <Radio :label="1">特定时间</Radio>
                </RadioGroup>
              </FormItem>
              <FormItem
                label="时间类型："
                class="un-start margin-bottom-form"
                v-show="formValidate.withdraw_date.date === 1"
              >
                <RadioGroup
                  v-model="formValidate.withdraw_date.date_type"
                  @on-change="onDatetypeSelectChange"
                >
                  <Radio :label="0">每周</Radio>
                  <Radio :label="1">每月</Radio>
                </RadioGroup>
              </FormItem>
              <FormItem
                label="特定提现时间："
                class="margin-bottom-form"
                v-show="formValidate.withdraw_date.date === 1"
                prop="withdraw_date.date_days"
              >
                <CheckboxGroup
                  v-model="formValidate.withdraw_date.date_days"
                  v-show="formValidate.withdraw_date.date_type === 0"
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
                  v-model="formValidate.withdraw_date.date_days"
                  v-show="formValidate.withdraw_date.date_type === 1"
                  placeholder="请选择时间"
                  confirm
                ></customDatePicker>
              </FormItem>
            </div>
          </switch-titlebar>
          
        </Form>
      </div>
      <div class="footer">
        <Button
          shape="circle"
          class="save-btn"
          type="primary"
          @click="onHandleSubmit('formValidateBase')"
          :loading="loading"
          perm="withdraw.config.operate"
        >保存</Button>
      </div>
    </div>
  </div>
</template>
<script>
import moreMessage from "COMPONENTS/more-message/more-message";
import alertWarning from "@/views/shop/components/alert/alert-warning.vue"
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import thirdMenuData from "./components/third-menu-for-setting-mall";
import customDatePicker from "COMPONENTS/picker/date-picker/picker";
import { setTimeout } from "timers";
export default {
  components: {
    thirdMenu,
    moreMessage,
    alertWarning,
    customDatePicker,
    switchTitlebar
  },
  data() {
    return {
      content: [
        "提现设置只针对佣金/余额提现到第三方支付平台时的条件限制，佣金提现到余额不受此限制。",
        "当开启了【线上微信钱包】提现时，单笔额度限制在\n5000元之内。",
        "提现到第三方支付平台时，收取手续费，手续费不足0.01元，按照0.01收取。不能超过100%，设置为0则不收取手续费。",
        "设置范围为：1~90天",
        "佣金提现至余额，不受以下的提现额度/费率/提现申请的限制。",
        "从微信的运营资金的对公账户直接把钱打到用户的微信钱包。",
        "从支付宝的对公账户直接把钱打到用户的支付宝账号。",
        "是指商家通过线下的方式手动给用户打款。"
      ],
      loading: false,
      isEdit: false, // 0是保存状态， 1是编辑状态
      commissionSwitch: false, //佣金提现方式开关
      balanceSwitch: false, //   余额提现方式开关
      balance_type: [
        "wxpay",
        "alipay",
        "wx_qrcode",
        "alipay_qrcode",
        "alipay_account",
        "bank_account"
      ], //余额提现方式
      commission_type: [
        "balance",
        "wxpay",
        "alipay",
        "wx_qrcode",
        "alipay_qrcode",
        "alipay_account",
        "bank_account"
      ], //佣金提现方式
      payConfig: {}, //支付设置，是否开启微信和支付宝
      formValidate: {
        min_money: 1, // 最低提现金额
        max_money: 5000, //最大提现金额
        balance_type: {}, //余额提现方式
        commission_type: {}, //佣金提现方式
        balance_check: [], //余额提现方式
        commission_check: [], //佣金提现方式
        //   handlingFees: true, // 开启收取手续费途径
        poundage_rate: 0, // 手续费费率
        withdraw_workday: 0, // 提现申请
        withdraw_date: {
          date: 0,
          date_type: 0,
          date_days: []
        }
      },
      old_withdraw_days: [],
      thirdMenu: [],
      ruleValidateBase: {
        min_money: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value == null) {
                return callback(new Error("额度不能为空"));
              }
              if (this.formValidate.max_money < value) {
                return callback(new Error("最大金额不可少于最小金额"));
              }
              if (this.balanceSwitch&&this.formValidate.balance_check.indexOf('wxpay') != -1||this.commissionSwitch&&this.formValidate.commission_check.indexOf('wxpay') != -1) {
                if (this.formValidate.max_money>5000) {
                  return callback(new Error("当开启了【线上微信钱包】提现时，单笔额度限制在5000元之内"));
                }
              }
              return callback();
            },
            trigger: "change"
          }
        ],
        // way: [
        //   { required: true, message: "Please select gender", trigger: "change" }
        // ],
        withdraw_workday: [
          {
            required: true,
            validator: (rule, value, callback) => {
              const reg = /^\+?[1-9][0-9]*$/;
              if (!value) {
                // return callback(new Error(this.$store.state.UNBLANK_MSG));
                return callback(new Error("请输入提现申请处理天数"));
              } else if (!reg.test(value)) {
                return callback(new Error(this.$store.state.NUM_CHECK_MSG));
              } else if (value > 90 || value < 1) {
                return callback(new Error("设置范围为：1~90天"));
              }
              return callback();
            },
            trigger: "blur"
          }
        ],
        "withdraw_date.date_days": [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!this.formValidate.withdraw_date.date || value.length) {
                return callback();
              }
              return callback(new Error("请选择提现时间"));
            },
            trigger: "change"
          }
        ]
      }
    };
  },
  computed: {
    //处理提现下面的div是否开启
    showWithdraw() {
      if (
        this.balanceSwitch && this.formValidate.balance_check.length ||
        this.commissionSwitch && this.formValidate.commission_check.length > 1 || 
        this.commissionSwitch && this.formValidate.commission_check.length == 1 && this.formValidate.commission_check[0] != "balance"
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
  mounted() {
    this.thirdMenu = thirdMenuData.getThirdMenu();
    this.getInfo();
  },
  methods: {
    onDatetypeSelectChange() {
      let old = this.formValidate.withdraw_date.date_days;
      this.$set(
        this.formValidate.withdraw_date,
        "date_days",
        this.old_withdraw_days
      );
      this.old_withdraw_days = old;
    },
    onChangePoundage_rate(val) {
      let str = "";
      let reg = /^[0,9]\d+\.?\d{0,2}$/;
      if (val != null && !reg.test(val)) {
        str = val.toFixed(2);
      }
      setTimeout(() => {
        this.formValidate.poundage_rate = Number(str);
      }, 1);
    },
    checkStatus(field, type, event) {
      // if (!this.formValidate[field].includes(type) && !this.payConfig[type]) {
      //   event.preventDefault();
      //   this.$Modal.confirm({
      //     title: "提示",
      //     content: `前往【支付设置>${
      //       type == "wxpay" ? "微信支付" : "支付宝"
      //     }】绑定${
      //       type == "wxpay" ? "微信支付" : "支付宝支付"
      //     }相关信息，即可使用线上${
      //       type == "wxpay" ? "微信" : "支付宝"
      //     }提现功能。`,
      //     okText: "前往设置",
      //     cancelText: "取消",
      //     onOk: () => {
      //       this.$router.push("/setting/mall/pay");
      //     }
      //   });
      // }
    },
    onGetChange(type, check_name, value) {
      for (let item in this[type]) {
        if (value.includes(this[type][item])) {
          this.formValidate[type][this[type][item]] = 1;
        } else {
          this.formValidate[type][this[type][item]] = 0;
        }
      }
    },
    onGetSwitchChange(type, check_name, value) {
      if(value) {
        for (let item in this[type]) {
          if (this.formValidate[check_name].includes(this[type][item])) {
            this.formValidate[type][this[type][item]] = 1;
          } else {
            this.formValidate[type][this[type][item]] = 0;
          }
        }
      }
    },
    // 提交
    onHandleSubmit(name) {
      if (this.formValidate.balance_check.length == 0 && this.balanceSwitch) {
        return this.$Message.error("保存失败，请选择至少一种余额提现方式");
      }
      if (this.formValidate.commission_check.length == 0 && this.commissionSwitch) {
        return this.$Message.error("保存失败，请选择至少一种佣金提现方式");
      }
      // 强转成数字类型
      this.$refs[name].validate(valid => {
        if (valid) {
          this.loading = true;
          // 初始化是新增
          let api = `add`;
          if (this.isEdit) {
            api = `edit`;
          }
          if (!this.balanceSwitch) {
            for (let item in this.balance_type) {
              this.formValidate.balance_type[this["balance_type"][item]] = 0;
            }
          }
          if (!this.commissionSwitch) {
            for (let item in this.commission_type) {
              this.formValidate.commission_type[this["commission_type"][item]] = 0;
            }
          }
          JSON.stringify(this.formValidate.balance_type);
          JSON.stringify(this.formValidate.commission_type);
          if (this.formValidate.poundage_rate == null)
            this.formValidate.poundage_rate = 0;
          let data = Object.assign({}, this.formValidate);
          delete data.balance_check;
          delete data.commission_check;
          if (data.withdraw_date.date === 0) {
            data.withdraw_date = { ...data.withdraw_date };
            data.withdraw_date.date_days = [];
          }
          this.$httpGet(`/shop/admin/withdrawconfig/${api}`, data, res => {
            this.loading = false;
            if (res.msg === this.$store.state.SUCCESS) {
              this.$Message.success(this.$store.state.SUCCESS_MSG);
              this.getInfo();
            }
          });
        } else {
          // this.$Message.error(this.$store.state.TODOFORM_MSG);
          this.$Message.error(this.$store.state.FAIL_MSG);
        }
      });
    },
    // 初始化数据
    getInfo() {
      this.$httpGet("/shop/admin/withdrawconfig/info", "", res => {
        if (res.msg === this.$store.state.SUCCESS) {
          if (res.data) {
            this.payConfig = res.data.pay_type;
            this.formValidate.commission_check = [];
            this.formValidate.balance_check = [];
            let withdraw_date = this.formValidate.withdraw_date;
            for (let item in res.data) {
              if (item === this.$store.state.SITE_ID || item == "pay_type") {
                continue;
              } else if (res.data[item] !== null) {
                // 是编辑
                this.isEdit = true;
                if (item === "poundage_rate") {
                  res.data[item] = Number(res.data[item]);
                }
                if (item === "balance_type") {
                  const balance = JSON.parse(res.data[item]);
                  this.$set(this.formValidate, item, balance);
                  if (Object.keys(balance).length > 0) {
                    for (let jar in balance) {
                      if (String(balance[jar]) === "1") {
                        this.formValidate.balance_check.push(jar);
                        this.balanceSwitch = true;
                      }
                    }
                  }
                } else if (item === "commission_type") {
                  const commission = JSON.parse(res.data[item]);
                  this.$set(this.formValidate, item, commission);
                  if (Object.keys(commission).length > 0) {
                    for (let key in commission) {
                      if (String(commission[key]) === "1") {
                        this.formValidate.commission_check.push(key);
                        this.commissionSwitch = true;
                      }
                    }
                  }
                } else {
                  this.$set(this.formValidate, item, res.data[item]);
                }
              }
            }
            if (res.data.withdraw_date) {
              this.$set(
                this.formValidate,
                "withdraw_date",
                Object.assign({}, withdraw_date, res.data.withdraw_date)
              );
            }
            console.log(this.formValidate, res.data)
          }
        }
      });
    },
    // 重置
    handleReset(name) {
      this.$refs[name].resetFields();
    }
  }
};
</script>
<style lang="less" scoped>
@import "../css/_spaceing.less";
@labelmr: 10px;
@checkboxmr: 5px;
@checkwrapmr: 16px;
@unitml: 10px;

.mall-container {
  position: absolute;
  width: 100%;
  height: calc(100vh - 132px);
  background: #f2f4fd;
  display: flex;
  .container {
    height: 100%;
    flex: 1;
    background: #fff;
  }
}
.padding-wrapper {
  /*height: calc(100vh - 120px);*/
  padding: 24px;
  padding-bottom: 74px;
  overflow: auto;
  background: white;
  .no-margin-left {
    /deep/.ivu-form-item-content {
      margin-left: 0px !important;
    }
  }
  .submit {
    width: 75px;
  }
  .unit {
    display: inline-block;
    vertical-align: middle;
    .spac-ml(@unitml);
  }
  /deep/.ivu-form-item-label {
    padding-right: 10px;
  }
  /deep/.un-start .ivu-form-item-label:before {
    content: unset;
  }
  /deep/.ivu-checkbox,
  /deep/.ivu-radio {
    .spac-mr(@checkboxmr);
  }
  /deep/.ivu-checkbox-wrapper,
  /deep/.ivu-radio-wrapper {
    font-size: 13px;
    .spac-mr(@checkwrapmr);
  }
  .radi-txt {
    display: inline-block;
    vertical-align: middle;
  }
  .product-detail-item {
    text-align: left;
    display: inline-block;
  }
  .offset-tip/deep/.ivu-form-item-error-tip {
    left: 32px;
  }
  .type-cg {
    display: block;
    margin-left: 25px;
  }
  .line {
    display: inline-block;
    width: 8px;
    height: 1px;
    background: #9ea4b1;
    margin: 0 6px;
    vertical-align: middle;
  }
  /deep/.ivu-checkbox-disabled + span {
    color: #657180;
  }
  .checkbox-title {
    font-size: 13px;
    color: #464c5b;
    display: inline-block;
    margin-right: 10px;
    width: 84px;
    text-align: right;
  }
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
