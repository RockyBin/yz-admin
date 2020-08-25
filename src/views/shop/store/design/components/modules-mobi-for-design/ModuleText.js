import BaseModule from "./BaseModule";
export default {
  createNew: function() {
    var m = BaseModule.createNew("ModuleText");
    m.text = "请输入文本";
    return m;
  }
};
