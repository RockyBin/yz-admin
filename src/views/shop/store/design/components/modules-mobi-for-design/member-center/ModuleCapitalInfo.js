import BaseModule from "./../BaseModule";
export default {
  createNew: function(target) {
    let options = {
      my_balance_is_show: 1,
      my_point_is_show: 1,
      my_coupon_is_show: 1
    };
    var m = BaseModule.createNew("ModuleCapitalInfo", target);
    Object.assign(m, options);
    return m;
  }
};