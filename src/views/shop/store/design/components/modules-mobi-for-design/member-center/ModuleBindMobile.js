import BaseModule from "./../BaseModule";
export default {
  createNew: function(target) {
    let options = {};
    var m = BaseModule.createNew("ModuleBindMobile", target);
    Object.assign(m, options);
    return m;
  }
};