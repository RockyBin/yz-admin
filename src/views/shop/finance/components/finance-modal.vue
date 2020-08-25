<template>
  <div>
    <Modal class="main-modal" :title="title" :width="470" v-model="show">
      <p v-if="this.withdrawalDetails.show_recharge_discount" class="special-tips">
        <Icon type="md-alert" color="#FF9900" size="16"/>
        <span>此笔为【余额】提现，并且该会员曾参加过【充值优惠】活动！</span>
      </p>
      <Form ref="form" class="form" :model="formField" :rules="rules">
        <FormItem
          label="审核："
          :class="{special:(withdrawalDetails.pay_type==2||withdrawalDetails.pay_type==3)}"
        >
          <RadioGroup v-model="isAgree">
            <Radio :label="1">同意</Radio>
            <Radio :label="0">拒绝</Radio>
          </RadioGroup>
        </FormItem>
        <div v-show="isAgree" class="agree">
          <FormItem
            v-if="withdrawalDetails.pay_type==2||withdrawalDetails.pay_type==3"
            label="打款金额："
            style="margin-bottom:20px !important;"
          >
            <span class="money">￥{{withdrawalDetails.money_real}}</span>
          </FormItem>
          <div 
            v-if="withdrawalDetails.pay_type==2"
            style="color:#fd050b;margin-bottom:20px;"
          >
            （点击 【确定打款】，系统将自动从企业对公账户付款到用户微信钱包，请谨慎操作！）
          </div>
          <div 
            v-if="withdrawalDetails.pay_type==3"
            style="color:#fd050b;margin-bottom:20px;"
          >
            （点击 【确定打款】，系统将自动从企业对公账户转账到用户支付宝账户，请谨慎操作！）
          </div>
          <div></div>
          <div
            class="type-qrcode"
            v-if="(withdrawalDetails.pay_type==6||withdrawalDetails.pay_type==7) && withdrawalDetails.snapshot"
          >
            <div class="left">
              <div class="qrcode-wrapper">
                <div
                  class="mask"
                  v-if="withdrawalDetails.pay_type==6||withdrawalDetails.pay_type==7"
                  @click="showBigImg=true"
                >
                  <Icon type="ios-eye-outline" color="white" size="20"></Icon>
                </div>
                <img
                  class="wx-qrcode"
                  v-if="withdrawalDetails.pay_type==6"
                  :src="getHeadImg(withdrawalDetails.snapshot.wx_qrcode)"
                  alt
                />
                <img
                  class="zfb-qrcode"
                  v-if="withdrawalDetails.pay_type==7"
                  :src="getHeadImg(withdrawalDetails.snapshot.alipay_qrcode)"
                  alt
                />
              </div>
              <p style="color:#747782;font-size:12px;">(点击可查看大图)</p>
            </div>
            <div class="right">
              <p class="tips">{{tips}}</p>
              <p class="amount">
                打款金额:
                <strong>￥{{withdrawalDetails.money_real}}</strong>
              </p>
              <FormItem label prop="isChecked">
                <Checkbox v-model="formField.isChecked">我已完成线下打款！</Checkbox>
              </FormItem>
            </div>
          </div>
          <div class="type-zfb" v-if="withdrawalDetails.pay_type==8">
            <p class="tips">{{tips}}</p>
            <div class="account">
              <p
                style="font-size:16px;font-weight:bold;margin-bottom:8px;"
              >{{withdrawalDetails.snapshot.alipay_account}}</p>
              <p style="font-size:14px;">{{withdrawalDetails.snapshot.alipay_name}}</p>
            </div>
            <div class="amount">
              <div>
                打款金额:
                <strong>￥{{withdrawalDetails.money_real}}</strong>
              </div>
              <FormItem label prop="isChecked">
                <Checkbox v-model="formField.isChecked">我已完成线下打款！</Checkbox>
              </FormItem>
            </div>
          </div>
          <div class="type-bank" v-if="withdrawalDetails.pay_type==9">
            <p class="tips">{{tips}}</p>
            <div class="account">
              <p>
                {{withdrawalDetails.snapshot.bank}}
                <span
                  class="float"
                >持卡人：{{withdrawalDetails.snapshot.bank_card_name}}</span>
              </p>
              <p>{{withdrawalDetails.snapshot.bank_account|fourDigital}}</p>
              <p>{{withdrawalDetails.snapshot.bank_branch|fourDigital}}</p>
            </div>
            <div class="amount">
              <div>
                打款金额:
                <strong>￥{{withdrawalDetails.money_real}}</strong>
              </div>
              <FormItem label prop="isChecked">
                <Checkbox v-model="formField.isChecked">我已完成线下打款！</Checkbox>
              </FormItem>
            </div>
          </div>
        </div>
        <div v-show="!isAgree" class="refuse">
          <FormItem prop="reason" label="拒绝原因：" :label-width="90">
            <Input
              type="textarea"
              v-model="formField.reason"
              :maxlength="20"
              placeholder="请输入拒绝原因"
            />
          </FormItem>
          <span class="suffix">{{formField.reason.length}}/20</span>
        </div>
      </Form>
      <div class="info">
        <div class="title">核实提现信息</div>
        <div class="flex">
          <div class="left">
            <img
              :src="withdrawalDetails.headurl ? getHeadImg(withdrawalDetails.headurl):'images/head-portrait.png'"
              alt
            />
            <member-infor
              style="text-align: left;padding: 8px;"
              :id="withdrawalDetails.member_id"
              :name="withdrawalDetails.auth_name || '--'"
              :nickname="withdrawalDetails.auth_nickname"
              :mobile="withdrawalDetails.mobile"
            ></member-infor>
          </div>
          <div class="right">
            <p class="item">
              <span class="name">提现至：</span>
              <!-- <span class="value">{{withdrawalDetails.beneficiary_type}}</span> -->
              <span class="value">{{withdrawFrom}}</span>
            </p>
            <p class="item">
              <span class="name">提现金额：</span>
              <span class="value">¥{{withdrawalDetails.money}}</span>
            </p>
            <p class="item">
              <span class="name">手续费：</span>
              <span class="value">¥{{withdrawalDetails.money_fee}}</span>
            </p>
            <p class="item">
              <span class="name">到账金额：</span>
              <span class="value">¥{{withdrawalDetails.money_real}}</span>
            </p>
          </div>
        </div>
      </div>
      <div class="footer" slot="footer">
        <Button type="text" @click="show=false">取消</Button>
        <Button
          type="primary"
          @click="submit"
          :loading="buttonLoading"
          v-text="confirmText"
        ></Button>
      </div>
    </Modal>
    <Modal class="big-img-modal" v-model="showBigImg" fullscreen footer-hide>
      <img
        v-if="withdrawalDetails.pay_type==6"
        :src="getHeadImg(withdrawalDetails.snapshot.wx_qrcode)"
        alt
      />
      <img
        v-if="withdrawalDetails.pay_type==7"
        :src="getHeadImg(withdrawalDetails.snapshot.alipay_qrcode)"
        alt
      />
    </Modal>
  </div>
</template>
<script>
//withdrawalDetails.headurl ? getHeadImg(withdrawalDetails.headurl):
import memberInfor from "@/views/shop/components/table/member-infor.vue";
export default {
  components: {
    memberInfor
  },
  props: ["value", "withdrawalDetails", "buttonLoading", "withdrawFrom"],
  data() {
    const validatorReason = (rule, value, callback) => {
      if (this.isAgree || value) {
        callback();
      } else {
        callback("请输入拒绝原因");
      }
    };
    const validateChecked = (rule, value, callback) => {
      if (!this.isAgree || value) {
        callback();
      } else {
        callback(" ");
      }
    };
    return {
      show: false,
      showBigImg: false,
      isAgree: 1,
      formField: {
        isChecked: false,
        reason: ""
      },
      rules: {
        reason: [
          { required: true, validator: validatorReason, trigger: "blur" }
        ],
        isChecked: [{ validator: validateChecked, trigger: "change" }]
      }
    };
  },
  watch: {
    value(val) {
      this.show = val;
    },
    show(val) {
      this.$emit("input", val);
      this.reset();
    }
  },
  filters: {
    fourDigital(str) {
      if(typeof str == "string"){
        return str.replace(/(\d{4})/g, "$1 ");
      } else {
        return ""
      }
    }
  },
  computed: {
    title() {
      switch (this.withdrawalDetails.pay_type) {
        case 2:
          return "审核-线上微信对公账户";
        case 3:
          return "审核-线上支付宝对公账户";
        case 6:
          return "审核-线下微信收款码";
        case 7:
          return "审核-线下支付宝收款码";
        case 8:
          return "审核-线下支付宝账户";
        case 9:
          return "审核-线下银行账户";
        default:
          return "";
      }
    },
    tips() {
      switch (this.withdrawalDetails.pay_type) {
        case 6:
          return "请用【微信扫一扫收款码】完成付款！";
        case 7:
          return "请用【支付宝扫一扫收款码】完成付款！";
        case 8:
          return "请【手动转账到支付宝账户】完成付款！";
        case 9:
          return "请【手动转账到银行账户】完成付款！";
        default:
          return "";
      }
    },
    confirmText() {
      if(this.isAgree==1) {
        if(this.withdrawalDetails.pay_type == 2 || this.withdrawalDetails.pay_type == 3) {
          return "确定打款";
        } else {
          return "确定已打款";
        }
      } else {
        return "确定";
      }
    }
  },
  methods: {
    getHeadImg(url) {
      if (!/^(http)/i.test(url)) {
        url = this.$store.state.siteComdataPath + url;
      }
      return url;
    },
    reset() {
      var modalBody = document.querySelector(".main-modal .ivu-modal-body");
      modalBody.scrollTop = 0;

      this.isAgree = 1;
      this.formField = {
        isChecked: false,
        reason: ""
      };

      this.$refs.form.resetFields();
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.isAgree) {
            this.$emit("agree");
          } else {
            this.$emit("refuse", this.formField.reason);
          }
        } else {
          this.$Message.error("审核失败");
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.main-modal {
  .special-tips {
    color: #464C5B;
    font-size: 12px;
    line-height: 1;
    margin-bottom: 20px;
    /deep/.ivu-icon-md-alert {
      margin-right: 10px;
      margin-top: -2px;
    }
  }
  /deep/.ivu-modal-body {
    max-height: 490px;
    overflow: auto;
    font-size: 13px;
    padding: 24px;
  }
}
.form {
  .ivu-radio-group{
    vertical-align: top;
  }
  .ivu-radio-wrapper {
    vertical-align: top;
  }
  .special {
    /deep/.ivu-form-item-label {
      padding: 0 12px 0 0;
      line-height: 15px;
    }
    /deep/.ivu-form-item-content {
      line-height: 20px;
    }
  }

  /deep/.ivu-radio-wrapper:first-child {
    margin-right: 26px;
  }
  /deep/.ivu-form-item {
    margin-bottom: 20px;
  }
  .agree {
    .money {
      color: #fd050b;
      font-size: 13px;
    }
    .tips {
      font-size: 14px;
      font-weight: bold;
      color: #464c5b;
    }
    .amount {
      font-size: 16px;
      strong {
        font-weight: bold;
      }
    }

    /deep/.ivu-form-item {
      color: #fd050b;
      .ivu-checkbox-wrapper {
        font-size: 13px;
        padding-top: 2px;
      }
      .ivu-checkbox {
        margin-right: 8px;
        margin-top: -2px;
      }
      .ivu-form-item-label {
        padding: 0 12px 0 0;
        line-height: 20px;
      }

      .ivu-form-item-content {
        line-height: 20px;
      }
    }
    /deep/.ivu-form-item-error {
      .ivu-checkbox-inner {
        border-color: #fd050b;
        box-shadow: 0 0 0 2px rgba(253, 5, 11, 0.2);
      }
    }
    .type-qrcode {
      display: flex;
      margin-bottom: 30px;
      .left {
        margin-right: 40px;
        font-size: 0;
        text-align: center;
      }
      .right {
        .tips {
          margin-bottom: 17px;
        }
        .amount {
          margin-bottom: 12px;
        }
      }
      .qrcode-wrapper {
        position: relative;
        width: 100px;
        margin-bottom: 10px;
        img {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 5px;
          &.wx-qrcode {
            object-position: top left;
          }
          &.zfb-qrcode {
            object-position: 54% left;
          }
        }
        .mask {
          display: none;
          position: absolute;
          width: 100%;
          height: 100%;
          line-height: 100px;
          text-align: center;
          border-radius: 5px;
          background: rgba(0, 0, 0, 0.5);
        }
        &:hover {
          .mask {
            display: block;
          }
        }
      }
    }
    .type-zfb {
      .account {
        width: 364px;
        height: 86px;
        border-radius: 10px;
        color: white;
        padding: 15px;
        background: url(../../css/images/zfb.png) no-repeat left center;
      }
      .tips {
        margin-bottom: 15px;
      }
      .amount {
        display: flex;
        align-items: center;
        height: 60px;
      }
      /deep/.ivu-form-item {
        margin-left: 20px;
        margin-top: 19px;
      }
    }
    .type-bank {
      .account {
        width: 364px;
        height: 86px;
        border-radius: 10px;
        color: white;
        padding: 10px 15px;
        line-height: 16px;
        background: url(../../css/images/bank.png) no-repeat left top -29px;
        p:first-child {
          font-size: 12px;
          
          .float {
            float: right;
          }
        }
        p:nth-child(2) {
          font-size: 16px;
          font-weight: bold;
          line-height: 21px;
          margin: 6px 0px;
        }
        p:nth-child(3) {
          font-size: 12px;
        }
      }
      .tips {
        margin-bottom: 15px;
      }
      .amount {
        display: flex;
        align-items: center;
        height: 60px;
      }
      /deep/.ivu-form-item {
        margin-left: 20px;
        margin-top: 19px;
      }
    }
  }
  .refuse {
    position: relative;
    /deep/.ivu-form-item {
      margin-bottom: 30px;
    }
    /deep/.ivu-input-wrapper {
      display: inline-block;
      textarea {
        width: 250px;
        height: 50px;
        resize: none;
      }
    }
    .suffix {
      position: absolute;
      bottom: 5px;
      right: 90px;
      color: #999;
      font-size: 12px;
    }
  }
}
.info {
  background: #f5f6f7;
  border-radius: 5px;
  margin-top: 3px;
  .title {
    position: relative;
    height: 40px;
    line-height: 40px;
    font-weight: bold;
    border-bottom: 1px solid #e5e5e5;
    padding-left: 20px;
    &:before {
      position: absolute;
      left: 9px;
      top: 12px;
      content: "";
      width: 4px;
      height: 18px;
      border-radius: 20px;
      background: #4a6af5;
    }
  }
  .flex {
    display: flex;
    font-size: 12px;
    padding: 20px 0;
    .left {
      width: 50%;
      text-align: center;
      img {
        width: 48px;
        height: 48px;
        object-fit: cover;
        margin-bottom: 10px;
      }
    }
    .right {
      width: 50%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  }
}
</style>
<style lang="less">
.big-img-modal {
  .ivu-modal-content {
    background: black;
    .ivu-modal-body {
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }
  }
  .ivu-icon-ios-close:hover {
    color: white;
  }
}
</style>