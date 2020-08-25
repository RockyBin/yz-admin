import BaseModule from "./BaseModule";
export default {
  createNew: function(options) {
    if (!options) {
      options = {"color":"black","fontSize":14,"bold":0,"top":"180px","left": "45%","text":"请输入文本内容"};
    }
    if(!options['fontSize']) options['fontSize'] = 12;
    if(!options['textAlign']) options['textAlign'] = "left";
    if(!options['bold']) options['bold'] = 0;
    var m = BaseModule.createNew("ModuleText",options);
    return m;
  }
};
