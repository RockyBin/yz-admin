<template>
  <div>
    <Modal v-model="isShow" :width="468" title="支付记录" class="payment-record">
      <div class="status">
        <Icon 
        :type="order_info.payment_status == 1 ? 'md-checkmark-circle' : 'md-close-circle'"
        :color="order_info.payment_status == 1 ? '#19be6b' : '#ed4014'"
        size="48"
        ></Icon>
        <div class="text">
          <div class="title" v-if="order_info.pay_type>=6">财务审核{{order_info.payment_status == 1 ? '已通过' : '不通过'}}</div>
          <div class="title" v-else>财务审核{{order_info.payment_status == 1 ? '已通过' : '不通过'}}（系统自动完成）</div>
          <div v-if="order_info.payment_status == 1" class="content">货款金额  ¥{{order_info.total_money}}<span style="color: #fd050b;">{{order_info.payee && order_info.pay_type <= 9 && order_info.pay_type >= 6 ? '（上级收款）':'（公司收款）'}}</span></div>
          <div v-else class="content">拒绝原因：{{order_info.refuse_remark}}<br/>货款金额 ¥{{order_info.total_money}}<span style="color: #fd050b;">{{order_info.payee && order_info.pay_type <= 9 && order_info.pay_type >= 6 ? '（上级收款）':'（公司收款）'}}</span></div>
        </div>
      </div>
      <div class="info-container">
        <div class="title">核实收款信息</div>
        <div class="content">
          <!--<div class="user-info">-->
            <!--<p style="text-align:center;"><img :src="order_info.headurl ? formatURL(order_info.headurl) :'images/head-portrait.png'" alt=""></p>-->
            <!--<p class="ellipsis">昵称：{{order_info.nickname}}</p>-->
            <!--<p>手机号：{{order_info.mobile}}</p>-->
            <!--<p>ID：{{order_info.member_id}}</p>-->
          <!--</div>-->
          <div class="account-info">
            <template v-if="order_info.pay_type==1">
              <p class="item"><span class="name">结算方式：</span><span class="value">线上结算-余额</span></p>
            </template>
            <template v-if="order_info.pay_type==2">
              <p class="item"><span class="name">结算方式：</span><span class="value">线上结算-微信</span></p>
            </template>
            <template v-if="order_info.pay_type==3">
              <p class="item"><span class="name">结算方式：</span><span class="value">线上结算-支付宝</span></p>
            </template>
			<template v-if="order_info.pay_type==11">
              <p class="item"><span class="name">结算方式：</span><span class="value">通联支付</span></p>
            </template>
            <template v-if="order_info.receipt_info && order_info.pay_type==6">
              <p class="item"><span class="name">结算方式：</span><span class="value">{{order_info.receipt_info.bank}}</span></p>
              <p class="item" style="margin-top: 16px;">
                <span class="name">微信收款码：</span>
                <span class="value absolute">
                  <show-big-img :imgURL="order_info.receipt_info.account"></show-big-img>
                </span>
              </p>
              <p class="item" style="margin-top: 19px;margin-bottom: 7px;">
                <span class="name">支付凭证：</span>
                <span class="value absolute">
                  <show-big-img v-for="(imgURL, index) in order_info.payment_voucher" :key="index" :imgURL="imgURL"></show-big-img>
                </span>
              </p>
            </template>
            <template v-if="order_info.receipt_info && order_info.pay_type==7">
              <p class="item"><span class="name">结算方式：</span><span class="value">{{order_info.receipt_info.bank}}</span></p>
              <p class="item" style="margin-top: 16px;">
                <span class="name">支付宝收款码：</span>
                <span class="value absolute">
                  <show-big-img :imgURL="order_info.receipt_info.account"></show-big-img>
                </span>
              </p>
              <p class="item" style="margin-top: 19px;margin-bottom: 7px;">
                <span class="name">支付凭证：</span>
                <span class="value absolute">
                  <show-big-img v-for="(imgURL, index) in order_info.payment_voucher" :key="index" :imgURL="imgURL"></show-big-img>
                </span>
              </p>
            </template>
            <template v-if="order_info.receipt_info && order_info.pay_type==8">
              <p class="item"><span class="name">结算方式：</span><span class="value">{{order_info.receipt_info.bank}}</span></p>
              <p class="item" style="margin-top: 16px;"><span class="name">账户姓名：</span><span class="value">{{order_info.receipt_info.account_name}}</span></p>
              <p class="item" style="margin-top: 16px;"><span class="name">支付宝账号：</span><span class="value">{{order_info.receipt_info.account}}</span></p>
              <p class="item" style="margin-top: 16px;margin-bottom: 7px;">
                <span class="name">支付凭证：</span>
                <span class="value absolute">
                  <show-big-img v-for="(imgURL, index) in order_info.payment_voucher" :key="index" :imgURL="imgURL"></show-big-img>
                </span>
              </p>
            </template>
            <template v-if="order_info.receipt_info && order_info.pay_type==9">
              <p class="item"><span class="name">结算方式：</span><span class="value">线下结算-银行账户</span></p>
              <p class="item" style="margin-top: 16px;"><span class="name">持卡人：</span><span class="value">{{order_info.receipt_info.account_name}}</span></p>
              <p class="item" style="margin-top: 16px;"><span class="name">开户行：</span><span class="value">{{order_info.receipt_info.bank}}</span></p>
              <p class="item" style="margin-top: 16px;"><span class="name">银行账号：</span><span class="value">{{order_info.receipt_info.account}}</span></p>
              <p class="item" style="margin-top: 16px;margin-bottom: 7px;">
                <span class="name">支付凭证：</span>
                <span class="value absolute">
                  <show-big-img v-for="(imgURL, index) in order_info.payment_voucher" :key="index" :imgURL="imgURL"></show-big-img>
                </span>
              </p>
            </template>
          </div>
        </div>
      </div>
      <div slot="footer">
        <Button type="primary" @click="isShow=false">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import showBigImg from "COMPONENTS/modal/modal-show-big-img.vue"
export default {
  components: {
    showBigImg
  },
  props: {
    value:Boolean,
    order_info: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      isShow: false,
      payType: 1
    }
  },
  watch: {
    value(val) {
      this.isShow = val;
    },
    isShow(val) {
      this.$emit("input", val)
    }
  },
  methods: {
    formatURL(url){
      return /^http/.test(url) ? url : this.$store.state.siteComdataPath + url
    }
  }
}
</script>
<style lang="less">
.payment-record {
  .status {
    width: 259px;
    margin: 0 auto 24px;
    display: flex;
    .text {
      margin-left: 16px;
      .title {
        font-size: 13px;
        font-weight: bold;
        line-height: 2;
      }
      .content {
        font-size: 12px;
        line-height: 1.5;
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
        }
      }
      .account-info {
        line-height: 1.2;
        .item {
          /*margin-bottom: 18px;*/
        }
        .absolute {
          position: absolute;
          margin-top: -7px;
        }
        .img-wrapper {
          margin-right: 10px;
        }
      }
    }
  }
}
  
</style>