import BaseModule from "./BaseModule";
export default {
  createNew: function(options) {
    if (!options) {
      options = {"color":"black","fontSize":16,"bold":1,"top":"130px","left": "16%", "width": "68%"};
    }
    if(!options['fontSize']) options['fontSize'] = 12;
    if(!options['textAlign']) options['textAlign'] = "right";
    if(!options['bold']) options['bold'] = 1;
    var m = BaseModule.createNew("ModuleNickName",options);
    return m;
  }
};
