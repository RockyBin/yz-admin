import BaseModule from "./BaseModule";
export default {
  createNew: function() {
    var m = BaseModule.createNew("ModuleLine");
    m.color = "#E1E1E1";
    m.background = "transparent";
    m.type = 1;
    m.width = 1;
    m.padding_top_bottom = 5;
    return m;
  }
};
