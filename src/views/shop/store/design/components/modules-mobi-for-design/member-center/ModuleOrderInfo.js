import BaseModule from "./../BaseModule";
export default {
  createNew: function(target) {
    let options = {};
    var m = BaseModule.createNew("ModuleOrderInfo", target);
    Object.assign(m, options);
    return m;
  }
};