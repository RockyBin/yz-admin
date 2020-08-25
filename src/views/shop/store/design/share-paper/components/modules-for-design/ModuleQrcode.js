import BaseModule from "./BaseModule";
export default {
  createNew: function (options) {
    if (!options) {
      options = {
        "color": "black",
        "top": "300px",
        "left": "45%",
        "width": "120px",
        "height": "120px"
      };
    }
    options["logo"] = null;
    var m = BaseModule.createNew("ModuleQrcode", options);
    m.qrtype = 0;
    m.linkinfo = {
      link_type: "home",
      link_data: null,
      link_url: "#/",
      link_desc: "链接到 店铺首页"
    };
    return m;
  }
};