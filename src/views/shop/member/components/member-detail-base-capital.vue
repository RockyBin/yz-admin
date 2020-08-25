<template>
  <div class="member-detail-base-capital">
    <div class="member-detail-base-capital-item">
      <div class="member-detail-base-capital-title">
        <titlebar title="余额情况"></titlebar>
        <a href="jvacript:;" @click="onSetBalanceClick" perm="balance.operate">充值/扣减</a>
      </div>
      <div>
        <span>当前可用余额：</span>
        <span>￥{{value.balance}}</span>
      </div>
      <div>
        <span>提现中余额：</span>
        <span>￥{{value.balance_blocked}}</span>
      </div>
      <div>
        <span>累计充值余额：</span>
        <span>￥{{value.balance_history}}</span>
      </div>
    </div>
    <div class="member-detail-base-capital-item">
      <div class="member-detail-base-capital-title">
        <titlebar title="积分情况"></titlebar>
        <a href="jvacript:;" @click="onSetPointClick" perm="point.operate">充值/扣减</a>
      </div>
      <div>
        <span>当前可用积分：</span>
        <span>{{value.point}}</span>
      </div>
      <div>
        <span>当前冻结积分：</span>
        <span>{{value.point_blocked}}</span>
      </div>
      <div>
        <span>累计消费积分：</span>
        <span>{{value.point_consume}}</span>
      </div>
      <div>
        <span>累计获取积分：</span>
        <span>{{value.point_history}}</span>
      </div>
    </div>
    <div class="member-detail-base-capital-item">
      <div class="member-detail-base-capital-title">
        <titlebar title="账户情况"></titlebar>
      </div>
      <div v-if="value.alipay_account">
        <span>支付宝账户：</span>
        <span>{{value.alipay_name + "/" + value.alipay_account}}</span>
      </div>
      <div v-if="value.bank_account" style="display:flex;margin:8px 0;">
        <span style="flex-shrink:0;line-height:16px;">银行账户：</span>
        <span style="line-height:16px;">{{value.bank + "/" }}{{value.bank_branch?value.bank_branch:'--'}}{{"/" + value.bank_card_name + "/" + value.bank_account}}</span>
      </div>
      <div v-if="value.wx_qrcode">
        <span>微信收款码：</span>
        <span class="member-detail-base-capital-img" @click="onViewImageClick(value.wx_qrcode)">
          <img :src="this.$store.state.siteComdataPath + value.wx_qrcode" alt />
          <td>
            <i data-v-4e63a2bc class="ivu-icon ivu-icon-ios-eye-outline"></i>
          </td>
        </span>
      </div>
      <div v-if="value.alipay_qrcode">
        <span>支付宝收款码：</span>
        <span @click="onViewImageClick(value.alipay_qrcode)" class="member-detail-base-capital-img">
          <img :src="this.$store.state.siteComdataPath + value.alipay_qrcode" alt />
          <td>
            <i data-v-4e63a2bc class="ivu-icon ivu-icon-ios-eye-outline"></i>
          </td>
        </span>
      </div>
      <div
        v-if="!value.alipay_account && !value.bank_account && !value.wx_qrcode && !value.alipay_qrcode"
      >暂无</div>
    </div>
    <Modal fullscreen v-model="imageViewStatus" footer-hide>
      <img
        v-if="imageViewSrc"
        style="display: block;position: absolute;top: 0;left: 0;right: 0;bottom: 0;margin: auto;max-width: calc(100vw - 48px);max-height: calc(100vh - 48px);"
        :src="$store.state.siteComdataPath + imageViewSrc"
        alt
      />
    </Modal>
    <rechange-modal v-model="modalRechangeStatus" :type="selectType" :memberInfo="value" />
  </div>
</template>
<script>
import titlebar from "@/views/shop/components/titlebar/vertical-line-titlebar";
import rechangeModal from "./member-rechange-model";
export default {
  components: {
    titlebar,
    rechangeModal
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
      imageViewStatus: false,
      imageViewSrc: "",
      modalRechangeStatus: false,
      selectType: false
    };
  },
  methods: {
    onSetBalanceClick() {
      this.selectType = false;
      this.modalRechangeStatus = true;
    },
    onSetPointClick() {
      this.selectType = true;
      this.modalRechangeStatus = true;
    },
    onViewImageClick(src) {
      this.imageViewSrc = src;
      this.imageViewStatus = true;
    }
  }
};
</script>
<style lang="less" scoped>
.member-detail-base-capital {
  display: flex;
  padding-top: 24px;
  color: #657180;
  .member-detail-base-capital-item {
    border: 1px solid #e9eaf2;
    border-radius: 5px;
    width: 290px;
    height: 215px;
    padding: 8px 16px;
    box-sizing: border-box;
    & + .member-detail-base-capital-item {
      margin-left: 20px;
    }
    &:last-child {
      width: calc(100% - 600px);
    }
    .member-detail-base-capital-title {
      position: relative;
      margin-bottom: 15px;
      color: #464c5b;
      a {
        position: absolute;
        top: 50%;
        transform: translate(78px, -50%);
        font-size: 13px;
        color: #3f66d3;
      }
      & ~ div {
        line-height: 32px;
      }
    }
    & > div:not(.member-detail-base-capital-title) {
      padding-left: 15px;
      span:first-child {
        font-weight: bold;
      }
    }
    .member-detail-base-capital-img {
      position: relative;
      height: 30px;
      margin-top: 1px;
      display: inline-block;
      cursor: pointer;
      &:hover {
        td {
          display: initial;
        }
      }
      img {
        width: 30px;
        height: 30px;
        vertical-align: top;
      }
      td {
        display: none;
        position: absolute;
        width: 30px;
        height: 30px;
        top: 0;
        left: 0;
        background-color: rgba(0, 0, 0, 0.5);
        i {
          position: absolute;
          font-size: 20px;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 50%;
          color: #fff;
        }
      }
    }
  }
}
</style>
