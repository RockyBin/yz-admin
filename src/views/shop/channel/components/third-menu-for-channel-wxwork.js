export default {
  thirdMenuList: [],
  getThirdMenu() {
    this.thirdMenuList = [];
    if (window.hasPerm('wxwork.config.view')) {
      this.thirdMenuList.push({
        title: "企业微信绑定",
        target: "/channel/wxwork/wxwork-setting"
      })
    }
    return this.thirdMenuList;
  }
};