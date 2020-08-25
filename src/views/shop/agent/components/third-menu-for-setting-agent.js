export default {
  thirdMenuList: [],
  getThirdMenu() {
    this.thirdMenuList = [];
    if (window.hasPerm('agent.config.view')) {
      this.thirdMenuList.push({
        title: "基础设置",
        target: "/agent/setting/base"
      })
    }
    if (window.hasPerm('agent.config.view')) {
      this.thirdMenuList.push({
        title: "加盟设置",
        target: "/agent/setting/joining"
      })
    }
    if (window.hasPerm('agent.config.view')) {
      this.thirdMenuList.push({
        title: "升级设置",
        target: "/agent/setting/update"
      })
    }
    if (window.hasPerm('agent.config.view')) {
      this.thirdMenuList.push({
        title: "销售奖",
        target: "/agent/reward/sale"
      })
    }
    if (window.hasPerm('agent.config.view')) {
      this.thirdMenuList.push({
        title: "推荐奖",
        target: "/agent/reward/recommend"
      })
    }
    if (window.hasPerm('agent.config.view')) {
      this.thirdMenuList.push({
        title: "业绩奖",
        target: "/agent/reward/performance"
      })
    }
    if (window.hasPerm('agent.config.view') && window.hasLicensePerm('ENABLE_GRATITUDE_AWARD')) {
      this.thirdMenuList.push({
        title: "感恩奖",
        target: "/agent/reward/gratitude"
      })
    }
    return this.thirdMenuList;
  }
};