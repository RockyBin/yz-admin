<template>
  <div class="add-more-btn">
    <Button class="btn-add" type="primary" :perm="perm" @click="onAddMoreClick">
      <i class="iconfont icon-ios-add"></i>
      <span>{{text}}</span>
    </Button>
  </div>
</template>
<script>
export default {
  props: {
    text: {
      default: "添加更多",
      type: String
    },
    perm: {
      type: String,
      default: ''
    }
  },
  methods: {
    onAddMoreClick() {
      this.$emit("onAddMoreClick");
    }
  }
};
</script>
<style lang="less" scoped>
.add-more-btn {
  display: inline-block;
  // height: 34px;
  /deep/button.ivu-btn {
    line-height: 1;
    height: 32px;
    border-radius: 17px;
    padding: 0 13px;
    i {
      vertical-align: text-bottom;
    }
    span span {
      vertical-align: baseline;
    }
  }
}
</style>
