import BaseModule from "./BaseModule";
export default {
  createNew: function() {
    var m = BaseModule.createNew("ModuleGroupBuying");
    m.layout = 1;
    m.padding_left_right = 10;
    m.product_margin = 5;
    m.product_style = 1;
    m.border_style = 0;
    m.groupbuying_setting_id = 0;
    m.product_list = [];
    m.product_ids = [];
    m.background = "transparent";
    return m;
  }
};