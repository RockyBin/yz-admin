<template>
  <div ref="couponlist" v-if="module.module_type == 'ModuleCoupon'" class="module-coupon">
    <template v-if="module.layout === 1">
      <div
        class="module-coupon-layout-101"
        :class="{'module-coupon-column': !couponOne, 'module-coupon-row module-coupon-one': couponOne}"
      >
        <div
          v-for="(item,index) in module.coupon_list"
          :key="index"
          :class="['coupon-item',module.coupon_list.length > 3 ? 'coupon-cols-' + module.cols : '','color-' + module.color, [3, 4].includes(item.received_status) ? 'coupon-item-disabled': '', module.coupon_list.length === 2 ? 'coupon-item-two':'']"
        >
          <template v-if="!couponOne">
            <div class="coupon-menkan-info">{{getMenkanInfo(item)}}</div>
            <div class="coupon-money-info">
              <span class="money">{{getCouponMoney(item)}}</span>
              <span class="unit">{{item.coupon_type == 0 ? " 元":" 折"}}</span>
            </div>
            <div
              :class="{'coupon-sell-get': [2, 3].includes(item.received_status), 'coupon-sell-out': item.received_status === 4}"
              v-if="[2, 3, 4].includes(item.received_status)"
            ></div>
            <button
              :disabled="item.received_status === 3"
              class="coupon-get-btn"
              v-if="item.received_status !== 4"
              @click="getCoupon(item)"
            >立即领取></button>
          </template>
          <template v-if="couponOne">
            <div class="coupon-money-info">
              <span class="money">{{getCouponMoney(item)}}</span>
              <span class="unit">{{item.coupon_type == 0 ? " 元":" 折"}}</span>
            </div>
            <div
              :class="{'coupon-sell-get': [2, 3].includes(item.received_status), 'coupon-sell-out': item.received_status === 4}"
              v-if="[2, 3, 4].includes(item.received_status)"
            ></div>
            <div class="coupon-btn-content">
              <div class="coupon-menkan-info">{{getMenkanInfo(item)}}</div>
              <button
                :disabled="item.received_status === 3"
                class="coupon-get-btn"
                v-if="item.received_status !== 4"
                @click="getCoupon(item)"
              >立即领取></button>
            </div>
          </template>
        </div>
      </div>
    </template>
    <template v-if="module.layout === 2">
      <div
        class="module-coupon-layout-102 module-coupon-row"
        :class="{'module-coupon-one': couponOne,'module-coupon-500': coupon500}"
      >
        <div
          v-for="(item,index) in module.coupon_list"
          :key="index"
          :class="['coupon-item',module.coupon_list.length > 2 ? 'coupon-cols-more-than-2' : '','color-' + module.color, [3, 4].includes(item.received_status) ? 'coupon-item-disabled': '']"
        >
          <div class="coupon-money-info">
            <span class="unit" v-if="item.coupon_type == 0">￥</span>
            <span class="money">{{getCouponMoney(item)}}</span>
            <span class="unit1" v-if="item.coupon_type == 1">折</span>
          </div>
          <div
            :class="{'coupon-sell-get': [2, 3].includes(item.received_status), 'coupon-sell-out': item.received_status === 4}"
            v-if="[2, 3, 4].includes(item.received_status)"
          ></div>
          <div style="display:inline-block;text-align: right;vertical-align: middle;">
            <div class="coupon-menkan-info">{{getMenkanInfo(item)}}</div>
            <button
              class="coupon-get-btn"
              :disabled="item.received_status === 3"
              v-if="item.received_status !== 4"
              @click="getCoupon(item)"
            >立即领取</button>
          </div>
        </div>
      </div>
    </template>
    <template v-if="module.layout === 3">
      <div
        class="module-coupon-layout-103 module-coupon-row"
        :class="{'module-coupon-one': couponOne}"
      >
        <div
          v-for="(item,index) in module.coupon_list"
          :key="index"
          :class="['coupon-item','color-' + module.color, [3, 4].includes(item.received_status)  ? 'coupon-item-disabled': '']"
        >
          <div class="coupon-money-content">
            <div class="coupon-money-info">
              <span class="unit" v-if="item.coupon_type == 0">￥</span>
              <span class="money">{{getCouponMoney(item)}}</span>
              <span class="unit1" v-if="item.coupon_type == 1">折</span>
            </div>
            <div class="coupon-menkan-info">{{getMenkanInfo(item)}}</div>
          </div>
          <div class="coupon-btn-content">
            <div
              :class="{'coupon-sell-get': [2, 3].includes(item.received_status), 'coupon-sell-out': item.received_status === 4}"
              v-if="[2, 3, 4].includes(item.received_status)"
            ></div>
            <button
              class="coupon-get-btn"
              :disabled="item.received_status === 3"
              v-if="item.received_status !== 4"
              @click="getCoupon(item)"
            >
              <div>立即</div>
              <div>领取</div>
            </button>
          </div>
        </div>
      </div>
    </template>
    <template v-if="module.layout === 4">
      <div
        class="module-coupon-layout-104"
        :class="{'module-coupon-column': !couponOne, 'module-coupon-row module-coupon-one': couponOne}"
      >
        <div
          v-for="(item,index) in module.coupon_list"
          :key="index"
          :class="['coupon-item',module.coupon_list.length > 3 ? 'coupon-cols-' + module.cols : '','color-' + module.color, [3, 4].includes(item.received_status)  ? 'coupon-item-disabled': '', module.coupon_list.length === 2 ? 'coupon-item-two':'']"
        >
          <div
            class="coupon-item-round coupon-item-round-left"
            :style="`background: ${module.background};`"
          ></div>
          <div
            class="coupon-item-round coupon-item-round-right"
            :style="`background: ${module.background};`"
          ></div>
          <div
            class="coupon-item-round coupon-item-round-top"
            :style="`background: ${module.background};`"
          ></div>
          <div
            class="coupon-item-round coupon-item-round-bottom"
            :style="`background: ${module.background};`"
          ></div>
          <div class="coupon-money-info">
            <span class="money">{{getCouponMoney(item)}}</span>
            <span class="unit">{{item.coupon_type == 0 ? " RMB":" 折"}}</span>
          </div>
          <div
            :class="{'coupon-sell-get': [2, 3].includes(item.received_status), 'coupon-sell-out': item.received_status === 4}"
            v-if="[2, 3, 4].includes(item.received_status)"
          ></div>
          <div class="coupon-money-content">
            <div class="coupon-menkan-info">{{getMenkanInfo(item)}}</div>
            <button
              class="coupon-get-btn"
              :disabled="item.received_status === 3"
              v-if="item.received_status !== 4"
              @click="getCoupon(item)"
            >立即领取</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script type="text/ecmascript-6">
export default {
  components: {},
  props: ["module", "editMode"],
  data() {
    return {
      coupon500: false
    };
  },
  computed: {
    couponOne() {
      return this.module.coupon_list.length === 1;
    }
  },
  mounted() {
    this.coupon500 = this.$refs.couponlist.clientWidth >= 490;
    if(this.$route.query.action == 'getcoupon'){
      var item = this.module.coupon_list.filter(x => x.id = this.$route.query.coupon_id);
      console.log(item);
      this.getCoupon(item[0]);
    }
  },
  methods: {
    getMenkanInfo(info) {
      var menkan = parseFloat(info.doorsill_full_money);
      if (menkan <= 0 || isNaN(menkan)) {
        return "无使用门槛";
      } else {
        return "满 " + menkan + " 元可用";
      }
    },
    getCouponMoney(info) {
      var coupon_money = parseFloat(info.coupon_money);
      return coupon_money;
    },
    getCoupon(item) {
      if(this.getDeviceType() == 2){
        var url = window.location.href;
        url += (url.indexOf("?") > -1 ? "&":"?") + "&action=getcoupon&coupon_id=" + item.id;
        this.$qrpopup({
          title: "手机扫码，安全登录", 
          tips: "打开微信扫码登录商城领取优惠券",
          qrurl: url
        });
        return;
      }
      var data = { id: item.id };
      this.$toast.loading({
        duration: 0,
        message:"领取中"
      })
      this.$httpGet("/shop/front/coupon/receivedcoupon", data, res => {
        this.$toast.clear();
        switch (res.code) {
          case 200:
            this.$toast(
              `${this.$t("shop-front.product_detail.youHaveReceivedACoupon")}`
            );
            this.$set(item, "received_status", 2);
            break;
          case 201:
            this.$set(item, "received_status", 3);
            this.$toast(res.msg);
            break;
          case 511:
            this.$set(item, "received_status", 4);
            this.$toast(res.msg);
            break;

          case 513:
            this.module.coupon_list.forEach((element, index) => {
              if (element.id === item.id) {
                this.module.coupon_list.splice(index, 1);
              }
            });
            this.$toast(res.msg);
            break;
          default:
            this.$toast(res.msg);
            break;
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.module-coupon {
  /* 橙色 */
  .color-orange {
    &.coupon-item {
      background-color: #f67238;
    }
  }
  /* 蓝色 */
  .color-blue {
    &.coupon-item {
      background-color: #41a3ee;
    }
  }
  /* 红色 */
  .color-red {
    &.coupon-item {
      background-color: #ea3d44;
    }
  }
  /* 纵向排列 */
  .module-coupon-column {
    display: flex;
    overflow: auto;
    .coupon-item {
      display: flex;
      align-items: center;
      flex-direction: column;
      flex-shrink: 0;
      flex: 1;
    }
  }
  /* 横向排列 */
  .module-coupon-row {
    display: flex;
    overflow: auto;
    .coupon-item {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      flex: 1;
    }
  }
  button {
    border: none;
    background: none;
  }
  .coupon-sell-get,
  .coupon-sell-out {
    opacity: 0.7;
  }
  /* 模块1开始 */
  .module-coupon-layout-101 {
    .coupon-item {
      min-width: calc((100% - 20px) / 3);
      padding: 0 14px;
      position: relative;
      height: 124px;
      border-radius: 5px;
      color: #fff;
      font-size: 12px;
      overflow: hidden;
      flex: none;
      &.coupon-cols-4 {
        min-width: calc((100% - 30px) / 4);
      }
      &.coupon-cols-5 {
        min-width: calc((100% - 40px) / 5);
      }
      &.coupon-cols-6 {
        min-width: calc((100% - 50px) / 6);
      }
      &.coupon-item-two {
        min-width: calc((100% - 10px) / 2);
      }
      & > div {
        position: relative;
        z-index: 1;
      }
      &::before {
        content: "";
        position: absolute;
        display: block;
        top: 2px;
        left: 2px;
        bottom: 2px;
        right: 2px;
        border-radius: 5px;
        border: 1px solid #fa585f;
        z-index: 0;
      }
      & + div.coupon-item {
        margin-left: 10px;
      }
      .coupon-menkan-info {
        margin-top: 12px;
      }
      .coupon-money-info {
        font-family: "Microsoft YaHei Light";
        font-size: 32px;
        margin-top: 4px;
        .unit {
          text-align: center;
          font-size: 20px;
          display: inline-block;
          width: 28px;
          height: 28px;
          line-height: 28px;
          border-radius: 50%;
          background-color: #fff;
          color: rgba(229, 64, 74, 1);
          transform: scale(0.5);
          vertical-align: baseline;
          margin-left: -2px;
        }
      }
      .coupon-get-btn {
        position: relative;
        color: #ffc1c4;
        margin-top: 4px;
        z-index: 1;
      }
      .coupon-sell-get,
      .coupon-sell-out {
        position: absolute;
        width: 56px;
        height: 42px;
        bottom: -7px;
        left: -4px;
        background-repeat: no-repeat;
        background-size: contain;
        background-image: ~"url(./images/coupon/looting.png)";
      }
      .coupon-sell-get {
        background-image: ~"url(./images/coupon/gotten.png)";
      }
      &.coupon-item-disabled {
        background-color: #999;
        &::before {
          border: 1px solid transparent !important;
        }
        .coupon-money-info {
          .unit {
            color: #999;
          }
        }
        .coupon-get-btn {
          color: #fff;
        }
        .coupon-sell-get {
          background-image: ~"url(./images/coupon/gotten-grey.png)";
        }
      }
    }
    &.module-coupon-one {
      .coupon-item {
        justify-content: space-between;
        padding: 0 24px;
        height: 80px;
        flex: 1;
        .coupon-money-info {
          font-size: 40px;
          margin-top: 0;
        }
        .coupon-btn-content {
          text-align: right;

          .coupon-menkan-info {
            margin-top: 0;
            max-width: 150px;
          }
          .coupon-get-btn {
            display: inline-block;
          }
        }

        .coupon-sell-get,
        .coupon-sell-out {
          bottom: 0;
          right: 0;
          left: 0;
          top: 0;
          margin: auto;
        }
      }
    }
    .color-blue {
      &::before {
        border: 1px solid #6dbffe;
      }
      .coupon-money-info {
        .unit {
          color: #41a3ee;
        }
      }
      .coupon-get-btn {
        color: #b9e1ff;
      }
    }
    .color-orange {
      &::before {
        border: 1px solid #ff9e74;
      }
      .coupon-money-info {
        .unit {
          color: #f5773f;
        }
      }
      .coupon-get-btn {
        color: #ffc7ae;
      }
    }
  }
  /* 模块1结束 */
  /* 模块2开始 */
  .module-coupon-layout-102 {
    white-space: nowrap;
    &.module-coupon-500{
      .coupon-item {
        min-width: 250px;
      }
    }
    .coupon-item {
      min-width: calc((100% - 1px) / 2);
      position: relative;
      height: 78px;
      color: #fff;
      font-size: 12px;
      overflow: hidden;
      align-items: center;
      padding: 0 20px 0 20px;
      display: inline-block;
      flex: none;
      & + .coupon-item {
        margin-left: 1px;
      }
      & > div {
        position: relative;
        z-index: 1;
        line-height: 2;
      }
      &::before {
        content: "";
        position: absolute;
        display: block;
        top: 8px;
        left: 9px;
        bottom: 8px;
        right: 9px;
        border: 1px solid #fa585f;
        z-index: 0;
      }
      .coupon-money-info {
        display: inline-block;
        font-size: 40px;
        margin-right: 14px;
        vertical-align: middle;
        .unit {
          text-align: center;
          font-size: 12px;
          display: inline-block;
          width: 14px;
          height: 14px;
          line-height: 14px;
          vertical-align: text-top;
          margin-right: 8px;
          margin-top: 8px;
          margin-left: -2px;
        }
        .unit1 {
          text-align: center;
          font-size: 12px;
          display: inline-block;
          width: 14px;
          height: 14px;
          line-height: 14px;
          vertical-align: baseline;
          margin-left: 4px;
        }
      }
      .coupon-menkan-info {
        text-align: center;
      }
      .coupon-get-btn {
        text-align: center;
        color: rgba(234, 61, 68, 1);
        margin: 4px auto 0;
        width: 90px;
        height: 20px;
        line-height: 20px;
        background-color: #ffe19f;
      }

      .coupon-sell-get,
      .coupon-sell-out {
        position: absolute;
        width: 56px;
        height: 42px;
        top: -9px;
        right: -6px;
        background-repeat: no-repeat;
        background-size: contain;
        background-image: ~"url(./images/coupon/looting.png)";
      }
      .coupon-sell-get {
        background-image: ~"url(./images/coupon/gotten.png)";
      }
      &.coupon-item-disabled {
        background-color: #999;
        &::before {
          border: 1px solid transparent;
        }
        .coupon-get-btn {
          background-color: #666;
          color: #fff;
        }
        .coupon-sell-get {
          background-image: ~"url(./images/coupon/gotten-grey.png)";
        }
      }
    }
    &.module-coupon-one {
      .coupon-item {
        justify-content: space-between;
        flex: 1;
        display: flex;
        .coupon-menkan-info {
          width: 150px;
          text-align: right;
          white-space: pre-wrap;
          line-height: 16px;
        }
        .coupon-get-btn {
          margin-right: 0;
        }
        .coupon-sell-get,
        .coupon-sell-out {
          bottom: 0;
          right: 0;
          left: 0;
          top: 0;
          margin: auto;
        }
      }
    }
    .color-blue {
      &::before {
        border: 1px solid #6dbffe;
      }
      .coupon-get-btn {
        color: #41a3ee;
        background-color: #ffffff;
      }
    }
    .color-orange {
      &::before {
        border: 1px solid #ff9e74;
      }
      .coupon-get-btn {
        color: #f67238;
        background-color: #f6be38;
      }
    }
  }
  /* 模块2结束 */
  /* 模块3开始 */
  .module-coupon-layout-103 {
    .coupon-item {
      min-width: 255px;
      position: relative;
      height: 88px;
      border-radius: 5px;
      color: #fff;
      font-size: 12px;
      overflow: hidden;
      justify-content: space-between;
      text-align: center;
      flex: none;

      & + div.coupon-item {
        margin-left: 10px;
      }
      .coupon-btn-content {
        position: relative;
        width: 88px;
        height: 88px;
        &:after {
          content: "";
          display: block;
          border: 1px dashed #fa585f;
          position: absolute;
          left: 0;
          top: 10px;
          bottom: 10px;
        }
        .coupon-get-btn {
          display: flex;
          width: 100%;
          height: 88px;
          color: #ffe19f;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          font-size: 16px;
        }
        .coupon-sell-get,
        .coupon-sell-out {
          position: absolute;
          width: 56px;
          height: 42px;
          right: -7px;
          top: -7px;
          background-repeat: no-repeat;
          background-size: contain;
          background-image: ~"url(./images/coupon/looting.png)";
        }
        .coupon-sell-get {
          background-image: ~"url(./images/coupon/gotten.png)";
        }
        .coupon-sell-out {
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          margin: auto;
        }
      }
      .coupon-money-content {
        position: relative;
        padding: 15px;
        min-width: calc(100% - 88px);
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: none;
        &:before,
        &:after {
          content: "";
          position: absolute;
          display: block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          right: -1px;
          background-color: #fff;
        }
        &:before {
          top: 0;
          transform: translate(50%, -50%);
        }
        &:after {
          bottom: 0;
          transform: translate(50%, 50%);
        }
        .coupon-menkan-info {
          margin-top: 10px;
          color: #fbcf93;
        }
        .coupon-money-info {
          font-size: 36px;
          height: 28px;
          line-height: 28px;
          .unit {
            text-align: center;
            font-size: 16px;
            display: inline-block;
            vertical-align: baseline;
            margin-right: 3px;
          }
          .unit1 {
            text-align: center;
            font-size: 16px;
            display: inline-block;
            vertical-align: baseline;
            margin-left: 3px;
          }
        }
      }
      &.coupon-item-disabled {
        background-color: #999;
        .coupon-btn-content {
          &:after {
            content: "";
            display: block;
            border: 1px dashed rgba(255, 255, 255, 0.3);
            position: absolute;
            left: 0;
            top: 10px;
            bottom: 10px;
          }
          .coupon-get-btn {
            color: #fff;
          }
        }
        .coupon-menkan-info {
          color: #fff;
        }
      }
    }
    &.module-coupon-one {
      .coupon-item {
        flex: 1;
      }
    }
    .color-blue {
      &:not(.coupon-item-disabled) .coupon-money-content {
        .coupon-menkan-info {
          color: #b9e1ff;
        }
      }
      .coupon-btn-content {
        &:after {
          border-color: #6dbffe;
        }
        .coupon-get-btn {
          color: white;
        }
      }
    }
    .color-orange {
      &:not(.coupon-item-disabled) .coupon-money-content {
        .coupon-menkan-info {
          color: #ffc7ae;
        }
      }
      .coupon-btn-content {
        &:after {
          border-color: #ff9e74;
        }
        .coupon-get-btn {
          color: white;
        }
      }
    }
  }
  /* 模块3结束 */
  /* 模块4开始 */
  .module-coupon-layout-104 {
    /* 橙色 */
    .color-orange {
      &.coupon-item {
        color: #f67238;
        &::before {
          border-color: #f67238;
        }
        .coupon-sell-get {
          background-image: ~"url(./images/coupon/gotten-orange.png)";
        }
        &.coupon-item-gotten {
        }
        .coupon-item-round {
          border-color: #f67238;
        }
        .coupon-money-content {
          .coupon-get-btn {
            background-color: #f67238;
          }
        }
      }
    }
    /* 蓝色 */
    .color-blue {
      &.coupon-item {
        color: #41a3ee;
        &::before {
          border-color: #41a3ee;
        }
        .coupon-sell-get {
          background-image: ~"url(./images/coupon/gotten-blue.png)";
        }
        .coupon-item-round {
          border-color: #41a3ee;
        }
        .coupon-money-content {
          .coupon-get-btn {
            background-color: #41a3ee;
          }
        }
      }
    }
    /* 红色 */
    .color-red {
      &.coupon-item {
        color: #ea3d44;
        &::before {
          border-color: #ea3d44;
        }
        .coupon-sell-get {
          background-image: ~"url(./images/coupon/gotten-red.png)";
        }
        .coupon-item-round {
          border-color: #ea3d44;
        }
        .coupon-money-content {
          .coupon-get-btn {
            background-color: #ea3d44;
          }
        }
      }
    }
    .coupon-item {
      background: #fff;
      min-width: calc(100% / 3);
      padding: 0 14px;
      position: relative;
      height: 140px;
      font-size: 12px;
      overflow: hidden;
      flex: none;
      &.coupon-cols-4 {
        min-width: calc(100% / 4);
      }
      &.coupon-cols-5 {
        min-width: calc(100% / 5);
      }
      &.coupon-cols-6 {
        min-width: calc(100% / 6);
      }
      &.coupon-item-two {
        min-width: calc(100% / 2);
      }
      & > div {
        position: relative;
        z-index: 1;
      }
      &::before {
        content: "";
        position: absolute;
        display: block;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        border: 1px solid #ea3d44;
        z-index: 0;
      }
      .coupon-item-round {
        box-sizing: border-box;
        position: absolute;
        width: 10px;
        height: 10px;
        border: 1px solid #ea3d44;
        border-radius: 50%;
        &.coupon-item-round-left {
          top: 0;
          left: 0;
          transform: translate(-50%, -50%);
        }
        &.coupon-item-round-right {
          bottom: 0;
          right: 0;
          transform: translate(50%, 50%);
        }
        &.coupon-item-round-top {
          top: 0;
          right: 0;
          transform: translate(50%, -50%);
        }
        &.coupon-item-round-bottom {
          bottom: 0;
          left: 0;
          transform: translate(-50%, 50%);
        }
      }

      .coupon-money-info {
        font-size: 30px;
        margin-top: 15px;
        font-family: "Microsoft YaHei Light";
        span {
          display: block;
        }
        .money {
          height: 30px;
          line-height: 30px;
          text-align: center;
        }
        .unit {
          text-align: center;
          font-size: 14px;
          margin-top: 5px;
        }
      }
      .coupon-money-content {
        .coupon-menkan-info {
          text-align: center;
          margin-top: 7px;
          color: #333333;
        }
        .coupon-get-btn {
          text-align: center;
          color: #ffc1c4;
          height: 18px;
          line-height: 18px;
          width: 86px;
          background-color: #ea3d44;
          color: #fff;
          margin: 11px auto 0;
        }
      }

      .coupon-sell-get,
      .coupon-sell-out {
        position: absolute;
        width: 56px;
        height: 42px;
        top: -5px;
        right: -5px;
        background-repeat: no-repeat;
        background-size: contain;
      }
      &.coupon-item-disabled {
        color: #999;
        .coupon-money-content {
          .coupon-menkan-info {
            color: #999;
          }
          .coupon-get-btn {
            background-color: #999;
          }
        }
        &:before,
        .coupon-item-round {
          border-color: #e5e5e5;
        }
        .coupon-sell-get {
          background-image: ~"url(./images/coupon/gotten-grey.png)";
        }
        .coupon-sell-out {
          bottom: 5px;
          right: 0px;
          left: 0;
          top: auto;
          margin: auto;
          background-image: ~"url(./images/coupon/looting.png)";
        }
      }
    }
    &.module-coupon-one {
      .coupon-item {
        justify-content: space-between;
        padding: 20px;
        height: 80px;
        flex: 1;
        .coupon-money-info {
          margin-top: 0;
          margin-left: 14px;
        }
        .coupon-money-content {
          text-align: right;
          .coupon-menkan-info {
            text-align: right;
            margin: -2px 0;
            width: 150px;
            line-height: 16px;
            overflow: hidden;
          }
          .coupon-get-btn {
            display: inline-block;
            margin-top: 10px;
          }
        }

        .coupon-sell-get,
        .coupon-sell-out {
          bottom: 0;
          right: 0;
          left: 0;
          top: 0;
          margin: auto;
        }
      }
    }
  }
  /* 模块4结束 */
}
</style>
