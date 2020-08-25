export default {
  thirdMenuList: [],
  getThirdMenu() {
    this.thirdMenuList = [];
    if (window.hasPerm("wxapp.config.view")) {
      this.thirdMenuList.push({
        title: "小程序绑定",
        target: "/channel/wxapp/wxapp-setting"
      });
    }
    if (window.hasPerm("wxapp.config.view")) {
      this.thirdMenuList.push({
        title: "小程序发布",
        target: "/channel/wxapp/wxapp-publish"
      });
    }
    return this.thirdMenuList;
  }
};