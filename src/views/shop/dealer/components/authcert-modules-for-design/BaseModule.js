export default {
  createNew: function(type, options) {
    var obj = {
      id: "module_" + parseInt(Math.random() * 1000000),
      module_type: type, //模块类型
      position: "absolute", //模块定位方式
      top: "unset", //模块的top
      left: "unset", //模块的left
      width: "unset", //模块宽度
      height: "unset", //模块高度
      zIndex: 1
    };
    if (options) {
      for(var key in options) {
        obj[key] = options[key];
      }
    }
    return obj;
  }
};
