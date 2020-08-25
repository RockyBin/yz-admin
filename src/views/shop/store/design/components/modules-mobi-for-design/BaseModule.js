export default {
  createNew: function(type, target) {
    if (!target) {
      return {
        id: "tmp_" + parseInt(Math.random() * 1000000),
        module_type: type,
        padding_left_right: 0,
        padding_top_bottom: 0,
        background: "#fff",
        publish: 1
      };
    } else if (target === "member") {
      return {
        id: "tmp_" + parseInt(Math.random() * 1000000),
        module_type: type,
        padding_left_right: 0,
        padding_top_bottom: 0,
        background: "transparent",
        publish: 1
      }
    }
  }
};
