import BaseModule from "./BaseModule";
export default {
  createNew: function () {
    var m = BaseModule.createNew("ModuleVideo");
    m.color = "#333";
    m.background = "transparent";
    m.url = "";
    m.scale = 2;
    m.cover = "";
    m.autoplay = 0;
    m.loop = 0;
    return m;
  }
};