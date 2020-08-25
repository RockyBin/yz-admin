<template>
  <div>
    <Modal v-model="isShow" :width="468" :title="verifyInfo && verifyInfo.status == 1 ? '通过记录' : '拒绝记录'" class="payment-record">
      <div v-if="verifyInfo">
        <div class="status">
          <Icon 
          v-if="verifyInfo.status"
          :type="verifyInfo.status == 1 ? 'md-checkmark-circle' : 'md-close-circle'"
          :color="verifyInfo.status == 1 ? '#19be6b' : '#ed4014'"
          size="48"
          ></Icon>
          <div class="text">
            <div class="title">财务审核{{verifyInfo.status == 1 ? '已通过' : '不通过'}}</div>
            <div v-if="verifyInfo.status == -1" class="content">拒绝原因：{{verifyInfo.reject_reason}}</div>
          </div>
        </div>
        <div class="border-top">
          <div class="format-item">充值：￥{{verifyInfo.info ? verifyInfo.info.money : "0.00"}}（公司收款）</div>
          <div class="format-item" style="margin-bottom:0px;" v-if="verifyInfo.info && verifyInfo.info.recharge_bonus && parseFloat(verifyInfo.info.recharge_bonus.bonus) != 0">赠送：￥{{verifyInfo.info.recharge_bonus.bonus}}（公司赠送）</div>
        </div>
        <div class="info-container">
          <div class="title">核对收款信息</div>
          <div class="content">
            <div class="account-info">
              <template v-if="verifyInfo.info && verifyInfo.info.pay_type==6">
                <p class="item"><span class="name">结算方式：</span><span class="value">{{verifyInfo.info.dealer_account.bank}}</span></p>
                <p class="item" style="margin-top: 16px;">
                  <span class="name">微信收款码：</span>
                  <span class="value absolute">
                    <show-big-img :imgURL="verifyInfo.info.dealer_account.account"></show-big-img>
                  </span>
                </p>
                <p class="item" style="margin-top: 19px;margin-bottom: 7px;">
                  <span class="name">支付凭证：</span>
                  <span class="value absolute">
                    <show-big-img v-for="(imgURL, index) in verifyInfo.info.snapshot" :key="index" :imgURL="imgURL"></show-big-img>
                  </span>
                </p>
              </template>
              <template v-if="verifyInfo.info && verifyInfo.info.pay_type==7">
                <p class="item"><span class="name">结算方式：</span><span class="value">{{verifyInfo.info.dealer_account.bank}}</span></p>
                <p class="item" style="margin-top: 16px;">
                  <span class="name">支付宝收款码：</span>
                  <span class="value absolute">
                    <show-big-img :imgURL="verifyInfo.info.dealer_account.account"></show-big-img>
                  </span>
                </p>
                <p class="item" style="margin-top: 19px;margin-bottom: 7px;">
                  <span class="name">支付凭证：</span>
                  <span class="value absolute">
                    <show-big-img v-for="(imgURL, index) in verifyInfo.info.snapshot" :key="index" :imgURL="imgURL"></show-big-img>
                  </span>
                </p>
              </template>
              <template v-if="verifyInfo.info && verifyInfo.info.pay_type==8">
                <p class="item"><span class="name">结算方式：</span><span class="value">{{verifyInfo.info.dealer_account.bank}}</span></p>
                <p class="item" style="margin-top: 16px;"><span class="name">账户名称：</span><span class="value">{{verifyInfo.info.dealer_account.account_name}}</span></p>
                <p class="item" style="margin-top: 16px;"><span class="name">支付宝账号：</span><span class="value">{{verifyInfo.info.dealer_account.account}}</span></p>
                <p class="item" style="margin-top: 16px;margin-bottom: 7px;">
                  <span class="name">支付凭证：</span>
                  <span class="value absolute">
                    <show-big-img v-for="(imgURL, index) in verifyInfo.info.snapshot" :key="index" :imgURL="imgURL"></show-big-img>
                  </span>
                </p>
              </template>
              <template v-if="verifyInfo.info && verifyInfo.info.dealer_account && verifyInfo.info.pay_type==9">
                <p class="item"><span class="name">结算方式：</span><span class="value">线下结算-银行账户</span></p>
                <p class="item" style="margin-top: 16px;"><span class="name">持卡人：</span><span class="value">{{verifyInfo.info.dealer_account.account_name}}</span></p>
                <p class="item" style="margin-top: 16px;"><span class="name">开户行：</span><span class="value">{{verifyInfo.info.dealer_account.bank}}</span></p>
                <p class="item" style="margin-top: 16px;"><span class="name">银行账号：</span><span class="value">{{verifyInfo.info.dealer_account.account}}</span></p>
                <p class="item" style="margin-top: 16px;margin-bottom: 7px;">
                  <span class="name">支付凭证：</span>
                  <span class="value absolute">
                    <show-big-img v-for="(imgURL, index) in verifyInfo.info.snapshot" :key="index" :imgURL="imgURL"></show-big-img>
                  </span>
                </p>
              </template>
            </div>
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
    verifyInfo: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      isShow: false,
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
    align-items: center;
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
  .border-top {
    padding: 20px;
    border-top: 1px dashed #E3E5E8;
    .format-item {
      margin-bottom: 16px;
      &:last-child {
        margin-bottom: 0px;
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