export default {
  thirdMenuList: [],
  getThirdMenu() {
    this.thirdMenuList = [];
    if (window.hasPerm("distributor.config.view")) {
      this.thirdMenuList.push({
        title: "基础设置",
        target: "/distributor/base/setting"
      });
    }
    if (window.hasPerm("distributor.config.view")) {
      this.thirdMenuList.push({
        title: "申请设置",
        target: "/distributor/apply/setting"
      });
    }
    return this.thirdMenuList;
  }
};
