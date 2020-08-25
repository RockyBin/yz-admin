import BaseModule from "./BaseModule";
export default {
  createNew: function() {
    var m = BaseModule.createNew("ModuleSlider");
    m.layout = 1;
    m.items = [this.newItem(), this.newItem(), this.newItem()];
    m.padding_top_bottom = 0;
    m.padding_left_right = 0;
    m.image_style = 1;
    m.border_style = 1;
    m.auto_play = 3;
    return m;
  },
  newItem: function() {
    return {
      image: "images/slider/demopic.png",
      link_desc: "",
      link_type: "none",
      link_data: "",
      link_url: "",
      has_link: 0
    };
  }
};
