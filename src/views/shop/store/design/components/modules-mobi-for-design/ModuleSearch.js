import BaseModule from "./BaseModule";
export default {
  createNew: function () {
    var m = BaseModule.createNew("ModuleSearch");
    m.style = 1;
    m.fix_top = 0;
    m.padding_top_bottom = 0;
    m.padding_left_right = 0;
    m.background = "#fff";
    m.keyword = "";
    m.keyword_align = "center";
    m.font_color = "#333";
    m.icon_color = "#999";
    m.input_background = "#f8f9fa";
    return m;
  }
};
