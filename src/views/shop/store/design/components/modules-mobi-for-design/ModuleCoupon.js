import BaseModule from "./BaseModule";
export default {
  createNew: function() {
    var m = BaseModule.createNew("ModuleCoupon");
    m.layout = 1;
    m.padding_top_bottom = 0;
    m.color = "red";
    m.coupon_ids = [];
    m.coupon_list = [];
    m.cols = 3; //显示列数，样式1、4有用
    return m;
  }
};
