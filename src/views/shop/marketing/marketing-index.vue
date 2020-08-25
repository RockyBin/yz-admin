<template>
  <div class="marketing-index">
    <div v-html="styleHtml"></div>
    <div :class="item.class" v-for="(item, index) in dataArray" :key="index">
      <div class="marketing-index-title">{{ item.title }}</div>
      <div class="marketing-index-list">
        <div
          class="marketing-index-item"
          :class="{ 'marketing-index-item-new': item1.isNew }"
          v-for="(item1, index) in item.list"
          :key="index"
          :perm="item1.perm || ''"
          @click="onItemClick(item1)"
        >
          <div class="marketing-index-item-left">
            <img :src="item1.image" alt="" />
          </div>
          <div class="marketing-index-item-right">
            <div>{{ item1.name }}</div>
            <div>{{ item1.text }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      styleHtml: `
        <style>
          .matter {
            background: #f2f4fd !important;
          }
        </style>
      `,
      dataArray: [
        {
          title: "营销工具",
          class: "marketing-index-top",
          list: [
            {
              image: "images/marketing/multiplayer-group.png",
              name: "多人拼团",
              isNew: true,
              perm: "group.buying.view",
              licensePerm: window.hasLicensePerm("ENABLE_GROUP_BUYING"),
              link: "marketingGroupbuying",
              text: "引导客户邀请朋友一起拼团购买"
            },
            {
              image: "images/marketing/coupon.png",
              name: "优惠券",
              perm: "coupon.view",
              link: "marketingManage",
              text: "向客户发放店铺优惠券"
            },
            {
              image: "images/marketing/integral.png",
              name: "积分",
              perm: "point.view",
              link: "marketingIntegral",
              text: "向客户发放积分"
            },
            {
              image: "images/marketing/free-shipping.png",
              name: "满额包邮",
              isNew: true,
              perm: "free.shipping.view",
              link: "marketingFreeShipping",
              text: "单笔订单满额即可包邮"
            },
            {
              image: "images/marketing/recharge-offer.png",
              name: "充值优惠",
              perm: "rechargebonus.view",
              isNew: true,
              licensePerm: window.hasLicensePerm("ENABLE_RECHARGE_BONUS"),
              link: "marketingRechargeBonus",
              text: "充值余额优惠赠送"
            }
          ]
        },
        {
          title: "应用工具",
          class: "marketing-index-top",
          list: [
            {
              image: "images/marketing/community-distribution.png",
              name: "社群分销",
              perm: "distributor.view",
              licensePerm: window.hasLicensePerm("ENABLE_DISTRIBUTION"),
              link: "distributorList",
              text: "社群分销"
            },
            {
              image: "images/marketing/proxy.png",
              name: "3级代理",
              perm: "agent.view",
              isNew: true,
              licensePerm: window.hasLicensePerm("ENABLE_AGENT"),
              link: "agentList",
              text: "3级代理"
            },
            {
              image: "images/marketing/area-agent.png",
              name: "区域代理",
              perm: "area.agent.view",
              isNew: true,
              licensePerm: window.hasLicensePerm("ENABLE_AREA_AGENT"),
              link: "areaAgentList",
              text: "区域代理"
            },
            {
              image: "images/marketing/cloud-storage.png",
              name: "智能云仓",
              perm: "dealer.level.view",
              isNew: true,
              licensePerm: window.hasLicensePerm("ENABLE_CLOUDSTOCK"),
              link: "dealerList",
              text: "智能云仓"
            },
            {
              image: "images/marketing/supplier.png",
              name: "供应商",
              perm: "supplier.view",
              isNew: true,
              licensePerm: window.hasLicensePerm("ENABLE_SUPPLIER"),
              link: "supplierList",
              text: "商城供应商管理，异业联盟合作"
            },
            {
              image: "images/marketing/live-interaction.png",
              name: "直播互动",
              perm: "live.view",
              isNew: true,
              licensePerm: window.hasLicensePerm("ENABLE_LIVE"),
              link: "liveManage",
              text: "互动转化，直播带货"
            },
            {
              image: "images/marketing/security-code.png",
              name: "防伪码",
              perm: "security.view",
              isNew: true,
              licensePerm: window.hasLicensePerm("ENABLE_SECURITY_CODE"),
              link: "securityCodestock",
              text: "商品防伪码功能"
            },
             {
              image: "images/marketing/ship-quickly.png",
              name: "快递发货应用",
              perm: "express.view",
              isNew: true,
              link: "marketingExpress",
              text: "快递打单，电子面单"
            }
          ]
        },
        {
          title: "渠道终端",
          class: "marketing-index-bottom",
          list: [
            {
              image: "images/marketing/the-public.png",
              name: "微信公众号",
              perm: "mp.menu.view",
              link: "customMenu",
              text: "微信公众号"
            },
            {
              image: "images/marketing/applets.png",
              name: "微信小程序",
              perm: "wxapp.config.view",
              isNew: true,
              licensePerm: window.hasLicensePerm("ENABLE_WXAPP"),
              link: "wxappSetting",
              text: "微信小程序"
            },
            {
              image: "images/marketing/enterprise-wechat.png",
              name: "企业微信",
              perm: "wxwork.config.view",
              isNew: true,
              licensePerm: window.hasLicensePerm("ENABLE_WXWORK"),
              link: "wxworkSetting",
              text: "企业微信"
            }
          ]
        }
      ]
    };
  },
  methods: {
    onItemClick(item) {
      if (item.link) {
        if (!item.hasOwnProperty("licensePerm") || item.licensePerm) {
          this.$router.push({
            name: item.link
          });
        } else { 
          this.$Modal.confirm({
            title: "提示",
            okText: "知道了",
            render: h => {
              let content = h(
                "div",
                "您的店铺暂时还没有开启该功能，如有需要请联系我们！"
              );
              this.$nextTick(() => {
                content.context._data.showCancel = false;
              });
              return content;
            }
          });
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
.marketing-index {
  color: #464c5b;
  .marketing-index-title {
    height: 32px;
    line-height: 32px;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 20px;
  }
  .marketing-index-list {
    width: 910px;
    .marketing-index-item {
      position: relative;
      display: inline-flex;
      width: 290px;
      padding: 11px 10px;
      background-color: #f5f6f7;
      border-radius: 3px;
      overflow: hidden;
      cursor: pointer;
      &:nth-child(3n + 2),
      &:nth-child(3n + 3) {
        margin-left: 20px;
      }
      &:nth-child(n + 4) {
        margin-top: 20px;
      }
      &.marketing-index-item-new {
        &::before,
        &::after {
          content: "";
          position: absolute;
          display: block;
          right: 0;
          top: 0;
        }
        &::before {
          width: 0;
          height: 0;
          border: 11px solid;
          border-color: #ff9900 #ff9900 transparent transparent;
        }
        &::after {
          content: "NEW";
          width: 60px;
          height: 36px;
          color: #fff;
          line-height: 36px;
          text-align: center;
          background-color: #ff9900;
          font-size: 18px;
          transform: scale(0.5);
          transform-origin: top right;
        }
      }
      .marketing-index-item-left img {
        display: block;
        width: 58px;
        height: 58px;
      }
      .marketing-index-item-right {
        margin-left: 16px;
        & > div {
          &:nth-child(1) {
            line-height: 19px;
            margin: 7px 0 8px;
            font-size: 14px;
            font-weight: bold;
          }
          &:nth-child(2) {
            font-size: 12px;
            line-height: 16px;
            color: #9ea7b4;
          }
        }
      }
    }
  }
  .marketing-index-top {
    background-color: #fff;
    padding: 24px 24px 25px;
    border-radius: 3px;
    margin-bottom: 10px;
  }
  .marketing-index-bottom {
    background-color: #fff;
    padding: 24px 24px 20px;
    border-radius: 3px;
  }
}
</style>
