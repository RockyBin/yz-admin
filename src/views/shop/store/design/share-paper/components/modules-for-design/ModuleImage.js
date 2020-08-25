import BaseModule from "./BaseModule";
export default {
  createNew: function(options) {
    if (!options) {
      options = {"top":"300px","left": "45%","width":"120px","height":"120px","src":"images/share-paper/defaultimg.png"};
    }
    if(typeof options['borderRadius'] == "undefined") options['borderRadius'] = "0";
    var m = BaseModule.createNew("ModuleImage",options);
    return m;
  }
};
