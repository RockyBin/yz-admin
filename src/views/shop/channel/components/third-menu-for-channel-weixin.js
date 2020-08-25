export default {
  thirdMenuList: [],
  getThirdMenu() {
    this.thirdMenuList = [];
    if (window.hasPerm('mp.menu.view')) {
      this.thirdMenuList.push({
        title: "自定义菜单",
        target: "/channel/weixin/custom-menu"
      })
    }
    if (window.hasPerm('mp.reply.view')) {
      this.thirdMenuList.push({
        title: "引导关注",
        target: "/channel/weixin/lead-attention"
      })
    }
    if (window.hasPerm('mp.reply.view')) {
      this.thirdMenuList.push({
        title: "自动回复",
        target: "/channel/weixin/auto-reply"
      })
    }
    if (window.hasPerm('mp.media.view')) {
      this.thirdMenuList.push({
        title: "素材管理",
        target: "/channel/weixin/material-management"
      })
    }
    if (window.hasPerm('mp.config.view')) {
      this.thirdMenuList.push({
        title: "公众号管理",
        target: "/channel/weixin/public-management"
      })
    }
    return this.thirdMenuList;
  }
};