export default {
  thirdMenuList: [],
  getThirdMenu() {
    this.thirdMenuList = [];
    if (window.hasPerm('notice.config.view')) {
      this.thirdMenuList.push({
        title:'买家通知',
        target:'/setting/news/notice/buyer'
      })
    }
    if (window.hasPerm('notice.config.view')) {
      this.thirdMenuList.push({
        title:'卖家通知',
        target:'/setting/news/notice/seller'
      })
    }
    if (window.hasPerm('sms.config.view')) {
      this.thirdMenuList.push({
        title:'短信设置',
        target:'/setting/news/message'
      })
    }
    return this.thirdMenuList;
  }
};