import ModuleHelper from "./mobile-module-helper";
export default {
  data() {
    return {
      designData: {},
      modules: [],
      memberInfo: {
        id: 387,
        site_id: 1,
        name: "",
        nickname: "会员昵称",
        headurl: "",
        level: 88,
        mobile: "13111111111",
        email: "11111111@no.com",
        terminal_type: 2,
        regfrom: 0,
        is_distributor: 1,
        agent_level: 2,
        agent_parent_id: 415,
        invite1: 415,
        buy_times: 555,
        buy_money: "65800.33",
        deal_times: 279,
        deal_money: "37036.40",
        status: 1,
        point: 6972,
        point_blocked: 12737,
        point_consume: 8910,
        point_history: 28619,
        balance: "147116.05",
        balance_blocked: "2.93",
        balance_history: "232070.11",
        invite_nickname: "小梦",
        invite_name: "匿名用户",
        level_text: "VIP13",
        product_collection: 18,
        coupon_able: 102,
        distributor_del: 0,
        distributor_status: 1,
        browse_num: 101,
        order_count: {
          no_pay: 6,
          pay: 152,
          send: 25,
          done: 331,
          wait_comment: 49
        },
        aftersale_isopen: 1,
        product_comment_status: 1,
        distribution_config_level: 3,
        agent_config_level: 3,
        invite_code: 88888,
        retail_status: 0,
        color_config: "red"
      }
    };
  },
  methods: {
    /**
     * 加载会员个人中心信息
     */
    loadMemberpageInfo() {
      this.$httpGet(
        "/shop/admin/ui/design/mobile/member/center/config",
        "",
        res => {
          Object.assign(this.designData, {
            retail_status: res.data.retail_status
          });
          this.$set(this.memberInfo, "retail_status", res.data.retail_status);
          this.$set(this.memberInfo, "color_config", res.data.color_config);
        }
      );
      this.$httpGet("/shop/front/page/mobile/info?type=2", "", res => {
        if (res.data.pageInfo) this.pageInfo = res.data.pageInfo;
        if (!this.pageInfo.title) {
          this.pageInfo.title = "会员首页";
        }
        // 如果用户没有编辑过个人中心页面，则显示默认选项
        if (!this.pageInfo.id) {
          this.modules = [
            ModuleHelper.newModule("ModuleMemberInfo", "member"),
            ModuleHelper.newModule("ModuleCapitalInfo", "member"),
            ModuleHelper.newModule("ModuleOrderInfo", "member"),
            ModuleHelper.newModule("ModuleWxSubscribe", "member"),
            ModuleHelper.newModule("ModuleMemberTools", "member")
          ];
        } else {
          this.modules = res.data.modules.modules;
          if (!this.modules.filter(item=>item.module_type=='ModuleWxSubscribe').length){
            let obj2 = {
              background: "transparent",
              fix_top: 0,
              id:"temp_256325",
              layout: 0,
              layout_color: null,
              module_type: "ModuleWxSubscribe",
              padding_left_right: 0,
              padding_top_bottom: 0,
              publish: 1
            }
            this.modules.splice(3,0,obj2);
          }
        }
      });
    }
  }
}