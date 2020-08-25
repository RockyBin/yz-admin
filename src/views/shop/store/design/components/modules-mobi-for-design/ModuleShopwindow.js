import BaseModule from "./BaseModule";
export default {
  //记录当前模块的所有items，避免因为切换风格而导致数据丢失
  items: {},
  //不同样式风格的item数量
  layoutItemNum: {
    1: 4,
    2: 3,
    3: 2,
    4: 4,
    5: 4,
    6: 3
  },
  createNew: function() {
    var m = BaseModule.createNew("ModuleShopwindow");
    m.background = "transparent";
    m.layout = 1;
    m.items = [];
    m.padding_top_bottom = 0;
    m.item_margin = 8;
    m = this.switchLayout(m, m.layout);
    return m;
  },
  newItem: function() {
    return {
      image: "",
      link_desc: "",
      link_type: "none",
      link_data: "",
      link_url: ""
    };
  },
  switchLayout: function(module, layout) {
    //保存一下原始全部的items，避免因为切换风格而导致数据丢失
    if (!this.items[module.id]) {
      this.items[module.id] = [];
      for (var i = 0; i < 10; i++) this.items[module.id].push(this.newItem());
    }
    this.items[module.id].splice(0, module.items.length, ...module.items);
    //如果当前items的元素比新的风格的元素个数少
    while (module.items.length < this.layoutItemNum[layout]) {
      module.items.push(this.items[module.id][module.items.length]);
    }
    //如果当前items的元素比新的风格的元素个数多
    if (module.items.length > this.layoutItemNum[layout])
      module.items.splice(this.layoutItemNum[layout], 100);
    return module;
  },
  //获取不同风格的图片的尺寸
  getLayoutImageSize: function(layout, imgIndex) {
    if (layout == 1) {
      return {
        suggest: "建议尺寸:750X340像素",
        width: "100%",
        height: "100%"
      };
    } else if (layout == 2) {
      return {
        suggest: "建议尺寸:340X340像素",
        width: "50%",
        height: "100%"
      };
    } else if (layout == 3) {
      return {
        suggest: "建议尺寸:226X226像素",
        width: "100%",
        height: "100%"
      };
    } else if (
      (layout == 4 && imgIndex == 0) ||
      (layout == 5 && imgIndex == 2)
    ) {
      return {
        suggest: "建议尺寸:342X406像素",
        width: "50%",
        height: "100%"
      };
    } else if (
      (layout == 4 && (imgIndex == 1 || imgIndex == 2)) ||
      (layout == 5 && (imgIndex == 0 || imgIndex == 1))
    ) {
      return {
        suggest: "建议尺寸:342X194像素",
        width: "25%",
        height: "50%"
      };
    } else if (layout == 6 && imgIndex == 0) {
      return {
        suggest: "建议尺寸:704X196像素",
        width: "100%",
        height: "50%"
      };
    } else if (layout == 6 && (imgIndex == 1 || imgIndex == 2)) {
      return {
        suggest: "建议尺寸:344X196像素",
        width: "50%",
        height: "50%"
      };
    } else if (layout == 7 && imgIndex == 0) {
      return {
        suggest: "建议尺寸:702X196像素"
      };
    } else if (
      layout == 7 &&
      (imgIndex == 1 || imgIndex == 2 || imgIndex == 3)
    ) {
      return {
        suggest: "建议尺寸:224X196像素"
      };
    } else if (layout == 8) {
      return {
        suggest: "建议尺寸:348X188像素"
      };
    } else if (layout == 9 && (imgIndex == 0 || imgIndex == 1)) {
      return {
        suggest: "建议尺寸:346X192像素"
      };
    } else if (
      layout == 9 &&
      (imgIndex == 2 || imgIndex == 3 || imgIndex == 4 || imgIndex == 5)
    ) {
      return {
        suggest: "建议尺寸:164X192像素"
      };
    }
  }
};
