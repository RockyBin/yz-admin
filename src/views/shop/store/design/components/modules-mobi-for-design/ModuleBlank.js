import BaseModule from "./BaseModule";
export default {
  createNew: function() {
    var m = BaseModule.createNew("ModuleBlank");
    m.height = 30;
    m.background = "transparent";
    return m;
  }
};
