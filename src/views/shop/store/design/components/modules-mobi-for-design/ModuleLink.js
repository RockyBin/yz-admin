import BaseModule from "./BaseModule";
export default {
  createNew: function () {
    var m = BaseModule.createNew("ModuleLink");
    m.layout = 1;
    m.items = [this.newItem(), this.newItem(), this.newItem(),this.newItem()];
    m.padding_top_bottom = 0;
    m.font_color = "#333";
    m.row_num = 4;
    m.row_count = 1; //滑动显示时，显示多少行
    m.show_num = 4; //滑动显示时，一屏显示多少个
    m.slide = 0;
    m.border_radius = "0px";
    return m;
  },
  newItem: function () {
    return {
      image: "",
      link_text: "",
      link_desc: "",
      link_type: "none",
      link_data: "",
      link_url: ""
    };
  }
};
