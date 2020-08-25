import store from "@/store";
export default {
  install(Vue) {
    /**
     * 检查登录权限
     */
    window.hasPerm = function(perm) {
      var me = store.state.userInfo;
      if (!me) return false;
      var arr = perm.toString().split(",");
      var arUserPerm = me.perms;
      var flag = false;
      for (var j = 0; j < arr.length; j++) {
        for (var i = 0; i < arUserPerm.length; i++) {
          if (
            arUserPerm[i].toLowerCase().trim() === "site.admin" ||
            arUserPerm[i].toLowerCase().trim() === arr[j].toLowerCase() ||
            arr[j].split("&").every(item => {
              return arUserPerm.includes(item.toLowerCase().trim())
            })
          ) {
            flag = true;
            break;
          }
        }
      }
      return flag;
    };

    /**
     * 检查版本权限
     */
    window.hasLicensePerm = function(perm) {
      var LicensePerm = store.state.LicensePerm;
      var arr = perm.toString().split(",");
      for (var i = 0; i < LicensePerm.length; i++) {
        for (var j = 0; j < arr.length; j++) {
          if (
            arr[j].toLowerCase().trim() ===
            LicensePerm[i].toLowerCase().trim()
          ) {
            return true;
          }
        }
      }
      return false;
    };

    /**
     * 取得一个随机号,以后可能用guid取代
     */
    window.guid = function() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };

    /**
     * 检测是否是导出的站点
     */
    window.isExportSite = function() {
      return store.getters.userInfo.SingleWeb;
    };

    window["me"] = {
      hasPerm: window.hasPerm,
      hasLicensePerm: window.hasLicensePerm,
      guid: window.guid,
      isExportSite: window.isExportSite
    };

    Vue.prototype.hasPerm = window.hasPerm;
    Vue.prototype.hasLicensePerm = window.hasLicensePerm;
    Vue.prototype.guid = window.guid;
    Vue.prototype.isExportSite = window.isExportSite;
  }
};
