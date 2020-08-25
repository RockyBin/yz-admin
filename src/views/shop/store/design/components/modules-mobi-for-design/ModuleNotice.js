import BaseModule from "./BaseModule";
export default {
  createNew: function() {
    var m = BaseModule.createNew("ModuleNotice");
    m.color = "#333";
    m.background = "#fff";
    m.icon = "images/icon/4.png";
    m.items = [
      {
        content: "",
        link_desc: "",
        link_type: "none",
        link_data: "",
        link_url: "/"
      }
    ];
    m.padding_top_bottom = 0;
    m.padding_left_right = 15;
    return m;
  },
  newItem: function() {
    return {
      content: "",
      color: "#333",
      link_desc: "",
      link_type: "none",
      link_data: "",
      link_url: ""
    };
  }
};
