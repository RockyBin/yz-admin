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
    m.showlink = 0; //当二维码链接类型为商城网址时，是否显示链接选择器
    m.linkinfo = {
      link_type: 0,
      link_data: 0,
      link_url: "",
      link_desc: ""
    };
    return m;
  }
};