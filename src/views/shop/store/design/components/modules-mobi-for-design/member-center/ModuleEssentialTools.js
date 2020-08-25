import BaseModule from "./../BaseModule";
const params = {
  my_fans_is_show: 1,
  coupon_center_is_show: 1,
  member_collection_is_show: 1,
  my_browse_record_is_show: 1,
  my_address_is_show: 1,
  comment_center_is_show: 1,
  distribution_is_show: 1,
  agent_is_show: 1,
  area_agent_is_show: 1,
  dealer_is_show: 1,
  security_code_is_show: 1,
  shop_cart_is_show: 0,
  member_setting_is_show: 0,
  member_modify_is_show: 0,
  service_phone_is_show: 0,
}
export default {
  createNew: function(target) {
    let options = {
      layout: 1,
      ...params,
      sort_list: Object.keys(params)
    };
    var m = BaseModule.createNew("ModuleMemberTools", target);
    Object.assign(m, options);
    return m;
  }
};