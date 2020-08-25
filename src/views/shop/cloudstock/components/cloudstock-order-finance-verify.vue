<template>
<div>
  <Modal v-model="isShow" width="470" title="财务审核" class="cloudstock-order-finance-verify">
    <Form ref="form" :labelWidth="86" :model="formFields" :rules="rules">
      <FormItem label="审核：">
        <RadioGroup v-model="formFields.review_status">
          <Radio :label="1">通过</Radio>
          <Radio :label="0">不通过</Radio>
        </RadioGroup>
      </FormItem>
      <div v-show="!formFields.review_status" style="margin-bottom: 20px">
        <Icon type="md-alert" style="color: #FF9900;font-size: 14px;margin-right: 10px;vertical-align:text-bottom;" />
        <span style="font-size:12px;color: #FE3737;line-height: initial;">您可能已收取用户的货款，请到线下处理退款！</span>
      </div>
      <FormItem v-show="formFields.review_status" label="支付凭证：" class="normal-lineheight">
        <show-big-img v-for="(imgURL,index) in order_info.payment_voucher" :imgURL="imgURL" :key="index" imgWidth="40px"></show-big-img>
        <span style="color:#747782;font-size:12px;">(点击可查看大图)</span>
      </FormItem>
      <FormItem v-show="formFields.review_status" class="confirm" prop="payment_status">
        <span class="confirm-text">货款 ￥{{order_info.total_money}}<span>{{order_info.payee ? '（上级收款）':'（公司收款）'}}</span></span>
        <Checkbox v-model="formFields.payment_status" :true-value="1" :false-value="0">我已收到线下付款！</Checkbox>
      </FormItem>
      <FormItem v-show="!formFields.review_status" label="拒绝原因：" prop="remark">
        <div class="input-wrapper">
          <Input v-model="formFields.remark" :maxlength="20" type="textarea"/>
          <span class="suffix">{{formFields.remark ? formFields.remark.length : 0}}/20</span>
        </div>
      </FormItem>
    </Form>
    <div class="info-container">
      <div class="title">核实收款信息</div>
      <div class="content">
        <!--<div class="user-info">-->
          <!--<p style="text-align:center;"><img :src="order_info.headurl ? formatURL(order_info.headurl) : 'images/head-portrait.png'" alt=""></p>-->
          <!--<p class="ellipsis">昵称：{{order_info.nickname}}</p>-->
          <!--<p>手机号：{{order_info.mobile}}</p>-->
          <!--<p>ID：{{order_info.member_id}}</p>-->
        <!--</div>-->
        <div class="account-info">
          <template v-if="order_info.receipt_info && order_info.receipt_info.pay_type==6">
            <p class="item" style="margin-bottom: 16px;"><span class="name">结算方式：</span><span class="value">{{order_info.receipt_info.bank}}</span></p>
            <p class="item" style="margin-bottom: 7px;">
              <span class="name">微信收款码：</span>
              <span class="value absolute">
                <show-big-img :imgURL="order_info.receipt_info.account"></show-big-img>
              </span>
            </p>
          </template>
          <template v-if="order_info.receipt_info && order_info.receipt_info.pay_type==7">
            <p class="item" style="margin-bottom: 16px;"><span class="name">结算方式：</span><span class="value">{{order_info.receipt_info.bank}}</span></p>
            <p class="item" style="margin-bottom: 7px;">
              <span class="name">支付宝收款码：</span>
              <span class="value absolute">
                <show-big-img :imgURL="order_info.receipt_info.account"></show-big-img>
              </span>
            </p>
          </template>
          <template v-if="order_info.receipt_info && order_info.receipt_info.pay_type==8">
            <p class="item" style="margin-bottom: 16px;"><span class="name">结算方式：</span><span class="value">{{order_info.receipt_info.bank}}</span></p>
            <p class="item" style="margin-bottom: 16px;"><span class="name">账户姓名：</span><span class="value">{{order_info.receipt_info.account_name}}</span></p>
            <p class="item"><span class="name">支付宝账号：</span><span class="value">{{order_info.receipt_info.account}}</span></p>
          </template>
          <template v-if="order_info.receipt_info && order_info.receipt_info.pay_type==9">
            <p class="item" style="margin-bottom: 16px;"><span class="name">结算方式：</span><span class="value">线下结算-银行账户</span></p>
            <p class="item" style="margin-bottom: 16px;"><span class="name">持卡人：</span><span class="value">{{order_info.receipt_info.account_name}}</span></p>
            <p class="item" style="margin-bottom: 16px;"><span class="name">开户行：</span><span class="value">{{order_info.receipt_info.bank}}</span></p>
            <p class="item"><span class="name">银行账号：</span><span class="value">{{order_info.receipt_info.account}}</span></p>
          </template>
        </div>
      </div>
    </div>
    <div slot="footer">
      <Button type="text" @click="close">取消</Button>
      <Button type="primary" @click="verify">{{formFields.review_status ? '确认已打款' : '确定'}}</Button>
    </div>
  </Modal>
</div>
</template>
<script>
import axios from "axios"
import showBigImg from "COMPONENTS/modal/modal-show-big-img.vue"
export default {
  components: {
    showBigImg
  },
  props:{
    value: Boolean,
    order_id: {
      type: [String, Number],
      default: null
    },
    order_info: {
      type: Object,
      default: {}
    }
  },
  data() {
    const validateReason = (rule, value, callback) => {
      if(this.formFields.review_status || value) {
        callback()
      } else {
        callback("请确输入拒绝原因")
      }
    };
    const validateChecked = (rule, value, callback) => {
      if (!this.formFields.review_status || value) {
        callback();
      } else {
        callback(" ");
      }
    };
    return {
      payType: 2,
      isShow: false,
      imgURL: "",
      formFields: {
        review_status: 1,
        payment_status: 0,
        remark: ""
      },
      rules: {
        remark: [{validator: validateReason, trigger: "blur", required: true}],
        payment_status: [{ validator: validateChecked, trigger: "change" }]
      }
    }
  },
  watch: {
    value(val) {
      this.isShow = val;
    },
    isShow(val){
      this.$emit("input", val)
      if(val) {
        this.$refs.form.resetFields()
        this.formFields = {
          review_status: 1,
          payment_status: 0,
          remark: ""
        }
      }
    }
  },
  methods: {
    formatURL(url){
      return /^http/.test(url) ? url : this.$store.state.siteComdataPath + url
    },
    close() {
      this.isShow = false
      this.$refs.form.resetFields()
    },
    verify() {
      this.$refs.form.validate(valid => {
        if(valid) {
          if(this.isLoading) {
            return
          } else {
            this.isLoading = true;
          }
          let data = Object.assign({order_id: this.order_id},this.formFields)
          axios.post("/shop/admin/cloudstock/purchase/finance/review", data).then(res => {
            if(res.code == 200){
              this.isShow = false
              this.$Message.success("审核成功")
              if(this.$route.name == "cloudstockOrderDetailBuy"){
                this.$parent.getOrderInfo()
              } else {
                this.$parent.getList()
              }
            } else {
              this.$Message.error(res.msg)
            }
          }).catch(e => {
            this.$Message.error(e)
          }).finally(() => {
            setTimeout(() => {
              this.isLoading = false
            }, 300)
          })
        } else {
          this.$Message.error("审核失败")
        }
      })
    }
  }
}
</script>
<style lang="less">
  .cloudstock-order-finance-verify{
    .ivu-form {
      margin-bottom: 20px;
      .ivu-radio-group{
        vertical-align: top;
      }
      .ivu-radio-wrapper {
        vertical-align: top;
        margin-right: 20px;
        .ivu-radio{
          margin-right: 5px;
        }
      }
      .normal-lineheight {
        /deep/.ivu-form-item-content {
          line-height: normal;
        }
      }
      .img-wrapper {
        margin-right: 10px;
        vertical-align: text-bottom;
      }
      .confirm{
        .confirm-text{
          font-size: 13px;
          font-weight: bold;
          color:#ED4014;
          margin-right: 20px;
        }
        .ivu-checkbox{
          margin-right: 5px;
        }
        .ivu-form-item-content{
          margin-left: 0px !important;
        }
        &.ivu-form-item-error {
          .ivu-checkbox-inner {
            border-color: #fd050b;
            box-shadow: 0 0 0 2px rgba(253, 5, 11, 0.2);
          }
        }
      }
      .input-wrapper {
        position: relative;
        display: inline-block;
        width: 250px;
        textarea{
          padding-right: 35px;
        }
        .suffix {
          position: absolute;
          right: 10px;
          bottom: 0px;
        }
      }
    }
    .info-container{
      background: #f5f6f7;
      border-radius: 5px;
      .title {
        position: relative;
        height: 40px;
        line-height: 40px;
        font-weight: bold;
        font-size: 13px;
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
      .content {
        display: flex;
        font-size: 12px;
        padding: 20px;
        .user-info{
          width: 40%;
          margin-right: 20px;
          line-height: 1.7;
          flex-shrink: 0;
          .ellipsis {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          img {
            width: 48px;
            height: 48px;
            object-fit: cover;
            margin-bottom: 10px;
            border-radius: 4px;
          }
        }
        .account-info {
          line-height: 1.5;
          .item {
            /*margin-bottom: 16px;*/
            .name {
              white-space: nowrap;
            }
            .value {
              word-break: break-all;
            }
          }
          .absolute {
            position: absolute;
            margin-top: -7px;
          }
        }
      }
    }
  }
</style>