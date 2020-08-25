import BaseModule from "./BaseModule";
export default {
  createNew: function () {
    var m = BaseModule.createNew("ModuleTitle");
    m.color = "#333";
    m.background = "#fff";
    m.title = "";
    m.layout = 1;
    m.type = 1;
    m.padding_top_bottom = 0;
    m.link_desc = "";
    m.link_type = "none";
    m.link_data = "";
    m.link_url = "";
    return m;
  }
};