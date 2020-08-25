import BaseModule from "./BaseModule";
export default {
  createNew: function(options) {
    if (!options) {
      options = {"top":"50px","left":"45%","width":"64px","height":"64px"};
    }
    var m = BaseModule.createNew("ModuleHead",options);
    return m;
  }
};
