<template>
  <!-- 底部列表项 -->
  <div
    class="member-center-info"
    :class="{'member-center-info-layout-one': module.layout === 1, 'member-center-info-layout-two': module.layout === 2}"
  >
    <div
      class="member-center-info-list"
      v-for="item in showList"
      :key="item.key"
      @click="item.click"
    >
      <div class="member-center-info-icon special">
        <div class="container">
          <div
            :class="'container-icon-' + item.key"
            :style="`background-image: url(${iconImage});`"
          ></div>
        </div>
        <div class="left">{{item.text}}</div>
        <span class="count" v-if="item.num">{{item.num}}</span>
        <i class="right iconfont iconfont1 icon-fanhui" v-if="module.layout === 1"></i>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["memberInfo", "module"],
  data() {
    return {
      iconImage: require("./images/icon-center.png")
    };
  },
  computed: {
    // 分销开关打开，才显示分销选项
    isDistributionOpened() {
      return (
        Number(this.memberInfo.distribution_config_level) > 0 &&
        this.hasLicensePerm("ENABLE_DISTRIBUTION")
      );
    },
    // 代理开关打开，才显示团队分红选项
    isAgentOpened() {
      return (
        Number(this.memberInfo.agent_config_level) > 0 &&
        this.hasLicensePerm("ENABLE_AGENT")
      );
    },
    isRegionalOpened() {
      return this.hasLicensePerm("ENABLE_AREA_AGENT");
    },
    // 经销商云仓开关打开，才显示经销商选项
    isDealerOpened() {
      return this.hasLicensePerm("ENABLE_CLOUDSTOCK");
    },
    //防伪码打开，才显示防伪码查询
    isSecurityOpened() {
      return this.hasLicensePerm("ENABLE_SECURITY_CODE");
    },
    showList() {
      let items = [];
      let showItems = this.getShowItems();
      // 添加已经排好序的
      this.module.sort_list.forEach(n => {
        // 选中显示且不重复的添加到显示列表
        this.module[n] && showItems[n] && items.push(showItems[n]);
        delete showItems[n];
      });
      // 添加未排序的
      Object.keys(showItems).forEach(n => {
        this.module[n] && items.push(showItems[n]);
      });
      return items.filter(n => n.status);
    }
  },
  methods: {
    getShowItems() {
      return {
        member_collection_is_show: {
          text: "收藏夹",
          key: 1,
          click: () => {
            this.$router.push({ name: "memberCollection" });
          },
          num: this.module.layout === 1 && this.memberInfo.product_collection,
          status: this.memberInfo.retail_status
        },
        my_browse_record_is_show: {
          text: "我的足迹",
          key: 2,
          click: () => {
            this.$router.push({ name: "memberBrowserecord" });
          },
          num: this.module.layout === 1 && this.memberInfo.browse_num,
          status: this.memberInfo.retail_status
        },
        my_address_is_show: {
          text: "地址管理",
          key: 3,
          click: () => {
            this.$router.push({ name: "manageAddress" });
          },
          status: true
        },
        comment_center_is_show: {
          text: "评价中心",
          key: 4,
          click: () => {
            this.memberInfo.product_comment_status &&
              this.$router.push({ name: "memberEvaluateCenter" });
          },
          status:
            this.memberInfo.retail_status &&
            this.memberInfo.product_comment_status
        },
        distribution_is_show: {
          text: this.$t
            ? this.$t("shop-front.diy_word.distribution_center")
            : "分销中心",
          key: 5,
          click: this.distributorClick,
          status: this.isDistributionOpened && this.memberInfo.retail_status
        },
        agent_is_show: {
          text: this.$t
            ? this.$t("shop-front.diy_word.team_agent_reward")
            : "代理中心",
          key: 6,
          click: this.agentItemClick,
          status: this.memberInfo.retail_status && this.isAgentOpened
        },
        area_agent_is_show: {
          text: "区域代理中心",
          key: 15,
          click: this.regionalItemClick,
          status: this.memberInfo.retail_status && this.isRegionalOpened
        },
        dealer_is_show: {
          text: this.$t
            ? this.$t("shop-front.diy_word.team_dealer_center")
            : "经销商中心",
          key: 7,
          click: this.dealerItemClick,
          status: this.isDealerOpened
        },
        security_code_is_show: {
          text: "防伪查询",
          key: 8,
          click: () => {
            this.$router.push({ name: "securityCheck" });
          },
          status: this.isSecurityOpened
        },
        shop_cart_is_show: {
          text: "购物车",
          key: 9,
          click: () => {
            this.$router.push({ name: "shoppingCart" });
          },
          status: this.memberInfo.retail_status
        },
        member_setting_is_show: {
          text: "个人设置",
          key: 10,
          click: () => {
            this.$router.push({ name: "memberPersonInfoView" });
          },
          status: true
        },
        member_modify_is_show: {
          text: "修改信息",
          key: 11,
          click: () => {
            this.$router.push({ name: "memberPersonInfoEdit" });
          },
          status: true
        },
        service_phone_is_show: {
          text: "联系客服",
          key: 12,
          click: () => {
            this.$router.push({ name: "customerService" });
          },
          status: true
        },
        my_fans_is_show: {
          text: "我的粉丝",
          key: 13,
          click: () => {
            this.$router.push({ name: "memberFans" });
          },
          status: true
        },
        coupon_center_is_show: {
          text: "领券中心",
          key: 14,
          click: () => {
            this.$router.push({ name: "couponCenter" });
          },
          status: this.memberInfo.retail_status
        }
      };
    },
    // 单击分销中心进行判断
    distributorClick() {
      if (
        this.memberInfo.is_distributor > 0 ||
        this.memberInfo.distributor_del ||
        this.memberInfo.distributor_status == -2
      ) {
        this.$router.push({ name: "distributorCenter" });
      } else {
        this.$router.push({ name: "distributorApply" });
      }
    },
    // 单击团队分红跳转到分红中心
    agentItemClick() {
      this.$router.push({ name: "agentCenter" });
    },
    // 单击区域代理中心跳转到区域代理中心
    regionalItemClick() {
      this.$router.push({ name: "areaagentCenter" });
    },
    // 单击经销商中心
    dealerItemClick() {
      this.$router.push({ name: "cloudCenter" });
    }
  }
};
</script>
<style lang="less" scoped>
// 用户信息
.member-center-info {
  display: flex;
  width: calc(100% - 20px);
  margin: 10px;
  border-radius: 5px;
  background-color: #fff;
  color: #333;
  flex-wrap: wrap;
  justify-content: space-between;
  box-shadow: 2px 2px 5px #33333312;
  // 用于占位，防止后台显示内容为空时无法点击
  min-height: 53px;
  // 左边图标部分（固定宽高）
  .member-center-info-icon {
    .container {
      width: 27px;
      height: 27px;
      display: inline-block;
      div {
        height: 100%;
        background-position-x: center;
        background-size: 100% auto;
        background-repeat: no-repeat;
      }
      .container-icon-1 {
        background-position-y: 1px;
      }
      .container-icon-2 {
        background-position-y: -38px;
      }
      .container-icon-3 {
        background-position-y: -74px;
      }
      .container-icon-4 {
        background-position-y: -111px;
      }
      .container-icon-5 {
        background-position-y: -148px;
      }
      .container-icon-6 {
        background-position-y: -185px;
      }
      .container-icon-7 {
        background-position-y: -222px;
      }
      .container-icon-8 {
        background-position-y: -259px;
      }
      .container-icon-9 {
        background-position-y: -296px;
      }
      .container-icon-10 {
        background-position-y: -333px;
      }
      .container-icon-11 {
        background-position-y: -370px;
      }
      .container-icon-12 {
        background-position-y: -407px;
      }
      .container-icon-13 {
        background-position-y: -444px;
      }
      .container-icon-14 {
        background-position-y: -482px;
      }
      .container-icon-15 {
        background-position-y: -518px;
      }
    }
  }
  &.member-center-info-layout-one {
    .member-center-info-list {
      width: 100%;
      height: 53px;
      line-height: 53px;
      text-align: left;
      box-sizing: border-box;
      .special {
        &::after {
          content: "";
          display: block;
          margin-right: 10px;
          margin-left: 10px;
          margin-top: -2px;
          height: 1px;
          background: #f7f7f7;
        }
      }
      .member-center-info-icon {
        .container {
          top: 10px;
          margin-left: 10px;
          margin-right: 8px;
          position: relative;
        }
        .left {
          font-size: 14px;
          display: inline-block;
        }
        .count {
          color: #666666;
          font-size: 12px;
          position: absolute;
          right: 47px;
        }
        .right {
          width: 20px;
          float: right;
          line-height: 53px;
          font-size: 14px;
          font-weight: bold;
          color: #666;
          transform: rotate(180deg);
          text-align: right;
        }
      }
    }
  }
  &.member-center-info-layout-two {
    padding: 15px 0;
    justify-content: left;
    .member-center-info-list {
      width: 25%;
      text-align: center;
      box-sizing: border-box;
      &:nth-child(n + 5) {
        margin-top: 25px;
      }
      .member-center-info-icon {
        display: flex;
        height: 50px;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        .left {
          font-size: 12px;
          line-height: 18px;
          display: inline-block;
        }
        .count {
          color: #666666;
          font-size: 12px;
          position: absolute;
          right: 47px;
        }
        .right {
          width: 20px;
          float: right;
          line-height: 53px;
          font-size: 14px;
          font-weight: bold;
          color: #666;
          transform: rotate(180deg);
          text-align: right;
        }
      }
    }
  }
}
</style>