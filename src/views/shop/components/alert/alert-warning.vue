<template>
  <Alert type="warning" show-icon class="common-alert-warning">
    <i slot="icon" class="iconfont icon-md-information-circl1"></i>
    <div slot="desc">
      <div class="common-alert-warning-title" v-if="title">{{title}}</div>
      <slot></slot>
    </div>
  </Alert>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: ""
    }
  },
  data() {
    return {};
  }
};
</script>
<style lang="less" scoped>
.common-alert-warning {
  padding: 16px 16px 16px 70px;
  margin-bottom: 0;
  border-color: #ABDCFF;
  background-color: #F0FAFF;
  box-shadow: 0px 2px 2px 0px rgba(0,0,0,0.16);
  /deep/.ivu-alert-icon {
    top: 8px;
    margin-top: 0;
    margin-left: -2px;
    color: #2D8CF0;
    i {
      font-size: 24px;
    }
  }
  /deep/.ivu-alert-desc {
    font-size: 12px;
    line-height: 18px;
    color: #657180;
    .common-alert-warning-title {
      font-size: 14px;
      margin-bottom: 6px;
    }
    p + p {
      margin-top: 4px;
    }
  }
}
</style>
