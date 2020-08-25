export default {
  thirdMenuList: [],
  getThirdMenu() {
    this.thirdMenuList = [];
    if (window.hasPerm('dealer.config.view')) {
      this.thirdMenuList.push({
        title: "基础设置",
        target: "/dealer/setting/base"
      })
    }
	  if (window.hasPerm('dealer.config.view')) {
      this.thirdMenuList.push({
        title: "加盟设置",
        target: "/dealer/setting/apply"
      })
    }
    if (window.hasPerm('dealer.config.view')) {
      this.thirdMenuList.push({
        title: "提现设置",
        target: "/dealer/setting/withdraw"
      })
    }
    if (window.hasPerm("dealer.config.view")) {
      this.thirdMenuList.push({
        title: "业绩奖",
        target: "/dealer/reward/performance"
      })
    }
    if (window.hasPerm("dealer.config.view")) {
      this.thirdMenuList.push({
        title: "推荐奖",
        target: "/dealer/reward/recommend"
      })
    }
    if (window.hasPerm("dealer.config.view")) {
      this.thirdMenuList.push({
        title: "销售奖",
        target: "/dealer/reward/sale"
      })
    }
    // this.thirdMenuList.push({
    //   title: "订货返现奖",
    //   target: "/dealer/recurrentce/award"
    // })
    return this.thirdMenuList;
  }
};