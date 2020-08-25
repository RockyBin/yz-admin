export default {
    thirdMenuList: [],
    getThirdMenu() {
      this.thirdMenuList = [];
      this.thirdMenuList.push({
        title: "基础设置",
        target: "/supplier/base/setting"
      })
      this.thirdMenuList.push({
        title: "提现设置",
        target: "/supplier/setting/withdraw"
      })
      return this.thirdMenuList;
    }
  };