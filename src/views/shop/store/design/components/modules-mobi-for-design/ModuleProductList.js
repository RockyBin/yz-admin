import BaseModule from "./BaseModule";
let m = null;
export default {
  createNew: function() {
    m = BaseModule.createNew("ModuleProductList");
    m.layout = 1;
    m.padding_left_right = 10;
    m.background = "transparent";
    m.data_source = -1;
    m.class_ids = [];
    m.product_ids = [];
    m.product_num = 10;
    m.sort_rule = "sold_count desc";
    m.product_style = 1;
    m.product_margin = 5;
    m.border_style = 0;
    m.font_style = 0;
    m.show_params = ["name", "price", "btn_buy"];
    m.btn_buy_style = 1;
    m.corner_mark = 1;
    m.custom_corner_mark = "";
    m.product_list = [];
    return m;
  },
  /**
   * 当商品来源是分类时，返回在编辑界面用的演示列表
   */
  createClassDemoList(layout) {
    var imgid = 1;
    var list = [];
    for (var i = 0; i < 30; i++) {
      list.push({
        inventory: "999",
        id: 0,
        name:
          layout === 1
            ? "这里是商品标题"
            : "商品名称最多显示两行，超过不显示",
        describe: "",
        small_images: layout == 1 ? "images/goods-demo-1.png" : "images/goods-demo-2.png",
        price: "88",
        market_price: "99",
        hits: 0,
        sold_count: 0,
        updated_at: "2019-02-16 17:28:17"
      });
      imgid++;
      if (imgid > 4) imgid = 1;
    }
    return list;
  }
};
