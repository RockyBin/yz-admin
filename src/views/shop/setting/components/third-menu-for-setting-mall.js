export default {
  thirdMenuList: [],
  getThirdMenu() {
    this.thirdMenuList = [];
    if (window.hasPerm("shop.config.view")) {
      this.thirdMenuList.push({
        title: "商城设置",
        target: "/setting/mall/mall"
      });
    }
    if (window.hasPerm("pay.config.view")) {
      this.thirdMenuList.push({
        title: "支付设置",
        target: "/setting/mall/pay"
      });
    }
    if (window.hasPerm("order.config.view")) {
      this.thirdMenuList.push({
        title: "订单设置",
        target: "/setting/mall/order"
      });
    }
    if (window.hasPerm("logistics.view")) {
      this.thirdMenuList.push({
        title: "物流设置",
        target: "/setting/mall/logisticsList"
      });
    }
    if (window.hasPerm("withdraw.config.view")) {
      this.thirdMenuList.push({
        title: "提现设置",
        target: "/setting/mall/getCash"
      });
    }
    if (window.hasPerm("word.view")) {
      this.thirdMenuList.push({
        title: "文字设置",
        target: "/setting/mall/word"
      });
    }
    if (window.hasPerm("store.config.view")) {
      this.thirdMenuList.push({
        title: "商户设置",
        target: "/setting/mall/merchant"
      });
    }
    if (window.hasPerm("site.config.view")) {
      this.thirdMenuList.push({
        title: "通用设置",
        target: "/setting/mall/generic"
      });
    }
    if (window.hasPerm("copyright.config.view") && !window.hasLicensePerm("ENABLE_FORCE_HIDE_COPYRIGHT")) {
      this.thirdMenuList.push({
        title: "版权设置",
        target: "/setting/copyright"
      });
    }
    if (window.hasPerm("site.config.view")) {
      this.thirdMenuList.push({
        title: "第三方客服",
        target: "/setting/mall/service3rd"
      });
    }
    if (window.hasPerm("ssl.config.view")) {
      this.thirdMenuList.push({
        title: "SSL证书",
        target: "/setting/ssl/list"
      });
    }
    // this.thirdMenuList.push({
    //   title: "滚屏设置",
    //   target: "/setting/mall/roll"
    // });
    return this.thirdMenuList;
  }
};