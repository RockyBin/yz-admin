<template>
  <div>
    <Button
      type="primary"
      perm="product.param.operate"
      class="add-category"
      shape="circle"
      icon="md-add"
      @click="addFirstClass(list)"
    >
      <span>{{text}}</span>
    </Button>
    <span class="noticeMessage" v-text="noticeMessage"></span>
  </div>
</template>
<script>
export default {
  data() {
    return {
      list: [],
      noticeMessage:
        "(分类图片只能添加jpg，jpeg，png格式 , 建议上传尺寸为140*140)"
    };
  },
  props: {
    text: {
      type: String,
      default: "新增一级分类"
    },
    firstClass: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  watch: {
    firstClass: {
      handler(val) {
        this.list = val;
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    addFirstClass(list) {
      let tempObj = {};
      for (var key in list[0]) {
        tempObj[key + ""] = list[0][key];
      }

      tempObj["class_name"] = "";
      tempObj["image"] = null;
      tempObj["file"] = null;
      tempObj["preview"] = "";
      tempObj["parent_id"] = 0;
      tempObj["id"] = 0;
      tempObj["product_count"] = 0;
      tempObj["status"] = 1;
      tempObj["childClass"] = [];
      tempObj["notNull"] = false;

      this.$emit("addFirstClass", tempObj);
    }
  }
};
</script>
<style lang="less" scoped>
.add-category {
  /*width: 131px;*/
  height: 32px;
  /*line-height: 17px;*/
  font-size: 12px;
  margin-top: 24px;
  background: #4a6af5;
}

.noticeMessage {
  position: absolute;
  color: #666;
  margin-top: 32px;
  margin-left: 14px;
  font-size: 12px;
}
</style>


