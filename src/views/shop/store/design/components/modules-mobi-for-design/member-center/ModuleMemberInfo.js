import BaseModule from "./../BaseModule";
export default {
  createNew: function(target) {
    let options = {
      layout: 1,
      invitation_code_is_show: 0,
      member_level_is_show: 1
    };
    var m = BaseModule.createNew("ModuleMemberInfo", target);
    Object.assign(m, options);
    return m;
  }
};
